export const CHAMBERS = ['all', 'senate', 'house', 'governor', 'presidential', 'mayor', 'city_council', 'state_senate', 'state_house', 'county', 'school_board', 'other_local'] as const

export type ChamberKey = (typeof CHAMBERS)[number]

export const CHAMBER_LABELS: Record<ChamberKey, string> = {
  all: 'All',
  senate: 'Senate',
  house: 'House',
  governor: 'Statewide',
  presidential: 'Presidential',
  mayor: 'Mayor',
  city_council: 'City Council',
  state_senate: 'State Senate',
  state_house: 'State House',
  county: 'County',
  school_board: 'School Board',
  other_local: 'Other Local',
}
