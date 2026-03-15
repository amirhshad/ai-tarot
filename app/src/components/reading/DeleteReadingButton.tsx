'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteReadingButton({ readingId }: { readingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/reading/${readingId}`, { method: 'DELETE' });
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          {deleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setConfirming(true);
      }}
      className="text-xs text-gray-600 hover:text-red-400 transition-colors p-1"
      title="Delete reading"
    >
      &#10005;
    </button>
  );
}
