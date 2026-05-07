'use client';

import { useState } from 'react';

interface Props {
  email: string;
}

export default function VerificationGate({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [countdown, setCountdown] = useState(0);

  async function handleResend() {
    setStatus('sending');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json();
        setCountdown(data.retryAfter ?? 60);
        setStatus('idle');
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        return;
      }
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-4">✴</span>
        <h2 className="text-xl font-bold text-amber-400 mb-3">Confirm your email</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          We sent a verification link to
        </p>
        <p className="text-white font-medium text-sm mb-6 break-all">{email}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Click the link in that email to unlock your readings. Check your spam folder if you don&apos;t see it.
        </p>

        {status === 'sent' ? (
          <p className="text-amber-400 text-sm">Email sent — check your inbox.</p>
        ) : status === 'error' ? (
          <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
        ) : countdown > 0 ? (
          <p className="text-gray-500 text-sm">Resend available in {countdown}s</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={status === 'sending'}
            className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-2 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Resend verification email'}
          </button>
        )}
      </div>
    </div>
  );
}
