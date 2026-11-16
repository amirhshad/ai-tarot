import { ImageResponse } from 'next/og';

export const brandOgSize = { width: 1200, height: 630 };
export const brandOgContentType = 'image/png';
export const brandOgAlt = 'TarotVeil — AI-Powered Tarot Readings';

/** Shared by /opengraph-image and /twitter-image so the two URLs match. */
export function renderBrandOgImage() {
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
        <div
          style={{
            position: 'absolute',
            inset: 20,
            border: '1px solid rgba(212, 160, 67, 0.15)',
            display: 'flex',
          }}
        />

        {/* A glyph here makes next/og fetch a font at request time, which
            fails closed and draws a missing-character box. A rotated square
            stays in the default renderer. */}
        <div
          style={{
            width: 18,
            height: 18,
            marginBottom: 28,
            background: 'rgba(212, 160, 67, 0.45)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />

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
    { ...brandOgSize }
  );
}
