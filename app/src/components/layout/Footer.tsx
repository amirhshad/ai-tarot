export default function Footer({ language = 'en' }: { language?: 'en' | 'fa' }) {
  return (
    <footer className="border-t border-purple-800/30 bg-purple-950/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-purple-400/60">
        <p>
          &copy; {new Date().getFullYear()} AI Tarot.{' '}
          {language === 'en' ? 'For entertainment purposes.' : 'برای سرگرمی.'}
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-purple-300 transition-colors">
            {language === 'en' ? 'Privacy' : 'حریم خصوصی'}
          </a>
          <a href="#" className="hover:text-purple-300 transition-colors">
            {language === 'en' ? 'Terms' : 'شرایط'}
          </a>
        </div>
      </div>
    </footer>
  );
}
