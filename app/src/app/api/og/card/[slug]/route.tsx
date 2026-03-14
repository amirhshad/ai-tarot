import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const card = DECK.find(c => cardToSlug(c) === params.slug);
  if (!card) {
    return new Response('Card not found', { status: 404 });
  }

  const suitLabel = card.arcana === 'major'
    ? `Major Arcana · ${card.number}`
    : `${card.suit ? card.suit.charAt(0).toUpperCase() + card.suit.slice(1) : ''} · ${card.number}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a1510 0%, #0d0b08 50%, #1a1510 100%)',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              color: '#b08d57',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {suitLabel}
          </div>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#f5f0e8',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {card.name}
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#b08d57',
              marginTop: '8px',
            }}
          >
            Tarot Card Meaning
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            {card.keywords.slice(0, 4).map((kw) => (
              <div
                key={kw}
                style={{
                  fontSize: '14px',
                  color: '#8a7a5a',
                  border: '1px solid #3d3425',
                  borderRadius: '20px',
                  padding: '6px 16px',
                }}
              >
                {kw}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#6a5a3a',
              marginTop: '32px',
              letterSpacing: '0.15em',
            }}
          >
            TAROTVEIL.COM
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
