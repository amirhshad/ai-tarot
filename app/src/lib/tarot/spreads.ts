import { SpreadDefinition } from './types';

export const SPREADS: Record<string, SpreadDefinition> = {
  single: {
    type: 'single',
    name: 'Single Card',
    description: 'A quick insight into your question or situation.',
    localized: {
      fa: { name: 'تک کارت', description: 'بینشی سریع درباره سؤال یا موقعیت شما.' },
      ar: { name: 'بطاقة واحدة', description: 'لمحة سريعة تُضيء سؤالك أو موقفك.' },
    },
    cardCount: 1,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'The Card',
        description: 'The core message for your question.',
        localized: {
          fa: { name: 'کارت', description: 'پیام اصلی برای سؤال شما.' },
          ar: { name: 'البطاقة', description: 'الرسالة الجوهرية لسؤالك.' },
        },
      },
    ],
  },

  'three-card': {
    type: 'three-card',
    name: 'Three Card Spread',
    description: 'Past, present, and future — a narrative arc of your situation.',
    localized: {
      fa: { name: 'سه کارت', description: 'گذشته، حال و آینده — روایتی از وضعیت شما.' },
      ar: { name: 'ثلاث بطاقات', description: 'الماضي والحاضر والمستقبل — قوسٌ يحكي موقفك.' },
    },
    cardCount: 3,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'Past',
        description: 'What has led you to this moment.',
        localized: {
          fa: { name: 'گذشته', description: 'آنچه شما را به این لحظه رسانده است.' },
          ar: { name: 'الماضي', description: 'ما ساقك إلى هذه اللحظة.' },
        },
      },
      {
        index: 1,
        name: 'Present',
        description: 'Where you stand right now.',
        localized: {
          fa: { name: 'حال', description: 'جایی که اکنون در آن قرار دارید.' },
          ar: { name: 'الحاضر', description: 'حيث تقف الآن.' },
        },
      },
      {
        index: 2,
        name: 'Future',
        description: 'What is unfolding ahead of you.',
        localized: {
          fa: { name: 'آینده', description: 'آنچه در پیش روی شماست.' },
          ar: { name: 'المستقبل', description: 'ما يتكشّف أمامك.' },
        },
      },
    ],
  },

  'celtic-cross': {
    type: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'The classic 10-card spread for deep, comprehensive readings.',
    localized: {
      fa: { name: 'صلیب سلتی', description: 'گسترش کلاسیک ده کارتی برای خوانش‌های عمیق و جامع.' },
      ar: { name: 'الصليب السلتي', description: 'الانتشار الكلاسيكي بعشر بطاقات، للقراءات العميقة الشاملة.' },
    },
    cardCount: 10,
    minimumTier: 'pro',
    positions: [
      {
        index: 0,
        name: 'Present',
        description: 'Your current situation and state of mind.',
        localized: {
          fa: { name: 'حال', description: 'وضعیت و حالت ذهنی فعلی شما.' },
          ar: { name: 'الحاضر', description: 'موقفك الراهن وحالُ ذهنك.' },
        },
      },
      {
        index: 1,
        name: 'Challenge',
        description: 'The immediate challenge or obstacle you face.',
        localized: {
          fa: { name: 'چالش', description: 'چالش یا مانع فوری پیش روی شما.' },
          ar: { name: 'التحدّي', description: 'التحدّي أو العقبة التي تواجهك الآن.' },
        },
      },
      {
        index: 2,
        name: 'Foundation',
        description: 'The root cause or basis of the situation.',
        localized: {
          fa: { name: 'بنیاد', description: 'علت ریشه‌ای یا پایه وضعیت.' },
          ar: { name: 'الأساس', description: 'الجذر الذي نبت منه هذا الموقف.' },
        },
      },
      {
        index: 3,
        name: 'Recent Past',
        description: 'Recent events that have influenced the present.',
        localized: {
          fa: { name: 'گذشته نزدیک', description: 'رویدادهای اخیر مؤثر بر حال.' },
          ar: { name: 'الماضي القريب', description: 'أحداثٌ قريبة ألقت بظلّها على حاضرك.' },
        },
      },
      {
        index: 4,
        name: 'Crown',
        description: 'Your goal or the best possible outcome.',
        localized: {
          fa: { name: 'تاج', description: 'هدف شما یا بهترین نتیجه ممکن.' },
          ar: { name: 'التاج', description: 'غايتك، أو أفضل ما قد يثمر.' },
        },
      },
      {
        index: 5,
        name: 'Near Future',
        description: 'What will happen in the coming weeks.',
        localized: {
          fa: { name: 'آینده نزدیک', description: 'آنچه در هفته‌های آینده رخ خواهد داد.' },
          ar: { name: 'المستقبل القريب', description: 'ما تحمله الأسابيع المقبلة.' },
        },
      },
      {
        index: 6,
        name: 'Self',
        description: 'How you see yourself in this situation.',
        localized: {
          fa: { name: 'خود', description: 'نگاه شما به خودتان در این وضعیت.' },
          ar: { name: 'الذات', description: 'كيف ترى نفسك في هذا الموقف.' },
        },
      },
      {
        index: 7,
        name: 'Environment',
        description: 'External influences and how others see you.',
        localized: {
          fa: { name: 'محیط', description: 'تأثیرات بیرونی و نگاه دیگران به شما.' },
          ar: { name: 'المحيط', description: 'المؤثّرات الخارجية، وكيف يراك الآخرون.' },
        },
      },
      {
        index: 8,
        name: 'Hopes & Fears',
        description: 'Your deepest hopes and hidden fears.',
        localized: {
          fa: { name: 'امیدها و ترس‌ها', description: 'عمیق‌ترین امیدها و ترس‌های پنهان شما.' },
          ar: { name: 'الآمال والمخاوف', description: 'أعمق ما ترجوه، وأخفى ما تخشاه.' },
        },
      },
      {
        index: 9,
        name: 'Outcome',
        description: 'The likely outcome based on the current path.',
        localized: {
          fa: { name: 'نتیجه', description: 'نتیجه محتمل بر اساس مسیر فعلی.' },
          ar: { name: 'المحصّلة', description: 'ما يُرجَّح أن يثمر إن بقيت على هذا الدرب.' },
        },
      },
    ],
  },

  horseshoe: {
    type: 'horseshoe',
    name: 'Horseshoe Spread',
    description: 'A 7-card arc for decision-making and path-forward questions.',
    localized: {
      fa: { name: 'نعل اسب', description: 'یک گسترش ۷ کارتی برای تصمیم‌گیری و سؤالات مسیر پیش رو.' },
      ar: { name: 'حَذوة الفرس', description: 'قوسٌ من سبع بطاقات، لأسئلة القرار واختيار الدرب.' },
    },
    cardCount: 7,
    minimumTier: 'pro',
    positions: [
      {
        index: 0,
        name: 'Past Influences',
        description: 'What past events have shaped this situation.',
        localized: {
          fa: { name: 'تأثیرات گذشته', description: 'رویدادهای گذشته‌ای که این وضعیت را شکل داده‌اند.' },
          ar: { name: 'مؤثّرات الماضي', description: 'أحداثٌ ماضية نحتت هذا الموقف.' },
        },
      },
      {
        index: 1,
        name: 'Present Situation',
        description: 'Where you stand right now.',
        localized: {
          fa: { name: 'وضعیت فعلی', description: 'جایی که اکنون در آن قرار دارید.' },
          ar: { name: 'الموقف الراهن', description: 'حيث تقف الآن.' },
        },
      },
      {
        index: 2,
        name: 'Hidden Factors',
        description: 'Subconscious influences you may not be aware of.',
        localized: {
          fa: { name: 'عوامل پنهان', description: 'تأثیرات ناخودآگاهی که ممکن است از آن‌ها آگاه نباشید.' },
          ar: { name: 'العوامل الخفيّة', description: 'مؤثّراتٌ في لاوعيك قد لا تنتبه إليها.' },
        },
      },
      {
        index: 3,
        name: 'Your Approach',
        description: 'Your attitude and how you are handling this.',
        localized: {
          fa: { name: 'رویکرد شما', description: 'نگرش شما و نحوه برخوردتان با این موضوع.' },
          ar: { name: 'نهجك', description: 'موقفك الداخلي، وكيف تتعامل مع هذا الأمر.' },
        },
      },
      {
        index: 4,
        name: 'Obstacles',
        description: 'Challenges and blockages you face.',
        localized: {
          fa: { name: 'موانع', description: 'چالش‌ها و موانعی که با آن‌ها روبرو هستید.' },
          ar: { name: 'العقبات', description: 'ما يعترض طريقك من تحدّيات وسدود.' },
        },
      },
      {
        index: 5,
        name: 'External Influences',
        description: 'People and circumstances affecting the outcome.',
        localized: {
          fa: { name: 'تأثیرات بیرونی', description: 'افراد و شرایطی که بر نتیجه تأثیر می‌گذارند.' },
          ar: { name: 'المؤثّرات الخارجية', description: 'أشخاصٌ وظروفٌ تُبدّل المحصّلة.' },
        },
      },
      {
        index: 6,
        name: 'Likely Outcome',
        description: 'Where this path leads if you stay the course.',
        localized: {
          fa: { name: 'نتیجه محتمل', description: 'این مسیر به کجا منتهی می‌شود اگر همین راه را ادامه دهید.' },
          ar: { name: 'المحصّلة المُرجَّحة', description: 'إلى أين يفضي هذا الدرب إن واصلت السير فيه.' },
        },
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
