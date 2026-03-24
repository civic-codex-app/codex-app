import { ImageResponse } from 'next/og'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const runtime = 'edge'
export const alt = 'Politician Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PARTY_COLORS: Record<string, string> = {
  democrat: '#3b82f6',
  republican: '#ef4444',
  independent: '#a855f7',
  green: '#22c55e',
}

const PARTY_LABELS: Record<string, string> = {
  democrat: 'Democrat',
  republican: 'Republican',
  independent: 'Independent',
  green: 'Green',
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data: pol } = await supabase
    .from('politicians')
    .select('name, party, state, title, image_url, chamber')
    .eq('slug', slug)
    .single()

  if (!pol) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#050505',
            color: '#fff',
            fontSize: 48,
            fontFamily: 'sans-serif',
          }}
        >
          Poli — Know Your Politicians
        </div>
      ),
      { ...size },
    )
  }

  const partyColor = PARTY_COLORS[pol.party] ?? '#6b7280'
  const partyLabel = PARTY_LABELS[pol.party] ?? pol.party

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#050505',
          color: '#fff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: partyColor,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '60px 80px',
            gap: 60,
            width: '100%',
          }}
        >
          {/* Avatar */}
          {pol.image_url ? (
            <img
              src={pol.image_url}
              alt=""
              width={220}
              height={220}
              style={{
                borderRadius: 110,
                objectFit: 'cover',
                border: `4px solid ${partyColor}`,
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: '#1a1a1a',
                border: `4px solid ${partyColor}`,
                fontSize: 72,
                color: '#666',
              }}
            >
              {pol.name.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
              {pol.name}
            </div>
            <div style={{ fontSize: 26, color: '#999', lineHeight: 1.3 }}>
              {pol.title}{pol.state ? ` — ${pol.state}` : ''}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: partyColor,
                }}
              />
              <span style={{ fontSize: 22, color: partyColor, fontWeight: 600 }}>
                {partyLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 20,
            color: '#666',
          }}
        >
          getpoli.app
        </div>
      </div>
    ),
    { ...size },
  )
}
