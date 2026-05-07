function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface VerificationEmailProps {
  verifyUrl: string;
  displayName?: string;
}

export function verificationEmail({ verifyUrl, displayName }: VerificationEmailProps): string {
  const greeting = displayName ? `Hi ${escapeHtml(displayName)}` : 'Hello';

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
      <h2 style="color:#f59e0b;font-size:18px;margin:0 0 16px;">${greeting},</h2>
      <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 16px;">
        The cards are waiting. Confirm your email address to unlock your readings and keep your journey with TarotVeil.
      </p>
      <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
        This link expires in 24 hours.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:#000000;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Verify My Email
        </a>
      </div>
      <p style="color:#666666;font-size:12px;line-height:1.6;margin:0;">
        Or copy this link into your browser:<br>
        <span style="color:#a3a3a3;word-break:break-all;">${verifyUrl}</span>
      </p>
    </div>

    <p style="color:#666666;font-size:12px;text-align:center;margin-top:32px;">
      If you didn't create a TarotVeil account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
}
