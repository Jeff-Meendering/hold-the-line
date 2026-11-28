import { describe, expect, it } from 'vitest'
import { legit, scam, TEST_QUESTION_SETS, TEST_QUESTION_TEXT } from './testPool.ts'
import { validateData } from './validate.ts'
import type { GameContent } from './validate.ts'

// Source URLs copied from requirements.md section 7. The validator only
// parses them; nothing here opens them.
const FTC_GIFT_CARDS = 'https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams'
const FTC_EMERGENCIES = 'https://consumer.ftc.gov/articles/scammers-use-fake-emergencies-steal-your-money'
const FINCEN_TREND = 'https://www.fincen.gov/system/files/shared/FTA_Elder_Financial_Exploitation_508Final.pdf'

/** A valid pool of 8: the smallest the rules allow, 3 scam and 5 legit
 *  (V10). Each type has a scam and a legit customer (V11), the scam types
 *  differ (V12), 3 legit customers have a look-alike (V13), and 2 of those
 *  show it in an answer (V16). */
const VALID: GameContent = {
  questionText: TEST_QUESTION_TEXT,
  questionSets: TEST_QUESTION_SETS,
  customers: [
    scam('s-cash', 'cash', { scamType: 'governmentImposter', sourceUrls: [FINCEN_TREND] }),
    scam('s-wire', 'wire', { scamType: 'romance', sourceUrls: [FTC_EMERGENCIES, FINCEN_TREND] }),
    scam('s-gift', 'giftCards', { scamType: 'techSupport', sourceUrls: [FTC_GIFT_CARDS] }),
    legit('l-cash', 'cash', { lookAlike: { flag: 'RF-8', shownIn: 'slip', explainedBy: 'purpose' } }),
    legit('l-wire', 'wire', { lookAlike: { flag: 'RF-13', shownIn: 'met', explainedBy: 'verified' } }),
    legit('l-gift', 'giftCards', { lookAlike: { flag: 'RF-12', shownIn: 'next', explainedBy: 'recipient' } }),
    legit('l-cash2', 'cash'),
    legit('l-wire2', 'wire'),
  ],
}

// Broken copies are made by editing a deep copy, typed loosely with `any` so
// a test can put in anything the content could hold at runtime, which is
// what validateData has to cope with.
type Loose = Record<string, any>
type LooseContent = { questionText: Loose; questionSets: Loose; customers: Loose[] }

