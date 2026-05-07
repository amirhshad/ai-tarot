'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function VerifiedToast() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace(pathname, { scroll: false });
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  if (!visible) return null;

  return (
    <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-medium text-sm px-5 py-3 rounded-xl shadow-lg">
      ✓ Email verified — welcome to Tarot Veil
    </div>
  );
}
