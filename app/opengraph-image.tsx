import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'James Sax Corner - Premium Saxophones & Professional Wind Instruments'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
          backgroundColor: '#1a1a2e',
          backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              display: 'flex',
            }}
          >
            🎷
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#d4af37',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            James Sax Corner
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#e0e0e0',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Premium Saxophones & Professional Wind Instruments
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#b0b0b0',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            Trusted by Musicians Worldwide • Expert Maintenance • Worldwide Shipping
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