function broken(change: (content: LooseContent, customer: (id: string) => Loose) => void): string[] {
  const content = structuredClone(VALID) as unknown as LooseContent
  const customer = (id: string) => {
    const found = content.customers.find((c) => c.id === id)
    if (found === undefined) throw new Error(`no customer ${id} in the test pool`)
    return found
  }
  change(content, customer)
  return validateData(content as unknown as GameContent)
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** At least one message starts with "<subject>: <rule> " and, if given,
 *  matches `text`. Used where one break causes messages from other rules too. */
function expectSome(messages: string[], subject: string, rule: string, text?: RegExp) {
  const matching = messages.filter((m) => m.startsWith(`${subject}: ${rule} `) && (text === undefined || text.test(m)))
  expect(matching, `messages were:\n${messages.join('\n')}`).not.toEqual([])
}

/** As expectSome, and every message is about the same subject. */
function expectOnly(messages: string[], subject: string, rule: string, text?: RegExp) {
  expectSome(messages, subject, rule, text)
  expect(messages).toEqual(messages.map(() => expect.stringMatching(new RegExp(`^${escape(subject)}: `))))
}

describe('validateData (design.md section 2.6, FR-15)', () => {
  it('returns no messages for a valid pool of 8', () => {
    expect(validateData(VALID)).toEqual([])
  })

  describe('bank', () => {
    it('V1: a question with no wording', () => {
      expectOnly(broken((d) => (d.questionText.met = '  ')), 'met', 'V1')
      expectOnly(broken((d) => delete d.questionText.told), 'told', 'V1')
    })

    it('V1: wording for an id that is not in the bank', () => {
      expectOnly(broken((d) => (d.questionText.extra = 'An extra question?')), 'extra', 'V1')
    })

    it('V2: a set of 4 (AC-8.3)', () => {
      const messages = broken((d) => (d.questionSets.cash = ['purpose', 'origin', 'next', 'told']))
      expectSome(messages, 'cash', 'V2', /4 questions/)
    })

    it('V2: a set of 6 (AC-8.3)', () => {
      const messages = broken((d) => (d.questionSets.cash = ['purpose', 'origin', 'urgency', 'next', 'told', 'met']))
      expectSome(messages, 'cash', 'V2', /6 questions, not 5/)
    })

    it('V2: a set with a repeat (AC-8.3)', () => {
      const messages = broken((d) => (d.questionSets.wire = ['purpose', 'recipient', 'met', 'met', 'told']))
      expectSome(messages, 'wire', 'V2', /met twice/)
    })

    it('V2: a set with an id that is not in the bank', () => {
      const messages = broken((d) => (d.questionSets.giftCards = ['purpose', 'recipient', 'urgency', 'next', 'refund']))
      expectSome(messages, 'giftCards', 'V2', /"refund"/)
    })

    it('V2: a transaction type with no set, and a set for a type that does not exist', () => {
      expectSome(broken((d) => delete d.questionSets.wire), 'wire', 'V2', /no question set/)
      expectOnly(broken((d) => (d.questionSets.crypto = ['purpose'])), 'crypto', 'V2')
    })

    it('V3: a bank question in no set (AC-8.3)', () => {
      const messages = broken((d) => (d.questionSets.cash = ['purpose', 'met', 'urgency', 'next', 'told']))
      expectSome(messages, 'origin', 'V3')
    })
  })

  describe('each customer', () => {
    it('V4: no id, named by its place in the list', () => {
      expectOnly(broken((_, c) => (c('s-cash').id = '')), 'customers[0]', 'V4', /no id/)
    })

    it('V4: an id used twice', () => {
      expectOnly(broken((_, c) => (c('l-cash2').id = 'l-cash')), 'l-cash', 'V4', /2 customers/)
    })

    it('V4: an empty name, behaviour, account note, or explanation', () => {
      expectOnly(broken((_, c) => (c('s-wire').name = '')), 's-wire', 'V4', /no name/)
      expectOnly(broken((_, c) => (c('l-gift').behaviour = ' ')), 'l-gift', 'V4', /no behaviour/)
      expectOnly(broken((_, c) => (c('l-wire').slip.accountNote = '')), 'l-wire', 'V4', /no account note/)
      expectOnly(broken((_, c) => (c('s-gift').explanation = '')), 's-gift', 'V4', /no explanation/)
    })

    it('V4: an amount that is not a whole number above 0', () => {
      for (const amount of [0, -900, 900.5, '900']) {
        expectOnly(broken((_, c) => (c('l-cash2').slip.amount = amount)), 'l-cash2', 'V4', /amount/)
      }
    })

    it('V4: a truth that is not scam or legit', () => {
      expectSome(broken((_, c) => (c('l-cash2').truth = 'maybe')), 'l-cash2', 'V4', /truth/)
    })

    it('V5: an answer removed (AC-8.1)', () => {
      expectOnly(broken((_, c) => delete c('s-wire').answers.verified), 's-wire', 'V5', /no answer to verified/)
    })

    it('V5: an extra answer (AC-8.3)', () => {
      expectOnly(broken((_, c) => (c('l-cash').answers.met = 'An extra answer.')), 'l-cash', 'V5', /"met"/)
    })

    it('V5: an empty answer, and no answers at all', () => {
      expectOnly(broken((_, c) => (c('l-gift').answers.told = '')), 'l-gift', 'V5', /empty answer to told/)
      expectOnly(broken((_, c) => delete c('l-wire2').answers), 'l-wire2', 'V5', /no answers/)
    })

    it('V6: a wire with no recipient or no destination', () => {
      expectOnly(broken((_, c) => delete c('s-wire').slip.recipient), 's-wire', 'V6', /recipient/)
      expectOnly(broken((_, c) => (c('l-wire2').slip.destination = '')), 'l-wire2', 'V6', /destination/)
    })

    it('V6: gift cards over 500 each, a count that is not whole, and an amount that does not multiply out', () => {
      expectOnly(
        broken((_, c) => Object.assign(c('l-gift').slip, { cardCount: 3, valuePerCard: 600, amount: 1800 })),
        'l-gift',
        'V6',
        /600/,
      )
      expectOnly(
        broken((_, c) => Object.assign(c('l-gift').slip, { cardCount: 2.5, valuePerCard: 400, amount: 1000 })),
        'l-gift',
        'V6',
        /2\.5/,
      )
      expectOnly(broken((_, c) => (c('s-gift').slip.amount = 1400)), 's-gift', 'V6', /1400/)
    })

    it('V6: a gift card count or value per card of 0 or below', () => {
      for (const cardCount of [0, -3]) {
        expectOnly(
          broken((_, c) => Object.assign(c('l-gift').slip, { cardCount })),
          'l-gift',
          'V6',
          new RegExp(`has ${cardCount} gift cards, not a whole number above 0`),
        )
      }
      for (const valuePerCard of [0, -500]) {
        expectOnly(
          broken((_, c) => Object.assign(c('l-gift').slip, { valuePerCard })),
          'l-gift',
          'V6',
          new RegExp(`has ${valuePerCard} per gift card, not a whole number above 0`),
        )
      }
    })

    it('V6: a value per card that is not a whole number', () => {
      expectOnly(
        broken((_, c) => Object.assign(c('l-gift').slip, { cardCount: 2, valuePerCard: 125.5, amount: 251 })),
        'l-gift',
        'V6',
        /125\.5 per gift card, not a whole number/,
      )
    })

    it('V6: a slip type that is not cash, wire, or gift cards', () => {
      expectSome(broken((_, c) => (c('s-gift').slip.type = 'crypto')), 's-gift', 'V6', /"crypto"/)
    })

    it('V7: an unknown scam type', () => {
      expectOnly(broken((_, c) => (c('s-cash').scamType = 'phishing')), 's-cash', 'V7', /"phishing"/)
    })

    it('V7: the source URLs removed (AC-8.1)', () => {
      expectOnly(broken((_, c) => (c('s-wire').sourceUrls = [])), 's-wire', 'V7', /no source URL/)
    })

    it('V7: a red flag removed, leaving 2 (AC-8.1)', () => {
      const messages = broken((_, c) => {
        c('s-gift').redFlags = c('s-gift').redFlags.filter((f: Loose) => f.shownIn !== 'behaviour')
      })
      expectOnly(messages, 's-gift', 'V7', /2 red flags/)
    })

    it('V7: an unknown red flag id, and a red flag repeated', () => {
      expectOnly(broken((_, c) => (c('s-cash').redFlags[1].id = 'RF-99')), 's-cash', 'V7', /"RF-99"/)
      expectOnly(
        broken((_, c) => c('s-cash').redFlags.push({ id: 'RF-8', shownIn: 'slip' })),
        's-cash',
        'V7',
        /RF-8 twice/,
      )
    })

    it('V8: a red flag behind a question that is not in the set, or in no known place', () => {
      expectOnly(broken((_, c) => (c('s-wire').redFlags[2].shownIn = 'origin')), 's-wire', 'V8', /"origin"/)
      expectOnly(broken((_, c) => (c('s-wire').redFlags[1].shownIn = 'counter')), 's-wire', 'V8', /"counter"/)
    })

    it('V8: no red flag on the slip or in the behaviour', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags = [
          { id: 'RF-5', shownIn: 'purpose' },
          { id: 'RF-3', shownIn: 'purpose' },
          { id: 'RF-4', shownIn: 'urgency' },
        ]
      })
      expectOnly(messages, 's-cash', 'V8', /no red flag on the slip or in the behaviour/)
    })

    it('V8: no red flag behind a question', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags = [
          { id: 'RF-8', shownIn: 'slip' },
          { id: 'RF-1', shownIn: 'behaviour' },
          { id: 'RF-2', shownIn: 'behaviour' },
        ]
      })
      expectOnly(messages, 's-cash', 'V8', /no red flag behind a question/)
    })

    it('V14: red flags behind 3 questions (AC-8.4)', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags.push({ id: 'RF-4', shownIn: 'urgency' }, { id: 'RF-16', shownIn: 'next' })
      })
      expectOnly(messages, 's-cash', 'V14', /purpose, urgency, next/)
    })

    it('V14: two red flags behind the same 2 questions are allowed', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags.push({ id: 'RF-4', shownIn: 'urgency' }, { id: 'RF-3', shownIn: 'purpose' })
      })
      expect(messages).toEqual([])
    })

    it('V17: a source URL that is http, not https (AC-8.6)', () => {
      const url = FTC_GIFT_CARDS.replace(/^https/, 'http')
      expectOnly(broken((_, c) => (c('s-gift').sourceUrls = [url])), 's-gift', 'V17', /not https/)
    })

    it('V17: a source URL on a host outside SOURCE_HOSTS (AC-8.6)', () => {
      const url = 'https://example.com/scams'
      expectOnly(broken((_, c) => (c('s-gift').sourceUrls = [url])), 's-gift', 'V17', /"example\.com".*not an approved host/)
    })

    it('V17: a source URL that only starts with an allowed host (AC-8.6, SEC-13)', () => {
      const url = 'https://consumer.ftc.gov.example.com/'
      expectOnly(broken((_, c) => c('s-wire').sourceUrls.push(url)), 's-wire', 'V17', /"consumer\.ftc\.gov\.example\.com"/)
    })

    it('V17: a source URL listed twice', () => {
      expectOnly(
        broken((_, c) => c('s-gift').sourceUrls.push(FTC_GIFT_CARDS)),
        's-gift',
        'V17',
        new RegExp(`"${escape(FTC_GIFT_CARDS)}" twice`),
      )
    })

    it('V17: a source URL with a port (SEC-13)', () => {
      const urls = [
        'https://consumer.ftc.gov:8443/articles',
        'https://consumer.ftc.gov:443/articles',
        'https://consumer.ftc.gov:/articles',
      ]
      for (const url of urls) {
        expectOnly(broken((_, c) => (c('s-gift').sourceUrls = [url])), 's-gift', 'V17', /which has a port/)
      }
    })

    it('V17: a source URL with a username or password (SEC-13)', () => {
      const urls = [
        'https://user:pass@consumer.ftc.gov/articles',
        'https://user@consumer.ftc.gov/articles',
        'https://:pass@consumer.ftc.gov/articles',
        'https://@consumer.ftc.gov/articles',
      ]
      for (const url of urls) {
        expectOnly(broken((_, c) => (c('s-gift').sourceUrls = [url])), 's-gift', 'V17', /which has a username or password/)
      }
    })

    it('V17: a source URL with a colon or an @ after the host is allowed', () => {
      const url = 'https://consumer.ftc.gov/articles/a:b?who=me@example#x:y'
      expect(broken((_, c) => (c('s-gift').sourceUrls = [url]))).toEqual([])
    })

    it('V17: a source URL that is not a URL, or not text', () => {
      expectOnly(broken((_, c) => (c('s-cash').sourceUrls = ['consumer.ftc.gov/articles'])), 's-cash', 'V17', /not a URL/)
      expectOnly(broken((_, c) => (c('s-cash').sourceUrls = [42])), 's-cash', 'V17', /not text/)
    })

    it('V9: a look-alike of an unknown red flag', () => {
      expectOnly(broken((_, c) => (c('l-cash').lookAlike.flag = 'RF-0')), 'l-cash', 'V9', /"RF-0"/)
    })

    it('V9: a look-alike shown in, or explained by, a question that is not in the set', () => {
      expectOnly(broken((_, c) => (c('l-wire').lookAlike.shownIn = 'next')), 'l-wire', 'V9', /in "next"/)
      expectOnly(broken((_, c) => (c('l-wire').lookAlike.explainedBy = 'origin')), 'l-wire', 'V9', /by "origin"/)
    })

    it('V9: a look-alike explained by its own question (AC-8.5)', () => {
      expectOnly(broken((_, c) => (c('l-wire').lookAlike.explainedBy = 'met')), 'l-wire', 'V9', /same question/)
    })

    it('V9: a look-alike that is not an object', () => {
      expectSome(broken((_, c) => (c('l-cash').lookAlike = 'RF-8')), 'l-cash', 'V9')
    })
  })

  describe('pool', () => {
    it('V10: fewer than 3 scam customers', () => {
      const messages = broken((d) => (d.customers = d.customers.filter((c) => c.id !== 's-gift')))
      expectSome(messages, 'pool', 'V10', /2 scam customers/)
    })

    it('V10: fewer than 5 legit customers', () => {
      const messages = broken((d) => (d.customers = d.customers.filter((c) => c.id !== 'l-wire2')))
      expectOnly(messages, 'pool', 'V10', /4 legit customers/)
    })

    it('V11: a transaction type with no legit customer', () => {
      const messages = broken((d) => {
        const i = d.customers.findIndex((c) => c.id === 'l-gift')
        d.customers[i] = legit('l-gift', 'cash', { lookAlike: { flag: 'RF-16', shownIn: 'next', explainedBy: 'origin' } })
      })
      expectOnly(messages, 'pool', 'V11', /no legit customer with a giftCards slip/)
    })

    it('V11: a transaction type with no scam customer', () => {
      const messages = broken((d) => {
        const i = d.customers.findIndex((c) => c.id === 's-gift')
        d.customers[i] = scam('s-gift', 'cash', { scamType: 'techSupport', sourceUrls: [FTC_GIFT_CARDS] })
      })
      expectOnly(messages, 'pool', 'V11', /no scam customer with a giftCards slip/)
    })

    it('V12: two scam customers with the same scam type, naming both', () => {
      expectOnly(broken((_, c) => (c('s-gift').scamType = 'romance')), 'pool', 'V12', /romance: s-wire, s-gift/)
    })

    it('V13: fewer than 3 legit customers with a look-alike', () => {
      expectOnly(broken((_, c) => delete c('l-cash').lookAlike), 'pool', 'V13', /2 legit customers/)
    })

    it('V15: two scam customers admitting on told, naming both (AC-8.4)', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags[2] = { id: 'RF-6', shownIn: 'told' }
        c('s-wire').redFlags[2] = { id: 'RF-17', shownIn: 'told' }
      })
      expectOnly(messages, 'pool', 'V15', /\(s-cash, s-wire\)/)
    })

    it('V15: one scam customer admitting on told is allowed', () => {
      expect(broken((_, c) => (c('s-cash').redFlags[2] = { id: 'RF-6', shownIn: 'told' }))).toEqual([])
    })

    it('V15: RF-6 and RF-17 behind a question other than told do not count', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags[2] = { id: 'RF-6', shownIn: 'urgency' }
        c('s-wire').redFlags[2] = { id: 'RF-6', shownIn: 'verified' }
        c('s-gift').redFlags[2] = { id: 'RF-17', shownIn: 'next' }
      })
      expect(messages).toEqual([])
    })

    it('V15: flags other than RF-6 and RF-17 behind told do not count', () => {
      const messages = broken((_, c) => {
        c('s-cash').redFlags[2] = { id: 'RF-3', shownIn: 'told' }
        c('s-wire').redFlags[2] = { id: 'RF-4', shownIn: 'told' }
      })
      expect(messages).toEqual([])
    })

    it('V16: only one look-alike in an answer (AC-8.5)', () => {
      const messages = broken((_, c) => {
        c('l-gift').lookAlike = { flag: 'RF-11', shownIn: 'slip', explainedBy: 'purpose' }
      })
      expectOnly(messages, 'pool', 'V16', /1 legit customer with a look-alike in an answer \(l-wire\)/)
    })
  })

  describe('reporting', () => {
    it('gives messages for two broken customers in one run', () => {
      const messages = broken((_, c) => {
        c('s-wire').sourceUrls = []
        c('l-cash').name = ''
      })
      expect(messages).toHaveLength(2)
      expectSome(messages, 's-wire', 'V7')
      expectSome(messages, 'l-cash', 'V4')
    })

    it('gives a message and does not throw when any one field of a customer is missing', () => {
      for (const id of ['s-cash', 's-wire', 's-gift', 'l-cash', 'l-wire', 'l-gift', 'l-cash2']) {
        const fields = Object.keys(VALID.customers.find((c) => c.id === id) ?? {})
        for (const field of fields) {
          let messages: string[] = []
          expect(() => {
            messages = broken((_, c) => delete c(id)[field])
          }, `${id} without ${field}`).not.toThrow()
          const subject = field === 'id' ? `customers[${VALID.customers.findIndex((c) => c.id === id)}]` : id
          expect(messages, `${id} without ${field}`).not.toEqual([])
          for (const m of messages) expect(m.startsWith(`${subject}: `) || m.startsWith('pool: '), m).toBe(true)
        }
      }
    })

    it('does not throw on a customer that is null, or content that is not an object', () => {
      expectOnly(broken((d) => d.customers.push(null as unknown as Loose)), 'customers[8]', 'V4', /not an object/)
      expect(() => validateData(null as unknown as GameContent)).not.toThrow()
      expect(() => validateData({} as GameContent)).not.toThrow()
      expect(validateData({} as GameContent)).toContain('pool: V10 has no list of customers')
    })

    it('starts every message with a customer id, a question id, a transaction type, or pool', () => {
      const messages = broken((d, c) => {
        d.questionSets.cash = ['purpose', 'met', 'urgency', 'next', 'told']
        d.questionSets.crypto = ['purpose']
        delete d.questionText.told
        c('s-gift').scamType = 'romance'
        c('l-wire').lookAlike.explainedBy = 'met'
      })
      const subjects = new Set(messages.map((m) => m.split(':')[0]))
      expect([...subjects].sort()).toEqual(['crypto', 'l-cash', 'l-cash2', 'l-wire', 'origin', 'pool', 's-cash', 'told'].sort())
    })
  })
})
