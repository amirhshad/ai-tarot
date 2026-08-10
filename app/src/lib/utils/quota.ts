import { SpreadType } from '@/lib/tarot/types';
import { getPlan } from '@/lib/stripe/config';
import { getUsage, upsertUsage } from '@/lib/db/queries';
import { PAYMENTS_ENABLED } from '@/lib/config/features';

/**
 * Current quota period — one UTC day (YYYY-MM-DD).
 *
 * Stored in the `usage.week_start` column, which is now a generic period key.
 * The column name is legacy; no migration is needed since old weekly rows simply
 * fall outside today's key and are ignored.
 */
function getCurrentPeriod(): string {
  return new Date().toISOString().split('T')[0];
}

/** Check if a user can perform a reading of the given spread type */
export async function checkQuota(
  userId: string,
  tier: string,
  spreadType: SpreadType,
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = getPlan(tier);

  // Paid users have unlimited readings
  if (tier !== 'free') {
    return { allowed: true };
  }

  const period = getCurrentPeriod();
  const usage = await getUsage(userId, period);

  const currentUsage = usage || {
    single_count: 0,
    three_card_count: 0,
    celtic_cross_count: 0,
    horseshoe_count: 0,
  };

  // With payments disabled there is nothing for a free user to upgrade to,
  // so the copy points at the reset instead of at a checkout page.
  const limitSuffix = PAYMENTS_ENABLED
    ? ' Upgrade to Pro for unlimited readings.'
    : ' Come back tomorrow for another.';
  const membersOnly = (spread: string) =>
    PAYMENTS_ENABLED
      ? `${spread} is available for Pro and Premium members.`
      : `${spread} is available to members only.`;

  switch (spreadType) {
    case 'single':
      if (currentUsage.single_count >= plan.limits.singlePerDay) {
        return { allowed: false, reason: `Daily single card limit reached.${limitSuffix}` };
      }
      break;
    case 'three-card':
      if (currentUsage.three_card_count >= plan.limits.threeCardPerDay) {
        return { allowed: false, reason: `Daily three-card limit reached.${limitSuffix}` };
      }
      break;
    case 'celtic-cross':
      if (plan.limits.celticCrossPerDay === 0) {
        return { allowed: false, reason: membersOnly('Celtic Cross') };
      }
      break;
    case 'horseshoe':
      if (plan.limits.horseshoePerDay === 0) {
        return { allowed: false, reason: membersOnly('Horseshoe Spread') };
      }
      break;
  }

  return { allowed: true };
}

/** Increment usage counter after a reading */
export async function incrementUsage(
  userId: string,
  spreadType: SpreadType,
): Promise<void> {
  const period = getCurrentPeriod();

  const columnMap: Record<SpreadType, string> = {
    'single': 'single_count',
    'three-card': 'three_card_count',
    'celtic-cross': 'celtic_cross_count',
    'horseshoe': 'horseshoe_count',
  };

  await upsertUsage(userId, period, columnMap[spreadType]);
}
