import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyDatesTimeline } from '@/components/elections/key-dates-timeline'

describe('KeyDatesTimeline', () => {
  it('shows election day even with no key dates', () => {
    render(<KeyDatesTimeline dates={[]} electionDate="2026-11-03" />)
    expect(screen.getByText('Election Day')).toBeInTheDocument()
    expect(screen.getByText(/Nov 3, 2026/)).toBeInTheDocument()
  })

  it('renders key dates with correct labels', () => {
    render(
      <KeyDatesTimeline
        dates={[
          {
            date_type: 'registration_deadline',
            event_date: '2026-10-05',
            description: 'Last day to register',
            source_url: null,
          },
          {
            date_type: 'early_voting_start',
            event_date: '2026-10-19',
            description: null,
            source_url: null,
          },
        ]}
        electionDate="2026-11-03"
      />
    )
    expect(screen.getByText('Registration Deadline')).toBeInTheDocument()
    expect(screen.getByText('Early Voting Begins')).toBeInTheDocument()
    expect(screen.getByText('Last day to register')).toBeInTheDocument()
  })

  it('does not duplicate election day if already in dates', () => {
    render(
      <KeyDatesTimeline
        dates={[
          {
            date_type: 'election_day',
            event_date: '2026-11-03',
            description: 'General election',
            source_url: null,
          },
        ]}
        electionDate="2026-11-03"
      />
    )
    const electionDayLabels = screen.getAllByText('Election Day')
    expect(electionDayLabels).toHaveLength(1)
  })
})
