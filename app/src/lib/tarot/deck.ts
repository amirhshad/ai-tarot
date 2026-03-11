import { TarotCard } from './types';

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: 'The Fool', nameFA: 'احمق',
    arcana: 'major', number: 0,
    keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
    keywordsFA: ['آغاز', 'معصومیت', 'خودانگیختگی', 'روح آزاد'],
    image: '/cards/major/m00.jpg',
  },
  {
    id: 1, name: 'The Magician', nameFA: 'جادوگر',
    arcana: 'major', number: 1,
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
    keywordsFA: ['تجلی', 'تدبیر', 'قدرت', 'عمل الهام‌بخش'],
    image: '/cards/major/m01.jpg',
  },
  {
    id: 2, name: 'The High Priestess', nameFA: 'کاهنه اعظم',
    arcana: 'major', number: 2,
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'],
    keywordsFA: ['شهود', 'دانش مقدس', 'مؤنث الهی', 'ناخودآگاه'],
    image: '/cards/major/m02.jpg',
  },
  {
    id: 3, name: 'The Empress', nameFA: 'ملکه',
    arcana: 'major', number: 3,
    keywords: ['femininity', 'beauty', 'nature', 'abundance'],
    keywordsFA: ['زنانگی', 'زیبایی', 'طبیعت', 'فراوانی'],
    image: '/cards/major/m03.jpg',
  },
  {
    id: 4, name: 'The Emperor', nameFA: 'امپراتور',
    arcana: 'major', number: 4,
    keywords: ['authority', 'structure', 'control', 'fatherhood'],
    keywordsFA: ['اقتدار', 'ساختار', 'کنترل', 'پدری'],
    image: '/cards/major/m04.jpg',
  },
  {
    id: 5, name: 'The Hierophant', nameFA: 'کاهن اعظم',
    arcana: 'major', number: 5,
    keywords: ['spiritual wisdom', 'tradition', 'conformity', 'education'],
    keywordsFA: ['حکمت معنوی', 'سنت', 'همنوایی', 'آموزش'],
    image: '/cards/major/m05.jpg',
  },
  {
    id: 6, name: 'The Lovers', nameFA: 'عاشقان',
    arcana: 'major', number: 6,
    keywords: ['love', 'harmony', 'relationships', 'values alignment'],
    keywordsFA: ['عشق', 'هماهنگی', 'روابط', 'همسویی ارزش‌ها'],
    image: '/cards/major/m06.jpg',
  },
  {
    id: 7, name: 'The Chariot', nameFA: 'ارابه',
    arcana: 'major', number: 7,
    keywords: ['control', 'willpower', 'success', 'determination'],
    keywordsFA: ['کنترل', 'اراده', 'موفقیت', 'عزم'],
    image: '/cards/major/m07.jpg',
  },
  {
    id: 8, name: 'Strength', nameFA: 'قدرت',
    arcana: 'major', number: 8,
    keywords: ['strength', 'courage', 'persuasion', 'influence'],
    keywordsFA: ['قدرت', 'شجاعت', 'متقاعدسازی', 'نفوذ'],
    image: '/cards/major/m08.jpg',
  },
  {
    id: 9, name: 'The Hermit', nameFA: 'زاهد',
    arcana: 'major', number: 9,
    keywords: ['soul-searching', 'introspection', 'being alone', 'inner guidance'],
    keywordsFA: ['جستجوی درون', 'درون‌نگری', 'تنهایی', 'هدایت درونی'],
    image: '/cards/major/m09.jpg',
  },
  {
    id: 10, name: 'Wheel of Fortune', nameFA: 'چرخ بخت',
    arcana: 'major', number: 10,
    keywords: ['good luck', 'karma', 'life cycles', 'destiny'],
    keywordsFA: ['خوش‌اقبالی', 'کارما', 'چرخه‌های زندگی', 'سرنوشت'],
    image: '/cards/major/m10.jpg',
  },
  {
    id: 11, name: 'Justice', nameFA: 'عدالت',
    arcana: 'major', number: 11,
    keywords: ['justice', 'fairness', 'truth', 'cause and effect'],
    keywordsFA: ['عدالت', 'انصاف', 'حقیقت', 'علت و معلول'],
    image: '/cards/major/m11.jpg',
  },
  {
    id: 12, name: 'The Hanged Man', nameFA: 'مرد آویزان',
    arcana: 'major', number: 12,
    keywords: ['pause', 'surrender', 'letting go', 'new perspectives'],
    keywordsFA: ['مکث', 'تسلیم', 'رها کردن', 'دیدگاه‌های نو'],
    image: '/cards/major/m12.jpg',
  },
  {
    id: 13, name: 'Death', nameFA: 'مرگ',
    arcana: 'major', number: 13,
    keywords: ['endings', 'change', 'transformation', 'transition'],
    keywordsFA: ['پایان‌ها', 'تغییر', 'دگرگونی', 'گذار'],
    image: '/cards/major/m13.jpg',
  },
  {
    id: 14, name: 'Temperance', nameFA: 'اعتدال',
    arcana: 'major', number: 14,
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
    keywordsFA: ['تعادل', 'اعتدال', 'صبر', 'هدف'],
    image: '/cards/major/m14.jpg',
  },
  {
    id: 15, name: 'The Devil', nameFA: 'شیطان',
    arcana: 'major', number: 15,
    keywords: ['shadow self', 'attachment', 'addiction', 'restriction'],
    keywordsFA: ['سایه درون', 'وابستگی', 'اعتیاد', 'محدودیت'],
    image: '/cards/major/m15.jpg',
  },
  {
    id: 16, name: 'The Tower', nameFA: 'برج',
    arcana: 'major', number: 16,
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
    keywordsFA: ['تغییر ناگهانی', 'آشوب', 'هرج‌ومرج', 'مکاشفه'],
    image: '/cards/major/m16.jpg',
  },
  {
    id: 17, name: 'The Star', nameFA: 'ستاره',
    arcana: 'major', number: 17,
    keywords: ['hope', 'faith', 'purpose', 'renewal'],
    keywordsFA: ['امید', 'ایمان', 'هدف', 'تجدید'],
    image: '/cards/major/m17.jpg',
  },
  {
    id: 18, name: 'The Moon', nameFA: 'ماه',
    arcana: 'major', number: 18,
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
    keywordsFA: ['توهم', 'ترس', 'اضطراب', 'ناخودآگاه'],
    image: '/cards/major/m18.jpg',
  },
  {
    id: 19, name: 'The Sun', nameFA: 'خورشید',
    arcana: 'major', number: 19,
    keywords: ['positivity', 'fun', 'warmth', 'success'],
    keywordsFA: ['مثبت‌اندیشی', 'شادی', 'گرما', 'موفقیت'],
    image: '/cards/major/m19.jpg',
  },
  {
    id: 20, name: 'Judgement', nameFA: 'داوری',
    arcana: 'major', number: 20,
    keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'],
    keywordsFA: ['داوری', 'تولد دوباره', 'ندای درون', 'آمرزش'],
    image: '/cards/major/m20.jpg',
  },
  {
    id: 21, name: 'The World', nameFA: 'جهان',
    arcana: 'major', number: 21,
    keywords: ['completion', 'integration', 'accomplishment', 'travel'],
    keywordsFA: ['تکمیل', 'یکپارچگی', 'دستاورد', 'سفر'],
    image: '/cards/major/m21.jpg',
  },
];

