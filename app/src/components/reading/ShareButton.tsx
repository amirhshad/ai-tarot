'use client';

import { useState } from 'react';

interface ShareButtonProps {
  readingId: string;
  existingShareUrl?: string | null;
}

export default function ShareButton({ readingId, existingShareUrl }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(existingShareUrl || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  async function handleShare() {
    if (shareUrl) {
      setShowPanel(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reading/${readingId}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
        setShowPanel(true);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const twitterUrl = shareUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my tarot reading!')}&url=${encodeURIComponent(shareUrl)}`
    : '';
  const whatsappUrl = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Check out my tarot reading: ${shareUrl}`)}`
    : '';
  const facebookUrl = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : '';

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-white/15 text-gray-300 hover:border-amber-400/50 hover:text-amber-400 transition-colors disabled:opacity-50"
      >
        {loading ? (
          'Creating link...'
        ) : shareUrl ? (
          <>
            <ShareIcon />
            Shared
          </>
        ) : (
          <>
            <ShareIcon />
            Share Reading
          </>
        )}
      </button>

      {showPanel && shareUrl && (
        <div className="absolute bottom-full mb-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-72 p-4 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Share this reading</span>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-white text-lg leading-none"
            >
              &times;
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
          >
            <ClipboardIcon />
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {/* Social buttons */}
          <div className="flex gap-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              X
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
