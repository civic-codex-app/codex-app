import { describe, it, expect } from 'vitest'
import { decodeEntities, extractUrl, htmlToText, parseRssItems } from '@/lib/utils/news'

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

describe("extractUrl", () => {
  it("unwraps a CDATA-wrapped link", () => {
    // ABC News wraps every <link> this way. Taken raw, the stored value kept
    // the wrapper, and an href that is not an absolute URL resolves relative
    // to our own origin — which is how 49 homepage links came to 404.
    expect(extractUrl("<![CDATA[https://abcnews.com/Politics/story?id=1]]>")).toBe(
      "https://abcnews.com/Politics/story?id=1"
    )
  })

  it("decodes entities in query strings", () => {
    expect(extractUrl("https://example.com/a?x=1&amp;y=2")).toBe("https://example.com/a?x=1&y=2")
  })

  it("trims surrounding whitespace and newlines", () => {
    expect(extractUrl("\n  https://example.com/b  \n")).toBe("https://example.com/b")
  })

  it("returns empty for anything that is not an absolute http(s) URL", () => {
    // Each of these would otherwise be rendered as a relative path.
    expect(extractUrl("")).toBe("")
    expect(extractUrl("/Politics/wireStory/x")).toBe("")
    expect(extractUrl("not a url at all")).toBe("")
    expect(extractUrl("javascript:alert(1)")).toBe("")
    expect(extractUrl("<![CDATA[]]>")).toBe("")
  })

  it("parseRssItems yields a clean link for a CDATA feed", () => {
    const xml =
      "<rss><channel><item>" +
      "<title><![CDATA[Headline &amp; more]]></title>" +
      "<link><![CDATA[https://abcnews.com/Politics/wireStory/x-123]]></link>" +
      "</item></channel></rss>"
    const [item] = parseRssItems(xml)
    expect(item.link).toBe("https://abcnews.com/Politics/wireStory/x-123")
    expect(item.title).toBe("Headline & more")
  })

  it("parseRssItems drops an item whose link cannot be used", () => {
    const xml =
      "<rss><channel><item><title>Relative</title><link>/not/absolute</link></item></channel></rss>"
    expect(parseRssItems(xml)).toEqual([])
  })
})
