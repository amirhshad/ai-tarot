import { TarotCard } from './types';

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: 'The Fool',
    arcana: 'major', number: 0,
    keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
    localized: {
      fa: { name: 'احمق', keywords: ['آغاز', 'معصومیت', 'خودانگیختگی', 'روح آزاد'] },
      ar: { name: 'الأحمق', keywords: ['بدايات', 'براءة', 'عفويّة', 'روح حرّة'] },
    },
    image: '/cards/major/m00.jpg',
  },
  {
    id: 1, name: 'The Magician',
    arcana: 'major', number: 1,
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
    localized: {
      fa: { name: 'جادوگر', keywords: ['تجلی', 'تدبیر', 'قدرت', 'عمل الهام‌بخش'] },
      ar: { name: 'الساحر', keywords: ['تجلٍّ', 'حسن تدبير', 'قوّة', 'فعل ملهَم'] },
    },
    image: '/cards/major/m01.jpg',
  },
  {
    id: 2, name: 'The High Priestess',
    arcana: 'major', number: 2,
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'],
    localized: {
      fa: { name: 'کاهنه اعظم', keywords: ['شهود', 'دانش مقدس', 'مؤنث الهی', 'ناخودآگاه'] },
      ar: { name: 'الكاهنة العظمى', keywords: ['حدس', 'معرفة مقدّسة', 'أنوثة إلهية', 'اللاوعي'] },
    },
    image: '/cards/major/m02.jpg',
  },
  {
    id: 3, name: 'The Empress',
    arcana: 'major', number: 3,
    keywords: ['femininity', 'beauty', 'nature', 'abundance'],
    localized: {
      fa: { name: 'ملکه', keywords: ['زنانگی', 'زیبایی', 'طبیعت', 'فراوانی'] },
      ar: { name: 'الإمبراطورة', keywords: ['أنوثة', 'جمال', 'طبيعة', 'وفرة'] },
    },
    image: '/cards/major/m03.jpg',
  },
  {
    id: 4, name: 'The Emperor',
    arcana: 'major', number: 4,
    keywords: ['authority', 'structure', 'control', 'fatherhood'],
    localized: {
      fa: { name: 'امپراتور', keywords: ['اقتدار', 'ساختار', 'کنترل', 'پدری'] },
      ar: { name: 'الإمبراطور', keywords: ['سلطة', 'نظام', 'تحكّم', 'أبوّة'] },
    },
    image: '/cards/major/m04.jpg',
  },
  {
    id: 5, name: 'The Hierophant',
    arcana: 'major', number: 5,
    keywords: ['spiritual wisdom', 'tradition', 'conformity', 'education'],
    localized: {
      fa: { name: 'کاهن اعظم', keywords: ['حکمت معنوی', 'سنت', 'همنوایی', 'آموزش'] },
      ar: { name: 'الكاهن الأعظم', keywords: ['حكمة روحية', 'تقليد', 'امتثال', 'تعليم'] },
    },
    image: '/cards/major/m05.jpg',
  },
  {
    id: 6, name: 'The Lovers',
    arcana: 'major', number: 6,
    keywords: ['love', 'harmony', 'relationships', 'values alignment'],
    localized: {
      fa: { name: 'عاشقان', keywords: ['عشق', 'هماهنگی', 'روابط', 'همسویی ارزش‌ها'] },
      ar: { name: 'العاشقان', keywords: ['حبّ', 'انسجام', 'علاقات', 'توافق القيم'] },
    },
    image: '/cards/major/m06.jpg',
  },
  {
    id: 7, name: 'The Chariot',
    arcana: 'major', number: 7,
    keywords: ['control', 'willpower', 'success', 'determination'],
    localized: {
      fa: { name: 'ارابه', keywords: ['کنترل', 'اراده', 'موفقیت', 'عزم'] },
      ar: { name: 'العربة', keywords: ['تحكّم', 'قوّة الإرادة', 'نجاح', 'عزيمة'] },
    },
    image: '/cards/major/m07.jpg',
  },
  {
    id: 8, name: 'Strength',
    arcana: 'major', number: 8,
    keywords: ['strength', 'courage', 'persuasion', 'influence'],
    localized: {
      fa: { name: 'قدرت', keywords: ['قدرت', 'شجاعت', 'متقاعدسازی', 'نفوذ'] },
      ar: { name: 'القوّة', keywords: ['قوّة', 'شجاعة', 'إقناع', 'تأثير'] },
    },
    image: '/cards/major/m08.jpg',
  },
  {
    id: 9, name: 'The Hermit',
    arcana: 'major', number: 9,
    keywords: ['soul-searching', 'introspection', 'being alone', 'inner guidance'],
    localized: {
      fa: { name: 'زاهد', keywords: ['جستجوی درون', 'درون‌نگری', 'تنهایی', 'هدایت درونی'] },
      ar: { name: 'الناسك', keywords: ['مساءلة الذات', 'تأمّل داخلي', 'عزلة', 'هداية باطنية'] },
    },
    image: '/cards/major/m09.jpg',
  },
  {
    id: 10, name: 'Wheel of Fortune',
    arcana: 'major', number: 10,
    keywords: ['good luck', 'karma', 'life cycles', 'destiny'],
    localized: {
      fa: { name: 'چرخ بخت', keywords: ['خوش‌اقبالی', 'کارما', 'چرخه‌های زندگی', 'سرنوشت'] },
      ar: { name: 'عجلة الحظ', keywords: ['حظّ طيّب', 'كارما', 'دورات الحياة', 'قدر'] },
    },
    image: '/cards/major/m10.jpg',
  },
  {
    id: 11, name: 'Justice',
    arcana: 'major', number: 11,
    keywords: ['justice', 'fairness', 'truth', 'cause and effect'],
    localized: {
      fa: { name: 'عدالت', keywords: ['عدالت', 'انصاف', 'حقیقت', 'علت و معلول'] },
      ar: { name: 'العدالة', keywords: ['عدالة', 'إنصاف', 'حقيقة', 'سبب ونتيجة'] },
    },
    image: '/cards/major/m11.jpg',
  },
  {
    id: 12, name: 'The Hanged Man',
    arcana: 'major', number: 12,
    keywords: ['pause', 'surrender', 'letting go', 'new perspectives'],
    localized: {
      fa: { name: 'مرد آویزان', keywords: ['مکث', 'تسلیم', 'رها کردن', 'دیدگاه‌های نو'] },
      ar: { name: 'المُعلَّق', keywords: ['توقّف', 'تسليم', 'تخلٍّ', 'منظورات جديدة'] },
    },
    image: '/cards/major/m12.jpg',
  },
  {
    id: 13, name: 'Death',
    arcana: 'major', number: 13,
    keywords: ['endings', 'change', 'transformation', 'transition'],
    localized: {
      fa: { name: 'مرگ', keywords: ['پایان‌ها', 'تغییر', 'دگرگونی', 'گذار'] },
      ar: { name: 'الموت', keywords: ['نهايات', 'تغيير', 'تحوّل', 'انتقال'] },
    },
    image: '/cards/major/m13.jpg',
  },
  {
    id: 14, name: 'Temperance',
    arcana: 'major', number: 14,
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
    localized: {
      fa: { name: 'اعتدال', keywords: ['تعادل', 'اعتدال', 'صبر', 'هدف'] },
      ar: { name: 'الاعتدال', keywords: ['توازن', 'اعتدال', 'صبر', 'غاية'] },
    },
    image: '/cards/major/m14.jpg',
  },
  {
    id: 15, name: 'The Devil',
    arcana: 'major', number: 15,
    keywords: ['shadow self', 'attachment', 'addiction', 'restriction'],
    localized: {
      fa: { name: 'شیطان', keywords: ['سایه درون', 'وابستگی', 'اعتیاد', 'محدودیت'] },
      ar: { name: 'الشيطان', keywords: ['الجانب المظلم', 'تعلّق', 'إدمان', 'تقييد'] },
    },
    image: '/cards/major/m15.jpg',
  },
  {
    id: 16, name: 'The Tower',
    arcana: 'major', number: 16,
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
    localized: {
      fa: { name: 'برج', keywords: ['تغییر ناگهانی', 'آشوب', 'هرج‌ومرج', 'مکاشفه'] },
      ar: { name: 'البُرج', keywords: ['تغيّر مفاجئ', 'اضطراب', 'فوضى', 'كشف'] },
    },
    image: '/cards/major/m16.jpg',
  },
  {
    id: 17, name: 'The Star',
    arcana: 'major', number: 17,
    keywords: ['hope', 'faith', 'purpose', 'renewal'],
    localized: {
      fa: { name: 'ستاره', keywords: ['امید', 'ایمان', 'هدف', 'تجدید'] },
      ar: { name: 'النجمة', keywords: ['أمل', 'إيمان', 'غاية', 'تجدّد'] },
    },
    image: '/cards/major/m17.jpg',
  },
  {
    id: 18, name: 'The Moon',
    arcana: 'major', number: 18,
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
    localized: {
      fa: { name: 'ماه', keywords: ['توهم', 'ترس', 'اضطراب', 'ناخودآگاه'] },
      ar: { name: 'القمر', keywords: ['وهم', 'خوف', 'قلق', 'اللاوعي'] },
    },
    image: '/cards/major/m18.jpg',
  },
  {
    id: 19, name: 'The Sun',
    arcana: 'major', number: 19,
    keywords: ['positivity', 'fun', 'warmth', 'success'],
    localized: {
      fa: { name: 'خورشید', keywords: ['مثبت‌اندیشی', 'شادی', 'گرما', 'موفقیت'] },
      ar: { name: 'الشمس', keywords: ['إيجابية', 'مرح', 'دفء', 'نجاح'] },
    },
    image: '/cards/major/m19.jpg',
  },
  {
    id: 20, name: 'Judgement',
    arcana: 'major', number: 20,
    keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'],
    localized: {
      fa: { name: 'داوری', keywords: ['داوری', 'تولد دوباره', 'ندای درون', 'آمرزش'] },
      ar: { name: 'الحُكم', keywords: ['حُكم', 'ولادة جديدة', 'نداء داخلي', 'غفران'] },
    },
    image: '/cards/major/m20.jpg',
  },
  {
    id: 21, name: 'The World',
    arcana: 'major', number: 21,
    keywords: ['completion', 'integration', 'accomplishment', 'travel'],
    localized: {
      fa: { name: 'جهان', keywords: ['تکمیل', 'یکپارچگی', 'دستاورد', 'سفر'] },
      ar: { name: 'العالَم', keywords: ['اكتمال', 'تكامل', 'إنجاز', 'سفر'] },
    },
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
  keywords: string[],
  localized: TarotCard['localized'],
  court?: TarotCard['court'],
): TarotCard {
  const prefix = SUIT_PREFIX[suit!];
  const numStr = String(number).padStart(2, '0');
  return {
    id, name, arcana: 'minor', suit, number, court, keywords, localized,
    image: `/cards/minor/${prefix}${numStr}.jpg`,
  };
}

