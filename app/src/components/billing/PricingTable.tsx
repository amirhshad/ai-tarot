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
      '1 single-card reading/day',
      '1 three-card reading/week',
      'Short AI interpretation',
      'English only',
    ],
    featuresFA: [
      '۱ خوانش تک‌کارت در روز',
      '۱ خوانش سه‌کارت در هفته',
      'تفسیر کوتاه هوش مصنوعی',
      'فقط انگلیسی',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    nameFA: 'حرفه‌ای',
    price: '$7.99/mo',
    priceFA: '۷.۹۹$/ماه',
    popular: true,
    features: [
      'Unlimited all spreads',
      'Deep narrative interpretation',
      '5 follow-up questions/reading',
      'Full reading history',
      'English + Farsi',
      '3 reader personalities',
    ],
    featuresFA: [
      'گسترش‌های نامحدود',
      'تفسیر روایی عمیق',
      '۵ سؤال بعدی/خوانش',
      'تاریخچه کامل',
      'انگلیسی + فارسی',
      '۳ شخصیت خواننده',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    nameFA: 'ویژه',
    price: '$14.99/mo',
    priceFA: '۱۴.۹۹$/ماه',
    features: [
      'Everything in Pro',
      '10 follow-up questions/reading',
      'Custom spreads',
      'Cross-reading trend analysis',
      'English + Farsi + Arabic',
      '6+ reader personalities',
    ],
    featuresFA: [
      'همه امکانات حرفه‌ای',
      '۱۰ سؤال بعدی/خوانش',
      'گسترش‌های سفارشی',
      'تحلیل روند بین خوانش‌ها',
      'انگلیسی + فارسی + عربی',
      '۶+ شخصیت خواننده',
    ],
  },
];

export default function PricingTable({
  currentTier,
  language = 'en',
  onSelectPlan,
}: PricingTableProps) {
  const isRTL = language === 'fa';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
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
  );
}
