import { describe, expect, it } from 'vitest'

// The rules test (D28, test-plan.md section 4). It reads every source file in
// src/ that is not a test, as text, and fails with the file and the rule.
// It matches text, comments included, so it catches honest mistakes and is
// not proof.
//
// Vite resolves import.meta.glob when Vitest loads this file, so reading the
// files needs no Node API and no extra package. Keys are relative to this
// file, such as './ui/StartScreen.tsx'.
const globbed = import.meta.glob<string>(['./**/*.{ts,tsx,css}', '!./**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

type SourceFile = { path: string; text: string }

const files: SourceFile[] = Object.entries(globbed).map(([key, text]) => ({
  path: key.replace(/^\.\//, ''),
  text,
}))

const inFolder = (folder: string) => files.filter((f) => f.path.startsWith(`${folder}/`))

type Import = { specifier: string; typeOnly: boolean; statement: string }

// Static imports and re-exports, side-effect imports, and dynamic imports.
function importsOf(text: string): Import[] {
  const found: Import[] = []
  // The clause between the keyword and `from` may hold only names, braces,
  // commas, and `*`, so the match cannot run on into the next statement.
  const fromClause = /^\s*(import|export)\s+(type\s+)?[\w\s{},*$]*?\bfrom\s*['"]([^'"]+)['"]/gm
  for (const m of text.matchAll(fromClause)) {
    found.push({ specifier: m[3], typeOnly: m[2] !== undefined, statement: m[0].trim() })
  }
  for (const m of text.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) {
    found.push({ specifier: m[1], typeOnly: false, statement: m[0].trim() })
  }
  for (const m of text.matchAll(/\bimport\s*\(/g)) {
    found.push({ specifier: '(dynamic import)', typeOnly: false, statement: m[0] })
  }
  return found
}

// Turns a relative specifier into a path from src/ with no extension, such as
// 'game/types'. A package name is returned as it is.
function resolve(fromPath: string, specifier: string): string {
  if (!specifier.startsWith('.')) return specifier
  const parts = fromPath.split('/').slice(0, -1)
  for (const segment of specifier.split('/')) {
    if (segment === '..') parts.pop()
    else if (segment !== '.') parts.push(segment)
  }
  return parts.join('/').replace(/\.(tsx?|css)$/, '')
}

// Each rule collects "file: problem" lines, so a failure names every file.
function check(targets: SourceFile[], problems: (f: SourceFile) => string[]): string[] {
  return targets.flatMap((f) => problems(f).map((p) => `${f.path}: ${p}`))
}

function mentions(text: string, patterns: Record<string, RegExp>): string[] {
  return Object.entries(patterns)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => `mentions ${name}`)
}

describe('rules test (D28)', () => {
  it('reads the source files', () => {
    const paths = files.map((f) => f.path)
    expect(paths).toContain('main.tsx')
    expect(paths).toContain('App.tsx')
    expect(paths).toContain('ui/StartScreen.tsx')
    expect(paths.some((p) => p.endsWith('.test.ts'))).toBe(false)
    expect(files.find((f) => f.path === 'main.tsx')?.text).toContain('createRoot')
  })

  it('src/game imports no React, DOM, UI, data, or App code, and uses no randomness or storage (architecture rule 1, NFR-8)', () => {
    const bannedImport = (r: string) =>
      /^react(-dom)?(\/|$)/.test(r) || /^(ui|data)\//.test(r) || r === 'App' || r === 'main'
    const problems = check(inFolder('game'), (f) => [
      ...importsOf(f.text)
        .filter((i) => bannedImport(resolve(f.path, i.specifier)))
        .map((i) => `imports ${i.specifier}`),
      ...mentions(f.text, {
        'Math.random': /Math\.random/,
        localStorage: /\blocalStorage\b/,
        document: /\bdocument\b/,
        window: /\bwindow\b/,
      }),
    ])
    expect(problems).toEqual([])
  })

  it('src/data has no import except `import type` from src/game/types (architecture rule 2)', () => {
    const problems = check(inFolder('data'), (f) =>
      importsOf(f.text)
        .filter((i) => !(i.typeOnly && resolve(f.path, i.specifier) === 'game/types'))
        .map((i) => `has an import that is not \`import type\` from game/types: ${i.statement}`),
    )
    expect(problems).toEqual([])
  })

  it('no file has an HTML sink, a network API, or a console call (NFR-9, NFR-1, SEC-4, SEC-10, SEC-18)', () => {
    const problems = check(files, (f) =>
      mentions(f.text, {
        dangerouslySetInnerHTML: /dangerouslySetInnerHTML/,
        innerHTML: /\binnerHTML\b/,
        outerHTML: /\bouterHTML\b/,
        insertAdjacentHTML: /\binsertAdjacentHTML\b/,
        'document.write': /document\.write/,
        eval: /\beval\s*\(/,
        'new Function': /\bnew\s+Function\b/,
        fetch: /\bfetch\s*\(/,
        XMLHttpRequest: /\bXMLHttpRequest\b/,
        WebSocket: /\bWebSocket\b/,
        EventSource: /\bEventSource\b/,
        sendBeacon: /\bsendBeacon\b/,
        console: /\bconsole\s*\./,
      }),
    )
    expect(problems).toEqual([])
  })

  it('localStorage only in src/ui/bestScore.ts, and no other browser storage (NFR-2, SEC-16)', () => {
    const problems = check(files, (f) => [
      ...(f.path === 'ui/bestScore.ts' ? [] : mentions(f.text, { localStorage: /\blocalStorage\b/ })),
      ...mentions(f.text, {
        sessionStorage: /\bsessionStorage\b/,
        'document.cookie': /document\.cookie/,
        indexedDB: /\bindexedDB\b/,
      }),
    ])
    expect(problems).toEqual([])
  })

  it('web addresses only in src/data/customers.ts (SEC-4, SEC-13)', () => {
    const problems = check(
      files.filter((f) => f.path !== 'data/customers.ts'),
      (f) => mentions(f.text, { 'http:// or https://': /https?:\/\//i }),
    )
    expect(problems).toEqual([])
  })

  it('CustomerScreen and Slip mention none of the hidden fields (FR-7, SEC-18)', () => {
    const hidden = ['truth', 'redFlags', 'scamType', 'lookAlike', 'explanation', 'sourceUrls']
    const problems = check(
      files.filter((f) => f.path === 'ui/CustomerScreen.tsx' || f.path === 'ui/Slip.tsx'),
      (f) => hidden.filter((word) => f.text.includes(word)).map((word) => `mentions ${word}`),
    )
    expect(problems).toEqual([])
  })
})
