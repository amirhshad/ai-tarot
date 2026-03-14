import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getReadingByShareToken } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  const reading = await getReadingByShareToken(token);
  if (!reading) {
    return new Response('Reading not found', { status: 404 });
  }

  const spread = getSpread(reading.spread_type);
  const cardsData = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
  const cards = spread
    ? deserializeDrawnCards(cardsData, spread.positions)
    : [];

  const spreadLabel = reading.spread_type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '60px',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px', color: '#f59e0b' }}>✴</span>
          <span style={{ fontSize: '28px', color: '#ffffff', fontWeight: 600 }}>TarotVeil</span>
        </div>

        {/* Spread type */}
        <div style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '32px' }}>
          {spreadLabel} Reading
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            maxWidth: '900px',
          }}
        >
          {cards.map((dc, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                {dc.position.name}
              </span>
              <span style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 600 }}>
                {dc.card.name}
              </span>
              {dc.reversed && (
                <span style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>
                  Reversed
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '40px' }}>
          Get your own reading at TarotVeil
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
