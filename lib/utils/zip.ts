import zipToDistrictData from '@/lib/data/zip-to-district.json'

export type DistrictEntry = { state: string; district: string }

const zipLookup = zipToDistrictData as Record<string, DistrictEntry[]>

/** Every congressional district a ZIP touches; 7,299 of 33,774 touch more than one. */
export function districtsForZip(zip: string): DistrictEntry[] {
  return zipLookup[zip] ?? []
}

/**
 * The state a ZIP sits in: from the district map when it is listed, else from
 * the three-digit prefix. The prefix table is the USPS allocation and is only
 * a fallback — it cannot tell a Minneapolis ZIP from a St. Paul one, but it
 * can tell Michigan from Ohio, which is enough to name senators and a governor.
 */
export function stateForZip(zip: string): string | null {
  const listed = districtsForZip(zip)
  if (listed.length) return listed[0].state
  const prefix = parseInt(zip.substring(0, 3), 10)
  if (prefix >= 35 && prefix <= 36) return 'AL'
  if (prefix >= 995 && prefix <= 999) return 'AK'
  if (prefix >= 850 && prefix <= 865) return 'AZ'
  if (prefix >= 716 && prefix <= 729) return 'AR'
  if (prefix >= 900 && prefix <= 961) return 'CA'
  if (prefix >= 800 && prefix <= 816) return 'CO'
  if (prefix >= 60 && prefix <= 69) return 'CT'
  if (prefix >= 197 && prefix <= 199) return 'DE'
  if (prefix >= 200 && prefix <= 205) return 'DC'
  if (prefix >= 320 && prefix <= 349) return 'FL'
  if (prefix >= 300 && prefix <= 319) return 'GA'
  if (prefix >= 967 && prefix <= 968) return 'HI'
  if (prefix >= 832 && prefix <= 838) return 'ID'
  if (prefix >= 600 && prefix <= 629) return 'IL'
  if (prefix >= 460 && prefix <= 479) return 'IN'
  if (prefix >= 500 && prefix <= 528) return 'IA'
  if (prefix >= 660 && prefix <= 679) return 'KS'
  if (prefix >= 400 && prefix <= 427) return 'KY'
  if (prefix >= 700 && prefix <= 714) return 'LA'
  if (prefix >= 39 && prefix <= 49) return 'ME'
  if (prefix >= 206 && prefix <= 219) return 'MD'
  if (prefix >= 10 && prefix <= 27) return 'MA'
  if (prefix >= 480 && prefix <= 499) return 'MI'
  if (prefix >= 550 && prefix <= 567) return 'MN'
  if (prefix >= 386 && prefix <= 397) return 'MS'
  if (prefix >= 630 && prefix <= 658) return 'MO'
  if (prefix >= 590 && prefix <= 599) return 'MT'
  if (prefix >= 680 && prefix <= 693) return 'NE'
  if (prefix >= 889 && prefix <= 898) return 'NV'
  if (prefix >= 30 && prefix <= 38) return 'NH'
  if (prefix >= 70 && prefix <= 89) return 'NJ'
  if (prefix >= 870 && prefix <= 884) return 'NM'
  if (prefix >= 100 && prefix <= 149) return 'NY'
  if (prefix >= 270 && prefix <= 289) return 'NC'
  if (prefix >= 580 && prefix <= 588) return 'ND'
  if (prefix >= 430 && prefix <= 458) return 'OH'
  if (prefix >= 730 && prefix <= 749) return 'OK'
  if (prefix >= 970 && prefix <= 979) return 'OR'
  if (prefix >= 150 && prefix <= 196) return 'PA'
  if (prefix >= 28 && prefix <= 29) return 'RI'
  if (prefix >= 290 && prefix <= 299) return 'SC'
  if (prefix >= 570 && prefix <= 577) return 'SD'
  if (prefix >= 370 && prefix <= 385) return 'TN'
  if (prefix >= 750 && prefix <= 799) return 'TX'
  if (prefix >= 840 && prefix <= 847) return 'UT'
  if (prefix >= 50 && prefix <= 59) return 'VT'
  if (prefix >= 220 && prefix <= 246) return 'VA'
  if (prefix >= 980 && prefix <= 994) return 'WA'
  if (prefix >= 247 && prefix <= 268) return 'WV'
  if (prefix >= 530 && prefix <= 549) return 'WI'
  if (prefix >= 820 && prefix <= 831) return 'WY'
  return null
}

export function isZip(value: unknown): value is string {
  return typeof value === 'string' && /^\d{5}$/.test(value)
}
