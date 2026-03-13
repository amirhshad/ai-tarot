import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TarotVeil — AI-Powered Tarot Readings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #0a0612, #060208)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Subtle gold border */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            border: '1px solid rgba(212, 160, 67, 0.15)',
            display: 'flex',
          }}
        />

        {/* Decorative star */}
        <div
          style={{
            color: 'rgba(212, 160, 67, 0.3)',
            fontSize: 32,
            marginBottom: 24,
            display: 'flex',
          }}
        >
          ✦
        </div>

        {/* Brand name */}
        <div
          style={{
            color: 'rgba(212, 160, 67, 0.85)',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '0.05em',
            display: 'flex',
          }}
        >
          TarotVeil
        </div>

        {/* Divider line */}
        <div
          style={{
            width: 120,
            height: 1,
            background: 'rgba(212, 160, 67, 0.3)',
            marginTop: 24,
            marginBottom: 24,
            display: 'flex',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            color: 'rgba(214, 211, 209, 0.7)',
            fontSize: 28,
            fontWeight: 300,
            display: 'flex',
          }}
        >
          AI-Powered Tarot Readings That Tell Your Story
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            color: 'rgba(212, 160, 67, 0.2)',
            fontSize: 14,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          tarotveil.com
        </div>
      </div>
    ),
    { ...size }
  );
}
