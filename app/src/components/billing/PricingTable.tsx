'use client';

interface PricingTableProps {
  currentTier?: string;
  language?: 'en' | 'fa';
  onSelectPlan?: (plan: 'pro' | 'premium') => void;
}

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    nameFA: 'رایگان',
    price: '$0',
    priceFA: 'رایگان',
    features: [
      '3 credits per day',
      'Single, three-card & horseshoe',
      'Short AI interpretation',
      'English only',
    ],
    featuresFA: [
      '۳ اعتبار در روز',
      'تک‌کارتی، سه‌کارتی و نعل اسبی',
      'تفسیر کوتاه هوش مصنوعی',
      'فقط انگلیسی',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    nameFA: 'حرفه‌ای',
    price: '$8.99/mo',
    priceFA: '۸.۹۹$/ماه',
    popular: true,
    features: [
      '120 credits per month',
      'All spreads, incl. Celtic Cross',
      'Deep narrative interpretation',
      '2 free follow-ups per reading, then 1 credit',
      'Full reading history',
      'English + Farsi',
    ],
    featuresFA: [
      '۱۲۰ اعتبار در ماه',
      'همه گسترش‌ها، از جمله صلیب سلتیک',
      'تفسیر روایی عمیق',
      '۲ سؤال رایگان در هر خوانش، سپس ۱ اعتبار',
      'تاریخچه کامل',
      'انگلیسی + فارسی',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    nameFA: 'ویژه',
    price: '$19.99/mo',
    priceFA: '۱۹.۹۹$/ماه',
    features: [
      '350 credits per month',
      'Everything in Pro',
      'Custom spreads',
      'Cross-reading trend analysis',
      'English + Farsi + Arabic',
    ],
    featuresFA: [
      '۳۵۰ اعتبار در ماه',
      'همه امکانات حرفه‌ای',
      'گسترش‌های سفارشی',
      'تحلیل روند بین خوانش‌ها',
      'انگلیسی + فارسی + عربی',
    ],
  },
];

/**
 * What a credit buys. Without this the allowances above are just numbers —
 * "120 credits" means nothing until you know a three-card reading costs 2.
 * Kept in sync with SPREAD_COSTS in lib/credits/config.ts.
 */
const COST_LEGEND_EN = 'Single card 1 credit · Three-card 2 · Horseshoe 3 · Celtic Cross 5 · Extra follow-up 1';
const COST_LEGEND_FA = 'تک‌کارتی ۱ اعتبار · سه‌کارتی ۲ · نعل اسبی ۳ · صلیب سلتیک ۵ · سؤال بعدی اضافه ۱';

export default function PricingTable({
  currentTier,
  language = 'en',
  onSelectPlan,
}: PricingTableProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrent = currentTier === plan.id;
        const name = language === 'en' ? plan.name : plan.nameFA;
        const price = language === 'en' ? plan.price : plan.priceFA;
        const features = language === 'en' ? plan.features : plan.featuresFA;

        return (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 border-2 flex flex-col ${
              plan.popular
                ? 'border-amber-400 bg-white/[0.06] shadow-lg shadow-amber-400/10'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            {plan.popular && (
              <span className="text-xs font-medium text-amber-400 mb-2">
                {language === 'en' ? 'Most Popular' : 'محبوب‌ترین'}
              </span>
            )}

            <h3 className="text-xl font-semibold text-white">{name}</h3>
            <p className="text-2xl font-bold text-white mt-2">{price}</p>

            <ul className="mt-6 space-y-3 flex-1">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-200">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <div className="mt-6 py-2 text-center text-sm text-gray-500">
                {isCurrent
                  ? (language === 'en' ? 'Current Plan' : 'اشتراک فعلی')
                  : (language === 'en' ? 'Free Forever' : 'همیشه رایگان')}
              </div>
            ) : (
              <button
                onClick={() => onSelectPlan?.(plan.id as 'pro' | 'premium')}
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isCurrent
                    ? 'bg-white/10 text-gray-500 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}
              >
                {isCurrent
                  ? (language === 'en' ? 'Current Plan' : 'اشتراک فعلی')
                  : (language === 'en' ? 'Upgrade' : 'ارتقا')}
              </button>
            )}
          </div>
        );
      })}
      </div>

      <p className="mt-8 text-center text-xs text-stone-500">
        {language === 'en' ? COST_LEGEND_EN : COST_LEGEND_FA}
      </p>
    </div>
  );
}
