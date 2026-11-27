// The pool of 10 customers: 4 scam and 6 legit (FR-11 to FR-14, FR-19,
// design.md sections 2.2 and 2.4). Content only. validateData checks it in
// data.test.ts, and this is the one file that may hold web addresses
// (SEC-13). Every person, business, and place name in it is made up (SEC-21).
import type { Customer } from '../game/types.ts'

export const customers: readonly Customer[] = [
  {
    id: 'c01-cash-emergency',
    name: 'Lorraine Pruitt',
    truth: 'scam',
    scamType: 'emergency',
    slip: {
      type: 'cash',
      amount: 8500,
      accountNote: 'Social Security and a small pension. Largest cash withdrawal this year: $200.',
    },
    behaviour:
      'Late seventies, coat still buttoned. Her hand shakes as she slides the slip across, and she checks the wall clock twice while you read it.',
    answers: {
      purpose: "A new furnace. Mine quit, and the man who's putting it in gives a better price for cash.",
      origin: 'It quit on Monday night. A friend from church gave me the name of a man who could come quickly.',
      urgency: "Yes, today. It's cold in that house, and he's holding the afternoon for me.",
      next: "I take it straight home. A driver is coming to the door for it at three, and I'm to have it in an envelope.",
      told: "Nobody's told me what to say. I was asked to keep it to myself for now, and I gave my word.",
    },
    explanation:
      "A caller posing as Lorraine's grandson said he was under arrest, begged her to keep it secret, and sent a courier to her door for the bail money. She was told to say it was for a furnace.",
    redFlags: [
      { id: 'RF-8', shownIn: 'slip' },
      { id: 'RF-2', shownIn: 'behaviour' },
      { id: 'RF-16', shownIn: 'next' },
      { id: 'RF-6', shownIn: 'told' },
    ],
    sourceUrls: [
      'https://consumer.ftc.gov/consumer-alerts/2021/04/dont-open-your-door-grandparent-scams',
      'https://www.ic3.gov/PSA/2021/PSA210729',
      'https://consumer.ftc.gov/consumer-alerts/2024/03/sure-ways-spot-scammer',
    ],
  },
  {
    id: 'c02-gift-government',
    name: 'Darius Coleman',
    truth: 'scam',
    scamType: 'governmentImposter',
    slip: {
      type: 'giftCards',
      amount: 2000,
      cardCount: 4,
      valuePerCard: 500,
      accountNote: 'Payroll deposits, rent, card spending. No gift cards before.',
    },
    behaviour:
      'Mid-twenties, in a delivery uniform. His phone is at his ear when he reaches the counter. He says "okay, I\'m up" into it and lowers it without ending the call.',
    answers: {
      purpose: 'A wedding present. My cousin gets married Saturday, and they asked for gift cards instead of stuff.',
      recipient: 'My cousin Andre and his fiancée. We grew up two doors apart.',
      urgency: "No, there's no rush... Sorry. Yes. Yes, it has to be today.",
      next: 'Tonight I send pictures of the backs, with the numbers showing. After that I just hold on to the cards.',
      told: 'No. Nobody.',
    },
    explanation:
      "A caller claiming to be from the sheriff's office said Darius had missed jury duty and would be arrested unless he paid a fine in gift cards. The caller stayed on the line and told him to say they were a wedding present.",
    redFlags: [
      { id: 'RF-11', shownIn: 'slip' },
      { id: 'RF-1', shownIn: 'behaviour' },
      { id: 'RF-3', shownIn: 'urgency' },
      { id: 'RF-12', shownIn: 'next' },
    ],
    sourceUrls: [
      'https://consumer.ftc.gov/articles/how-avoid-government-impersonation-scam',
      'https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams',
      'https://consumer.ftc.gov/consumer-alerts/2024/03/sure-ways-spot-scammer',
    ],
  },
  {
    id: 'c03-wire-romance',
    name: 'Carol Whitfield',
    truth: 'scam',
    scamType: 'romance',
    slip: {
      type: 'wire',
      amount: 22500,
      recipient: 'Graham Tolliver',
      destination: 'Aberdeen, United Kingdom',
      accountNote: 'Salary and savings transfers, card spending. No wires before.',
    },
    behaviour:
      "Early sixties, cheerful, with the recipient's details copied out neatly on a card. She is in no hurry and asks how your day is going.",
    answers: {
      purpose: "I'm buying a share in a friend's engineering business. It's all been drawn up properly.",
      recipient:
        "Graham. He's an engineer on a North Sea rig. We met on a dating site last spring and we've talked every day since.",
      met: "We talk every evening. I'd say I know him better than people I've sat beside for years.",
      verified: "Yes. I called Graham on the number I've always had for him, and we went through it line by line.",
      told: "No, nobody. It's my money and my decision.",
    },
    explanation:
      "A scammer with a fake dating profile won Carol's trust over months, always had a reason not to meet, then asked her to wire money for a business deal. He told her to call him a friend and business partner.",
    redFlags: [
      { id: 'RF-9', shownIn: 'slip' },
      { id: 'RF-13', shownIn: 'recipient' },
      { id: 'RF-3', shownIn: 'met' },
    ],
    sourceUrls: [
      'https://consumer.ftc.gov/articles/what-know-about-romance-scams',
      'https://www.fincen.gov/system/files/advisory/2022-06-15/FinCEN%20Advisory%20Elder%20Financial%20Exploitation%20FINAL%20508.pdf',
      'https://consumer.ftc.gov/consumer-alerts/2024/03/sure-ways-spot-scammer',
    ],
  },
  {
    id: 'c04-cash-bank',
    name: 'Stephen Nakamura',
    truth: 'scam',
    scamType: 'bankImpersonation',
    slip: {
      type: 'cash',
      amount: 14000,
      accountNote: 'Salary deposits, card spending, small ATM withdrawals. CD closed this morning, 14 months early.',
    },
    behaviour:
      'Mid-fifties, pressed shirt, unhurried. He greets you by the name on your badge and has his ID out before you ask.',
    answers: {
      purpose: "We're redoing the kitchen. The contractor takes ten percent off for cash.",
      origin: "I had a call about some odd activity on my accounts. It made me think I shouldn't leave it all sitting in here.",
      urgency: 'Today would be best. He orders the cabinets tomorrow.',
      next: "It gets paid in this afternoon. There's a machine at a gas station on Miller Road. I scan a code and feed the bills in.",
      told: 'No, nothing like that.',
    },
    explanation:
      "A caller posing as his bank's fraud department said Stephen's accounts were compromised and that a Bitcoin ATM would keep his savings safe. He was told not to trust the branch and to say the cash was for a kitchen.",
    redFlags: [
      { id: 'RF-8', shownIn: 'slip' },
      { id: 'RF-10', shownIn: 'slip' },
      { id: 'RF-7', shownIn: 'origin' },
      { id: 'RF-15', shownIn: 'next' },
    ],
    sourceUrls: [
      'https://www.fincen.gov/system/files/shared/FTA_Elder_Financial_Exploitation_508Final.pdf',
      'https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers',
      'https://consumer.ftc.gov/consumer-alerts/2024/03/did-someone-send-you-bitcoin-atm-its-scam',
      'https://consumer.ftc.gov/consumer-alerts/2024/03/will-your-bank-or-investment-fund-stop-transfer-scammer-probably-not',
    ],
  },
  {
    id: 'c05-cash-card',
    name: 'Ana Morales',
    truth: 'legit',
    slip: {
      type: 'cash',
      amount: 900,
      accountNote: 'Payroll deposits, card payments, a monthly daycare transfer. Rarely withdraws cash.',
    },
    behaviour:
      'Mid-thirties, flustered, a toddler on her hip. She says sorry to the line behind her and tells you she has never done this at a counter before.',
    answers: {
      purpose: "Groceries, gas, the sitter on Friday. Normal things. I just can't pay for them the normal way this week.",
      origin: "The bank's fraud team called me on Saturday. Somebody got into my account, and they've had to shut my card off.",
      urgency: "If you can, please. I really can't leave without it.",
      next: 'It goes in my purse and gets spent at the grocery store. It only has to last until my new card shows up.',
      told: "No. Nobody's said anything like that.",
    },
    explanation:
      "Ana's card details were stolen and her bank's real fraud team cancelled the card. She needed a week of spending money until the new one arrived, and nobody had asked her to move money anywhere.",
    lookAlike: { flag: 'RF-7', shownIn: 'origin', explainedBy: 'next' },
  },
  {
    id: 'c06-cash-truck',
    name: 'Curtis Boyd',
    truth: 'legit',
    slip: {
      type: 'cash',
      amount: 7500,
      accountNote: 'Payroll deposits, mortgage, card spending. CD closed today, 5 months early.',
    },
    behaviour:
      'Mid-forties, work boots, keys in his hand. He asks if this can be quick and looks at his watch while you read the slip.',
    answers: {
      purpose: 'A truck. A 2016 pickup from a private seller who wants cash, and the price is worth the CD penalty.',
      origin: 'Mine failed inspection last month. I saw this one listed on Sunday, and my mechanic went over it yesterday.',
      urgency: "Yes. If I don't have it by two, it's gone.",
      next: "I'm meeting a guy in a parking lot at two and handing it over. That's the arrangement.",
      told: 'No. Why would they?',
    },
    explanation:
      'Curtis was buying a used truck from a private seller who wanted cash. He had seen it, had his mechanic check it, and was meeting the seller to pay and collect the title.',
    lookAlike: { flag: 'RF-16', shownIn: 'next', explainedBy: 'purpose' },
  },
  {
    id: 'c07-gift-retirement',
    name: 'Denise Okafor',
    truth: 'legit',
    slip: {
      type: 'giftCards',
      amount: 1200,
      cardCount: 3,
      valuePerCard: 400,
      accountNote: 'Payroll deposits, card spending. Several small incoming transfers this week.',
    },
    behaviour:
      'About fifty, an office badge on a lanyard. She keeps her voice just above a whisper and glances along the counter as she hands you the slip.',
    answers: {
      purpose: "It's a leaving present. Everyone on our floor chipped in, and I got the job of turning it into something.",
      recipient: 'Marjorie in payroll. She retires Friday after thirty-one years, and she banks at this branch, so not a word.',
      urgency: 'By Friday, so today would be best.',
      next: 'They go in an envelope, and the envelope stays hidden in my desk until Friday.',
      told: "Asked to keep it quiet? Yes, strictly. And I'd be grateful if you would too.",
    },
    explanation:
      'Denise was buying a surprise retirement gift with money her co-workers had collected. She kept it quiet because the co-worker who is retiring banks at this branch.',
    lookAlike: { flag: 'RF-6', shownIn: 'told', explainedBy: 'recipient' },
  },
  {
    id: 'c08-gift-crew',
    name: 'Frank Delgado',
    truth: 'legit',
    slip: {
      type: 'giftCards',
      amount: 3000,
      cardCount: 12,
      valuePerCard: 250,
      accountNote: 'Business account: payroll, fuel, suppliers. No gift cards before.',
    },
    behaviour:
      'Late fifties, in a company fleece, phone clamped to his ear. "Twelve, you said? Not thirteen?" he asks it, then nods at you to go ahead.',
    answers: {
      purpose: "Year-end thank-you for my crew. It's been a good season, and they'd rather have this than a dinner.",
      recipient:
        "My twelve guys. I run a landscaping outfit, and Deb in the office is on the phone with the list so I don't miss one.",
      urgency: 'Today would be good. The last pay run before the break is tomorrow.',
      next: "They go in the envelopes with tomorrow's pay stubs. Deb's already written the names on.",
      told: 'Ha. Only how many to buy.',
    },
    explanation:
      'Frank owns a small landscaping company and was buying year-end gifts for his twelve employees. The person on the phone was his office manager, reading him the list.',
    lookAlike: { flag: 'RF-1', shownIn: 'behaviour', explainedBy: 'recipient' },
  },
  {
    id: 'c09-wire-hospital',
    name: 'Joel Santos',
    truth: 'legit',
    slip: {
      type: 'wire',
      amount: 6400,
      recipient: 'Mabini Coast Medical Center',
      destination: 'Batangas, Philippines',
      accountNote: 'Payroll deposits, card spending. Sends about $300 abroad most months through a transfer app.',
    },
    behaviour:
      'Mid-forties, unshaven, eyes red. He has the details on a creased printout and asks, before anything else, how fast a wire gets there.',
    answers: {
      purpose: "My mother's in the hospital and they won't operate until the deposit is paid. It has to get there today.",
      recipient: "The hospital's billing office. My sister's there with her and sent me a picture of the invoice.",
      met: "Nobody at the hospital, no. My sister's been at the bedside since Tuesday, and we talk every few hours.",
      verified: "Yes. I looked up the hospital's main number myself, called it, and billing read the account back to me.",
      told: 'No. I just need it sent.',
    },
    explanation:
      "Joel's mother really was in a hospital abroad, with his sister at her bedside. Before sending anything he looked up the hospital's number himself, called it, and confirmed the account.",
    lookAlike: { flag: 'RF-5', shownIn: 'purpose', explainedBy: 'verified' },
  },
  {
    id: 'c10-wire-daughter',
    name: 'Margaret Lindqvist',
    truth: 'legit',
    slip: {
      type: 'wire',
      amount: 30000,
      recipient: 'Karin Shaw',
      destination: 'Portland, Oregon',
      accountNote: 'Pension and investment income, checks. No wires before.',
    },
    behaviour:
      'In her eighties, upright and unhurried, a cane hooked over the counter. She tells you she has banked here longer than you have been alive, and smiles as she says it.',
    answers: {
      purpose: "It's toward a house for my daughter. I'd rather she had it now than read about it in my will.",
      recipient: "My daughter, Karin. I've known her fifty-one years, which I should think is long enough.",
      met: 'I was there when she was born.',
      verified: 'I called her last night on her own phone and read the account number back to her twice.',
      told: "No. And I'd have told them to mind their own business.",
    },
    explanation:
      'Margaret was giving her daughter money toward a house. A first wire this large is unusual for the account, but it was going to family, and she had confirmed the details with her daughter herself.',
    lookAlike: { flag: 'RF-9', shownIn: 'slip', explainedBy: 'recipient' },
  },
]
