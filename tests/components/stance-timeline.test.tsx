import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StanceTimeline } from '@/components/politicians/stance-timeline'

describe('StanceTimeline', () => {
  it('shows current stance when no history', () => {
    render(
      <StanceTimeline
        entries={[]}
        currentStance="supports"
        issueName="Healthcare"
      />
    )
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText(/No stance changes on record/)).toBeInTheDocument()
  })

  it('shows current stance label', () => {
    render(
      <StanceTimeline
        entries={[]}
        currentStance="strongly_supports"
        issueName="Climate"
      />
    )
    expect(screen.getByText('Favors')).toBeInTheDocument()
  })

  it('renders historical entries', () => {
    render(
      <StanceTimeline
        entries={[
          {
            stance: 'opposes',
            effective_date: '2024-01-15',
            source_url: null,
            source_description: 'Voted against bill',
          },
          {
            stance: 'supports',
            effective_date: '2023-06-01',
            source_url: 'https://example.com',
            source_description: 'Public statement',
          },
        ]}
        currentStance="supports"
        issueName="Healthcare"
      />
    )
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('Opposes')).toBeInTheDocument()
    expect(screen.getByText('Voted against bill')).toBeInTheDocument()
    expect(screen.getByText('Public statement')).toBeInTheDocument()
  })

  it('renders source links when available', () => {
    render(
      <StanceTimeline
        entries={[
          {
            stance: 'opposes',
            effective_date: '2024-01-15',
            source_url: 'https://example.com',
            source_description: null,
          },
        ]}
        currentStance="supports"
        issueName="Test"
      />
    )
    const link = screen.getByText('Source')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com')
  })
})