/** Map suit name to image filename prefix */
const SUIT_PREFIX: Record<string, string> = {
  wands: 'w',
  cups: 'c',
  swords: 's',
  pentacles: 'p',
};

function createMinorCard(
  id: number,
  number: number,
  suit: TarotCard['suit'],
  name: string,
  nameFA: string,
  keywords: string[],
  keywordsFA: string[],
  court?: TarotCard['court'],
): TarotCard {
  const prefix = SUIT_PREFIX[suit!];
  const numStr = String(number).padStart(2, '0');
  return {
    id, name, nameFA, arcana: 'minor', suit, number, court, keywords, keywordsFA,
    image: `/cards/minor/${prefix}${numStr}.jpg`,
  };
}

// Wands (22-35)
const WANDS: TarotCard[] = [
  createMinorCard(22, 1, 'wands', 'Ace of Wands', 'آس چوب‌دست‌ها', ['inspiration', 'new opportunities', 'growth', 'potential'], ['الهام', 'فرصت‌های تازه', 'رشد', 'پتانسیل']),
  createMinorCard(23, 2, 'wands', 'Two of Wands', 'دو چوب‌دست‌ها', ['future planning', 'progress', 'decisions', 'discovery'], ['برنامه‌ریزی آینده', 'پیشرفت', 'تصمیمات', 'کشف']),
  createMinorCard(24, 3, 'wands', 'Three of Wands', 'سه چوب‌دست‌ها', ['progress', 'expansion', 'foresight', 'overseas opportunities'], ['پیشرفت', 'گسترش', 'دوراندیشی', 'فرصت‌های فرامرزی']),
  createMinorCard(25, 4, 'wands', 'Four of Wands', 'چهار چوب‌دست‌ها', ['celebration', 'joy', 'harmony', 'relaxation'], ['جشن', 'شادی', 'هماهنگی', 'آرامش']),
  createMinorCard(26, 5, 'wands', 'Five of Wands', 'پنج چوب‌دست‌ها', ['disagreement', 'competition', 'tension', 'conflict'], ['اختلاف', 'رقابت', 'تنش', 'تعارض']),
  createMinorCard(27, 6, 'wands', 'Six of Wands', 'شش چوب‌دست‌ها', ['success', 'public recognition', 'progress', 'self-confidence'], ['موفقیت', 'تقدیر عمومی', 'پیشرفت', 'اعتمادبه‌نفس']),
  createMinorCard(28, 7, 'wands', 'Seven of Wands', 'هفت چوب‌دست‌ها', ['challenge', 'competition', 'protection', 'perseverance'], ['چالش', 'رقابت', 'حمایت', 'پشتکار']),
  createMinorCard(29, 8, 'wands', 'Eight of Wands', 'هشت چوب‌دست‌ها', ['speed', 'action', 'air travel', 'movement'], ['سرعت', 'عمل', 'سفر هوایی', 'حرکت']),
  createMinorCard(30, 9, 'wands', 'Nine of Wands', 'نه چوب‌دست‌ها', ['resilience', 'courage', 'persistence', 'test of faith'], ['تاب‌آوری', 'شجاعت', 'پایداری', 'آزمون ایمان']),
  createMinorCard(31, 10, 'wands', 'Ten of Wands', 'ده چوب‌دست‌ها', ['burden', 'extra responsibility', 'hard work', 'completion'], ['بار سنگین', 'مسئولیت اضافی', 'سخت‌کوشی', 'اتمام']),
  createMinorCard(32, 11, 'wands', 'Page of Wands', 'شاهزاده چوب‌دست‌ها', ['inspiration', 'ideas', 'discovery', 'limitless potential'], ['الهام', 'ایده‌ها', 'کشف', 'پتانسیل بی‌حد'], 'page'),
  createMinorCard(33, 12, 'wands', 'Knight of Wands', 'شوالیه چوب‌دست‌ها', ['energy', 'passion', 'adventure', 'impulsiveness'], ['انرژی', 'اشتیاق', 'ماجراجویی', 'تکانشگری'], 'knight'),
  createMinorCard(34, 13, 'wands', 'Queen of Wands', 'ملکه چوب‌دست‌ها', ['courage', 'confidence', 'independence', 'social butterfly'], ['شجاعت', 'اعتمادبه‌نفس', 'استقلال', 'اجتماعی بودن'], 'queen'),
  createMinorCard(35, 14, 'wands', 'King of Wands', 'شاه چوب‌دست‌ها', ['natural leader', 'vision', 'entrepreneur', 'honour'], ['رهبر ذاتی', 'چشم‌انداز', 'کارآفرین', 'شرافت'], 'king'),
];

