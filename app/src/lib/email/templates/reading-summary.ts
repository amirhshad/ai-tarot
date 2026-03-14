interface ReadingSummaryProps {
  readingId: string;
  spreadType: string;
  cardNames: string[];
  interpretationSnippet: string;
  baseUrl: string;
}

export function readingSummaryEmail({
  readingId,
  spreadType,
  cardNames,
  interpretationSnippet,
  baseUrl,
}: ReadingSummaryProps): string {
  const spreadLabel = spreadType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const cardsHtml = cardNames.map(name =>
    `<span style="display:inline-block;background:rgba(245,158,11,0.1);color:#f59e0b;font-size:13px;padding:4px 10px;border-radius:6px;margin:3px 2px;">${name}</span>`
  ).join('');
  const snippet = interpretationSnippet.length > 200
    ? interpretationSnippet.slice(0, 200) + '...'
    : interpretationSnippet;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:36px;color:#f59e0b;">✴</span>
      <h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;">TarotVeil</h1>
    </div>

    <div style="background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <h2 style="color:#f59e0b;font-size:18px;margin:0 0 8px;">${spreadLabel} Reading</h2>
      <p style="color:#666;font-size:13px;margin:0 0 20px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div style="margin-bottom:20px;">${cardsHtml}</div>

      <p style="color:#d4d4d4;font-size:14px;line-height:1.6;margin:0 0 24px;font-style:italic;">
        "${snippet}"
      </p>

      <div style="text-align:center;">
        <a href="${baseUrl}/reading/${readingId}" style="display:inline-block;background:#f59e0b;color:#000000;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          View Full Reading
        </a>
      </div>
    </div>

    <p style="color:#666666;font-size:12px;text-align:center;margin-top:32px;">
      TarotVeil — Narrative-driven tarot readings powered by AI
    </p>
  </div>
</body>
</html>`.trim();
}
