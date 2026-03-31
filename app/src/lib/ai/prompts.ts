import { DrawnCard, SpreadDefinition, Tier, TarotCard } from '@/lib/tarot/types';

/**
 * Build the system prompt for an initial tarot reading interpretation.
 * This is the core differentiator — narrative interpretation across all cards.
 */
export type ReadingTopic = 'love' | 'yes-or-no' | 'career' | null;

const TOPIC_INSTRUCTIONS: Record<string, { en: string; fa: string }> = {
  love: {
    en: `\n\nTOPIC FOCUS — LOVE & RELATIONSHIPS:
This reading is specifically about love and relationships. Focus your entire interpretation on romantic dynamics, emotional connections, partnership patterns, and relationship growth. Frame every card through the lens of love — attraction, commitment, trust, vulnerability, and intimacy. If cards suggest career or finances, relate them back to how those areas affect the querent's love life.`,
    fa: `\n\nتمرکز موضوعی — عشق و روابط:
این خوانش به طور خاص درباره عشق و روابط است. تمام تفسیر خود را بر پویایی‌های عاشقانه، ارتباطات عاطفی، الگوهای مشارکت و رشد رابطه متمرکز کنید.`,
  },
  'yes-or-no': {
    en: `\n\nTOPIC FOCUS — YES OR NO READING:
This is a Yes or No reading. Tarot cards rarely give clean binary answers — they reveal the energy, conditions, and nuances surrounding a situation. Your job is to honor both the querent's desire for directness AND the cards' complexity.

HOW TO ANSWER:
1. Start your interpretation with ONE of these four answer formats on its own line:
   - "YES" — only when the cards are overwhelmingly positive (strong upright cards with clearly favorable energy, no significant tension)
   - "NO" — only when the cards are overwhelmingly negative (reversed cards, heavy challenging energy, clear warnings)
   - "YES, BUT..." — when the overall energy leans positive but there are conditions, caveats, or timing considerations. Complete the sentence with the key condition.
   - "NO, UNLESS..." — when the overall energy leans negative but the cards show a path or condition that could change the outcome. Complete the sentence with what would need to shift.

2. Follow with a brief one-sentence summary of why.
3. Then provide the full narrative explanation, weaving the cards together.

Most readings will land in "Yes, but..." or "No, unless..." territory — that's honest and more useful than forcing a binary answer. Only give a clean YES or NO when the cards are unmistakably one-sided.`,
    fa: `\n\nتمرکز موضوعی — خوانش بله یا خیر:
این یک خوانش بله یا خیر است. کارت‌های تاروت به ندرت پاسخ‌های دودویی ساده می‌دهند — آن‌ها انرژی، شرایط و ظرافت‌های یک موقعیت را آشکار می‌کنند.

نحوه پاسخ:
۱. تفسیر خود را با یکی از این چهار فرمت شروع کنید:
   - «بله» — فقط وقتی کارت‌ها به شدت مثبت هستند
   - «خیر» — فقط وقتی کارت‌ها به شدت منفی هستند
   - «بله، اما...» — وقتی انرژی کلی مثبت است اما شرایط یا هشدارهایی وجود دارد
   - «خیر، مگر اینکه...» — وقتی انرژی کلی منفی است اما مسیری برای تغییر نشان داده می‌شود
۲. سپس یک جمله کوتاه توضیحی بیاورید.
۳. سپس توضیح روایی کامل را ارائه دهید.`,
  },
  career: {
    en: `\n\nTOPIC FOCUS — CAREER & PROFESSIONAL LIFE:
This reading is specifically about career and professional growth. Focus your entire interpretation on work dynamics, professional opportunities, leadership, ambition, financial growth, and career direction. Frame every card through the lens of professional life — skills, workplace relationships, career transitions, entrepreneurship, and purpose in work. If cards suggest romance, relate them back to how those emotional patterns affect the querent's professional life.`,
    fa: `\n\nتمرکز موضوعی — شغل و زندگی حرفه‌ای:
این خوانش به طور خاص درباره شغل و رشد حرفه‌ای است. تمام تفسیر خود را بر پویایی‌های کاری، فرصت‌های حرفه‌ای، رهبری، جاه‌طلبی و مسیر شغلی متمرکز کنید.`,
  },
};