// Cups (36-49)
const CUPS: TarotCard[] = [
  createMinorCard(36, 1, 'cups', 'Ace of Cups', 'آس جام‌ها', ['love', 'new feelings', 'emotional awakening', 'creativity'], ['عشق', 'احساسات نو', 'بیداری عاطفی', 'خلاقیت']),
  createMinorCard(37, 2, 'cups', 'Two of Cups', 'دو جام‌ها', ['unified love', 'partnership', 'mutual attraction', 'connection'], ['عشق متحد', 'مشارکت', 'جذابیت متقابل', 'ارتباط']),
  createMinorCard(38, 3, 'cups', 'Three of Cups', 'سه جام‌ها', ['celebration', 'friendship', 'creativity', 'community'], ['جشن', 'دوستی', 'خلاقیت', 'اجتماع']),
  createMinorCard(39, 4, 'cups', 'Four of Cups', 'چهار جام‌ها', ['meditation', 'contemplation', 'apathy', 'reevaluation'], ['مراقبه', 'تأمل', 'بی‌تفاوتی', 'بازارزیابی']),
  createMinorCard(40, 5, 'cups', 'Five of Cups', 'پنج جام‌ها', ['regret', 'failure', 'disappointment', 'pessimism'], ['افسوس', 'شکست', 'ناامیدی', 'بدبینی']),
  createMinorCard(41, 6, 'cups', 'Six of Cups', 'شش جام‌ها', ['revisiting the past', 'childhood memories', 'innocence', 'joy'], ['بازگشت به گذشته', 'خاطرات کودکی', 'معصومیت', 'شادی']),
  createMinorCard(42, 7, 'cups', 'Seven of Cups', 'هفت جام‌ها', ['opportunities', 'choices', 'wishful thinking', 'illusion'], ['فرصت‌ها', 'انتخاب‌ها', 'آرزواندیشی', 'توهم']),
  createMinorCard(43, 8, 'cups', 'Eight of Cups', 'هشت جام‌ها', ['disappointment', 'abandonment', 'withdrawal', 'escapism'], ['ناامیدی', 'رها کردن', 'کناره‌گیری', 'فرار از واقعیت']),
  createMinorCard(44, 9, 'cups', 'Nine of Cups', 'نه جام‌ها', ['contentment', 'satisfaction', 'gratitude', 'wish come true'], ['رضایت', 'خرسندی', 'سپاسگزاری', 'برآورده شدن آرزو']),
  createMinorCard(45, 10, 'cups', 'Ten of Cups', 'ده جام‌ها', ['divine love', 'blissful relationships', 'harmony', 'alignment'], ['عشق الهی', 'روابط پرشکوه', 'هماهنگی', 'همسویی']),
  createMinorCard(46, 11, 'cups', 'Page of Cups', 'شاهزاده جام‌ها', ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility'], ['فرصت‌های خلاقانه', 'پیام‌های شهودی', 'کنجکاوی', 'امکان'], 'page'),
  createMinorCard(47, 12, 'cups', 'Knight of Cups', 'شوالیه جام‌ها', ['creativity', 'romance', 'charm', 'imagination'], ['خلاقیت', 'عاشقانه', 'جذابیت', 'تخیل'], 'knight'),
  createMinorCard(48, 13, 'cups', 'Queen of Cups', 'ملکه جام‌ها', ['compassion', 'calm', 'comfort', 'emotional security'], ['شفقت', 'آرامش', 'آسایش', 'امنیت عاطفی'], 'queen'),
  createMinorCard(49, 14, 'cups', 'King of Cups', 'شاه جام‌ها', ['emotional balance', 'compassion', 'diplomacy', 'wisdom'], ['تعادل عاطفی', 'شفقت', 'دیپلماسی', 'خرد'], 'king'),
];

// Swords (50-63)
const SWORDS: TarotCard[] = [
  createMinorCard(50, 1, 'swords', 'Ace of Swords', 'آس شمشیرها', ['breakthrough', 'clarity', 'sharp mind', 'truth'], ['شکافت', 'وضوح', 'ذهن تیز', 'حقیقت']),
  createMinorCard(51, 2, 'swords', 'Two of Swords', 'دو شمشیرها', ['difficult choices', 'indecision', 'stalemate', 'blocked emotions'], ['انتخاب‌های دشوار', 'بلاتکلیفی', 'بن‌بست', 'احساسات مسدود']),
  createMinorCard(52, 3, 'swords', 'Three of Swords', 'سه شمشیرها', ['heartbreak', 'emotional pain', 'sorrow', 'grief'], ['دل‌شکستگی', 'درد عاطفی', 'اندوه', 'سوگ']),
  createMinorCard(53, 4, 'swords', 'Four of Swords', 'چهار شمشیرها', ['rest', 'relaxation', 'meditation', 'contemplation'], ['استراحت', 'آرامش', 'مراقبه', 'تأمل']),
  createMinorCard(54, 5, 'swords', 'Five of Swords', 'پنج شمشیرها', ['conflict', 'disagreements', 'competition', 'defeat'], ['تعارض', 'اختلافات', 'رقابت', 'شکست']),
  createMinorCard(55, 6, 'swords', 'Six of Swords', 'شش شمشیرها', ['transition', 'change', 'rite of passage', 'releasing baggage'], ['گذار', 'تغییر', 'مراسم عبور', 'رها کردن بارها']),
  createMinorCard(56, 7, 'swords', 'Seven of Swords', 'هفت شمشیرها', ['betrayal', 'deception', 'getting away with something', 'strategy'], ['خیانت', 'فریب', 'فرار از مسئولیت', 'استراتژی']),
  createMinorCard(57, 8, 'swords', 'Eight of Swords', 'هشت شمشیرها', ['negative thoughts', 'self-imposed restriction', 'imprisonment', 'victim mentality'], ['افکار منفی', 'محدودیت خودساخته', 'زندان', 'ذهنیت قربانی']),
  createMinorCard(58, 9, 'swords', 'Nine of Swords', 'نه شمشیرها', ['anxiety', 'worry', 'fear', 'depression'], ['اضطراب', 'نگرانی', 'ترس', 'افسردگی']),
  createMinorCard(59, 10, 'swords', 'Ten of Swords', 'ده شمشیرها', ['painful endings', 'deep wounds', 'betrayal', 'loss'], ['پایان دردناک', 'زخم‌های عمیق', 'خیانت', 'از دست دادن']),
  createMinorCard(60, 11, 'swords', 'Page of Swords', 'شاهزاده شمشیرها', ['new ideas', 'curiosity', 'thirst for knowledge', 'new communication'], ['ایده‌های جدید', 'کنجکاوی', 'تشنگی دانش', 'ارتباط نو'], 'page'),
  createMinorCard(61, 12, 'swords', 'Knight of Swords', 'شوالیه شمشیرها', ['ambitious', 'action-oriented', 'driven to succeed', 'fast thinking'], ['جاه‌طلب', 'عمل‌گرا', 'مصمم به موفقیت', 'تفکر سریع'], 'knight'),
  createMinorCard(62, 13, 'swords', 'Queen of Swords', 'ملکه شمشیرها', ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication'], ['مستقل', 'قضاوت بی‌طرفانه', 'مرزهای شفاف', 'ارتباط مستقیم'], 'queen'),
  createMinorCard(63, 14, 'swords', 'King of Swords', 'شاه شمشیرها', ['mental clarity', 'intellectual power', 'authority', 'truth'], ['وضوح ذهنی', 'قدرت فکری', 'اقتدار', 'حقیقت'], 'king'),
];

// Pentacles (64-77)
const PENTACLES: TarotCard[] = [
  createMinorCard(64, 1, 'pentacles', 'Ace of Pentacles', 'آس سکه‌ها', ['new financial opportunity', 'prosperity', 'abundance', 'security'], ['فرصت مالی جدید', 'رونق', 'فراوانی', 'امنیت']),
  createMinorCard(65, 2, 'pentacles', 'Two of Pentacles', 'دو سکه‌ها', ['balance', 'adaptability', 'time management', 'prioritisation'], ['تعادل', 'سازگاری', 'مدیریت زمان', 'اولویت‌بندی']),
  createMinorCard(66, 3, 'pentacles', 'Three of Pentacles', 'سه سکه‌ها', ['teamwork', 'collaboration', 'learning', 'implementation'], ['کار تیمی', 'همکاری', 'یادگیری', 'اجرا']),
  createMinorCard(67, 4, 'pentacles', 'Four of Pentacles', 'چهار سکه‌ها', ['saving money', 'security', 'conservatism', 'scarcity'], ['پس‌انداز', 'امنیت', 'محافظه‌کاری', 'کمبود']),
  createMinorCard(68, 5, 'pentacles', 'Five of Pentacles', 'پنج سکه‌ها', ['financial loss', 'poverty', 'lack mindset', 'isolation'], ['ضرر مالی', 'فقر', 'ذهنیت کمبود', 'انزوا']),
  createMinorCard(69, 6, 'pentacles', 'Six of Pentacles', 'شش سکه‌ها', ['giving', 'receiving', 'sharing wealth', 'generosity'], ['بخشیدن', 'دریافت کردن', 'تقسیم ثروت', 'سخاوت']),
  createMinorCard(70, 7, 'pentacles', 'Seven of Pentacles', 'هفت سکه‌ها', ['long-term view', 'sustainable results', 'perseverance', 'investment'], ['دید بلندمدت', 'نتایج پایدار', 'پشتکار', 'سرمایه‌گذاری']),
  createMinorCard(71, 8, 'pentacles', 'Eight of Pentacles', 'هشت سکه‌ها', ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development'], ['کارآموزی', 'کارهای تکراری', 'تسلط', 'توسعه مهارت']),
  createMinorCard(72, 9, 'pentacles', 'Nine of Pentacles', 'نه سکه‌ها', ['abundance', 'luxury', 'self-sufficiency', 'financial independence'], ['فراوانی', 'تجمل', 'خودکفایی', 'استقلال مالی']),
  createMinorCard(73, 10, 'pentacles', 'Ten of Pentacles', 'ده سکه‌ها', ['wealth', 'financial security', 'family', 'long-term success'], ['ثروت', 'امنیت مالی', 'خانواده', 'موفقیت بلندمدت']),
  createMinorCard(74, 11, 'pentacles', 'Page of Pentacles', 'شاهزاده سکه‌ها', ['manifestation', 'financial opportunity', 'skill development', 'ambition'], ['تجلی', 'فرصت مالی', 'توسعه مهارت', 'جاه‌طلبی'], 'page'),
  createMinorCard(75, 12, 'pentacles', 'Knight of Pentacles', 'شوالیه سکه‌ها', ['hard work', 'productivity', 'routine', 'conservatism'], ['سخت‌کوشی', 'بهره‌وری', 'روتین', 'محافظه‌کاری'], 'knight'),
  createMinorCard(76, 13, 'pentacles', 'Queen of Pentacles', 'ملکه سکه‌ها', ['nurturing', 'practical', 'providing financially', 'working parent'], ['پرورش‌دهنده', 'عملگرا', 'تأمین مالی', 'والد شاغل'], 'queen'),
  createMinorCard(77, 14, 'pentacles', 'King of Pentacles', 'شاه سکه‌ها', ['wealth', 'business', 'leadership', 'security'], ['ثروت', 'کسب‌وکار', 'رهبری', 'امنیت'], 'king'),
];

export const DECK: TarotCard[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES,
];

export function getCardById(id: number): TarotCard | undefined {
  return DECK.find(card => card.id === id);
}
