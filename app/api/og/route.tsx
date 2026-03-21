import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Codex'
  const subtitle = searchParams.get('subtitle') ?? 'Civic Engagement Platform'
  const party = searchParams.get('party') // democrat, republican, etc.
  const type = searchParams.get('type') ?? 'default' // politician, issue, election

  const partyColors: Record<string, string> = {
    democrat: '#3B82F6',
    republican: '#EF4444',
    green: '#22C55E',
    independent: '#A855F7',
  }

  const accentColor = party ? partyColors[party] ?? '#8B5CF6' : '#8B5CF6'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
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
            background: accentColor,
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: '#9CA3AF',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
            }}
          >
            CODEX
          </div>
          {type !== 'default' && (
            <div
              style={{
                display: 'flex',
                fontSize: '16px',
                color: '#6B7280',
                marginLeft: '8px',
              }}
            >
              {type === 'politician'
                ? '— Politician Profile'
                : type === 'issue'
                  ? '— Policy Issue'
                  : type === 'election'
                    ? '— Election'
                    : ''}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 30 ? '56px' : '72px',
            fontWeight: 700,
            color: '#F9FAFB',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              color: '#9CA3AF',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Party indicator */}
        {party && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: '60px',
              left: '80px',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: accentColor,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                color: accentColor,
                textTransform: 'capitalize' as const,
              }}
            >
              {party === 'democrat'
                ? 'Democratic Party'
                : party === 'republican'
                  ? 'Republican Party'
                  : party}
            </div>
          </div>
        )}

        {/* Bottom right URL */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '60px',
            right: '80px',
            fontSize: '18px',
            color: '#4B5563',
          }}
        >
          codexapp.org
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