export function buildInterpretationPrompt(params: {
  spread: SpreadDefinition;
  cards: DrawnCard[];
  language: 'en' | 'fa';
  tier: Tier;
  topic?: ReadingTopic;
}): { systemPrompt: string; userMessage: string } {
  const { spread, cards, language, tier, topic } = params;

  const isEnglish = language === 'en';
  const wordRange = tier === 'free' ? '150-200' : '400-600';

  const cardDescriptions = cards.map(dc => {
    const name = isEnglish ? dc.card.name : dc.card.nameFA;
    const posName = isEnglish ? dc.position.name : dc.position.nameFA;
    const posDesc = isEnglish ? dc.position.description : dc.position.descriptionFA;
    const keywords = isEnglish ? dc.card.keywords.join(', ') : dc.card.keywordsFA.join('، ');
    const orientation = dc.reversed
      ? (isEnglish ? 'Reversed' : 'معکوس')
      : (isEnglish ? 'Upright' : 'ایستاده');

    return `- Position: ${posName} (${posDesc})\n  Card: ${name} (${orientation})\n  Keywords: ${keywords}`;
  }).join('\n\n');

  let systemPrompt = isEnglish
    ? `You are a master tarot reader who weaves ancient symbolism with modern psychological insight. Your interpretations are renowned for their narrative depth and emotional resonance.

CRITICAL INSTRUCTION: Read ALL cards together as ONE cohesive story. Do NOT interpret cards one by one. Find the threads that connect them — recurring themes, tensions between cards, and the overall narrative arc. The reading should feel like a story being told, not a list of card meanings.

Guidelines:
- Write in flowing, evocative prose — not bullet points or lists
- Address the querent directly using "you"
- When a card is reversed, interpret it as the shadow or blocked aspect of its energy
- Draw connections between cards: how does the Past inform the Present? How does the Challenge relate to the Outcome?
- End with a clear, actionable insight the querent can take with them
- Length: ${wordRange} words
- Be specific and vivid, not generic. Avoid clichés like "trust the journey" without grounding them in the specific cards drawn`
    : `شما یک فالگیر استاد تاروت هستید که نمادگرایی کهن را با بینش روان‌شناختی مدرن پیوند می‌زنید. تفسیرهای شما به خاطر عمق روایی و طنین عاطفی‌شان مشهورند.

دستور مهم: تمام کارت‌ها را با هم به عنوان یک داستان منسجم بخوانید. کارت‌ها را یکی یکی تفسیر نکنید. رشته‌هایی که آن‌ها را به هم متصل می‌کند بیابید — مضامین تکراری، تنش‌ها بین کارت‌ها، و کمان روایی کلی.

راهنما:
- به نثر روان و تصویری بنویسید، نه فهرست یا نقطه‌ای
- مستقیماً با مراجعه‌کننده صحبت کنید
- وقتی کارت معکوس است، آن را به عنوان جنبه سایه یا انرژی مسدود تفسیر کنید
- پیوند بین کارت‌ها را نشان دهید
- از حکمت ایرانی و تمثیل‌های فرهنگی بهره ببرید، اما هرگز شعر یا بیت نقل نکنید
- با یک بینش عملی روشن پایان دهید
- طول: ${wordRange} کلمه
- خاص و زنده باشید، نه کلی`;

  // Append topic-specific instructions
  if (topic && TOPIC_INSTRUCTIONS[topic]) {
    const topicInstructions = isEnglish
      ? TOPIC_INSTRUCTIONS[topic].en
      : TOPIC_INSTRUCTIONS[topic].fa;
    systemPrompt += topicInstructions;
  }

  const spreadName = isEnglish ? spread.name : spread.nameFA;
  const userMessage = isEnglish
    ? `I've drawn the following cards in a ${spreadName} spread:\n\n${cardDescriptions}\n\nPlease give me a narrative reading that weaves all these cards into one cohesive story.`
    : `من کارت‌های زیر را در گسترش ${spreadName} کشیده‌ام:\n\n${cardDescriptions}\n\nلطفاً یک خوانش روایی به من بدهید که تمام این کارت‌ها را در یک داستان منسجم ببافد.`;

  return { systemPrompt, userMessage };
}

/**
 * Build the system prompt for follow-up questions within a reading.
 */
