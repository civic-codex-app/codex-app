import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') ?? 'Unknown'
  const party = searchParams.get('party') ?? ''
  const state = searchParams.get('state') ?? ''
  const score = searchParams.get('score') ?? '0'

  const partyColors: Record<string, string> = {
    democrat: '#2563eb',
    republican: '#dc2626',
    green: '#16a34a',
    independent: '#7c3aed',
  }

  const partyLabels: Record<string, string> = {
    democrat: 'Democrat',
    republican: 'Republican',
    green: 'Green Party',
    independent: 'Independent',
  }

  const scoreNum = parseInt(score)
  const scoreColor =
    scoreNum >= 75
      ? '#22c55e'
      : scoreNum >= 50
        ? '#3b82f6'
        : scoreNum >= 25
          ? '#eab308'
          : '#ef4444'

  const accentColor = party ? partyColors[party] ?? '#7c3aed' : scoreColor
  const partyLabel = partyLabels[party] ?? party
  const subtitle = [partyLabel, state].filter(Boolean).join(' · ')

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
            color: '#6b7280',
            letterSpacing: '0.15em',
            fontWeight: 500,
          }}
        >
          CODEX
        </div>

        {/* "My Top Match" heading */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            color: '#9ca3af',
            marginBottom: '24px',
            letterSpacing: '0.05em',
          }}
        >
          My Top Match
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
            marginBottom: '32px',
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
                fontSize: '60px',
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: '16px',
                color: '#9ca3af',
                marginTop: '4px',
              }}
            >
              % match
            </span>
          </div>
        </div>

        {/* Politician name */}
        <div
          style={{
            display: 'flex',
            fontSize: name.length > 25 ? '40px' : '48px',
            fontWeight: 700,
            color: '#f9fafb',
            lineHeight: 1.1,
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          {name}
        </div>

        {/* Party + State */}
        {subtitle && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: accentColor,
              }}
            />
            <span style={{ color: accentColor }}>{subtitle}</span>
          </div>
        )}

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '30px',
            fontSize: '15px',
            color: '#4b5563',
          }}
        >
          See who agrees with you at codex-app-gold.vercel.app/match
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
