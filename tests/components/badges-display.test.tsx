import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BadgesDisplay } from '@/components/dashboard/badges-display'

describe('BadgesDisplay', () => {
  it('renders all 8 badge slots', () => {
    render(<BadgesDisplay earnedBadges={[]} />)
    // All 8 badge names should appear in the DOM
    expect(screen.getByText('First Vote')).toBeInTheDocument()
    expect(screen.getByText('Informed Voter')).toBeInTheDocument()
    expect(screen.getByText('Issue Expert')).toBeInTheDocument()
    expect(screen.getByText('Bill Watcher')).toBeInTheDocument()
    expect(screen.getByText('Civic Regular')).toBeInTheDocument()
    expect(screen.getByText('Civic Champion')).toBeInTheDocument()
    expect(screen.getByText('Networker')).toBeInTheDocument()
    expect(screen.getByText('Dedicated Citizen')).toBeInTheDocument()
  })

  it('shows earned badge names', () => {
    render(<BadgesDisplay earnedBadges={['first_vote', 'informed_voter']} />)
    expect(screen.getByText('First Vote')).toBeInTheDocument()
    expect(screen.getByText('Informed Voter')).toBeInTheDocument()
  })

  it('shows progress count', () => {
    render(<BadgesDisplay earnedBadges={['first_vote', 'informed_voter']} />)
    expect(screen.getByText(/2 of 8/)).toBeInTheDocument()
  })

  it('shows 0 of 8 when no badges earned', () => {
    render(<BadgesDisplay earnedBadges={[]} />)
    expect(screen.getByText(/0 of 8/)).toBeInTheDocument()
  })

  it('shows all 8 when fully earned', () => {
    const allBadges = [
      'first_vote', 'informed_voter', 'issue_expert', 'bill_watcher',
      'civic_regular', 'civic_champion', 'networker', 'dedicated',
    ]
    render(<BadgesDisplay earnedBadges={allBadges} />)
    expect(screen.getByText(/8 of 8/)).toBeInTheDocument()
  })
})
