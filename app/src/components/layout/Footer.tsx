export default function Footer({ language = 'en' }: { language?: 'en' | 'fa' }) {
  return (
    <footer className="border-t border-white/10 bg-black/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} TarotVeil.{' '}
          {language === 'en' ? 'For entertainment purposes.' : 'برای سرگرمی.'}
        </p>
        <div className="flex gap-4">
          <a href="/cards" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Card Meanings' : 'معانی کارت‌ها'}
          </a>
          <a href="/spreads" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Spreads' : 'گسترش‌ها'}
          </a>
          <a href="/privacy" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Privacy' : 'حریم خصوصی'}
          </a>
          <a href="/terms" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Terms' : 'شرایط'}
          </a>
        </div>
      </div>
    </footer>
  );
}
