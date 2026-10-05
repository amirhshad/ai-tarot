# Arabic reading sample — verification for Phase 1

**Date:** 2026-10-05
**Purpose:** Task 11's register check — read one real Arabic reading against the
constraints, rather than only reviewing the prompts that produce it.

## How it was generated

| | |
|---|---|
| Endpoint | `POST /api/reading/free` (unauthenticated) |
| Spread | Three Card — Past / Present / Future |
| Tier | **free → Claude Haiku 4.5** (the cheapest path, and the *floor* of output quality) |
| Topic | `love` — the most emotionally demanding register, so the hardest test of "warm MSA" |
| Question | `هل أنا مستعدّ لأن أفتح قلبي من جديد؟` ("Am I ready to open my heart again?") |
| Cards | Past: The Fool, upright · Present: **Death, reversed** · Future: The Star, upright |

Death reversed was chosen deliberately to exercise the `معكوس` orientation label
in running prose.

## The Arabic, as shipped

> دخلتَ إلى الحبّ الأول بقلب خفيف، لا تحمل أسئلة كبيرة. كان هناك براءة في الطريقة التي انجذبتَ فيها، عفويّة في الشعور، روح تتحرّك بحريّة نحو من تراه. لم تكن تحسب الخسائر المحتملة لأن الخوف لم يكن جزءًا من اللغة التي تتكلمها وقتها. هذا ما ساقك إلى هنا.
>
> الآن أنت في وسط شيء لا تستطيع السيطرة عليه. الموت المعكوس يقول إنك تقاوم نهايةً ما، أو تعثّر في الانتقال. قد تكون هذه مقاومة لترك الماضي فعلًا — ليس حبًا قديمًا بقدر ما هي مقاومة الألم نفسه. تريد أن تحتفظ بقليل من الحماية، بجدار يفصلك قليلًا عن المخاطرة مرّة أخرى. لا تريد أن تصير خاويًا من جديد.
>
> لكن النجمة في المستقبل لا تظهر نعمًا ولا تراجعًا. تظهر ضوءًا يستنير حتّى في الظلام. الاستعدادية ليست غياب الخوف — إنها الخطو نحو النور رغم أن العتمة لا تزال حقيقية. البطاقات لا تسألك هل ستؤلمك المرّة القادمة. تسألك: هل ستسمح للأمل أن يشتعل حتّى وأنت تحمل ندوب الأمس؟
>
> استعدادك ليس في غياب المقاومة الحالية. إنه في قرارك أن تعبر تلك المقاومة حينما تجد الشخص الذي يستحقّ. اترك الموت المعكوس يفعل عمله — اترك النهاية تتمّ بحقّها، بدل أن تعليقها في الهواء. الضوء الذي ترى النجمة ينعكس عليه جاهز لك.
>
> **اختر: لا تفتح قلبك لأن لا أحد يستطيع إيذاءك. افتحه لأن حياتك تستحقّ أن تحترق من جديد.**

## Farsi translation

Translated for assessment, not for shipping — so you can judge the content and
register in the language you read fluently. Kept faithful rather than improved:
where the Arabic is awkward, the Farsi is awkward in the same place.

> با دلی سبک به عشق اول وارد شدی، بدون آنکه پرسش‌های بزرگی با خود ببری. در آن کشیده‌شدن، معصومیتی بود؛ در آن احساس، خودانگیختگی‌ای؛ روحی که آزادانه به سوی آن‌که می‌دیدی حرکت می‌کرد. زیان‌های ممکن را حساب نمی‌کردی، چون ترس بخشی از زبانی نبود که آن روزها با آن سخن می‌گفتی. همین تو را به اینجا رساند.
>
> اکنون در میانهٔ چیزی هستی که نمی‌توانی مهارش کنی. مرگِ معکوس می‌گوید که در برابر پایانی مقاومت می‌کنی، یا در گذار می‌لنگی. شاید این مقاومت در برابر رها کردنِ گذشته باشد — نه آن‌قدر عشقی کهنه، که مقاومت در برابر خودِ درد. می‌خواهی اندکی محافظت را نگه داری، دیواری که کمی تو را از خطر کردنِ دوباره جدا کند. نمی‌خواهی باز تُهی شوی.
>
> اما ستاره در آینده نه نعمتی نشان می‌دهد و نه پس‌رفتی. نوری نشان می‌دهد که حتی در تاریکی می‌تابد. آمادگی، نبودِ ترس نیست — گام نهادن به سوی نور است، با آنکه تیرگی هنوز واقعی است. کارت‌ها از تو نمی‌پرسند که آیا بار بعد دردت خواهد آمد. از تو می‌پرسند: آیا می‌گذاری امید شعله بگیرد، حتی وقتی زخم‌های دیروز را با خود داری؟
>
> آمادگی تو در نبودِ این مقاومت نیست. در آن تصمیمِ توست که از آن مقاومت بگذری، آنگاه که کسی را بیابی که سزاوار است. بگذار مرگِ معکوس کارش را بکند — بگذار پایان به حقِ خود تمام شود، به‌جای آنکه در هوا معلّقش نگه داری. آن نوری که ستاره بر آن بازمی‌تابد، آمادهٔ توست.
>
> **انتخاب کن: قلبت را نگشا به این دلیل که هیچ‌کس نتواند آزارت دهد. بگشا به این دلیل که زندگی‌ات سزاوار است که از نو بسوزد.**

