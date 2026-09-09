import { describe, it, expect } from 'vitest'
import { decodeEntities, htmlToText, parseRssItems } from '@/lib/utils/news'

describe('decodeEntities', () => {
  it('decodes named entities', () => {
    expect(decodeEntities('Smith &amp; Co. &quot;quoted&quot;')).toBe('Smith & Co. "quoted"')
    expect(decodeEntities('&lt;a&gt;')).toBe('<a>')
  })

  it('decodes decimal and hex numeric entities', () => {
    expect(decodeEntities('America&#039;s')).toBe("America's")
    expect(decodeEntities('&#8217;')).toBe('’')
    expect(decodeEntities('&#x2019;')).toBe('’')
  })

  it('leaves unknown and malformed entities alone', () => {
    expect(decodeEntities('&notarealentity;')).toBe('&notarealentity;')
    expect(decodeEntities('AT&T')).toBe('AT&T')
    expect(decodeEntities('&#xD800;')).toBe('&#xD800;')
  })
})

describe('htmlToText', () => {
  it('strips ordinary markup', () => {
    expect(htmlToText('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('unwraps CDATA', () => {
    expect(htmlToText('<![CDATA[Plain summary]]>')).toBe('Plain summary')
  })

  it('strips entity-escaped markup wrapped in CDATA', () => {
    // The Guardian's real shape: CDATA around markup whose own tags are
    // entity-escaped, so a tag strip alone matches nothing.
    const raw =
      '<![CDATA[<p>Lead sentence</p><a href="https://example.com/x?utm_source=A&amp;utm_campaign=B">Continue reading</a>]]>'
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace('&lt;![CDATA[', '<![CDATA[')
        .replace(']]&gt;', ']]>')
    const out = htmlToText(raw)
    expect(out).toBe('Lead sentence Continue reading')
    expect(out).not.toContain('utm_source')
    expect(out).not.toContain('href')
  })

  it('leaves no token long enough to blow out a grid track', () => {
    const url = `https://example.com/${'a'.repeat(240)}`
    const raw = `<![CDATA[&lt;p&gt;Story&lt;/p&gt;&lt;a href="${url}"&gt;Read&lt;/a&gt;]]>`
    const longest = htmlToText(raw)
      .split(/\s+/)
      .reduce((a, w) => (w.length > a.length ? w : a), '')
    expect(longest.length).toBeLessThan(40)
  })

  it('collapses whitespace including non-breaking spaces', () => {
    expect(htmlToText('a&nbsp;&nbsp;b\n\n c')).toBe('a b c')
  })

  it('handles empty input', () => {
    expect(htmlToText('')).toBe('')
  })
})

describe('parseRssItems', () => {
  it('decodes entities in titles', () => {
    const xml =
      '<rss><channel><item>' +
      '<title>Navarro: ouster was &#039;totally unacceptable&#039;</title>' +
      '<link>https://example.com/a</link>' +
      '</item></channel></rss>'
    expect(parseRssItems(xml)[0].title).toBe("Navarro: ouster was 'totally unacceptable'")
  })

  it('reduces an escaped-markup description to plain text', () => {
    const xml =
      '<rss><channel><item>' +
      '<title>Headline</title>' +
      '<link>https://example.com/b</link>' +
      '<description>&lt;p&gt;Body text&lt;/p&gt;&lt;a href="https://example.com/tracking?utm_campaign=XYZ"&gt;Continue reading&lt;/a&gt;</description>' +
      '</item></channel></rss>'
    const [item] = parseRssItems(xml)
    expect(item.description).toBe('Body text Continue reading')
    expect(item.description).not.toContain('utm_campaign')
  })

  it('skips items missing a title or link', () => {
    const xml =
      '<rss><channel>' +
      '<item><title>No link</title></item>' +
      '<item><link>https://example.com/c</link></item>' +
      '<item><title>Good</title><link>https://example.com/d</link></item>' +
      '</channel></rss>'
    expect(parseRssItems(xml).map((i) => i.title)).toEqual(['Good'])
  })
})
