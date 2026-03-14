'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      if (data.profile) {
        setDisplayName(data.profile.display_name || '');
        setLanguage(data.profile.language || 'en');
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, language }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50"
          >
            <option value="en">English</option>
            <option value="fa">فارسی (Farsi)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-medium rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-400">Saved!</span>}
        </div>
      </form>

      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