## What the prompt scaffolding got right

Every constraint the Arabic prompt family was built to enforce held:

- **Reflective, never predictive.** `قد تكون هذه مقاومة`, `تسألك`, and explicitly
  `البطاقات لا تسألك هل ستؤلمك المرّة القادمة` — "the cards do not ask you whether
  it will hurt next time." No `ستفعل` / `سيحدث` anywhere. This was the single
  constraint most at risk and it is clean.
- **`أنت` consistent**, masculine throughout (`دخلتَ`, `انجذبتَ`), never slipping
  to plural or dialect.
- **Woven, not a card-by-card walk.** `هذا ما ساقك إلى هنا` closes the past into
  the present, `لكن النجمة` turns against it, and the final paragraph returns to
  Death reversed rather than ending on whichever card came last.
- **The directive's Arabic register is present** — light and darkness carry the
  reading (`النور`, `الظلام`, `العتمة`, `الضوء`), not ported Persian metaphors.
- **Zero Persian letters.** `الموت المعكوس` is correct masculine agreement with
  `الموت`, which is what the orientation table should produce.
- The closing line is genuinely good writing: *"Do not open your heart because
  no one can hurt you. Open it because your life deserves to burn again."*

## What is wrong with it — five slips in ~300 words

This is the honest part. The scaffolding is sound; **the model's Arabic is not clean.**

| | Text | Problem |
|---|---|---|
| 1 | `أو تعثّر في الانتقال` | `تعثّر` is 3rd-person past ("he stumbled") amid 2nd-person address. Should be `تتعثّر`. |
| 2 | `لا تظهر نعمًا ولا تراجعًا` | `نعمًا` is not a well-formed accusative here; `نعمةً` or `نعيمًا` was meant. |
| 3 | `ضوءًا يستنير` | `يستنير` is intransitive — "a light that becomes lit". Wants `يُنير` (illuminates). |
| 4 | `الاستعدادية` | An awkward coinage. The normal word is `الاستعداد`, which the text itself uses correctly two sentences later (`استعدادك`). |
| 5 | `بدل أن تعليقها` | `تعليقها` is a verbal noun where `أن` requires a verb: `بدل أن تعلّقها`. |

Also `الضوء الذي ترى النجمة ينعكس عليه جاهز لك` is convoluted enough that a reader
has to re-parse it.

## The conclusion that matters

**The Arabic prompt family works. The free tier's Arabic does not meet the
register bar the prompts ask for.**

Five grammatical errors in 300 words is an error roughly every two sentences — a
rate a native reader notices immediately, and the kind that reads as machine
translation even though the *structure* and *tone* are right.

Crucially, **this was Haiku 4.5 on the free tier**, which is the floor. Paid tiers
run Sonnet 5.5, which should produce materially cleaner Arabic. So the finding is
not "Arabic is broken" but:

> Arabic output quality is tier-dependent in a way English and Farsi are not,
> because Arabic morphology punishes a weaker model harder than English does.

**Recommended before promoting Arabic publicly:** generate the same spread on a
paid tier and compare. If Sonnet's Arabic is clean, the gap is a free-tier
limitation worth either accepting or addressing by routing Arabic free readings to
a stronger model. If Sonnet's Arabic shows the same slip rate, the prompt needs an
explicit grammatical-care instruction — none of the five errors above is the kind
a voice constraint currently targets, since `VOICE_CONSTRAINTS.ar` addresses
register and cliché, not morphology.

That comparison costs one paid reading and is the single highest-value next check.
