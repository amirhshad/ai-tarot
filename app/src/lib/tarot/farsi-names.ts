/**
 * Common Farsi name variants for tarot cards.
 * These help SEO by covering alternate search terms.
 * Source: fa.wikipedia.org/wiki/تاروت, angelcard.ir, iran-tarot.com, pichak.net
 */

export const FARSI_NAME_VARIANTS: Record<string, string[]> = {
  // Major Arcana
  'the-fool': ['احمق', 'ابله', 'دلقک'],
  'the-magician': ['جادوگر', 'کیمیاگر', 'شعبده‌باز'],
  'the-high-priestess': ['کاهنه اعظم', 'پاپ بانو', 'راهبه', 'بانوی کلیسا'],
  'the-empress': ['ملکه', 'شهبانو', 'امپراتور زن'],
  'the-emperor': ['امپراتور', 'شاه', 'پادشاه'],
  'the-hierophant': ['کاهن اعظم', 'پاپ اعظم', 'هیروفانت'],
  'the-lovers': ['عاشقان', 'عاشق و معشوق', 'دلدادگان'],
  'the-chariot': ['ارابه', 'کالسکه'],
  'strength': ['قدرت', 'استقامت', 'نیروی درون'],
  'the-hermit': ['زاهد', 'درویش', 'راهب', 'خلوت‌نشین'],
  'wheel-of-fortune': ['چرخ اقبال', 'چرخ فلک', 'چرخ سرنوشت'],
  'justice': ['عدالت', 'میزان'],
  'the-hanged-man': ['مرد به دار آویخته', 'سر به دار', 'مرد حلق آویز'],
  'death': ['مرگ', 'انتها'],
  'temperance': ['اعتدال', 'میانه‌روی'],
  'the-devil': ['شیطان', 'اهریمن'],
  'the-tower': ['برج', 'برج فروریخته'],
  'the-star': ['ستاره'],
  'the-moon': ['ماه'],
  'the-sun': ['خورشید'],
  'judgement': ['قضاوت', 'داوری', 'رستاخیز'],
  'the-world': ['جهان', 'کائنات', 'گیتی'],

  // Court cards — Wands
  'king-of-wands': ['شاه عصاها', 'پادشاه چوبدست‌ها'],
  'queen-of-wands': ['ملکه عصاها', 'بانوی چوبدست‌ها'],
  'knight-of-wands': ['شوالیه عصاها', 'سوار چوبدست‌ها'],
  'page-of-wands': ['نوبالغ عصاها', 'سرباز چوبدست‌ها'],

  // Court cards — Cups
  'king-of-cups': ['شاه جام‌ها', 'پادشاه جام‌ها'],
  'queen-of-cups': ['ملکه جام‌ها', 'بانوی جام‌ها'],
  'knight-of-cups': ['شوالیه جام‌ها', 'سوار جام‌ها'],
  'page-of-cups': ['نوبالغ جام‌ها', 'سرباز جام‌ها'],

  // Court cards — Swords
  'king-of-swords': ['شاه شمشیرها', 'پادشاه شمشیرها'],
  'queen-of-swords': ['ملکه شمشیرها', 'بانوی شمشیرها'],
  'knight-of-swords': ['شوالیه شمشیرها', 'سوار شمشیرها'],
  'page-of-swords': ['نوبالغ شمشیرها', 'سرباز شمشیرها'],

  // Court cards — Pentacles
  'king-of-pentacles': ['شاه سکه‌ها', 'پادشاه پنتاکل‌ها'],
  'queen-of-pentacles': ['ملکه سکه‌ها', 'بانوی پنتاکل‌ها'],
  'knight-of-pentacles': ['شوالیه سکه‌ها', 'سوار پنتاکل‌ها'],
  'page-of-pentacles': ['نوبالغ سکه‌ها', 'سرباز پنتاکل‌ها'],

  // Number cards — Wands
  'ace-of-wands': ['آس عصاها', 'یک عصا'],
  'two-of-wands': ['دو عصا', 'دوی عصاها'],
  'three-of-wands': ['سه عصا', 'سه‌ی عصاها'],
  'four-of-wands': ['چهار عصا', 'چهار عصاها'],
  'five-of-wands': ['پنج عصا', 'پنج عصاها'],
  'six-of-wands': ['شش عصا', 'شش عصاها'],
  'seven-of-wands': ['هفت عصا', 'هفت عصاها'],
  'eight-of-wands': ['هشت عصا', 'هشت عصاها'],
  'nine-of-wands': ['نه عصا', 'نه عصاها'],
  'ten-of-wands': ['ده عصا', 'ده عصاها'],

  // Number cards — Cups
  'ace-of-cups': ['آس جام‌ها', 'یک جام'],
  'two-of-cups': ['دو جام', 'دوی جام‌ها'],
  'three-of-cups': ['سه جام', 'سه‌ی جام‌ها'],
  'four-of-cups': ['چهار جام', 'چهار جام‌ها'],
  'five-of-cups': ['پنج جام', 'پنج جام‌ها'],
  'six-of-cups': ['شش جام', 'شش جام‌ها'],
  'seven-of-cups': ['هفت جام', 'هفت جام‌ها'],
  'eight-of-cups': ['هشت جام', 'هشت جام‌ها'],
  'nine-of-cups': ['نه جام', 'نه جام‌ها'],
  'ten-of-cups': ['ده جام', 'ده جام‌ها'],

  // Number cards — Swords
  'ace-of-swords': ['آس شمشیرها', 'یک شمشیر'],
  'two-of-swords': ['دو شمشیر', 'دوی شمشیرها'],
  'three-of-swords': ['سه شمشیر', 'سه‌ی شمشیرها'],
  'four-of-swords': ['چهار شمشیر', 'چهار شمشیرها'],
  'five-of-swords': ['پنج شمشیر', 'پنج شمشیرها'],
  'six-of-swords': ['شش شمشیر', 'شش شمشیرها'],
  'seven-of-swords': ['هفت شمشیر', 'هفت شمشیرها'],
  'eight-of-swords': ['هشت شمشیر', 'هشت شمشیرها'],
  'nine-of-swords': ['نه شمشیر', 'نه شمشیرها'],
  'ten-of-swords': ['ده شمشیر', 'ده شمشیرها'],

  // Number cards — Pentacles
  'ace-of-pentacles': ['آس سکه‌ها', 'یک سکه'],
  'two-of-pentacles': ['دو سکه', 'دوی سکه‌ها'],
  'three-of-pentacles': ['سه سکه', 'سه‌ی سکه‌ها'],
  'four-of-pentacles': ['چهار سکه', 'چهار سکه‌ها'],
  'five-of-pentacles': ['پنج سکه', 'پنج سکه‌ها'],
  'six-of-pentacles': ['شش سکه', 'شش سکه‌ها'],
  'seven-of-pentacles': ['هفت سکه', 'هفت سکه‌ها'],
  'eight-of-pentacles': ['هشت سکه', 'هشت سکه‌ها'],
  'nine-of-pentacles': ['نه سکه', 'نه سکه‌ها'],
  'ten-of-pentacles': ['ده سکه', 'ده سکه‌ها'],
};

/** Get Farsi name variants for a card slug. Returns empty array if not found. */
export function getFarsiVariants(slug: string): string[] {
  return FARSI_NAME_VARIANTS[slug] || [];
}
