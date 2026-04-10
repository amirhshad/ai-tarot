'use client';

import { useEffect, useState } from 'react';
import PricingTable from '@/components/billing/PricingTable';

export default function BillingPage() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: 'monthly' }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError('Failed to connect to payment service');
      console.error('Checkout error:', err);
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
        <p className="text-gray-500 text-sm mt-1">
          Manage your subscription and billing.
        </p>
      </div>

      {tier !== 'free' && (
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-white font-medium capitalize">{tier} Plan</p>
            <p className="text-xs text-gray-500">Active subscription</p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="px-4 py-2 border border-white/15 text-gray-400 rounded-xl text-sm hover:border-white/30 transition-colors disabled:opacity-50"
          >
            Manage Billing
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <PricingTable currentTier={tier} onSelectPlan={handleSelectPlan} />
    </div>
  );
}
