import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurpriseMatches } from '@/components/dashboard/surprise-matches'

const mockMatches = [
  {
    id: '1',
    name: 'Senator Smith',
    slug: 'senator-smith',
    party: 'republican',
    state: 'TX',
    chamber: 'senate',
    image_url: null,
    score: 72,
    matched: 10,
  },
  {
    id: '2',
    name: 'Rep. Jones',
    slug: 'rep-jones',
    party: 'republican',
    state: 'OH',
    chamber: 'house',
    image_url: null,
    score: 58,
    matched: 8,
  },
]

describe('SurpriseMatches', () => {
  it('renders nothing when no matches', () => {
    const { container } = render(<SurpriseMatches matches={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows reveal button initially', () => {
    render(<SurpriseMatches matches={mockMatches} />)
    expect(screen.getByText('Reveal your surprise matches')).toBeInTheDocument()
    expect(screen.queryByText('Senator Smith')).not.toBeInTheDocument()
  })

  it('reveals matches when button clicked', () => {
    render(<SurpriseMatches matches={mockMatches} />)
    fireEvent.click(screen.getByText('Reveal your surprise matches'))
    expect(screen.getByText('Senator Smith')).toBeInTheDocument()
    expect(screen.getByText('Rep. Jones')).toBeInTheDocument()
  })

  it('shows alignment scores after reveal', () => {
    render(<SurpriseMatches matches={mockMatches} />)
    fireEvent.click(screen.getByText('Reveal your surprise matches'))
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
  })

  it('shows section header', () => {
    render(<SurpriseMatches matches={mockMatches} />)
    expect(screen.getByText('Across the Aisle')).toBeInTheDocument()
  })
})
