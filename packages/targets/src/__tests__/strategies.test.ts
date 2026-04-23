import { describe, expect, it } from 'vitest'

import { applyStrategy } from '../strategies.js'

const START = '<!-- acm:start -->'
const END = '<!-- acm:end -->'

describe('inject', () => {
  it('creates markers when existing content is empty', () => {
    const result = applyStrategy('inject', '', 'hello')
    expect(result).toContain(START)
    expect(result).toContain(END)
    expect(result).toContain('hello')
  })

  it('appends markers to existing content that has no markers', () => {
    const result = applyStrategy('inject', 'existing content', 'managed')
    expect(result).toMatch(/existing content/)
    expect(result).toContain(START)
    expect(result).toContain('managed')
  })

  it('replaces only the content between existing markers', () => {
    const existing = `before\n${START}\nold\n${END}\nafter`
    const result = applyStrategy('inject', existing, 'new')
    expect(result).toContain('before')
    expect(result).toContain('after')
    expect(result).toContain('new')
    expect(result).not.toContain('old')
  })

  it('does not touch content outside markers', () => {
    const existing = `# My notes\n\n${START}\nmanaged\n${END}\n\n## More`
    const result = applyStrategy('inject', existing, 'updated')
    expect(result).toMatch(/# My notes/)
    expect(result).toMatch(/## More/)
    expect(result).not.toContain('managed')
    expect(result).toContain('updated')
  })

  it('trims whitespace from incoming content inside markers', () => {
    const result = applyStrategy('inject', '', '  hello  \n')
    expect(result).toContain(`${START}\nhello\n${END}`)
  })
})

describe('overwrite', () => {
  it('replaces entire content', () => {
    expect(applyStrategy('overwrite', 'old', 'new')).toBe('new')
  })

  it('works when existing is empty', () => {
    expect(applyStrategy('overwrite', '', 'new')).toBe('new')
  })
})

describe('append', () => {
  it('appends to existing content', () => {
    const result = applyStrategy('append', 'existing', 'appended')
    expect(result).toMatch(/existing/)
    expect(result).toMatch(/appended/)
  })

  it('returns incoming content when existing is empty', () => {
    expect(applyStrategy('append', '', 'content')).toBe('content')
  })

  it('does not duplicate a trailing newline', () => {
    const result = applyStrategy('append', 'a', 'b')
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'))
  })
})