// Wands (22-35)
const WANDS: TarotCard[] = [
  createMinorCard(22, 1, 'wands', 'Ace of Wands', ['inspiration', 'new opportunities', 'growth', 'potential'], {
    fa: { name: 'آس چوب‌دست‌ها', keywords: ['الهام', 'فرصت‌های تازه', 'رشد', 'پتانسیل'] },
    ar: { name: 'آس العصي', keywords: ['إلهام', 'فرص جديدة', 'نمو', 'إمكانات'] },
  }),
  createMinorCard(23, 2, 'wands', 'Two of Wands', ['future planning', 'progress', 'decisions', 'discovery'], {
    fa: { name: 'دو چوب‌دست‌ها', keywords: ['برنامه‌ریزی آینده', 'پیشرفت', 'تصمیمات', 'کشف'] },
    ar: { name: 'اثنان من العصي', keywords: ['تخطيط للمستقبل', 'تقدّم', 'قرارات', 'اكتشاف'] },
  }),
  createMinorCard(24, 3, 'wands', 'Three of Wands', ['progress', 'expansion', 'foresight', 'overseas opportunities'], {
    fa: { name: 'سه چوب‌دست‌ها', keywords: ['پیشرفت', 'گسترش', 'دوراندیشی', 'فرصت‌های فرامرزی'] },
    ar: { name: 'ثلاثة من العصي', keywords: ['تقدّم', 'توسّع', 'بُعد نظر', 'فرص خارجية'] },
  }),
  createMinorCard(25, 4, 'wands', 'Four of Wands', ['celebration', 'joy', 'harmony', 'relaxation'], {
    fa: { name: 'چهار چوب‌دست‌ها', keywords: ['جشن', 'شادی', 'هماهنگی', 'آرامش'] },
    ar: { name: 'أربعة من العصي', keywords: ['احتفال', 'فرح', 'انسجام', 'استرخاء'] },
  }),
  createMinorCard(26, 5, 'wands', 'Five of Wands', ['disagreement', 'competition', 'tension', 'conflict'], {
    fa: { name: 'پنج چوب‌دست‌ها', keywords: ['اختلاف', 'رقابت', 'تنش', 'تعارض'] },
    ar: { name: 'خمسة من العصي', keywords: ['خلاف', 'تنافس', 'توتّر', 'صراع'] },
  }),
  createMinorCard(27, 6, 'wands', 'Six of Wands', ['success', 'public recognition', 'progress', 'self-confidence'], {
    fa: { name: 'شش چوب‌دست‌ها', keywords: ['موفقیت', 'تقدیر عمومی', 'پیشرفت', 'اعتمادبه‌نفس'] },
    ar: { name: 'ستة من العصي', keywords: ['نجاح', 'تقدير عام', 'تقدّم', 'ثقة بالنفس'] },
  }),
  createMinorCard(28, 7, 'wands', 'Seven of Wands', ['challenge', 'competition', 'protection', 'perseverance'], {
    fa: { name: 'هفت چوب‌دست‌ها', keywords: ['چالش', 'رقابت', 'حمایت', 'پشتکار'] },
    ar: { name: 'سبعة من العصي', keywords: ['تحدٍّ', 'تنافس', 'حماية', 'مثابرة'] },
  }),
  createMinorCard(29, 8, 'wands', 'Eight of Wands', ['speed', 'action', 'air travel', 'movement'], {
    fa: { name: 'هشت چوب‌دست‌ها', keywords: ['سرعت', 'عمل', 'سفر هوایی', 'حرکت'] },
    ar: { name: 'ثمانية من العصي', keywords: ['سرعة', 'فعل', 'سفر جوّي', 'حركة'] },
  }),
  createMinorCard(30, 9, 'wands', 'Nine of Wands', ['resilience', 'courage', 'persistence', 'test of faith'], {
    fa: { name: 'نه چوب‌دست‌ها', keywords: ['تاب‌آوری', 'شجاعت', 'پایداری', 'آزمون ایمان'] },
    ar: { name: 'تسعة من العصي', keywords: ['صمود', 'شجاعة', 'مثابرة', 'امتحان الإيمان'] },
  }),
  createMinorCard(31, 10, 'wands', 'Ten of Wands', ['burden', 'extra responsibility', 'hard work', 'completion'], {
    fa: { name: 'ده چوب‌دست‌ها', keywords: ['بار سنگین', 'مسئولیت اضافی', 'سخت‌کوشی', 'اتمام'] },
    ar: { name: 'عشرة من العصي', keywords: ['عبء ثقيل', 'مسؤولية إضافية', 'كدّ', 'إتمام'] },
  }),
  createMinorCard(32, 11, 'wands', 'Page of Wands', ['inspiration', 'ideas', 'discovery', 'limitless potential'], {
    fa: { name: 'شاهزاده چوب‌دست‌ها', keywords: ['الهام', 'ایده‌ها', 'کشف', 'پتانسیل بی‌حد'] },
    ar: { name: 'غلام العصي', keywords: ['إلهام', 'أفكار', 'اكتشاف', 'إمكانات لا محدودة'] },
  }, 'page'),
  createMinorCard(33, 12, 'wands', 'Knight of Wands', ['energy', 'passion', 'adventure', 'impulsiveness'], {
    fa: { name: 'شوالیه چوب‌دست‌ها', keywords: ['انرژی', 'اشتیاق', 'ماجراجویی', 'تکانشگری'] },
    ar: { name: 'فارس العصي', keywords: ['طاقة', 'شغف', 'مغامرة', 'تسرّع'] },
  }, 'knight'),
  createMinorCard(34, 13, 'wands', 'Queen of Wands', ['courage', 'confidence', 'independence', 'social butterfly'], {
    fa: { name: 'ملکه چوب‌دست‌ها', keywords: ['شجاعت', 'اعتمادبه‌نفس', 'استقلال', 'اجتماعی بودن'] },
    ar: { name: 'ملكة العصي', keywords: ['شجاعة', 'ثقة بالنفس', 'استقلالية', 'اجتماعية'] },
  }, 'queen'),
  createMinorCard(35, 14, 'wands', 'King of Wands', ['natural leader', 'vision', 'entrepreneur', 'honour'], {
    fa: { name: 'شاه چوب‌دست‌ها', keywords: ['رهبر ذاتی', 'چشم‌انداز', 'کارآفرین', 'شرافت'] },
    ar: { name: 'مَلِك العصي', keywords: ['قائد بالفطرة', 'رؤية', 'ريادة', 'شرف'] },
  }, 'king'),
];

