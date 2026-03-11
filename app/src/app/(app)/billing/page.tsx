'use client';

import { useEffect, useState } from 'react';
import PricingTable from '@/components/billing/PricingTable';

export default function BillingPage() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.profile?.tier) setTier(data.profile.tier);
    }
    loadProfile();
  }, []);

  async function handleSelectPlan(plan: 'pro' | 'premium') {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: 'monthly' }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-purple-300/60 text-sm mt-1">
          Manage your subscription and billing.
        </p>
      </div>

      {tier !== 'free' && (
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/20 flex items-center justify-between">
          <div>
            <p className="text-white font-medium capitalize">{tier} Plan</p>
            <p className="text-xs text-purple-400/60">Active subscription</p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="px-4 py-2 border border-purple-700/50 text-purple-300 rounded-xl text-sm hover:border-purple-500/50 transition-colors disabled:opacity-50"
          >
            Manage Billing
          </button>
        </div>
      )}

      <PricingTable currentTier={tier} onSelectPlan={handleSelectPlan} />
    </div>
  );
}
