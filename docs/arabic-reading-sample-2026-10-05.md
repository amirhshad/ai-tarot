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

---

# The paid-tier comparison — answered

Run the same day. Same spread, same three cards, same question, same prompt
builders — `tier: 'pro'`, so **Claude Sonnet 5.5** instead of Haiku 4.5. 403
words against the free tier's ~300.

## The Arabic, paid tier

> الأحمق في موضع الماضي يقف على الحافة وفي يده زهرة، ولا يلتفت إلى ما تحت قدميه. هكذا دخلتَ الحبّ في المرّة التي تحملها هذه البطاقة: خفيفًا، مصدّقًا، تعطي قبل أن تحسب. وهنا الأمر الذي يستحقّ أن تتأمّله: الأحمق لا يقع في الهاوية في الرمز، لكنّ الذاكرة قد تحفظ القفزة وحدها وتنسى أنّها كانت شجاعة. ما ساقك إلى هذه اللحظة إذن هو انفتاح كامل سبق كلَّ حذر، وما جاء بعده هو ما صاغ حذرك الحالي.
>
> ثم تأتي بطاقة الموت، وهي معكوسة. وهذا أهمّ ما في الانتشار. الموت المستقيم يُغلق بابًا بإحكام ويدفنه. أمّا المعكوس فيشير إلى نهاية لم تكتمل، أو إلى تحوّل تتشبّث بحوافّه. تقف الآن عند شيء انتهى في معظمه ولم تأذن له بعدُ أن يرحل كلّه: علاقة، أو صورة عن نفسك في الحبّ، أو وعد قديم لم تتسلّم أنّه لن يتحقّق. وحين تضع هذه البطاقة بجوار الأحمق ترى التناقض واضحًا. الأحمق لا يحمل شيئًا من الماضي، ومعكوس الموت يحمل كلّ شيء. أنت بينهما: لا بريء كما كنت، ولا متحرّر ممّا تعلّمته. وسؤالك «هل أنا مستعدّ؟» يعيش في هذه المسافة تحديدًا.
>
> لهذا لا تجيبك البطاقات بنعم أو لا. ما تقوله البطاقة المعكوسة أنّ الاستعداد لا يسبق الانتهاء، بل يتبعه. لا تفتح قلبك من جديد وأنت لا تزال نصف واقف في الباب القديم. وما يمنع الموتَ أن يكتمل غالبًا هو الخوف من الفراغ الذي يليه، لا حبٌّ باقٍ. الفراغ مخيف، لكنّ بطاقة الموت في أصلها تُنهي كي تُفسح مكانًا.
>
> والنجمة في المستقبل تردّ على هذا الخوف مباشرة. تجثو امرأة عارية عند الماء بعد الليل الطويل، وتسكب من إناءين: واحد في الماء وواحد على الأرض. لا شيء مخبّأ ولا مدرَّع. لكنّها ليست الأحمق؛ فالأحمق لم يكن يعرف ما يمكن أن يُفقد، أمّا النجمة فتعرف، وتفتح يدها رغم ذلك. هذا الانفتاح الثاني أعمق من الأول، لأنّه يأتي بعد معرفة. ولاحظ أنّ النجمة تظهر بعد الموت في تسلسل الأوراق الكبرى، وهذا ليس عبثًا: الأمل الذي تعدك به لا يتجاوز الجرح، بل ينبت منه.
>
> فالخيط الذي يجمع الثلاثة هو أنّ انفتاحك المقبل لن يشبه الأول. الأحمق فتح قلبه جهلًا بالخطر، والنجمة تفتحه وهي تعرف الخطر. وبينهما الموت المعكوس، وهو ما عليك أن تعبره بأن تسمّي ما انتهى فعلًا وتكفّ عن إبقائه معلّقًا.
>
> أمّا استعدادك فتقرؤه البطاقات هكذا: أنت مستعدّ بقدر ما تسمح لما انتهى أن ينتهي. وليس المطلوب أن تتخلّص من الحذر أو تستعيد البراءة، فالنجمة لا تطلب منك ذلك. المطلوب أن تتأمّل: ما الذي ما زلتَ تمسك به من الباب القديم، ولماذا؟ وحين تجيب عن هذا بصدق، قد تجد أنّ السؤال عن الاستعداد قد أجاب عن نفسه.