// Cups (36-49)
const CUPS: TarotCard[] = [
  createMinorCard(36, 1, 'cups', 'Ace of Cups', ['love', 'new feelings', 'emotional awakening', 'creativity'], {
    fa: { name: 'آس جام‌ها', keywords: ['عشق', 'احساسات نو', 'بیداری عاطفی', 'خلاقیت'] },
    ar: { name: 'آس الكؤوس', keywords: ['حبّ', 'مشاعر جديدة', 'صحوة عاطفية', 'إبداع'] },
  }),
  createMinorCard(37, 2, 'cups', 'Two of Cups', ['unified love', 'partnership', 'mutual attraction', 'connection'], {
    fa: { name: 'دو جام‌ها', keywords: ['عشق متحد', 'مشارکت', 'جذابیت متقابل', 'ارتباط'] },
    ar: { name: 'اثنان من الكؤوس', keywords: ['حبّ متّحد', 'شراكة', 'انجذاب متبادل', 'ارتباط'] },
  }),
  createMinorCard(38, 3, 'cups', 'Three of Cups', ['celebration', 'friendship', 'creativity', 'community'], {
    fa: { name: 'سه جام‌ها', keywords: ['جشن', 'دوستی', 'خلاقیت', 'اجتماع'] },
    ar: { name: 'ثلاثة من الكؤوس', keywords: ['احتفال', 'صداقة', 'إبداع', 'جماعة'] },
  }),
  createMinorCard(39, 4, 'cups', 'Four of Cups', ['meditation', 'contemplation', 'apathy', 'reevaluation'], {
    fa: { name: 'چهار جام‌ها', keywords: ['مراقبه', 'تأمل', 'بی‌تفاوتی', 'بازارزیابی'] },
    ar: { name: 'أربعة من الكؤوس', keywords: ['تأمّل', 'تفكّر', 'فتور', 'إعادة تقييم'] },
  }),
  createMinorCard(40, 5, 'cups', 'Five of Cups', ['regret', 'failure', 'disappointment', 'pessimism'], {
    fa: { name: 'پنج جام‌ها', keywords: ['افسوس', 'شکست', 'ناامیدی', 'بدبینی'] },
    ar: { name: 'خمسة من الكؤوس', keywords: ['ندم', 'فشل', 'خيبة أمل', 'تشاؤم'] },
  }),
  createMinorCard(41, 6, 'cups', 'Six of Cups', ['revisiting the past', 'childhood memories', 'innocence', 'joy'], {
    fa: { name: 'شش جام‌ها', keywords: ['بازگشت به گذشته', 'خاطرات کودکی', 'معصومیت', 'شادی'] },
    ar: { name: 'ستة من الكؤوس', keywords: ['عودة إلى الماضي', 'ذكريات الطفولة', 'براءة', 'فرح'] },
  }),
  createMinorCard(42, 7, 'cups', 'Seven of Cups', ['opportunities', 'choices', 'wishful thinking', 'illusion'], {
    fa: { name: 'هفت جام‌ها', keywords: ['فرصت‌ها', 'انتخاب‌ها', 'آرزواندیشی', 'توهم'] },
    ar: { name: 'سبعة من الكؤوس', keywords: ['فرص', 'خيارات', 'تمنّيات', 'وهم'] },
  }),
  createMinorCard(43, 8, 'cups', 'Eight of Cups', ['disappointment', 'abandonment', 'withdrawal', 'escapism'], {
    fa: { name: 'هشت جام‌ها', keywords: ['ناامیدی', 'رها کردن', 'کناره‌گیری', 'فرار از واقعیت'] },
    ar: { name: 'ثمانية من الكؤوس', keywords: ['خيبة أمل', 'تخلٍّ', 'انسحاب', 'هروب من الواقع'] },
  }),
  createMinorCard(44, 9, 'cups', 'Nine of Cups', ['contentment', 'satisfaction', 'gratitude', 'wish come true'], {
    fa: { name: 'نه جام‌ها', keywords: ['رضایت', 'خرسندی', 'سپاسگزاری', 'برآورده شدن آرزو'] },
    ar: { name: 'تسعة من الكؤوس', keywords: ['رضا', 'قناعة', 'شكر', 'تحقّق أمنية'] },
  }),
  createMinorCard(45, 10, 'cups', 'Ten of Cups', ['divine love', 'blissful relationships', 'harmony', 'alignment'], {
    fa: { name: 'ده جام‌ها', keywords: ['عشق الهی', 'روابط پرشکوه', 'هماهنگی', 'همسویی'] },
    ar: { name: 'عشرة من الكؤوس', keywords: ['حبّ إلهي', 'علاقات سعيدة', 'انسجام', 'توافق'] },
  }),
  createMinorCard(46, 11, 'cups', 'Page of Cups', ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility'], {
    fa: { name: 'شاهزاده جام‌ها', keywords: ['فرصت‌های خلاقانه', 'پیام‌های شهودی', 'کنجکاوی', 'امکان'] },
    ar: { name: 'غلام الكؤوس', keywords: ['فرص إبداعية', 'رسائل حدسية', 'فضول', 'إمكانية'] },
  }, 'page'),
  createMinorCard(47, 12, 'cups', 'Knight of Cups', ['creativity', 'romance', 'charm', 'imagination'], {
    fa: { name: 'شوالیه جام‌ها', keywords: ['خلاقیت', 'عاشقانه', 'جذابیت', 'تخیل'] },
    ar: { name: 'فارس الكؤوس', keywords: ['إبداع', 'رومانسية', 'سحر', 'خيال'] },
  }, 'knight'),
  createMinorCard(48, 13, 'cups', 'Queen of Cups', ['compassion', 'calm', 'comfort', 'emotional security'], {
    fa: { name: 'ملکه جام‌ها', keywords: ['شفقت', 'آرامش', 'آسایش', 'امنیت عاطفی'] },
    ar: { name: 'ملكة الكؤوس', keywords: ['رحمة', 'سكينة', 'راحة', 'أمان عاطفي'] },
  }, 'queen'),
  createMinorCard(49, 14, 'cups', 'King of Cups', ['emotional balance', 'compassion', 'diplomacy', 'wisdom'], {
    fa: { name: 'شاه جام‌ها', keywords: ['تعادل عاطفی', 'شفقت', 'دیپلماسی', 'خرد'] },
    ar: { name: 'مَلِك الكؤوس', keywords: ['توازن عاطفي', 'رحمة', 'دبلوماسية', 'حكمة'] },
  }, 'king'),
];

