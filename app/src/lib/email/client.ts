import { Resend } from 'resend';
import { welcomeEmail } from './templates/welcome';
import { readingSummaryEmail } from './templates/reading-summary';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return; // Silently skip if no API key configured
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    await resend.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }
}

export async function sendWelcomeEmail(email: string, displayName?: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
  const html = welcomeEmail({ displayName, baseUrl });
  await sendEmail(email, 'Welcome to TarotVeil — Your first reading awaits ✴', html);
}

export async function sendReadingSummary(
  email: string,
  readingId: string,
  spreadType: string,
  cardNames: string[],
  interpretationSnippet: string,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
  const html = readingSummaryEmail({ readingId, spreadType, cardNames, interpretationSnippet, baseUrl });
  const subject = `Your ${spreadType.replace('-', ' ')} reading is ready`;
  await sendEmail(email, subject, html);
}