## Farsi translation

> احمق در جایگاه گذشته بر لبهٔ پرتگاه ایستاده و گلی در دست دارد، و به آنچه زیر پایش است نمی‌نگرد. تو نیز در آن بار که این کارت حملش می‌کند، چنین به عشق درآمدی: سبک، باورکننده، بخشنده پیش از آنکه حساب کنی. و این نکته‌ای است که ارزش تأمل دارد: احمق در نماد به درّه نمی‌افتد، اما حافظه ممکن است تنها آن جهش را نگه دارد و فراموش کند که شجاعت بود. پس آنچه تو را به این لحظه رساند، گشودگیِ کاملی بود که بر هر احتیاطی مقدم شد؛ و آنچه پس از آن آمد، همان است که احتیاط امروزت را شکل داد.
>
> سپس کارت مرگ می‌آید، و معکوس است. و این مهم‌ترین چیز در این گسترش است. مرگِ مستقیم دری را محکم می‌بندد و به خاکش می‌سپارد. اما معکوس به پایانی اشاره می‌کند که کامل نشده، یا به دگرگونی‌ای که به لبه‌هایش چنگ زده‌ای. اکنون بر سر چیزی ایستاده‌ای که بیشترش پایان یافته و تو هنوز اجازه نداده‌ای همه‌اش برود: یک رابطه، یا تصویری از خودت در عشق، یا وعده‌ای کهنه که نپذیرفته‌ای برآورده نخواهد شد. و چون این کارت را کنار احمق بگذاری، تناقض را روشن می‌بینی. احمق هیچ از گذشته با خود ندارد، و مرگِ معکوس همه‌چیز را دارد. تو میان آن دویی: نه معصوم چنان‌که بودی، و نه رها از آنچه آموخته‌ای. و پرسش تو — «آیا آماده‌ام؟» — دقیقاً در همین فاصله زندگی می‌کند.
>
> از این رو کارت‌ها به تو آری یا نه نمی‌گویند. آنچه کارتِ معکوس می‌گوید این است که آمادگی بر پایان مقدم نیست، بلکه از پی آن می‌آید. قلبت را از نو مگشا در حالی که هنوز نیمی از تو در آستانهٔ کهنه ایستاده است. و آنچه بیشتر وقت‌ها نمی‌گذارد مرگ کامل شود، ترس از آن تهیّ است که پس از آن می‌آید، نه عشقی که باقی مانده. تهیّ ترسناک است، اما کارت مرگ در اصل خود پایان می‌دهد تا جا باز کند.
>
> و ستاره در آینده مستقیماً به همین ترس پاسخ می‌دهد. زنی عریان پس از شبِ دراز کنار آب زانو می‌زند و از دو کوزه می‌ریزد: یکی در آب و یکی بر خاک. هیچ‌چیز پنهان نیست و هیچ‌چیز زره‌پوش. اما او احمق نیست؛ احمق نمی‌دانست چه چیزی می‌تواند از دست برود، اما ستاره می‌داند، و با این همه دستش را می‌گشاید. این گشودگیِ دوم از نخستین عمیق‌تر است، زیرا پس از دانستن می‌آید. و توجه کن که ستاره در توالیِ کارت‌های بزرگ پس از مرگ می‌آید، و این بی‌سبب نیست: امیدی که به تو می‌دهد از زخم نمی‌گذرد، بلکه از آن می‌روید.
>
> پس رشته‌ای که این سه را به هم می‌پیوندد این است که گشودگیِ آیندهٔ تو شبیه نخستین نخواهد بود. احمق قلبش را از ناآگاهی از خطر گشود، و ستاره آن را می‌گشاید در حالی که خطر را می‌شناسد. و میان آن دو، مرگِ معکوس است — همان که باید از آن بگذری، با نام بردن از آنچه واقعاً پایان یافته و با دست کشیدن از معلق نگه داشتنش.
>
> و آمادگی‌ات را کارت‌ها چنین می‌خوانند: تو به همان اندازه آماده‌ای که می‌گذاری آنچه پایان یافته، پایان یابد. و خواسته این نیست که از احتیاط رها شوی یا معصومیت را بازگردانی؛ ستاره چنین چیزی از تو نمی‌خواهد. خواسته این است که تأمل کنی: چه چیزی را هنوز از آستانهٔ کهنه در دست داری، و چرا؟ و چون به این صادقانه پاسخ دهی، شاید ببینی که پرسشِ آمادگی خودش به خودش پاسخ داده است.