// Swords (50-63)
const SWORDS: TarotCard[] = [
  createMinorCard(50, 1, 'swords', 'Ace of Swords', ['breakthrough', 'clarity', 'sharp mind', 'truth'], {
    fa: { name: 'آس شمشیرها', keywords: ['شکافت', 'وضوح', 'ذهن تیز', 'حقیقت'] },
    ar: { name: 'آس السيوف', keywords: ['اختراق', 'وضوح', 'ذهن حادّ', 'حقيقة'] },
  }),
  createMinorCard(51, 2, 'swords', 'Two of Swords', ['difficult choices', 'indecision', 'stalemate', 'blocked emotions'], {
    fa: { name: 'دو شمشیرها', keywords: ['انتخاب‌های دشوار', 'بلاتکلیفی', 'بن‌بست', 'احساسات مسدود'] },
    ar: { name: 'اثنان من السيوف', keywords: ['خيارات صعبة', 'تردّد', 'طريق مسدود', 'مشاعر مكبوتة'] },
  }),
  createMinorCard(52, 3, 'swords', 'Three of Swords', ['heartbreak', 'emotional pain', 'sorrow', 'grief'], {
    fa: { name: 'سه شمشیرها', keywords: ['دل‌شکستگی', 'درد عاطفی', 'اندوه', 'سوگ'] },
    ar: { name: 'ثلاثة من السيوف', keywords: ['انكسار القلب', 'ألم عاطفي', 'حزن', 'ثكل'] },
  }),
  createMinorCard(53, 4, 'swords', 'Four of Swords', ['rest', 'relaxation', 'meditation', 'contemplation'], {
    fa: { name: 'چهار شمشیرها', keywords: ['استراحت', 'آرامش', 'مراقبه', 'تأمل'] },
    ar: { name: 'أربعة من السيوف', keywords: ['راحة', 'استرخاء', 'تأمّل', 'تفكّر'] },
  }),
  createMinorCard(54, 5, 'swords', 'Five of Swords', ['conflict', 'disagreements', 'competition', 'defeat'], {
    fa: { name: 'پنج شمشیرها', keywords: ['تعارض', 'اختلافات', 'رقابت', 'شکست'] },
    ar: { name: 'خمسة من السيوف', keywords: ['صراع', 'خلافات', 'تنافس', 'هزيمة'] },
  }),
  createMinorCard(55, 6, 'swords', 'Six of Swords', ['transition', 'change', 'rite of passage', 'releasing baggage'], {
    fa: { name: 'شش شمشیرها', keywords: ['گذار', 'تغییر', 'مراسم عبور', 'رها کردن بارها'] },
    ar: { name: 'ستة من السيوف', keywords: ['انتقال', 'تغيير', 'طقس عبور', 'تخفيف الأعباء'] },
  }),
  createMinorCard(56, 7, 'swords', 'Seven of Swords', ['betrayal', 'deception', 'getting away with something', 'strategy'], {
    fa: { name: 'هفت شمشیرها', keywords: ['خیانت', 'فریب', 'فرار از مسئولیت', 'استراتژی'] },
    ar: { name: 'سبعة من السيوف', keywords: ['خيانة', 'خداع', 'تملّص', 'استراتيجية'] },
  }),
  createMinorCard(57, 8, 'swords', 'Eight of Swords', ['negative thoughts', 'self-imposed restriction', 'imprisonment', 'victim mentality'], {
    fa: { name: 'هشت شمشیرها', keywords: ['افکار منفی', 'محدودیت خودساخته', 'زندان', 'ذهنیت قربانی'] },
    ar: { name: 'ثمانية من السيوف', keywords: ['أفكار سلبية', 'تقييد ذاتي', 'سجن', 'عقلية الضحية'] },
  }),
  createMinorCard(58, 9, 'swords', 'Nine of Swords', ['anxiety', 'worry', 'fear', 'depression'], {
    fa: { name: 'نه شمشیرها', keywords: ['اضطراب', 'نگرانی', 'ترس', 'افسردگی'] },
    ar: { name: 'تسعة من السيوف', keywords: ['قلق', 'هَمّ', 'خوف', 'اكتئاب'] },
  }),
  createMinorCard(59, 10, 'swords', 'Ten of Swords', ['painful endings', 'deep wounds', 'betrayal', 'loss'], {
    fa: { name: 'ده شمشیرها', keywords: ['پایان دردناک', 'زخم‌های عمیق', 'خیانت', 'از دست دادن'] },
    ar: { name: 'عشرة من السيوف', keywords: ['نهاية مؤلمة', 'جروح عميقة', 'خيانة', 'فقدان'] },
  }),
  createMinorCard(60, 11, 'swords', 'Page of Swords', ['new ideas', 'curiosity', 'thirst for knowledge', 'new communication'], {
    fa: { name: 'شاهزاده شمشیرها', keywords: ['ایده‌های جدید', 'کنجکاوی', 'تشنگی دانش', 'ارتباط نو'] },
    ar: { name: 'غلام السيوف', keywords: ['أفكار جديدة', 'فضول', 'عطش للمعرفة', 'تواصل جديد'] },
  }, 'page'),
  createMinorCard(61, 12, 'swords', 'Knight of Swords', ['ambitious', 'action-oriented', 'driven to succeed', 'fast thinking'], {
    fa: { name: 'شوالیه شمشیرها', keywords: ['جاه‌طلب', 'عمل‌گرا', 'مصمم به موفقیت', 'تفکر سریع'] },
    ar: { name: 'فارس السيوف', keywords: ['طموح', 'توجّه للعمل', 'إصرار على النجاح', 'تفكير سريع'] },
  }, 'knight'),
  createMinorCard(62, 13, 'swords', 'Queen of Swords', ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication'], {
    fa: { name: 'ملکه شمشیرها', keywords: ['مستقل', 'قضاوت بی‌طرفانه', 'مرزهای شفاف', 'ارتباط مستقیم'] },
    ar: { name: 'ملكة السيوف', keywords: ['استقلالية', 'حكم غير متحيّز', 'حدود واضحة', 'تواصل مباشر'] },
  }, 'queen'),
  createMinorCard(63, 14, 'swords', 'King of Swords', ['mental clarity', 'intellectual power', 'authority', 'truth'], {
    fa: { name: 'شاه شمشیرها', keywords: ['وضوح ذهنی', 'قدرت فکری', 'اقتدار', 'حقیقت'] },
    ar: { name: 'مَلِك السيوف', keywords: ['وضوح ذهني', 'قوّة فكرية', 'سلطة', 'حقيقة'] },
  }, 'king'),
];

