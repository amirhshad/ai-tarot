import { SpreadType } from '@/lib/tarot/types';
import { getPlan } from '@/lib/stripe/config';
import { getUsage, upsertUsage } from '@/lib/db/queries';

/** Get the Monday of the current week (ISO week start) */
function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
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

  const weekStart = getCurrentWeekStart();
  const usage = await getUsage(userId, weekStart);

  const currentUsage = usage || {
    single_count: 0,
    three_card_count: 0,
    celtic_cross_count: 0,
  };

  switch (spreadType) {
    case 'single':
      if (currentUsage.single_count >= plan.limits.singlePerDay) {
        return { allowed: false, reason: 'Daily single card limit reached. Upgrade to Pro for unlimited readings.' };
      }
      break;
    case 'three-card':
      if (currentUsage.three_card_count >= plan.limits.threeCardPerWeek) {
        return { allowed: false, reason: 'Weekly three-card limit reached. Upgrade to Pro for unlimited readings.' };
      }
      break;
    case 'celtic-cross':
      if (plan.limits.celticCrossPerWeek === 0) {
        return { allowed: false, reason: 'Celtic Cross is available for Pro and Premium members.' };
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
  const weekStart = getCurrentWeekStart();

  const columnMap: Record<SpreadType, string> = {
    'single': 'single_count',
    'three-card': 'three_card_count',
    'celtic-cross': 'celtic_cross_count',
  };

  await upsertUsage(userId, weekStart, columnMap[spreadType]);
}
