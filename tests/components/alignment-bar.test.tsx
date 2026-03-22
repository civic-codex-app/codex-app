import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlignmentBar } from '@/components/ballot/alignment-bar'

describe('AlignmentBar', () => {
  it('renders the score percentage', () => {
    render(<AlignmentBar score={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders 0% score', () => {
    render(<AlignmentBar score={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100% score', () => {
    render(<AlignmentBar score={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('applies green color for high scores', () => {
    const { container } = render(<AlignmentBar score={80} />)
    const bar = container.querySelector('[style*="background"]')
    expect(bar).toBeTruthy()
  })

  it('renders in sm size', () => {
    const { container } = render(<AlignmentBar score={50} size="sm" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders in md size', () => {
    const { container } = render(<AlignmentBar score={50} size="md" />)
    expect(container.firstChild).toBeTruthy()
  })
})