// Pentacles (64-77)
const PENTACLES: TarotCard[] = [
  createMinorCard(64, 1, 'pentacles', 'Ace of Pentacles', ['new financial opportunity', 'prosperity', 'abundance', 'security'], {
    fa: { name: 'آس سکه‌ها', keywords: ['فرصت مالی جدید', 'رونق', 'فراوانی', 'امنیت'] },
    ar: { name: 'آس الدنانير', keywords: ['فرصة مالية جديدة', 'ازدهار', 'وفرة', 'أمان'] },
  }),
  createMinorCard(65, 2, 'pentacles', 'Two of Pentacles', ['balance', 'adaptability', 'time management', 'prioritisation'], {
    fa: { name: 'دو سکه‌ها', keywords: ['تعادل', 'سازگاری', 'مدیریت زمان', 'اولویت‌بندی'] },
    ar: { name: 'اثنان من الدنانير', keywords: ['توازن', 'مرونة', 'إدارة الوقت', 'ترتيب الأولويات'] },
  }),
  createMinorCard(66, 3, 'pentacles', 'Three of Pentacles', ['teamwork', 'collaboration', 'learning', 'implementation'], {
    fa: { name: 'سه سکه‌ها', keywords: ['کار تیمی', 'همکاری', 'یادگیری', 'اجرا'] },
    ar: { name: 'ثلاثة من الدنانير', keywords: ['عمل جماعي', 'تعاون', 'تعلّم', 'تنفيذ'] },
  }),
  createMinorCard(67, 4, 'pentacles', 'Four of Pentacles', ['saving money', 'security', 'conservatism', 'scarcity'], {
    fa: { name: 'چهار سکه‌ها', keywords: ['پس‌انداز', 'امنیت', 'محافظه‌کاری', 'کمبود'] },
    ar: { name: 'أربعة من الدنانير', keywords: ['ادّخار', 'أمان', 'تحفّظ', 'شحّ'] },
  }),
  createMinorCard(68, 5, 'pentacles', 'Five of Pentacles', ['financial loss', 'poverty', 'lack mindset', 'isolation'], {
    fa: { name: 'پنج سکه‌ها', keywords: ['ضرر مالی', 'فقر', 'ذهنیت کمبود', 'انزوا'] },
    ar: { name: 'خمسة من الدنانير', keywords: ['خسارة مالية', 'فقر', 'عقلية الندرة', 'انعزال'] },
  }),
  createMinorCard(69, 6, 'pentacles', 'Six of Pentacles', ['giving', 'receiving', 'sharing wealth', 'generosity'], {
    fa: { name: 'شش سکه‌ها', keywords: ['بخشیدن', 'دریافت کردن', 'تقسیم ثروت', 'سخاوت'] },
    ar: { name: 'ستة من الدنانير', keywords: ['عطاء', 'تلقٍّ', 'تقاسم الثروة', 'كرم'] },
  }),
  createMinorCard(70, 7, 'pentacles', 'Seven of Pentacles', ['long-term view', 'sustainable results', 'perseverance', 'investment'], {
    fa: { name: 'هفت سکه‌ها', keywords: ['دید بلندمدت', 'نتایج پایدار', 'پشتکار', 'سرمایه‌گذاری'] },
    ar: { name: 'سبعة من الدنانير', keywords: ['رؤية بعيدة المدى', 'نتائج مستدامة', 'مثابرة', 'استثمار'] },
  }),
  createMinorCard(71, 8, 'pentacles', 'Eight of Pentacles', ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development'], {
    fa: { name: 'هشت سکه‌ها', keywords: ['کارآموزی', 'کارهای تکراری', 'تسلط', 'توسعه مهارت'] },
    ar: { name: 'ثمانية من الدنانير', keywords: ['تمرّس', 'مهام متكررة', 'إتقان', 'تطوير مهارة'] },
  }),
  createMinorCard(72, 9, 'pentacles', 'Nine of Pentacles', ['abundance', 'luxury', 'self-sufficiency', 'financial independence'], {
    fa: { name: 'نه سکه‌ها', keywords: ['فراوانی', 'تجمل', 'خودکفایی', 'استقلال مالی'] },
    ar: { name: 'تسعة من الدنانير', keywords: ['وفرة', 'رفاهية', 'استقلالية', 'استقلال مالي'] },
  }),
  createMinorCard(73, 10, 'pentacles', 'Ten of Pentacles', ['wealth', 'financial security', 'family', 'long-term success'], {
    fa: { name: 'ده سکه‌ها', keywords: ['ثروت', 'امنیت مالی', 'خانواده', 'موفقیت بلندمدت'] },
    ar: { name: 'عشرة من الدنانير', keywords: ['ثراء', 'أمان مالي', 'عائلة', 'نجاح طويل الأمد'] },
  }),
  createMinorCard(74, 11, 'pentacles', 'Page of Pentacles', ['manifestation', 'financial opportunity', 'skill development', 'ambition'], {
    fa: { name: 'شاهزاده سکه‌ها', keywords: ['تجلی', 'فرصت مالی', 'توسعه مهارت', 'جاه‌طلبی'] },
    ar: { name: 'غلام الدنانير', keywords: ['تجلٍّ', 'فرصة مالية', 'تطوير مهارة', 'طموح'] },
  }, 'page'),
  createMinorCard(75, 12, 'pentacles', 'Knight of Pentacles', ['hard work', 'productivity', 'routine', 'conservatism'], {
    fa: { name: 'شوالیه سکه‌ها', keywords: ['سخت‌کوشی', 'بهره‌وری', 'روتین', 'محافظه‌کاری'] },
    ar: { name: 'فارس الدنانير', keywords: ['كدّ', 'إنتاجية', 'روتين', 'تحفّظ'] },
  }, 'knight'),
  createMinorCard(76, 13, 'pentacles', 'Queen of Pentacles', ['nurturing', 'practical', 'providing financially', 'working parent'], {
    fa: { name: 'ملکه سکه‌ها', keywords: ['پرورش‌دهنده', 'عملگرا', 'تأمین مالی', 'والد شاغل'] },
    ar: { name: 'ملكة الدنانير', keywords: ['رعاية', 'عملية', 'إعالة مالية', 'رعاية عاملة'] },
  }, 'queen'),
  createMinorCard(77, 14, 'pentacles', 'King of Pentacles', ['wealth', 'business', 'leadership', 'security'], {
    fa: { name: 'شاه سکه‌ها', keywords: ['ثروت', 'کسب‌وکار', 'رهبری', 'امنیت'] },
    ar: { name: 'مَلِك الدنانير', keywords: ['ثراء', 'أعمال', 'قيادة', 'أمان'] },
  }, 'king'),
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
