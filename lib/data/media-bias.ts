/**
 * Media bias ratings for ~200 major US news sources.
 * Based on AllSides media bias ratings (public knowledge).
 *
 * Scale: left | center-left | center | center-right | right
 * Display groups collapse to: left | center | right
 */

export type MediaBias = 'left' | 'center-left' | 'center' | 'center-right' | 'right'
export type BiasGroup = 'left' | 'center' | 'right' | 'unknown'

export const MEDIA_BIAS: Record<string, MediaBias> = {
  // === LEFT ===
  'motherjones.com': 'left',
  'dailykos.com': 'left',
  'jacobin.com': 'left',
  'thenation.com': 'left',
  'truthout.org': 'left',
  'commondreams.org': 'left',
  'democracynow.org': 'left',
  'alternet.org': 'left',
  'rawstory.com': 'left',
  'salon.com': 'left',
  'thinkprogress.org': 'left',
  'occupy.com': 'left',
  'currentaffairs.org': 'left',
  'inthesetimes.com': 'left',
  'theintercept.com': 'left',
  'newrepublic.com': 'left',
  'prospect.org': 'left',

  // === CENTER-LEFT ===
  'nytimes.com': 'center-left',
  'washingtonpost.com': 'center-left',
  'cnn.com': 'center-left',
  'msnbc.com': 'center-left',
  'nbcnews.com': 'center-left',
  'abcnews.go.com': 'center-left',
  'cbsnews.com': 'center-left',
  'politico.com': 'center-left',
  'vox.com': 'center-left',
  'slate.com': 'center-left',
  'thedailybeast.com': 'center-left',
  'buzzfeednews.com': 'center-left',
  'huffpost.com': 'center-left',
  'huffingtonpost.com': 'center-left',
  'theatlantic.com': 'center-left',
  'newyorker.com': 'center-left',
  'guardian.com': 'center-left',
  'theguardian.com': 'center-left',
  'bbc.com': 'center-left',
  'bbc.co.uk': 'center-left',
  'npr.org': 'center-left',
  'time.com': 'center-left',
  'latimes.com': 'center-left',
  'usatoday.com': 'center-left',
  'newsweek.com': 'center-left',
  'bloomberg.com': 'center-left',
  'vice.com': 'center-left',
  'talkingpointsmemo.com': 'center-left',
  'thehill.com': 'center-left',
  'pbs.org': 'center-left',
  'insider.com': 'center-left',
  'businessinsider.com': 'center-left',
  'axios.com': 'center-left',
  'chicagotribune.com': 'center-left',
  'sfchronicle.com': 'center-left',
  'bostonglobe.com': 'center-left',
  'seattletimes.com': 'center-left',
  'nydailynews.com': 'center-left',
  'vanityfair.com': 'center-left',

  // === CENTER ===
  'apnews.com': 'center',
  'reuters.com': 'center',
  'c-span.org': 'center',
  'allsides.com': 'center',
  'realclearpolitics.com': 'center',
  'factcheck.org': 'center',
  'politifact.com': 'center',
  'snopes.com': 'center',
  'propublica.org': 'center',
  'economist.com': 'center',
  'csmonitor.com': 'center',
  'fivethirtyeight.com': 'center',
  'ballotpedia.org': 'center',
  'govtrack.us': 'center',
  'scotusblog.com': 'center',
  'theconversation.com': 'center',
  'ground.news': 'center',
  'lawfaremedia.org': 'center',
  'marketwatch.com': 'center',
  'aol.com': 'center',
  'yahoo.com': 'center',
  'news.yahoo.com': 'center',
  'msn.com': 'center',
  'usnews.com': 'center',

  // === CENTER-RIGHT ===
  'wsj.com': 'center-right',
  'foxbusiness.com': 'center-right',
  'forbes.com': 'center-right',
  'nationalreview.com': 'center-right',
  'reason.com': 'center-right',
  'washingtonexaminer.com': 'center-right',
  'washingtontimes.com': 'center-right',
  'nypost.com': 'center-right',
  'freebeacon.com': 'center-right',
  'spectator.org': 'center-right',
  'city-journal.org': 'center-right',
  'weeklystandard.com': 'center-right',
  'thedispatch.com': 'center-right',
  'thebulwark.com': 'center-right',
  'commentary.org': 'center-right',
  'hotair.com': 'center-right',
  'townhall.com': 'center-right',
  'redstate.com': 'center-right',
  'theamericanconservative.com': 'center-right',
  'judicialwatch.org': 'center-right',

  // === RIGHT ===
  'foxnews.com': 'right',
  'breitbart.com': 'right',
  'dailywire.com': 'right',
  'dailycaller.com': 'right',
  'thefederalist.com': 'right',
  'newsmax.com': 'right',
  'oann.com': 'right',
  'thegatewaypundit.com': 'right',
  'pjmedia.com': 'right',
  'twitchy.com': 'right',
  'wnd.com': 'right',
  'lifenews.com': 'right',
  'lifesitenews.com': 'right',
  'cnsnews.com': 'right',
  'theblaze.com': 'right',
  'westernjournal.com': 'right',
  'epochtimes.com': 'right',
  'theepochtimes.com': 'right',
  'justthenews.com': 'right',
  'americanthinker.com': 'right',
}

/**
 * Extract domain from a URL (strips www. prefix)
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname
  } catch {
    return ''
  }
}

/**
 * Get the bias rating for a URL
 */
export function getBias(url: string): MediaBias | null {
  const domain = extractDomain(url)
  return MEDIA_BIAS[domain] ?? null
}

/**
 * Get the display group (left/center/right) for a bias rating
 */
export function biasToGroup(bias: MediaBias | null): BiasGroup {
  if (!bias) return 'unknown'
  if (bias === 'left' || bias === 'center-left') return 'left'
  if (bias === 'center') return 'center'
  if (bias === 'center-right' || bias === 'right') return 'right'
  return 'unknown'
}

/**
 * Display label for each bias group
 */
export const BIAS_GROUP_LABELS: Record<BiasGroup, string> = {
  left: 'Left-Leaning',
  center: 'Center',
  right: 'Right-Leaning',
  unknown: 'Other Sources',
}

/**
 * Color for each bias group (subtle tints)
 */
export const BIAS_GROUP_COLORS: Record<BiasGroup, { bg: string; text: string; dot: string }> = {
  left: { bg: 'rgba(59, 130, 246, 0.08)', text: '#60a5fa', dot: '#3b82f6' },
  center: { bg: 'rgba(156, 163, 175, 0.08)', text: '#9ca3af', dot: '#6b7280' },
  right: { bg: 'rgba(239, 68, 68, 0.08)', text: '#f87171', dot: '#ef4444' },
  unknown: { bg: 'rgba(156, 163, 175, 0.05)', text: '#6b7280', dot: '#4b5563' },
}