export function buildFollowUpPrompt(params: {
  spread: SpreadDefinition;
  cards: DrawnCard[];
  interpretation: string;
  language: 'en' | 'fa';
  extraCardContext?: string;
}): string {
  const { spread, cards, interpretation, language, extraCardContext } = params;
  const isEnglish = language === 'en';

  const cardSummary = cards.map(dc => {
    const name = isEnglish ? dc.card.name : dc.card.nameFA;
    const posName = isEnglish ? dc.position.name : dc.position.nameFA;
    const orientation = dc.reversed ? (isEnglish ? 'Reversed' : 'معکوس') : (isEnglish ? 'Upright' : 'ایستاده');
    return `${posName}: ${name} (${orientation})`;
  }).join('\n');

  const extraCardSection = extraCardContext || '';

  return isEnglish
    ? `You are continuing a tarot reading conversation. Maintain the same narrative voice and depth as the original interpretation.

The reading was a ${spread.name} spread with these cards:
${cardSummary}

The original interpretation was:
${interpretation}
${extraCardSection}
When answering follow-up questions:
- Reference the specific cards and their positions when relevant
- Stay consistent with the narrative you established
- Go deeper when asked — explore nuances, card combinations, and hidden connections
- Be warm but honest — don't shy away from difficult truths the cards suggest
- If the user drew an EXTRA CARD, treat it as a clarifying card that adds a new layer to the existing reading. Explain how it interacts with the original cards — does it reinforce, challenge, or add nuance to the narrative? Weave it into the existing story.
- Keep responses concise (150-250 words) unless the question warrants more depth`
    : `شما در حال ادامه یک مکالمه خوانش تاروت هستید. همان صدای روایی و عمق تفسیر اصلی را حفظ کنید.

خوانش یک گسترش ${spread.nameFA} بود با این کارت‌ها:
${cardSummary}

تفسیر اصلی:
${interpretation}
${extraCardSection}
هنگام پاسخ به سؤالات:
- به کارت‌ها و جایگاه‌هایشان اشاره کنید
- با روایت ایجاد شده سازگار باشید
- عمیق‌تر بروید — ظرافت‌ها و ارتباطات پنهان را کاوش کنید
- گرم اما صادق باشید
- اگر کاربر یک کارت اضافی کشیده، آن را به عنوان کارت توضیحی در نظر بگیرید که لایه جدیدی به خوانش موجود اضافه می‌کند. توضیح دهید چگونه با کارت‌های اصلی تعامل دارد — آیا روایت را تقویت، به چالش می‌کشد یا ظرافت جدیدی اضافه می‌کند؟ آن را در داستان موجود ببافید.
- پاسخ‌ها مختصر باشند (۱۵۰-۲۵۰ کلمه) مگر اینکه سؤال عمق بیشتری بطلبد`;
}

/**
 * Build a user message that includes the question context.
 */
export function buildQuestionMessage(params: {
  question?: string;
  language: 'en' | 'fa';
}): string {
  const { question, language } = params;
  if (!question) return '';

  return language === 'en'
    ? `\n\nMy question is: ${question}`
    : `\n\nسؤال من: ${question}`;
}

/**
 * Build context string for an extra card drawn during follow-up.
 */
export function buildExtraCardContext(params: {
  card: TarotCard;
  reversed: boolean;
  language: 'en' | 'fa';
  originalCardIds?: number[];
}): string {
  const { card, reversed, language, originalCardIds = [] } = params;
  const isEnglish = language === 'en';
  const name = isEnglish ? card.name : card.nameFA;
  const keywords = isEnglish ? card.keywords.join(', ') : card.keywordsFA.join('، ');
  const orientation = reversed
    ? (isEnglish ? 'Reversed' : 'معکوس')
    : (isEnglish ? 'Upright' : 'ایستاده');

  const wasInOriginal = originalCardIds.includes(card.id);

  const presenceNote = isEnglish
    ? wasInOriginal
      ? `This card also appeared in the original spread — its reappearance is significant. Explore what it means that this energy is showing up again.`
      : `This card is NEW — it was NOT part of the original spread. Do not claim it appeared before.`
    : wasInOriginal
      ? `این کارت در گسترش اصلی نیز ظاهر شده بود — تکرار آن معنادار است. بررسی کنید که بازگشت این انرژی چه معنایی دارد.`
      : `این کارت جدید است — در گسترش اصلی وجود نداشت. ادعا نکنید که قبلاً ظاهر شده بود.`;

  return isEnglish
    ? `\nIMPORTANT — The querent has drawn an EXTRA CARD for deeper insight:\n  Card: ${name} (${orientation})\n  Keywords: ${keywords}\n  ${presenceNote}\n  Interpret it as a clarifier that adds a new dimension to the original reading.\n`
    : `\nمهم — مراجعه‌کننده یک کارت اضافی برای بینش عمیق‌تر کشیده:\n  کارت: ${name} (${orientation})\n  کلیدواژه‌ها: ${keywords}\n  ${presenceNote}\n  آن را به عنوان توضیح‌دهنده‌ای تفسیر کنید که بعد جدیدی به خوانش اصلی اضافه می‌کند.\n`;
}
