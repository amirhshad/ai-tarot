import { SpreadDefinition } from './types';

export const SPREADS: Record<string, SpreadDefinition> = {
  single: {
    type: 'single',
    name: 'Single Card',
    nameFA: 'تک کارت',
    description: 'A quick insight into your question or situation.',
    descriptionFA: 'بینشی سریع درباره سؤال یا موقعیت شما.',
    cardCount: 1,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'The Card',
        nameFA: 'کارت',
        description: 'The core message for your question.',
        descriptionFA: 'پیام اصلی برای سؤال شما.',
      },
    ],
  },

  'three-card': {
    type: 'three-card',
    name: 'Three Card Spread',
    nameFA: 'سه کارت',
    description: 'Past, present, and future — a narrative arc of your situation.',
    descriptionFA: 'گذشته، حال و آینده — روایتی از وضعیت شما.',
    cardCount: 3,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'Past',
        nameFA: 'گذشته',
        description: 'What has led you to this moment.',
        descriptionFA: 'آنچه شما را به این لحظه رسانده است.',
      },
      {
        index: 1,
        name: 'Present',
        nameFA: 'حال',
        description: 'Where you stand right now.',
        descriptionFA: 'جایی که اکنون در آن قرار دارید.',
      },
      {
        index: 2,
        name: 'Future',
        nameFA: 'آینده',
        description: 'What is unfolding ahead of you.',
        descriptionFA: 'آنچه در پیش روی شماست.',
      },
    ],
  },

  'celtic-cross': {
    type: 'celtic-cross',
    name: 'Celtic Cross',
    nameFA: 'صلیب سلتی',
    description: 'The classic 10-card spread for deep, comprehensive readings.',
    descriptionFA: 'گسترش کلاسیک ده کارتی برای خوانش‌های عمیق و جامع.',
    cardCount: 10,
    minimumTier: 'pro',
    positions: [
      {
        index: 0,
        name: 'Present',
        nameFA: 'حال',
        description: 'Your current situation and state of mind.',
        descriptionFA: 'وضعیت و حالت ذهنی فعلی شما.',
      },
      {
        index: 1,
        name: 'Challenge',
        nameFA: 'چالش',
        description: 'The immediate challenge or obstacle you face.',
        descriptionFA: 'چالش یا مانع فوری پیش روی شما.',
      },
      {
        index: 2,
        name: 'Foundation',
        nameFA: 'بنیاد',
        description: 'The root cause or basis of the situation.',
        descriptionFA: 'علت ریشه‌ای یا پایه وضعیت.',
      },
      {
        index: 3,
        name: 'Recent Past',
        nameFA: 'گذشته نزدیک',
        description: 'Recent events that have influenced the present.',
        descriptionFA: 'رویدادهای اخیر مؤثر بر حال.',
      },
      {
        index: 4,
        name: 'Crown',
        nameFA: 'تاج',
        description: 'Your goal or the best possible outcome.',
        descriptionFA: 'هدف شما یا بهترین نتیجه ممکن.',
      },
      {
        index: 5,
        name: 'Near Future',
        nameFA: 'آینده نزدیک',
        description: 'What will happen in the coming weeks.',
        descriptionFA: 'آنچه در هفته‌های آینده رخ خواهد داد.',
      },
      {
        index: 6,
        name: 'Self',
        nameFA: 'خود',
        description: 'How you see yourself in this situation.',
        descriptionFA: 'نگاه شما به خودتان در این وضعیت.',
      },
      {
        index: 7,
        name: 'Environment',
        nameFA: 'محیط',
        description: 'External influences and how others see you.',
        descriptionFA: 'تأثیرات بیرونی و نگاه دیگران به شما.',
      },
      {
        index: 8,
        name: 'Hopes & Fears',
        nameFA: 'امیدها و ترس‌ها',
        description: 'Your deepest hopes and hidden fears.',
        descriptionFA: 'عمیق‌ترین امیدها و ترس‌های پنهان شما.',
      },
      {
        index: 9,
        name: 'Outcome',
        nameFA: 'نتیجه',
        description: 'The likely outcome based on the current path.',
        descriptionFA: 'نتیجه محتمل بر اساس مسیر فعلی.',
      },
    ],
  },
};

export function getSpread(type: string): SpreadDefinition | undefined {
  return SPREADS[type];
}

export function getAvailableSpreads(tier: string): SpreadDefinition[] {
  const tierOrder = { free: 0, pro: 1, premium: 2 };
  const userTierLevel = tierOrder[tier as keyof typeof tierOrder] ?? 0;

  return Object.values(SPREADS).filter(spread => {
    const spreadTierLevel = tierOrder[spread.minimumTier as keyof typeof tierOrder] ?? 0;
    return spreadTierLevel <= userTierLevel;
  });
}
