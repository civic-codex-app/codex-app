import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const score = searchParams.get('score') ?? '0'
  const name = searchParams.get('name') ?? 'Unknown'
  const party = searchParams.get('party') ?? ''
  const matched = searchParams.get('matched') ?? '14'

  const partyColors: Record<string, string> = {
    democrat: '#3B82F6',
    republican: '#EF4444',
    green: '#22C55E',
    independent: '#A855F7',
  }

  const scoreNum = parseInt(score)
  const scoreColor =
    scoreNum >= 75 ? '#22C55E' : scoreNum >= 50 ? '#3B82F6' : scoreNum >= 25 ? '#EAB308' : '#EF4444'
  const accentColor = party ? partyColors[party] ?? '#8B5CF6' : scoreColor

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          backgroundColor: '#0A0A0F',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: `linear-gradient(90deg, ${accentColor}, ${scoreColor})`,
          }}
        />

        {/* Codex branding */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '30px',
            left: '60px',
            fontSize: '18px',
            color: '#6B7280',
            letterSpacing: '0.15em',
          }}
        >
          CODEX
        </div>

        {/* Score circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: `4px solid ${scoreColor}`,
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span style={{ fontSize: '16px', color: '#9CA3AF', marginTop: '4px' }}>
              % match
            </span>
          </div>
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '22px', color: '#9CA3AF' }}>
            My top match is
          </span>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#F9FAFB',
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: '16px', color: '#6B7280' }}>
            Based on {matched} issue positions
          </span>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '30px',
            fontSize: '14px',
            color: '#4B5563',
          }}
        >
          Take the quiz at codexapp.com/match
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