## The verdict: the gap is the model, not the prompt

| | Free (Haiku 4.5) | Paid (Sonnet 5.5) |
|---|---|---|
| Words | ~300 | 403 |
| Clear grammatical errors | **5** | **0** |
| Arguable slips | — | 1 (`لم تتسلّم` where `لم تُسلِّم بـ` is the idiom for "you haven't accepted that") |
| Persian letters | 0 | 0 |
| Latin runs | 0 | 0 |
| Deterministic prediction | none | none |

All five Haiku error classes are absent. More than that, Sonnet does things the
free tier did not:

- **Correct agreement on a harder construction.** Haiku wrote `الموت المعكوس`
  (masculine, agreeing with `الموت`). Sonnet writes `بطاقة الموت، وهي معكوسة`
  (feminine, agreeing with `بطاقة`) *and* `ومعكوس الموت` later — both correct,
  chosen by context.
- **Real card imagery**: the Fool's flower, the Star's two vessels poured into
  water and onto earth. It is reading the Rider-Waite images, not paraphrasing
  keywords.
- **A structural argument** rather than three descriptive paragraphs: it names the
  Fool/Death contradiction explicitly (`ترى التناقض واضحًا`), then names the thread
  (`فالخيط الذي يجمع الثلاثة`), which is exactly what `NARRATIVE_STRUCTURE.ar` asks for
  and what the free tier only gestured at.
- **It refuses the binary correctly** — `لهذا لا تجيبك البطاقات بنعم أو لا` — for a
  "am I ready?" question on the `love` topic, where no yes-or-no format applies.
- `الاستعداد لا يسبق الانتهاء، بل يتبعه` ("readiness does not precede the ending,
  it follows it") is the kind of line the register was designed to make possible.

**One terminology note, not an error:** Sonnet wrote `تسلسل الأوراق الكبرى` for the
Major Arcana, where this project's committed term is `الأركانا الكبرى`. Free
generation is not bundle copy so nothing is inconsistent in the codebase — but it
shows the model does not know the project's chosen term. If Phase 2 cares about
that term appearing consistently in generated prose, it belongs in
`VOICE_CONSTRAINTS.ar` or the spread shapes, not only in `ar.json`.

## What this means for shipping

The Arabic prompt family is sound — confirmed twice now, on two models. The
free tier's five errors were Haiku's morphology, not a prompt defect, which also
explains why `VOICE_CONSTRAINTS.ar` did not catch them: it governs register and
cliché, and these were inflection.

So the decision is a product one, not an engineering one:

1. **Ship as is.** Paid Arabic is good. Free Arabic is comprehensible but reads
   as machine-written to a native speaker — the same bargain English and Farsi
   free readings already make, except Arabic morphology makes the gap more
   visible.
2. **Route Arabic free readings to Sonnet.** Closes the gap at the cost of free-tier
   margin on Arabic traffic only. `getModel` in `app/src/lib/ai/client.ts` already
   takes the tier; it would need the locale too.
3. **Add a morphology instruction to `VOICE_CONSTRAINTS.ar`** and re-test on Haiku.
   Cheapest, least certain — the five errors are the kind a stronger model avoids
   naturally rather than the kind a rule reliably prevents.

My recommendation is **2**, scoped to Arabic only, if Arabic free traffic is small
enough that the cost is noise. Otherwise **1**, with the free-tier limitation
written down rather than discovered.

