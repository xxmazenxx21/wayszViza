# بريف موقع WaysZ Visa — النسخة 3 (مسودة للاعتماد)

> **النطاق:** خاص بموقع WaysZ Visa (waysz-visa.com). الموقع الرئيسي waysz.org يظهر هنا كرابط (`site.mainSite`).
> **المصادر:** البريف v2 (الجزء 01 «ثانيًا: موقع WaysZ Visa» · الجزء 04 · الجزء 05) + طلبات العميل (27 نوفمبر 2026):
> 1. خذ الفكرة العامة والخدمات من موقع العميل القديم mg-visa.com، وحسّن الصياغة والتنظيم.
> 2. خذ أفكارًا من reachimmigration.com، وأضف ما يقدمه المنافسون من خدمات.
>
> 3. (رد العميل) خذ محتوى برامج الإقامة والجنسية عن طريق الاستثمار من gicg.net.
>
> **قرارات العميل (27 نوفمبر 2026):**
> - mg-visa.com موقعه القديم، ومسموح ننقل منه بحرية. بيانات التواصل والفروع ستكون للكيان الجديد، ويرسلها العميل.
> - **أسماء الدول** تظهر في الموقع بشكل طبيعي.
> - العميل **وكيل معتمد** لبرامج الجنسية عن طريق الاستثمار، والفئة 9 تبقى.
>
> - **طريقة العمل:** كل شيء يُبنى ويُعرض أولًا على الاستضافة التجريبية؛ العميل يراجع المحتوى بنفسه ويعدّل ما يريد قبل الرفع النهائي على الدومين.
>
> **طريقة النقل:** أُخذت الفكرة والخدمات وقوائم الدول، وأُعيدت صياغة النص ليكون أوضح ومتسقًا مع نبرة الموقع.

**مفتاح العلامات:** 🆕 جديد · ✏️ معدّل عن v2 · ✅ كما هو في v2 (النص الحالي في الريبو) · ❓ ينتظر رد العميل

---

## 1. هيكل الموقع الجديد

| # | الصفحة | المسار | الحالة |
|---|---|---|---|
| 1 | الرئيسية | `/` | ✏️ أقسام جديدة |
| 2 | خدمات التأشيرات | `/visa-services/` | ✏️ 9 فئات بدل 5، و9 خدمات بدل 4 |
| 3 | قالب تفاصيل التأشيرة | `/visa-services/<slug>/` | ✏️ 3 عناصر اختيارية جديدة + 9 صفحات جديدة (المجموع 18) |
| 4 | اعرف تأشيرتك (أداة التقييم المبدئي) | `/assessment/` | 🆕 |
| 5 | طلب الاستشارة | `/consultation/` | ✏️ حقول جديدة |
| 6 | من نحن | `/about/` | ✏️ محتوى كامل |
| 7 | تواصل معنا | `/contact/` | ✏️ ❓ البيانات |
| 8 | سياسة الخصوصية | `/privacy/` | 🆕 ❓ النص القانوني من العميل |
| 9 | الشروط والأحكام | `/terms/` | 🆕 ❓ النص القانوني من العميل |
| 10 | 404 | — | ✅ |

### روابط القائمة (Header) ✏️

| AR | EN |
|---|---|
| الرئيسية | Home |
| خدمات التأشيرات ▾ (قائمة منسدلة: «أنواع التأشيرات» مقسمة لأربع مجموعات + «خدماتنا») | Visa Services ▾ («Visa types» in four groups + «Our services») |
| اعرف تأشيرتك 🆕 | Find your visa |
| من نحن | About |
| تواصل معنا | Contact |
| زر: اطلب استشارة | Button: Request a consultation |
| WaysZ (رابط خارجي للموقع الرئيسي) | WaysZ (external link to the main site) |

### الفوتر ✏️

- **أعمدة:** روابط سريعة · أنواع التأشيرات · خدماتنا · تواصل معنا (الهاتف، البريد، واتساب، الفروع ❓) · السوشيال ميديا ❓.
- **سطر قانوني:** سياسة الخصوصية · الشروط والأحكام · «جزء من WaysZ».

---

## 2. فئات التأشيرات (9 بدل 5) ✏️

مقسمة إلى أربع مجموعات حسب غرض السفر، لأن الزائر يعرف «ليه مسافر» قبل ما يعرف اسم التأشيرة.

| المجموعة | # | الفئة AR | Category EN | slug | الحالة |
|---|---|---|---|---|---|
| زيارة · Visit | 1 | تأشيرة السياحة والزيارة القصيرة | Tourist & Short-Visit Visa | `tourist-visa` | ✏️ (كانت «الزيارة القصيرة») |
| | 2 | التأشيرة العائلية | Family Visa | `family-visa` | ✏️ (+ زيارة بدعوة) |
| | 3 | تأشيرة الأعمال والمؤتمرات | Business & Conference Visa | `business-visa` | ✅ |
| دراسة · Study | 4 | تأشيرة الدراسة | Student Visa | `student-visa` | ✏️ (+ دعم القبول) |
| عمل · Work | 5 | تأشيرة العمل | Work Visa | `work-visa` | 🆕 |
| | 6 | تأشيرة البحث عن عمل | Job Seeker Visa | `job-seeker-visa` | 🆕 |
| إقامة واستثمار · Residence & investment | 7 | الهجرة والإقامة الدائمة | Immigration & Permanent Residence | `immigration-residence-visa` | ✏️ (تركيز على الإقامة الدائمة) |
| | 8 | تأشيرة المستثمر ورواد الأعمال | Investor & Entrepreneur Visa | `investor-visa` | 🆕 |
| | 9 | الإقامة والجنسية عن طريق الاستثمار | Residency & Citizenship by Investment | `investment-residency-citizenship` | 🆕 (العميل وكيل معتمد) |

## 3. الخدمات (9 بدل 4) ✏️

| # | الخدمة AR | Service EN | slug | الحالة |
|---|---|---|---|---|
| 1 | استشارة التأشيرة وتقييم الملف | Visa Consultation & File Assessment | `visa-consultation` | ✏️ (+ تقييم الملف) |
| 2 | جاهزية المستندات | Document Readiness | `document-readiness` | ✅ |
| 3 | الإرشاد في الطلب والخطابات | Application & Cover Letter Guidance | `application-guidance` | ✏️ (+ خطاب الغرض وخط السير) |
| 4 | الاستعداد للموعد والمقابلة | Appointment & Interview Preparation | `appointment-preparation` | ✏️ (+ المقابلة صراحة) |
| 5 | مراجعة الرفض وإعادة التقديم | Refusal Review & Reapplication | `refusal-review` | 🆕 |
| 6 | المساعدة في حجز موعد التقديم | Appointment Booking Assistance | `appointment-booking` | 🆕 ❓ |
| 7 | حجوزات السفر وتأمين السفر للملف | Travel Bookings & Insurance for Your File | `travel-bookings` | 🆕 ❓ |
| 8 | الترجمة المعتمدة وتوثيق المستندات | Certified Translation & Attestation | `translation-attestation` | 🆕 ❓ |
| 9 | تأشيرات الشركات والوفود | Corporate & Delegation Visas | `corporate-visas` | 🆕 |

**خدمات اختيارية مقترحة ❓**

| الخدمة AR | Service EN | لماذا مقترحة |
|---|---|---|
| السيرة الذاتية والبحث عن عمل بالخارج | CV & Job Search Abroad | تكمّل فئتي العمل والبحث عن عمل؛ يقدمها كبار المنافسين |
| التحضير لاختبارات اللغة | Language Test Preparation | المنافسون الكبار يقدمونها؛ تحتاج شريكًا أو مدربين |
| خدمة كبار العملاء (استلام المستندات من المنزل، مستشار مخصص) | Premium / Concierge Service | تناسب عملاء الفئة A |
| التوجيه قبل السفر (السكن، أول أسبوع) | Pre-departure Orientation | يقدمها المنافسون بعد صدور التأشيرة |

> **ملاحظة «حجز المواعيد»:** خدمة 6 يقدمها الفريق للعميل في مركز التقديم؛ الموقع يعرض الخدمة ويوجّه لطلب الاستشارة (نظام حجز أونلاين مقترح لمرحلة لاحقة).

---

## 4. الصفحة الرئيسية ✏️

ترتيب الأقسام الجديد (الأرقام بين القوسين = أرقام v2):

| # | القسم | الحالة |
|---|---|---|
| 1.0 | Hero | ✅ (نص بديل اختياري) |
| 1.1 | كيف نساعدك في رحلة التأشيرة؟ | ✅ |
| 1.2–1.5 | الخدمات الأربع الأساسية | ✏️ أسماء محدّثة |
| 1.5b | خدمات إضافية | 🆕 |
| 1.5c | أنواع التأشيرات (4 مجموعات) | ✏️ |
| 1.5d | اعرف تأشيرتك (أداة التقييم) | 🆕 |
| 1.5e | لماذا WaysZ Visa؟ | 🆕 |
| 1.6 | خطوات المساعدة | ✅ |
| 1.6b | الوجهات التي نعمل عليها | 🆕 ❓ |
| 1.6c | آراء العملاء | 🆕 ❓ (الآراء من العميل) |
| — | الأسئلة الشائعة | ✏️ أسئلة جديدة |
| 1.8 | زر بدء الاستشارة | ✅ |
| 1.9 | جزء من WaysZ | ✅ |

### 1.0 Hero ✅
- **العنوان:** طريقك إلى التأشيرة يبدأ بخطوة صحيحة · *Your path to a visa starts with the right step*
- **بديل مقترح 🆕 (مستوحى من فكرة الموقع القديم):** آفاق جديدة لك ولعائلتك تبدأ بملف صحيح · *New horizons for you and your family start with the right file*
- **النص الفرعي:** كما هو في v2.
- **الأزرار:** ابدأ استشارتك · *Start your consultation* — تعرف على خدماتنا · *Explore our services*

### 1.2–1.5 الخدمات الأساسية ✏️
نفس الأربع خدمات ونفس الأوصاف في v2، مع تحديث أسماء الخدمات 1 و3 و4 حسب جدول الخدمات أعلاه.

### 1.5b خدمات إضافية 🆕
- **العنوان:** ولأن ملفك يحتاج أكثر من ذلك · *Because your file needs more than that*
- **النص:** خدمات تكمّل رحلتك من أول سؤال حتى يوم موعدك. · *Services that complete your journey, from your first question to your appointment day.*
- **البطاقات (اسم + سطر):**

| AR | EN |
|---|---|
| **مراجعة الرفض وإعادة التقديم** — نقرأ أسباب الرفض معك، ونبني ملفًا أقوى للتقديم التالي. | **Refusal review & reapplication** — We read the refusal reasons with you and build a stronger file for your next application. |
| **المساعدة في حجز الموعد** — نساعدك على حجز موعد التقديم في الجهة المعتمدة وفق المتاح. | **Appointment booking assistance** — We help you book your submission appointment with the authorized center, subject to availability. |
| **حجوزات وتأمين السفر** — حجوزات طيران وفندق وتأمين سفر تناسب متطلبات ملفك. | **Travel bookings & insurance** — Flight, hotel and travel insurance arranged to suit your file's requirements. |
| **الترجمة والتوثيق** — ترجمة معتمدة لمستنداتك وتوجيه في خطوات توثيقها. | **Translation & attestation** — Certified translation of your documents and guidance on attesting them. |
| **تأشيرات الشركات والوفود** — تنسيق ملفات تأشيرات فرق العمل والوفود في مكان واحد. | **Corporate & delegation visas** — Visa files for teams and delegations, coordinated in one place. |

### 1.5c أنواع التأشيرات ✏️
- **العنوان:** ما غرض رحلتك؟ · *What is your trip for?*
- **النص:** اختر غرض سفرك، ونوضح لك نوع التأشيرة الأقرب له ومتطلباته العامة. · *Choose why you are traveling, and we'll show you the visa type that fits it best and its general requirements.*
- **4 مجموعات** (زيارة · دراسة · عمل · إقامة واستثمار) والـ 9 فئات تحتها، كل بطاقة: الاسم + سطر الوصف المختصر (§7 أدناه) + رابط لصفحتها.
- **بطاقة أخيرة:** لست متأكدًا من نوع تأشيرتك؟ ← تذهب لأداة «اعرف تأشيرتك» بدل طلب الاستشارة مباشرة.

### 1.5d اعرف تأشيرتك 🆕
- **العنوان:** محتار تبدأ منين؟ · *Not sure where to start?* (صياغة EN بديلة: *Unsure where to begin?*)
- **النص:** أجب عن أسئلة قصيرة، ونرشح لك نوع التأشيرة الأقرب لحالتك والخدمات التي قد تحتاجها. النتيجة مبدئية، والاستشارة هي التي تحدد طريقك بدقة. · *Answer a few short questions and we'll suggest the visa type closest to your situation and the services you may need. The result is preliminary; your consultation sets your path precisely.*
- **زر:** ابدأ التقييم · *Start the assessment*

### 1.5e لماذا WaysZ Visa؟ 🆕
- **العنوان:** أكثر من تجهيز أوراق · *More than paperwork*
- **النص:** نرافقك بإرشاد واضح، وخطة تناسب حالتك، واهتمام بكل تفصيلة في ملفك. · *We stay with you through clear guidance, a plan that fits your case and attention to every detail of your file.*

| AR | EN |
|---|---|
| **إرشاد عن خبرة** — فريق يتابع تحديثات متطلبات السفارات، ويشرح لك المطلوب بلغة بسيطة. | **Experienced guidance** — A team that follows embassy requirement updates and explains what you need in plain language. |
| **خطة على مقاس حالتك** — لا قوائم جاهزة؛ نبني خطواتك ومستنداتك على غرض سفرك ووضعك أنت. | **A plan built around you** — No ready-made lists; your steps and documents are built on your purpose and your situation. |
| **وضوح كامل** — نوضح لك كل خطوة وكل التكاليف قبل أن تبدأ. | **Full transparency** — We explain every step and every cost before you start. |
| **وجهات متعددة** — من أوروبا وأمريكا الشمالية إلى أستراليا، وبرامج الإقامة والجنسية عن طريق الاستثمار بصفتنا وكيلًا معتمدًا. | **Many destinations** — From Europe and North America to Australia, plus residency and citizenship by investment programs as an authorized agent. |
| **خصوصية بياناتك** — نتعامل مع مستنداتك وبياناتك بسرية، ونوضح لك الطريقة الآمنة لمشاركتها. | **Your privacy** — Your documents and data are handled confidentially, and we show you the safe way to share them. |

### 1.6b الوجهات التي نعمل عليها 🆕
- **العنوان:** وجهات نرافقك إليها · *Destinations we guide you to*
- **النص:** من أوروبا إلى أمريكا الشمالية وأستراليا، نرافقك إلى وجهتك أيًّا كان غرض سفرك. · *From Europe to North America and Australia, we guide you to your destination, whatever your purpose.*
- **المحتوى:** أسماء الدول مجمّعة حسب المنطقة. كل اسم يفتح طلب الاستشارة والوجهة محددة مسبقًا (`?destination=`).
- **القائمة (من الموقع القديم + gicg.net):**

| المنطقة AR | Region EN | الدول AR | Countries EN |
|---|---|---|---|
| أوروبا ومنطقة شنغن | Europe & Schengen | ألمانيا، فرنسا، إسبانيا، إيطاليا، البرتغال، هولندا، بلجيكا، النمسا، السويد، سويسرا، اليونان، مالطا، المجر | Germany, France, Spain, Italy, Portugal, Netherlands, Belgium, Austria, Sweden, Switzerland, Greece, Malta, Hungary |
| أوروبا (خارج شنغن) | Europe (non-Schengen) | المملكة المتحدة، قبرص، تركيا | United Kingdom, Cyprus, Türkiye |
| أمريكا الشمالية | North America | الولايات المتحدة، كندا | United States, Canada |
| أستراليا ونيوزيلندا | Australia & New Zealand | أستراليا، نيوزيلندا | Australia, New Zealand |
| آسيا | Asia | ماليزيا | Malaysia |
| الكاريبي والمحيط الهادئ (الجنسية عن طريق الاستثمار) | Caribbean & Pacific (citizenship by investment) | أنتيغوا وباربودا، دومينيكا، غرينادا، سانت كيتس ونيفيس، سانت لوسيا، ناورو | Antigua and Barbuda, Dominica, Grenada, Saint Kitts and Nevis, Saint Lucia, Nauru |

- ❓ **تأكيد خفيف:** القائمة مأخوذة من الموقع القديم؛ يراجعها العميل ويعدّلها. دول أخرى ظهرت في قائمة عامة بالموقع القديم (أوكرانيا، روسيا، بولندا، سلوفاكيا، ليتوانيا، النرويج) يمكن إضافتها بسهولة.
- **صفحات منفصلة لكل دولة:** تظل خارج النطاق الآن (مقترح لمرحلة لاحقة).

### 1.6c آراء العملاء 🆕 ❓
- يُملأ بآراء عملاء يرسلها العميل (الاسم + سطر الرأي).
- **العنوان:** من تجارب عملائنا · *From our clients' experience*

### الأسئلة الشائعة ✏️ (أسئلة v2 + الجديد)

| AR | EN |
|---|---|
| **هل تتعاملون مع طلبات سبق رفضها؟** نعم. نراجع خطاب الرفض وملفك السابق، ونوضح لك نقاط التحسين قبل إعادة التقديم. | **Do you handle previously refused applications?** Yes. We review the refusal letter and your previous file, and show you what to improve before you reapply. |
| **هل تحجزون موعد التقديم بدلًا مني؟** نعم، نتولى حجز موعدك في الجهة المعتمدة ونختار معك أنسب موعد متاح. | **Can you book my submission appointment?** Yes, we book your appointment with the authorized center and pick the best available slot with you. |
| **هل تخدمون الشركات والوفود؟** نعم. ننسق ملفات تأشيرات فرق العمل والمشاركين في المعارض والمؤتمرات. | **Do you work with companies and delegations?** Yes. We coordinate visa files for business teams and for exhibition and conference participants. |
| **هل يمكنني إرسال جواز سفري أو مستنداتي عبر الموقع؟** لا. لا ترسل أي مستندات عبر النموذج؛ سيوضح لك المستشار الطريقة الآمنة لمشاركتها عند الحاجة. | **Can I send my passport or documents through the website?** No. Don't send any documents through the form; your consultant will explain the safe way to share them when needed. |

### 1.8 · 1.9 ✅ كما هي في v2.

> قسم 1.7 «الموافقة ليست مضمونة» اتشال.

---

## 5. صفحة خدمات التأشيرات ✏️

- **العنوان والنص التعريفي:** ✅ كما في v2.
- **2.1 عرض الخدمات:** 9 خدمات (جدول §3) بدل 4. الأربع الأساسية أولًا، ثم الخمس الجديدة.
- **2.2 فئات التأشيرات:** 9 فئات في 4 مجموعات (جدول §2) + بطاقة «لست متأكدًا…» ← أداة «اعرف تأشيرتك».
- **2.3 الوصف المختصر لكل فئة:** §7 أدناه.
- **2.4 زر طلب الاستشارة:** ✅ كما في v2.

---

## 6. قالب تفاصيل التأشيرة ✏️

العناصر الأساسية (7):
1 الاسم · 2 الوصف · 3 لمن تناسب؟ · 4 كيف نساعد؟ · 5 المستندات والمعلومات المطلوبة مبدئيًا + ملاحظة · 6 أسئلة شائعة · 7 زر بدء الاستشارة.

> ✏️ اتشال عنصر «ما لا نضمنه» وسطر التنبيه القانوني الثابت من كل الصفحات.

**عناصر اختيارية جديدة 🆕** (تظهر في الصفحات التي فيها محتوى لها):
- **2b «أنواع شائعة» · *Common types*:** قائمة قصيرة بالأنواع الفرعية للفئة (مثل: دخول لمرة واحدة / دخول متعدد).
- **2c «وجهات نعمل عليها» · *Destinations we work with*:** أسماء الدول المتاحة لهذه الفئة فقط، كل اسم يفتح طلب الاستشارة بالفئة والدولة معبّأتين. (القوائم في §7b.)
- **2d «مزايا شائعة» · *Common benefits*:** للفئات الاستثمارية؛ أهم مزايا البرامج.

**الصفحات (18):**
- ✅ بدون تغيير: `business-visa` · `document-readiness` (نصها الحالي في `src/content/visas/`).
- ✏️ تعديل جزئي: `tourist-visa` · `family-visa` · `student-visa` · `immigration-residence-visa` · `visa-consultation` · `application-guidance` · `appointment-preparation` (التعديلات في §8).
- 🆕 جديدة بالكامل: 4 فئات + 5 خدمات (النص الكامل في §9 و§10).

---

## 7. الوصف المختصر لكل فئة (§2.3 — بطاقات الرئيسية وصفحة الخدمات)

| الفئة | AR (+ تناسب) | EN (+ For) |
|---|---|---|
| السياحة والزيارة القصيرة ✏️ | للرحلات السياحية والزيارات القصيرة. نساعدك على توضيح غرض الزيارة وتنظيم مستنداتك المالية وما يثبت ارتباطك بالعودة. — تناسب: المسافرين في رحلات قصيرة المدة. | For holidays and short visits. We help you explain your purpose and organize your financial documents and proof of ties to home. — For: travelers on short trips. |
| العائلية ✏️ | لزيارة الأقارب بدعوة منهم أو الالتحاق بأفراد الأسرة بالخارج. نرشدك في إثبات صلة القرابة وتجهيز مستندات الداعي. — تناسب: من لديه أقارب أو زوج أو زوجة بالخارج. | To visit relatives on their invitation or join family members abroad. We guide you on proving the relationship and preparing the host's documents. — For: anyone with relatives or a spouse abroad. |
| الأعمال والمؤتمرات ✅ | كما في v2. | As in v2. |
| الدراسة ✏️ | للالتحاق بالجامعات والمعاهد وبرامج اللغة بالخارج. نساعدك على تنظيم مستندات القبول والتمويل وخطتك الدراسية. — تناسب: الطلاب المقبولين أو المتقدمين لبرامج دراسية. | To join universities, institutes and language programs abroad. We help you organize your admission and funding documents and your study plan. — For: admitted students and program applicants. |
| العمل 🆕 | لمن لديه عرض عمل من جهة بالخارج. نرشدك في مستندات صاحب العمل ومؤهلاتك وخطوات التقديم. — تناسب: أصحاب عروض العمل والمنقولين داخل شركاتهم. | For anyone with a job offer from an employer abroad. We guide you through the employer's documents, your qualifications and the application steps. — For: job-offer holders and intra-company transferees. |
| البحث عن عمل 🆕 | للمهنيين الذين يريدون دخول دولة للبحث عن عمل فيها. نساعدك على فهم الشروط العامة وتجهيز ملف مؤهلاتك وخطة بحثك. — تناسب: أصحاب المهارات والخبرات المطلوبة. | For professionals who want to enter a country to look for work there. We help you understand the general conditions and prepare your qualifications file and search plan. — For: skilled, experienced professionals. |
| الهجرة والإقامة الدائمة ✏️ | للاستقرار طويل المدى أو الإقامة الدائمة في دولة أخرى. نساعدك على فهم المسارات المتاحة لوضعك وتجهيز ملفك. — تناسب: الراغبين في الاستقرار بالخارج مع أسرهم. | For long-term settlement or permanent residence in another country. We help you understand the paths open to you and prepare your file. — For: those looking to settle abroad with their families. |
| المستثمر ورواد الأعمال 🆕 | لمن يريد الاستثمار في نشاط قائم أو تأسيس مشروع بالخارج. نرشدك في خطة العمل وإثبات الأموال والخبرة. — تناسب: المستثمرين وأصحاب الأعمال ورواد المشروعات الناشئة. | For those who want to invest in an existing business or start one abroad. We guide you on your business plan, proof of funds and experience. — For: investors, business owners and start-up founders. |
| الإقامة والجنسية عن طريق الاستثمار 🆕 | برامج تمنح الإقامة أو جنسية ثانية مقابل استثمار مؤهل. بصفتنا وكيلًا معتمدًا، نساعدك على مقارنة البرامج وتجهيز ملفك. — تناسب: الأفراد والعائلات الباحثين عن إقامة أو جنسية ثانية. | Programs that grant residency or a second citizenship in return for a qualifying investment. As an authorized agent, we help you compare programs and prepare your file. — For: individuals and families seeking residency or a second citizenship. |

---

## 7b. الوجهات لكل فئة (عنصر 2c) 🆕

> من قوائم الموقع القديم + gicg.net. يراجعها العميل (نفس التأكيد الخفيف في 1.6b). الأسماء EN تُكتب كما في عمود الدول في 1.6b.

| الفئة | الوجهات |
|---|---|
| السياحة والزيارة القصيرة | دول منطقة شنغن (ألمانيا، فرنسا، إسبانيا، إيطاليا، البرتغال، سويسرا…)، المملكة المتحدة، الولايات المتحدة، كندا |
| العائلية (زيارة بدعوة) | إسبانيا، فرنسا، ألمانيا، البرتغال، سويسرا، إيطاليا، الولايات المتحدة، كندا |
| الأعمال والمؤتمرات | دول منطقة شنغن، المملكة المتحدة، الولايات المتحدة، كندا ❓ (لم تظهر في الموقع القديم؛ اقتراح) |
| الدراسة | دول أوروبا، الولايات المتحدة، كندا، أستراليا، المملكة المتحدة، نيوزيلندا، ماليزيا |
| العمل | كندا، أستراليا، الولايات المتحدة، المملكة المتحدة، نيوزيلندا، ألمانيا، النمسا، السويد، فرنسا، بلجيكا، ماليزيا |
| البحث عن عمل | ألمانيا، النمسا، السويد، البرتغال، هولندا، بلجيكا |
| الهجرة والإقامة الدائمة | كندا، أستراليا، نيوزيلندا |
| المستثمر ورواد الأعمال | إسبانيا، كندا، أستراليا، الولايات المتحدة، المملكة المتحدة، نيوزيلندا، ألمانيا، النمسا، السويد، فرنسا، بلجيكا |
| الإقامة عن طريق الاستثمار | مالطا، البرتغال، قبرص، المجر، اليونان |
| الجنسية عن طريق الاستثمار | أنتيغوا وباربودا، دومينيكا، غرينادا، سانت كيتس ونيفيس، سانت لوسيا، تركيا، ناورو |

---

## 8. تعديلات الصفحات الموجودة ✏️

> النص الحالي لكل صفحة في `src/content/visas/<slug>.json` يبقى، وتُضاف أو تُستبدل البنود التالية فقط.

### `tourist-visa` — تأشيرة السياحة والزيارة القصيرة
- **الاسم:** تأشيرة السياحة والزيارة القصيرة · *Tourist & Short-Visit Visa*
- **2b أنواع شائعة 🆕:**
  - AR: دخول لمرة واحدة · دخول متعدد خلال فترة محددة · تأشيرة عبور (ترانزيت) للمرور بمطار أو دولة.
  - EN: Single entry · Multiple entry within a set period · Transit visa for passing through an airport or country.
- **سؤال شائع جديد:**
  - AR: **هل أحتاج حجز طيران وفندق قبل التقديم؟** كثير من الجهات تطلب ما يثبت خط سير الرحلة. نوضح لك ما يناسب ملفك، ويمكننا ترتيب حجوزات تناسب متطلبات الملف.
  - EN: **Do I need flight and hotel bookings before applying?** Many authorities ask for proof of your itinerary. We explain what suits your file and can arrange bookings that meet its requirements.

### `family-visa` — التأشيرة العائلية
- **2b أنواع شائعة 🆕:**
  - AR: زيارة عائلية بدعوة يتحمل فيها المسافر تكاليف رحلته · زيارة عائلية يتكفل فيها الداعي بالإقامة والتكاليف · لمّ الشمل أو الالتحاق بالزوج أو الزوجة.
  - EN: Family visit where the traveler covers the trip · Family visit where the host covers stay and costs · Family reunion or joining a spouse.
- **بند «كيف نساعد؟» جديد:**
  - AR: توضيح الفرق بين الزيارة التي تتحملها بنفسك والزيارة التي يتكفل بها الداعي، وما يُطلب في كل حالة من المسافر والداعي.
  - EN: Explaining the difference between a visit you fund yourself and one your host sponsors, and what each case usually requires from you and from your host.

### `student-visa` — تأشيرة الدراسة
- **بند «كيف نساعد؟» جديد:**
  - AR: الإرشاد في خطوات القبول: اختيار البرنامج المناسب، وتجهيز مستندات التقديم للجامعة أو المعهد. ❓
  - EN: Guidance on the admission steps: choosing a suitable program and preparing your application to the university or institute. ❓
- **سؤال شائع جديد:**
  - AR: **هل يمكن أن يرافقني أفراد أسرتي؟** بعض الدول تسمح بذلك بشروط ومستندات إضافية. نوضح لك ما يناسب وجهتك.
  - EN: **Can my family come with me?** Some countries allow it, with extra conditions and documents. We explain what applies to your destination.
- ❓ هل يقدم العميل دعم القبول الجامعي فعلًا، أم الفيزا فقط بعد القبول؟

### `immigration-residence-visa` — الهجرة والإقامة الدائمة
- **الاسم:** الهجرة والإقامة الدائمة · *Immigration & Permanent Residence*
- **الوصف (استبدال):**
  - AR: تفكر في الاستقرار طويل المدى أو الإقامة الدائمة في دولة أخرى مع أسرتك؟ نساعدك على فهم مسارات الهجرة المتاحة لوضعك، مثل مسارات الكفاءات والترشيح الإقليمي، وشروطها العامة، ونرشدك في تجهيز ملفك خطوة بخطوة.
  - EN: Thinking about settling long-term or gaining permanent residence in another country with your family? We help you understand the immigration paths open to you, such as skilled and regional-nomination routes, and their general conditions, and guide you as you prepare your file step by step.
- **2b أنواع شائعة 🆕:**
  - AR: مسارات الكفاءات المهنية (أنظمة النقاط) · مسارات الترشيح الإقليمي أو المحلي · الإقامة الدائمة عبر الأسرة.
  - EN: Skilled-worker paths (points-based systems) · Regional or provincial nomination paths · Family-based permanent residence.
- **ملاحظة:** العمل المؤقت والبحث عن عمل انتقلا لصفحتيهما الجديدتين؛ تُحذف إشارة «العمل» من الوصف القديم.

### `visa-consultation` — استشارة التأشيرة وتقييم الملف
- **الاسم:** استشارة التأشيرة وتقييم الملف · *Visa Consultation & File Assessment*
- **بند «كيف نساعد؟» جديد:**
  - AR: تقييم مبدئي لنقاط القوة والضعف في ملفك: الوضع الوظيفي والمالي وتاريخ السفر وأي رفض سابق.
  - EN: A preliminary assessment of your file's strengths and weak points: your job, finances, travel history and any previous refusal.

### `application-guidance` — الإرشاد في الطلب والخطابات
- **الاسم:** الإرشاد في الطلب والخطابات · *Application & Cover Letter Guidance*
- **بنود «كيف نساعد؟» جديدة:**
  - AR: الإرشاد في كتابة خطاب الغرض من السفر بما يتسق مع بيانات الطلب ومستنداتك.
  - EN: Guidance on writing your cover letter so it matches your application data and documents.
  - AR: إعداد خط سير رحلة واضح يتوافق مع حجوزاتك ومدة إقامتك.
  - EN: Preparing a clear itinerary that matches your bookings and length of stay.

### `appointment-preparation` — الاستعداد للموعد والمقابلة
- **الاسم:** الاستعداد للموعد والمقابلة · *Appointment & Interview Preparation*
- **بند «كيف نساعد؟» جديد:**
  - AR: جلسة مقابلة تجريبية على الأسئلة المتوقعة لنوع تأشيرتك، مع ملاحظات واضحة على إجاباتك.
  - EN: A mock interview on the questions usually asked for your visa type, with clear feedback on your answers.

---

## 9. صفحات الفئات الجديدة 🆕 (النص الكامل)

### 9.1 `work-visa` — تأشيرة العمل · Work Visa (kind: category)

**1 الاسم:** تأشيرة العمل · *Work Visa*

**2 الوصف**
- AR: حصلت على عرض عمل من جهة بالخارج؟ نرشدك في متطلبات تأشيرة العمل، ونساعدك على تنظيم مستندات صاحب العمل ومؤهلاتك وخبراتك، لتقدّم ملفًا واضحًا ومتسقًا.
- EN: Got a job offer from an employer abroad? We guide you through the work visa requirements and help you organize your employer's documents, your qualifications and your experience into a clear, consistent file.

**2b أنواع شائعة**
- AR: تأشيرات الكفاءات المهنية · تأشيرات العمل المؤقت المرتبطة بصاحب عمل محدد · النقل داخل الشركة إلى فرع بالخارج · العمل الموسمي.
- EN: Skilled-worker visas · Temporary work visas tied to one employer · Intra-company transfer to a branch abroad · Seasonal work.

**3 لمن تناسب؟**
- AR: أصحاب عروض العمل من جهات بالخارج. · الموظفون المنقولون إلى فرع أو شركة تابعة بالخارج. · أصحاب المهن والمهارات المطلوبة في سوق العمل بالخارج.
- EN: Holders of job offers from employers abroad. · Employees transferring to a branch or affiliate abroad. · Professionals in occupations and skills in demand abroad.

**4 كيف نساعد؟**
- AR:
  - التأكد من أن نوع تأشيرة العمل يناسب عرضك ووضعك المهني.
  - مراجعة عقد العمل أو خطاب العرض ومستندات الكفالة من صاحب العمل، والتأكد من وضوح بياناتها.
  - تنظيم شهاداتك وخبراتك ومستندات اللغة إن طُلبت، والإرشاد في معادلة المؤهلات عند الحاجة.
  - الإرشاد في تعبئة الطلب وتجهيزك للمقابلة إن كانت مطلوبة، مع ترجمة معتمدة لمستنداتك.
- EN:
  - Confirming that the work visa type fits your offer and professional situation.
  - Reviewing your contract or offer letter and the employer's sponsorship documents, and making sure their details are clear.
  - Organizing your certificates, experience and language documents if required, and guiding you on recognizing your qualifications when needed.
  - Guiding you through the application and preparing you for the interview if one is required, with certified translation of your documents.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: جواز سفر ساري المفعول. · عقد العمل أو خطاب عرض العمل. · مستندات الكفالة أو الموافقة من صاحب العمل، إن طُلبت. · الشهادات الدراسية والمهنية. · شهادات الخبرة. · ما يثبت مستوى اللغة، إن طُلب. · شهادة الحالة الجنائية والفحص الطبي، إن طُلبا.
- EN: A valid passport. · Your employment contract or job offer letter. · The employer's sponsorship or approval documents, if required. · Academic and professional certificates. · Experience letters. · Proof of language level, if required. · A police clearance certificate and medical exam, if required.
- **ملاحظة:** AR: القائمة استرشادية؛ وتختلف المستندات عادةً حسب الدولة ونوع الوظيفة وصاحب العمل. · EN: This list is a guide; required documents usually vary by country, job type and employer.

**6 أسئلة شائعة**
- AR: **هل تساعدونني في إيجاد وظيفة بالخارج؟** خدمتنا تبدأ بعد حصولك على عرض العمل؛ نرشدك في تجهيز ملف التأشيرة. وإن لم يكن لديك عرض بعد، قد تناسبك تأشيرة البحث عن عمل. — EN: **Can you help me find a job abroad?** Our service starts once you have a job offer; we guide you in preparing your visa file. If you don't have an offer yet, a job seeker visa may suit you.
- AR: **هل يلزم أن يكفلني صاحب العمل؟** في أغلب تأشيرات العمل نعم، وتختلف المستندات المطلوبة منه حسب الدولة. نوضح لك ما يخص حالتك. — EN: **Does my employer need to sponsor me?** For most work visas, yes, and the documents required from them vary by country. We explain what applies to you.
- AR: **هل يمكن أن تنضم أسرتي إليّ لاحقًا؟** بعض الدول تسمح بذلك بشروط. نشرح لك المسار المناسب ومستنداته. — EN: **Can my family join me later?** Some countries allow it under conditions. We explain the right path and its documents.

**7 زر بدء الاستشارة**
- AR: **عرض عملك يستحق ملفًا بنفس القوة** — ابدأ استشارتك الآن، ونرشدك في تجهيز ملف تأشيرة العمل خطوة بخطوة. — [ابدأ استشارتك]
- EN: **Your job offer deserves an equally strong file** — Start your consultation now, and we'll guide you through your work visa file step by step. — [Start your consultation]

---

### 9.2 `job-seeker-visa` — تأشيرة البحث عن عمل · Job Seeker Visa (kind: category)

**1 الاسم:** تأشيرة البحث عن عمل · *Job Seeker Visa*

**2 الوصف**
- AR: تريد دخول دولة للبحث عن عمل فيها بنفسك؟ بعض الدول تمنح أصحاب المؤهلات والخبرات المطلوبة تأشيرة مؤقتة لهذا الغرض. نساعدك على فهم شروطها العامة، وتجهيز ملف مؤهلاتك وخطة بحثك.
- EN: Want to enter a country to look for work there yourself? Some countries grant qualified, experienced professionals a temporary visa for this purpose. We help you understand its general conditions and prepare your qualifications file and job search plan.

**3 لمن تناسب؟**
- AR: أصحاب المؤهلات الجامعية أو المهنية والخبرات المطلوبة. · المهنيون الراغبون في استكشاف سوق العمل بالخارج قبل الحصول على عرض. · من يستوفي متطلبات اللغة أو يستعد لها.
- EN: Holders of in-demand university or vocational qualifications and experience. · Professionals who want to explore a job market abroad before getting an offer. · Those who meet, or are preparing for, the language requirements.

**4 كيف نساعد؟**
- AR:
  - تقييم مبدئي لمؤهلاتك وخبراتك مقابل الشروط العامة لهذا النوع من التأشيرات.
  - الإرشاد في معادلة شهاداتك أو الاعتراف بها إن طُلب ذلك.
  - مساعدتك على إعداد خطة بحث عن عمل واضحة وإثبات القدرة على تغطية فترة الإقامة.
  - شرح ما يحدث عند حصولك على وظيفة، وخطوات الانتقال إلى تأشيرة العمل.
- EN:
  - A preliminary assessment of your qualifications and experience against the general conditions of this visa type.
  - Guidance on having your certificates recognized, if required.
  - Helping you prepare a clear job search plan and proof that you can support yourself during your stay.
  - Explaining what happens once you find a job, and the steps to move to a work visa.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: جواز سفر ساري المفعول. · الشهادات الدراسية أو المهنية، ومعادلتها إن طُلبت. · سيرة ذاتية بالصيغة المعتادة في الدولة المقصودة. · شهادات الخبرة وخطابات التوصية. · ما يثبت القدرة المالية لتغطية فترة البحث. · ما يثبت مستوى اللغة، إن طُلب. · تأمين صحي، إن طُلب.
- EN: A valid passport. · Academic or vocational certificates, and their recognition if required. · A CV in the format usual in your destination. · Experience and reference letters. · Proof of funds to cover your search period. · Proof of language level, if required. · Health insurance, if required.
- **ملاحظة:** AR: القائمة استرشادية؛ وتختلف المتطلبات عادةً حسب الدولة ومجال عملك. · EN: This list is a guide; requirements usually vary by country and by your field.

**6 أسئلة شائعة**
- AR: **هل يسمح لي بالعمل بهذه التأشيرة؟** عادةً لا يُسمح بالعمل قبل الحصول على وظيفة وتغيير نوع الإقامة، والقواعد تختلف من دولة لأخرى. نوضح لك ما يخص وجهتك. — EN: **Can I work on this visa?** Usually not before you find a job and change your residence status, and the rules differ between countries. We explain what applies to your destination.
- AR: **ماذا يحدث إذا وجدت وظيفة؟** تنتقل عادةً إلى تأشيرة أو إقامة عمل وفق إجراءات الدولة. نرشدك في هذه الخطوة أيضًا. — EN: **What happens if I find a job?** You usually move to a work visa or permit under the country's procedures. We guide you through that step too.
- AR: **هل تناسبني هذه التأشيرة أم تأشيرة العمل؟** إن كان لديك عرض عمل فتأشيرة العمل غالبًا أنسب؛ وإن لم يكن، نقيّم معك فرص تأشيرة البحث عن عمل. — EN: **Is this visa or a work visa right for me?** If you have a job offer, a work visa usually fits better; if not, we assess your options for a job seeker visa with you.

**7 زر بدء الاستشارة**
- AR: **خطوتك المهنية القادمة قد تبدأ من هنا** — ابدأ استشارتك، ونقيّم معك فرصك ونرتب ملفك. — [ابدأ استشارتك]
- EN: **Your next career move may start here** — Start your consultation, and we'll assess your options and organize your file with you. — [Start your consultation]

---

### 9.3 `investor-visa` — تأشيرة المستثمر ورواد الأعمال · Investor & Entrepreneur Visa (kind: category)

**1 الاسم:** تأشيرة المستثمر ورواد الأعمال · *Investor & Entrepreneur Visa*

**2 الوصف**
- AR: تخطط للاستثمار في نشاط قائم أو لتأسيس مشروعك بالخارج؟ كثير من الدول تقدم تأشيرات لجذب المستثمرين ورواد الأعمال. نساعدك على فهم المسارات المتاحة وشروطها العامة، ونرشدك في تجهيز خطة العمل وإثبات الأموال والخبرة.
- EN: Planning to invest in an existing business or start your own abroad? Many countries offer visas to attract investors and entrepreneurs. We help you understand the available paths and their general conditions, and guide you in preparing your business plan, proof of funds and experience.

**2b أنواع شائعة**
- AR: تأشيرة رائد الأعمال لتأسيس مشروع جديد · تأشيرة المستثمر في نشاط قائم · تأشيرة المشروعات الناشئة المبتكرة، وغالبًا تحتاج دعم جهة حاضنة أو معتمدة.
- EN: Entrepreneur visa for starting a new business · Investor visa for an existing business · Innovative start-up visa, often requiring endorsement from an incubator or approved body.

**3 لمن تناسب؟**
- AR: المستثمرون الراغبون في ضخ رأس مال في نشاط بالخارج. · أصحاب الأعمال الذين يريدون التوسع أو تأسيس فرع بالخارج. · رواد المشروعات الناشئة أصحاب الأفكار المبتكرة.
- EN: Investors looking to put capital into a business abroad. · Business owners who want to expand or open a branch abroad. · Start-up founders with innovative ideas.

**4 كيف نساعد؟**
- AR:
  - جلسة لفهم أهدافك الاستثمارية وخبرتك، وشرح المسارات المحتملة ومتطلباتها العامة.
  - الإرشاد في هيكل خطة العمل وما يُطلب عادةً أن توضحه.
  - تنظيم مستندات إثبات الأموال ومصدرها، وخبرتك في إدارة الأعمال.
  - التنسيق مع الاستشارات القانونية والترجمة المعتمدة عند الحاجة، ومتابعة خطوات التقديم معك.
- EN:
  - A session to understand your investment goals and experience, and to explain possible paths and their general requirements.
  - Guidance on how to structure your business plan and what it usually needs to show.
  - Organizing your proof of funds and their source, and your business management experience.
  - Coordinating legal advice and certified translation when needed, and following the application steps with you.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: جواز سفر ساري المفعول. · خطة عمل. · ما يثبت الأموال ومصدرها. · القوائم المالية أو مستندات نشاطك التجاري الحالي. · ما يثبت خبرتك في إدارة الأعمال. · شهادة الحالة الجنائية والفحص الطبي، إن طُلبا. · ما يثبت مستوى اللغة، إن طُلب.
- EN: A valid passport. · A business plan. · Proof of funds and their source. · Financial statements or documents of your current business. · Proof of business management experience. · A police clearance certificate and medical exam, if required. · Proof of language level, if required.
- **ملاحظة:** AR: القائمة استرشادية؛ وتختلف متطلبات الاستثمار ومجالاته المقبولة عادةً حسب الدولة والبرنامج. · EN: This list is a guide; investment requirements and eligible sectors usually vary by country and program.

**6 أسئلة شائعة**
- AR: **ما الحد الأدنى للاستثمار المطلوب؟** يختلف من دولة لأخرى ومن برنامج لآخر، ويتغير من وقت لآخر. نوضح لك المتطلبات الحالية لوجهتك في الاستشارة. — EN: **What is the minimum investment?** It differs between countries and programs and changes over time. We explain your destination's current requirements in your consultation.
- AR: **هل تمنح هذه التأشيرات إقامة دائمة؟** بعضها قد يفتح طريقًا للتمديد أو الإقامة الدائمة بشروط. نشرح لك المسار المتوقع لكل برنامج. — EN: **Do these visas lead to permanent residence?** Some may open a path to extension or permanent residence under conditions. We explain the expected path for each program.
- AR: **هل تساعدونني في كتابة خطة العمل؟** نرشدك في هيكلها وما يجب أن توضحه، ويمكن التنسيق مع متخصصين لإعدادها. — EN: **Can you help me write the business plan?** We guide you on its structure and what it should show, and can coordinate with specialists to prepare it.

**7 زر بدء الاستشارة**
- AR: **مشروعك بالخارج يبدأ بخطة واضحة** — ابدأ استشارتك، ونرسم معك طريق تأشيرة المستثمر المناسب لك. — [ابدأ استشارتك]
- EN: **Your business abroad starts with a clear plan** — Start your consultation, and we'll map out the right investor visa path with you. — [Start your consultation]

---

### 9.4 `investment-residency-citizenship` — الإقامة والجنسية عن طريق الاستثمار · Residency & Citizenship by Investment (kind: category)

> المصدر: gicg.net (فكرة البرامج والدول وهيكل الصفحة). العميل وكيل معتمد لبرامج الجنسية.

**1 الاسم:** الإقامة والجنسية عن طريق الاستثمار · *Residency & Citizenship by Investment*

**2 الوصف**
- AR: برامج تتيح لك ولأسرتك الإقامة في دولة جديدة، أو الحصول على جنسية ثانية، مقابل استثمار مؤهل وفق شروط كل دولة. بصفتنا وكيلًا معتمدًا، نساعدك على مقارنة البرامج المناسبة لأهدافك، وفهم متطلباتها العامة، ونرافقك في تجهيز ملفك ومتابعته حتى صدور القرار.
- EN: Programs that let you and your family live in a new country, or obtain a second citizenship, in return for a qualifying investment under each country's rules. As an authorized agent, we help you compare the programs that fit your goals, understand their general requirements, and support you in preparing and following your file until a decision is made.

**2b أنواع شائعة**
- AR: **الجنسية عن طريق الاستثمار:** جنسية ثانية وجواز سفر للمستثمر وأسرته، وغالبًا دون اشتراط الانتقال للإقامة. · **الإقامة عن طريق الاستثمار:** إقامة طويلة أو دائمة للمستثمر وأسرته، وقد تفتح لاحقًا طريقًا للجنسية بشروط ومدد تحددها الدولة.
- EN: **Citizenship by investment:** a second citizenship and passport for the investor and their family, often without a requirement to relocate. · **Residency by investment:** long-term or permanent residence for the investor and their family, which may later open a path to citizenship under conditions and timeframes set by the country.
- **مسارات الاستثمار الشائعة (عامة):** AR: العقارات · المساهمة في صندوق حكومي أو تنموي · تأسيس نشاط تجاري أو المساهمة فيه · أدوات استثمارية يحددها البرنامج. — EN: Real estate · A contribution to a government or development fund · Starting or investing in a business · Other instruments set by the program.

**2c وجهات نعمل عليها**
- **الجنسية:** أنتيغوا وباربودا · دومينيكا · غرينادا · سانت كيتس ونيفيس · سانت لوسيا · تركيا · ناورو — *Antigua and Barbuda · Dominica · Grenada · Saint Kitts and Nevis · Saint Lucia · Türkiye · Nauru*
- **الإقامة:** مالطا · البرتغال · قبرص · المجر · اليونان — *Malta · Portugal · Cyprus · Hungary · Greece*

**2d مزايا شائعة**
- AR:
  - **أمان لأسرتك:** فرص أوسع في التعليم والرعاية الصحية، وإمكانية ضم أفراد الأسرة.
  - **حرية تنقل أوسع:** بعض الجوازات والإقامات تسهّل السفر إلى وجهات كثيرة دون تأشيرة مسبقة.
  - **استثمار له قيمة:** بعض المسارات تكون في أصول مثل العقارات، وفق شروط البرنامج.
  - **فرص للأعمال:** وجود قانوني يساعدك على توسيع أعمالك دوليًا.
  - **بديل للمستقبل:** خيار إقامة أو انتقال لك ولأسرتك حين تحتاجه.
- EN:
  - **Security for your family:** wider access to education and healthcare, and the option to include family members.
  - **Wider mobility:** some passports and residence permits make travel to many destinations easier without a prior visa.
  - **An investment with value:** some routes are in assets such as real estate, under the program's conditions.
  - **Business opportunities:** a legal presence that helps you grow your business internationally.
  - **A plan B for the future:** a residence or relocation option for you and your family when you need it.

**3 لمن تناسب؟**
- AR: الأفراد والعائلات الباحثون عن إقامة بديلة أو جنسية ثانية. · المستثمرون ورجال الأعمال الراغبون في حرية تنقل أوسع لأعمالهم. · من يخطط لمستقبل تعليمي أو معيشي مختلف لأسرته.
- EN: Individuals and families looking for an alternative residency or a second citizenship. · Investors and business people who want wider mobility for their business. · Those planning a different future of study or living for their family.

**4 كيف نساعد؟**
- AR:
  - تقييم مبدئي لأهدافك ووضع أسرتك، ومقارنة البرامج المتاحة من حيث المتطلبات العامة والمزايا والالتزامات.
  - شرح مسارات الاستثمار المتاحة في كل برنامج، والتنسيق مع المختصين القانونيين والماليين عند الحاجة.
  - قائمة مستندات مخصصة لك ولأفراد أسرتك، ومراجعة ما جهزته، وترجمته ترجمة معتمدة.
  - تقديم الملف ومتابعته مع الجهات المختصة بصفتنا وكيلًا معتمدًا للبرامج التي نعمل عليها، وإبقاؤك على اطلاع بكل خطوة.
- EN:
  - A preliminary assessment of your goals and your family's situation, and a comparison of available programs by general requirements, benefits and obligations.
  - Explaining each program's investment routes, and coordinating with legal and financial professionals when needed.
  - A document list tailored to you and your family, a review of what you've prepared, and certified translation.
  - Submitting and following up your file with the competent authorities as an authorized agent for the programs we work on, and keeping you informed at every step.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: جوازات سفر سارية لك ولأفراد أسرتك. · شهادات الميلاد والزواج. · ما يثبت مصدر الأموال. · شهادة الحالة الجنائية. · الفحص الطبي، إن طُلب. · تأمين صحي، إن طُلب. · مستندات الاستثمار المختار حسب البرنامج.
- EN: Valid passports for you and your family members. · Birth and marriage certificates. · Proof of source of funds. · A police clearance certificate. · A medical exam, if required. · Health insurance, if required. · Documents for the chosen investment, depending on the program.
- **ملاحظة:** AR: القائمة استرشادية؛ ولكل برنامج متطلبات تحقق خاصة به وقد تتغير دون إشعار. · EN: This list is a guide; each program has its own due-diligence requirements, which may change without notice.

**6 أسئلة شائعة**
- AR: **ما الفرق بين الإقامة والجنسية عن طريق الاستثمار؟** الإقامة تمنحك حق العيش في الدولة دون جنسيتها، وقد تفتح طريقًا للجنسية لاحقًا بشروط. أما الجنسية فتمنحك جوازها وحقوق مواطنيها. — EN: **What's the difference between residency and citizenship by investment?** Residency lets you live in the country without its citizenship and may later open a path to it under conditions. Citizenship gives you its passport and its citizens' rights.
- AR: **هل يجب أن أنتقل للعيش في الدولة؟** أغلب برامج الجنسية لا تشترط الانتقال، أما برامج الإقامة فقد تشترط حدًا أدنى من التواجد. نوضح لك شروط كل برنامج. — EN: **Do I have to move to the country?** Most citizenship programs don't require relocation; residency programs may require a minimum stay. We explain each program's conditions.
- AR: **هل يمكن أن تشمل أسرتي؟** أغلب البرامج تسمح بضم الزوج أو الزوجة والأبناء، وأحيانًا الوالدين، بشروط تختلف من برنامج لآخر. — EN: **Can my family be included?** Most programs allow a spouse and children, and sometimes parents, under conditions that differ by program.
- AR: **لماذا يلزم التقديم عبر وكيل معتمد؟** كثير من برامج الجنسية لا تقبل الطلبات إلا عبر وكلاء مرخصين من الدولة. نعمل على هذه البرامج بصفتنا وكيلًا معتمدًا. — EN: **Why do I need an authorized agent?** Many citizenship programs only accept applications through government-licensed agents. We work on these programs as an authorized agent.
- AR: **كم تستغرق الإجراءات؟** تختلف حسب البرنامج وإجراءات التحقق وسرعة تجهيز المستندات، ونعطيك تصورًا واضحًا للمدة المتوقعة في الاستشارة. — EN: **How long does it take?** It depends on the program, its checks and how quickly your documents are ready, and we give you a clear idea of the expected timeline in your consultation.

**7 زر بدء الاستشارة**
- AR: **قرار بهذا الحجم يستحق مقارنة هادئة** — ابدأ استشارتك، ونقارن معك البرامج المناسبة لك ولأسرتك. — [ابدأ استشارتك]
- EN: **A decision this big deserves a calm comparison** — Start your consultation, and we'll compare the right programs for you and your family. — [Start your consultation]

❓ **يرسلها العميل (اختياري):** أسماء البرامج المرخص فيها بالضبط (لعرض «وكيل معتمد لدى…» مع رقم الترخيص إن أمكن) · كتيبات البرامج PDF إن أراد زر «حمّل كتيب البرنامج».

---

## 10. صفحات الخدمات الجديدة 🆕 (النص الكامل)

### 10.1 `refusal-review` — مراجعة الرفض وإعادة التقديم · Refusal Review & Reapplication (kind: service)

**1 الاسم:** مراجعة الرفض وإعادة التقديم · *Refusal Review & Reapplication*

**2 الوصف**
- AR: رُفض طلبك؟ الرفض لا يعني دائمًا نهاية الطريق؛ كثيرًا ما يعود لنقص في مستند، أو عدم اتساق في البيانات، أو عدم وضوح غرض السفر. نراجع معك خطاب الرفض وملفك السابق، ونحدد نقاط الضعف، ونساعدك على بناء ملف أقوى قبل إعادة التقديم.
- EN: Was your application refused? A refusal isn't always the end of the road; it often comes down to a missing document, inconsistent details or an unclear travel purpose. We review the refusal letter and your previous file with you, pinpoint the weak points and help you build a stronger file before you reapply.

**3 لمن تناسب؟**
- AR: من رُفض طلب تأشيرته مؤخرًا ويريد فهم الأسباب. · من يخطط لإعادة التقديم على نفس الوجهة أو وجهة أخرى. · من لديه أكثر من رفض سابق ويحتاج مراجعة شاملة.
- EN: Anyone recently refused who wants to understand why. · Those planning to reapply to the same or another destination. · Applicants with more than one previous refusal who need a full review.

**4 كيف نساعد؟**
- AR:
  - قراءة خطاب الرفض وشرح أسبابه بلغة بسيطة.
  - مراجعة ملفك السابق كاملًا وتحديد الفجوات والتعارضات.
  - خطة واضحة لتقوية الملف: المستندات الإضافية، وخطاب الغرض، وتوقيت إعادة التقديم.
  - توضيح الخيارات المتاحة، مثل إعادة التقديم أو طلب إعادة النظر حيث تسمح الجهة بذلك.
- EN:
  - Reading your refusal letter and explaining its reasons in plain language.
  - Reviewing your whole previous file and identifying gaps and inconsistencies.
  - A clear plan to strengthen the file: extra documents, your cover letter and the timing of your reapplication.
  - Explaining your options, such as reapplying or requesting a review where the authority allows it.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: خطاب الرفض. · نسخة من طلبك السابق. · المستندات التي قدمتها سابقًا. · أي مراسلات مع السفارة أو مركز التقديم.
- EN: The refusal letter. · A copy of your previous application. · The documents you submitted. · Any correspondence with the embassy or application center.
- **ملاحظة:** AR: لا ترسل هذه المستندات عبر الموقع؛ سيوضح لك المستشار الطريقة الآمنة لمشاركتها. · EN: Don't send these documents through the website; your consultant will explain the safe way to share them.

**6 أسئلة شائعة**
- AR: **هل الرفض السابق يقلل فرصي دائمًا؟** ليس بالضرورة؛ المهم أن تعالج أسباب الرفض بوضوح في طلبك الجديد. — EN: **Does a previous refusal always hurt my chances?** Not necessarily; what matters is clearly addressing the refusal reasons in your new application.
- AR: **متى يمكنني إعادة التقديم؟** يختلف حسب الدولة وسبب الرفض. ننصحك بالتوقيت المناسب بعد معالجة نقاط الضعف. — EN: **When can I reapply?** It depends on the country and the reason. We advise on the right timing once the weak points are fixed.
- AR: **هل يجب أن أذكر الرفض السابق في طلبي الجديد؟** غالبًا نعم؛ الإفصاح الصحيح جزء أساسي من ملف متسق وصادق. — EN: **Should I mention the previous refusal in my new application?** Usually yes; accurate disclosure is a key part of a consistent, honest file.

**7 زر بدء الاستشارة**
- AR: **الرفض بداية لملف أوضح** — ابدأ استشارتك، ونراجع معك أسباب الرفض ونرتب خطوتك التالية. — [ابدأ استشارتك]
- EN: **A refusal can start a clearer file** — Start your consultation, and we'll review the refusal with you and plan your next step. — [Start your consultation]

---

### 10.2 `appointment-booking` — المساعدة في حجز موعد التقديم · Appointment Booking Assistance (kind: service) ❓

**1 الاسم:** المساعدة في حجز موعد التقديم · *Appointment Booking Assistance*

**2 الوصف**
- AR: حجز موعد التقديم أو أخذ البصمات خطوة أساسية، وقد تكون مرهقة في مواسم الذروة. نساعدك على إنشاء حسابك وحجز موعدك في الجهة المعتمدة وفق المواعيد المتاحة، ونرتب معك المستندات المطلوبة ليوم الموعد.
- EN: Booking your submission or biometrics appointment is an essential step, and it can be stressful in peak seasons. We help you set up your account and book your appointment with the authorized center based on available slots, and we organize the documents you need for the day with you.

**3 لمن تناسب؟**
- AR: من يتقدم لأول مرة ولا يعرف خطوات الحجز. · من يحتاج موعدًا مرتبطًا بتاريخ سفر أو فعالية. · العائلات والمجموعات التي تحتاج مواعيد متقاربة.
- EN: First-time applicants unsure of the booking steps. · Travelers who need an appointment that fits a trip or event date. · Families and groups who need appointments close together.

**4 كيف نساعد؟**
- AR:
  - تحديد الجهة الصحيحة للتقديم حسب وجهتك ونوع تأشيرتك ومكان إقامتك.
  - المساعدة في إنشاء الحساب وتعبئة بيانات الحجز بدقة.
  - متابعة المواعيد المتاحة وحجز الأنسب لخطتك.
  - قائمة بما تحمله يوم الموعد، وما يحدث خلاله.
- EN:
  - Identifying the right center for your destination, visa type and place of residence.
  - Helping you create the account and fill in the booking details accurately.
  - Watching available slots and booking the one that best fits your plan.
  - A checklist of what to bring on the day, and what happens during the appointment.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: بيانات جواز السفر. · نوع التأشيرة والوجهة. · تواريخ السفر المتوقعة. · بيانات التواصل.
- EN: Your passport details. · Your visa type and destination. · Your expected travel dates. · Your contact details.
- **ملاحظة:** AR: المطلوب للحجز يختلف حسب الجهة. · EN: What's needed to book differs by center.

**6 أسئلة شائعة**
- AR: **هل يمكنكم مساعدتي في موعد قريب؟** نتابع المواعيد المتاحة باستمرار، ونحجز لك أقرب موعد يناسب خطتك. — EN: **Can you help me get an early appointment?** We keep watching available slots and book the earliest one that fits your plan.
- AR: **هل يجب أن أحضر الموعد بنفسي؟** في أغلب الحالات نعم، لأخذ البصمات والصورة. نوضح لك ما يخص حالتك. — EN: **Do I need to attend in person?** In most cases yes, for fingerprints and a photo. We explain what applies to you.
- AR: **متى أحجز الموعد؟** بعد أن يقترب ملفك من الاكتمال، ومبكرًا قدر الإمكان في مواسم الذروة. — EN: **When should I book?** Once your file is nearly complete, and as early as possible in peak seasons.

**7 زر بدء الاستشارة**
- AR: **موعدك في وقته، وملفك جاهز له** — اطلب الخدمة، ونرتب معك موعدك ومستنداته. — [اطلب استشارة]
- EN: **Your appointment on time, your file ready for it** — Request the service, and we'll arrange your appointment and its documents with you. — [Request a consultation]

> ❓ هل يقدم العميل هذه الخدمة فعلًا؟ (الموقع القديم يذكر تجهيز الملف والتقديم في مراكز التقديم.)

---

### 10.3 `travel-bookings` — حجوزات السفر وتأمين السفر للملف · Travel Bookings & Insurance for Your File (kind: service) ❓

**1 الاسم:** حجوزات السفر وتأمين السفر للملف · *Travel Bookings & Insurance for Your File*

**2 الوصف**
- AR: كثير من الجهات تطلب ما يثبت خط سير رحلتك وإقامتك وتأمينك الطبي خلال السفر. نرتب لك حجوزات طيران وفندق وتأمين سفر تناسب متطلبات ملفك ومدة رحلتك، لتكون كل مستنداتك متسقة مع بعضها.
- EN: Many authorities ask for proof of your itinerary, your accommodation and your travel medical insurance. We arrange flight, hotel and travel insurance bookings that suit your file's requirements and the length of your trip, so all your documents line up.

**3 لمن تناسب؟**
- AR: المتقدمون لتأشيرات السياحة والزيارة والأعمال. · من يحتاج حجوزات مرنة قبل صدور التأشيرة. · المسافرون الذين يحتاجون تأمين سفر يطابق متطلبات الجهة.
- EN: Applicants for tourist, visit and business visas. · Travelers who need flexible bookings before their visa is issued. · Travelers who need insurance that meets the authority's requirements.

**4 كيف نساعد؟**
- AR:
  - توضيح نوع الحجز والتأمين الذي يطلبه ملفك.
  - ترتيب حجز طيران وفندق يطابق خط السير ومدة الإقامة، مع خيارات قابلة للتعديل حيث أمكن.
  - ترتيب تأمين سفر طبي يغطي مدة الرحلة وفق المتطلبات المعتادة.
  - مراجعة اتساق الحجوزات مع بيانات الطلب وخطاب الغرض.
- EN:
  - Explaining which bookings and insurance your file needs.
  - Arranging flight and hotel bookings that match your itinerary and stay, with changeable options where possible.
  - Arranging travel medical insurance that covers your trip in line with usual requirements.
  - Checking that your bookings match your application data and cover letter.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: بيانات جواز السفر. · تواريخ السفر والوجهات. · عدد المسافرين.
- EN: Your passport details. · Your travel dates and destinations. · The number of travelers.
- **ملاحظة:** AR: متطلبات الحجز والتأمين تختلف حسب الجهة ونوع التأشيرة. · EN: Booking and insurance requirements differ by authority and visa type.

**6 أسئلة شائعة**
- AR: **هل أشتري تذكرة نهائية قبل صدور التأشيرة؟** غالبًا لا يُنصح بذلك. نوضح لك نوع الحجز المناسب في هذه المرحلة. — EN: **Should I buy a final ticket before my visa is issued?** It's usually not advised. We explain the right type of booking at this stage.
- AR: **هل يكفي أي تأمين سفر؟** لا؛ بعض الجهات تشترط حدًا أدنى للتغطية ومدة محددة. نرتب ما يطابق المتطلبات. — EN: **Will any travel insurance do?** No; some authorities require minimum cover and a set period. We arrange what matches the requirements.

**7 زر بدء الاستشارة**
- AR: **ملف متسق من أول حجز** — اطلب الخدمة، ونرتب حجوزاتك وتأمينك بما يناسب ملفك. — [اطلب استشارة]
- EN: **A consistent file from the first booking** — Request the service, and we'll arrange bookings and insurance that suit your file. — [Request a consultation]

> ❓ هل لدى العميل شركاء طيران وفنادق وتأمين؟ (الموقع القديم يعرض شركة حجوزات طيران ضمن شركائه.) لو لا، تُحذف الخدمة أو تتحول إلى «إرشاد» فقط.

---

### 10.4 `translation-attestation` — الترجمة المعتمدة وتوثيق المستندات · Certified Translation & Attestation (kind: service) ❓

**1 الاسم:** الترجمة المعتمدة وتوثيق المستندات · *Certified Translation & Attestation*

**2 الوصف**
- AR: كثير من المستندات تحتاج ترجمة معتمدة أو توثيقًا قبل تقديمها للسفارة. نترجم مستنداتك ترجمة معتمدة لدى الجهات الرسمية والسفارات، ونرشدك في خطوات توثيقها وتصديقها حسب ما تطلبه وجهتك.
- EN: Many documents need a certified translation or attestation before you submit them to an embassy. We provide certified translations accepted by official bodies and embassies, and guide you through the attestation and legalization steps your destination requires.

**3 لمن تناسب؟**
- AR: من يحتاج ترجمة شهادات أو عقود أو مستندات أسرية أو مالية. · من يحتاج توثيق مستنداته لدى الجهات المحلية أو السفارة. · الطلاب والمهنيون المتقدمون لمعادلة شهاداتهم.
- EN: Anyone who needs certificates, contracts or family or financial documents translated. · Those who need their documents attested with local authorities or an embassy. · Students and professionals applying to have their qualifications recognized.

**4 كيف نساعد؟**
- AR:
  - تحديد المستندات التي تحتاج ترجمة أو توثيقًا لملفك تحديدًا.
  - ترجمة معتمدة بلغات متعددة، مع مراجعة دقة الأسماء والتواريخ.
  - الإرشاد في ترتيب خطوات التوثيق والتصديق والجهات المختصة بها.
  - مطابقة المستندات المترجمة مع بيانات الطلب.
- EN:
  - Identifying which of your documents need translation or attestation.
  - Certified translation in several languages, with checks on names and dates.
  - Guidance on the order of attestation and legalization steps and the authorities involved.
  - Matching translated documents against your application data.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: المستندات المطلوب ترجمتها أو توثيقها. · اللغة المطلوبة. · الوجهة والجهة التي ستُقدَّم إليها.
- EN: The documents to translate or attest. · The target language. · The destination and the authority they're for.
- **ملاحظة:** AR: متطلبات التوثيق تختلف حسب الدولة ونوع المستند. لا ترسل المستندات عبر الموقع. · EN: Attestation requirements differ by country and document type. Don't send documents through the website.

**6 أسئلة شائعة**
- AR: **هل ترجمتكم معتمدة لدى السفارات؟** نعم، نقدم ترجمة معتمدة لدى الجهات الرسمية والسفارات. ❓ — EN: **Are your translations accepted by embassies?** Yes, we provide certified translations accepted by official bodies and embassies. ❓
- AR: **ما الفرق بين الترجمة المعتمدة والتوثيق؟** الترجمة تنقل المستند للغة المطلوبة، أما التوثيق فهو اعتماد الجهات الرسمية لصحة المستند أو توقيعه. — EN: **What's the difference between certified translation and attestation?** Translation renders the document into the required language; attestation is official confirmation that the document or its signature is genuine.

**7 زر بدء الاستشارة**
- AR: **مستنداتك بلغة السفارة** — اطلب الخدمة، ونحدد معك ما يحتاج ترجمة أو توثيقًا. — [اطلب استشارة]
- EN: **Your documents in the embassy's language** — Request the service, and we'll work out what needs translating or attesting. — [Request a consultation]

> ❓ تُنفّذ عبر فريق الترجمة في WaysZ (كما في v2) أم شريك آخر؟ وما اللغات المتاحة؟

---

### 10.5 `corporate-visas` — تأشيرات الشركات والوفود · Corporate & Delegation Visas (kind: service)

**1 الاسم:** تأشيرات الشركات والوفود · *Corporate & Delegation Visas*

**2 الوصف**
- AR: تسافر فرق عملك لاجتماعات أو مشروعات أو معارض ومؤتمرات بالخارج؟ ننسق ملفات تأشيرات موظفيك أو وفدك في مكان واحد: قوائم مستندات موحدة، ومتابعة لكل مسافر، وتواصل واحد مع مسؤول السفر لديك.
- EN: Does your team travel abroad for meetings, projects, exhibitions or conferences? We coordinate visa files for your staff or delegation in one place: unified document lists, follow-up for each traveler and a single point of contact with your travel coordinator.

**3 لمن تناسب؟**
- AR: الشركات التي يسافر موظفوها بانتظام. · الجهات المشاركة بوفود في المعارض والمؤتمرات الدولية. · منظمو الفعاليات الذين يستقبلون أو يرسلون وفودًا.
- EN: Companies whose staff travel regularly. · Organizations sending delegations to international exhibitions and conferences. · Event organizers sending or receiving delegations.

**4 كيف نساعد؟**
- AR:
  - تحديد نوع التأشيرة المناسب لكل مسافر حسب غرض الرحلة ووضعه.
  - قوائم مستندات موحدة لخطابات الشركة والدعوات وبيانات المسافرين.
  - تنسيق المواعيد والملفات لعدة مسافرين بالتوازي.
  - تقرير متابعة واضح لمسؤول السفر بحالة تجهيز كل ملف.
- EN:
  - Identifying the right visa type for each traveler by trip purpose and situation.
  - Unified document lists for company letters, invitations and traveler details.
  - Coordinating appointments and files for several travelers in parallel.
  - A clear progress report for your travel coordinator on each file's readiness.

**5 المستندات والمعلومات المطلوبة مبدئيًا**
- AR: قائمة المسافرين ووظائفهم. · خطاب الشركة الموفدة. · خطابات الدعوة من الجهة المضيفة أو منظم الفعالية. · ما يثبت التسجيل في الفعالية، إن وُجد. · مستندات الشركة الرسمية، إن طُلبت.
- EN: The list of travelers and their roles. · A letter from the sending company. · Invitation letters from the host or event organizer. · Proof of event registration, if any. · Official company documents, if required.
- **ملاحظة:** AR: يحتاج كل مسافر أيضًا مستنداته الشخصية حسب نوع تأشيرته. · EN: Each traveler also needs their own personal documents for their visa type.

**6 أسئلة شائعة**
- AR: **متى نبدأ تجهيز ملفات الوفد؟** كلما كان أبكر كان أفضل، خاصة قبل الفعاليات الكبرى ومواسم الذروة. — EN: **When should we start preparing the delegation's files?** The earlier the better, especially before major events and peak seasons.
- AR: **هل تتعاملون مع شخص واحد من الشركة؟** نعم، نتواصل مع منسق واحد، ونتابع مع كل مسافر ما يخص مستنداته الشخصية. — EN: **Do you work with one contact at the company?** Yes, we coordinate with one point of contact and follow up with each traveler on their personal documents.

**7 زر بدء الاستشارة**
- AR: **سفر فريقك بخطة واحدة واضحة** — تواصل معنا، ونرتب ملفات تأشيرات فريقك أو وفدك. — [اطلب استشارة]
- EN: **Your team's travel, on one clear plan** — Contact us, and we'll organize your team's or delegation's visa files. — [Request a consultation]

---

## 11. اعرف تأشيرتك — أداة التقييم المبدئي 🆕 (`/assessment/`)

**الفكرة:** أسئلة قصيرة (خطوة في كل شاشة) ترشّح **نوع التأشيرة والخدمات والوجهات المتاحة لها** ، وتعمل على الواجهة (بدون backend)، والنتيجة تفتح طلب الاستشارة والحقول معبّأة مسبقًا.

- **العنوان:** اعرف تأشيرتك المناسبة · *Find the right visa for you*
- **النص:** أسئلة قصيرة لا تستغرق دقيقة، ونرشح لك نوع التأشيرة الأقرب لحالتك والخدمات التي قد تحتاجها. · *A few short questions, under a minute, and we'll suggest the visa type closest to your situation, its destinations and the services you may need.*
- **زر البدء:** ابدأ · *Start* — **رجوع:** السؤال السابق · *Previous question* — **إعادة:** ابدأ من جديد · *Start over*

| # | السؤال AR | Question EN | الاختيارات AR / EN |
|---|---|---|---|
| 1 | ما الغرض الأساسي من سفرك؟ | What is the main purpose of your trip? | سياحة أو زيارة قصيرة / Tourism or a short visit · زيارة الأسرة أو الالتحاق بها / Visiting or joining family · عمل أو مؤتمر أو معرض / Business, conference or exhibition · الدراسة / Study · وظيفة لديّ عرض بها / A job I have an offer for · البحث عن عمل / Looking for work · الاستقرار أو الإقامة الدائمة / Settling or permanent residence · الاستثمار أو تأسيس مشروع / Investing or starting a business · إقامة أو جنسية عن طريق الاستثمار / Residency or citizenship by investment |
| 1b | (فقط إن اختار «إقامة أو جنسية عن طريق الاستثمار») ما الذي تبحث عنه؟ | (Only for «residency or citizenship by investment») What are you looking for? | إقامة / Residency · جنسية ثانية / Second citizenship · لست متأكدًا / I'm not sure |
| 1c | هل لديك وجهة مفضلة؟ | Do you have a preferred destination? | قائمة الدول المتاحة للفئة (§7b) / The category's countries (§7b) · ليس بعد / Not yet |
| 2 | هل لديك ما يدعم غرضك؟ (يتغير حسب السؤال 1: قبول دراسي، عرض عمل، دعوة…) | Do you have something that supports your purpose? (changes with Q1: admission, job offer, invitation…) | نعم / Yes · ليس بعد / Not yet · لست متأكدًا / I'm not sure |
| 3 | هل سبق رفض طلب تأشيرة لك؟ | Have you ever been refused a visa? | نعم / Yes · لا / No |
| 4 | متى تخطط للسفر؟ | When are you planning to travel? | خلال شهر / Within a month · خلال 1–3 أشهر / In 1–3 months · بعد أكثر من 3 أشهر / In more than 3 months · لم أحدد بعد / Not decided yet |
| 5 | هل تسافر وحدك؟ | Are you traveling alone? | وحدي / Alone · مع أسرتي / With my family · ضمن فريق عمل أو وفد / With a work team or delegation |

**النتيجة:**
- **العنوان:** بناءً على إجاباتك، قد يناسبك: · *Based on your answers, this may suit you:*
- **بطاقة الفئة المرشحة** (من السؤال 1، و1b للاستثمار) + رابط صفحتها.
- **الوجهات المتاحة لهذه الفئة** (أسماء من §7b)، والوجهة المختارة في 1c مميزة.
- **خدمات مقترحة** (قواعد بسيطة):
  - السؤال 3 = نعم ← مراجعة الرفض وإعادة التقديم.
  - السؤال 4 = خلال شهر ← المساعدة في حجز موعد التقديم.
  - السؤال 5 = فريق أو وفد ← تأشيرات الشركات والوفود.
  - السؤال 2 = ليس بعد (مع عرض عمل) ← اقتراح تأشيرة البحث عن عمل كبديل.
  - دائمًا ← استشارة التأشيرة وتقييم الملف.
- **سطر تحت النتيجة:** AR: هذا ترشيح مبدئي من إجاباتك، ونحدد معك الطريق بالتفصيل في الاستشارة. · EN: *This is an initial suggestion based on your answers; we'll map out the details with you in your consultation.*
- **زر:** أكمل طلب الاستشارة · *Continue to your consultation request* (يفتح `/consultation/` والفئة والإجابات معبّأة).
- لا يُرسَل أي شيء من الأداة؛ الإرسال يحدث فقط من نموذج الاستشارة.

---

## 12. طلب الاستشارة ✏️

- **العنوان والنص:** ✅ كما في v2.

| # | الحقل AR | Field EN | النوع | إلزامي | الحالة |
|---|---|---|---|---|---|
| — | الاسم بالكامل | Full name | نص | ● | ✅ |
| — | رقم الهاتف | Phone number | رقم | ● | ✅ |
| — | البريد الإلكتروني | Email | بريد | — | ✅ |
| 4.1b | بلد الإقامة الحالي | Country of residence | قائمة | ● | 🆕 (يحدد جهة التقديم) |
| 4.2 | الدولة المقصودة | Destination country | قائمة | ● | ✅ |
| 4.3 | نوع التأشيرة | Visa type | قائمة: الفئات التسع + لست متأكدًا / the nine categories + I'm not sure | ● | ✏️ |
| 4.3b | الخدمات التي تحتاجها | Services you need | اختيار متعدد: الخدمات التسع | — | 🆕 |
| 4.4 | الغرض من السفر | Purpose of travel | نص قصير | ● | ✅ |
| 4.4b | هل سبق رفض طلب تأشيرة لك؟ | Have you been refused a visa before? | نعم / لا | — | 🆕 |
| 4.4c | عدد المسافرين | Number of travelers | رقم (افتراضي 1) | — | 🆕 |
| 4.5 | موعد السفر المتوقع | Expected travel date | شهر / تاريخ | — | ✅ |
| 4.6 | وسيلة التواصل المفضلة | Preferred contact method | مكالمة / واتساب / بريد | ● | ✅ |
| 4.7 | وصف الاستفسار | Describe your inquiry | نص طويل | — | ✅ |
| 4.8 | رسالة تنبيه بعدم إرسال المستندات | Do-not-send-documents warning | ثابت | — | ✅ |

- **الحقل 4.1b:** AR: بلد الإقامة الحالي — اختر الدولة التي تقيم فيها الآن · EN: *Country of residence — Choose the country you live in now*
- **الحقل 4.4b:** AR: نساعدك في الحالتين؛ معرفة ذلك تساعدنا على تجهيز استشارتك. · EN: *We help either way; knowing this helps us prepare your consultation.*
- **التعبئة المسبقة:** النموذج يقبل `?type=` و`?service=` و`?destination=` من صفحات التأشيرات وأداة التقييم وقسم الوجهات.
- ❓ **فرع مفضل:** حقل «الفرع المفضل» يُضاف عند وصول قائمة الفروع.

---

## 13. من نحن ✏️ (`/about/`)

**العنوان:** من نحن · *About us*

**المقدمة**
- AR: WaysZ Visa منصة متخصصة في استشارات التأشيرات والإرشاد في إجراءاتها، وجزء من WaysZ. نرافق كل من يخطط للسفر بغرض السياحة أو الدراسة أو العمل أو الإقامة أو الاستثمار، من فهم المتطلبات حتى الاستعداد ليوم الموعد، بخطة تناسب حالته وبوضوح كامل في كل خطوة.
- EN: WaysZ Visa is a platform specialized in visa consultation and guidance through visa procedures, and part of WaysZ. We support anyone planning to travel for tourism, study, work, residence or investment, from understanding the requirements to getting ready for appointment day, with a plan that fits their case and full clarity at every step.

**رؤيتنا · Our vision** 🆕
- AR: عالم يعبر فيه كل مسافر الحدود بثقة، ويرى فيها فرصة لا عائقًا، ويبدأ رحلته وهو يعرف طريقه.
- EN: A world where every traveler crosses borders with confidence, sees opportunity in them rather than obstacles, and starts the journey knowing the way.

**رسالتنا · Our mission** 🆕
- AR: أن نكون شريكًا موثوقًا يجعل إجراءات التأشيرة أوضح وأسهل، ونبني مع عملائنا علاقة طويلة قائمة على الثقة لا على معاملة واحدة.
- EN: To be a trusted partner who makes visa procedures clearer and easier, and to build long relationships with our clients based on trust, not a single transaction.

**قيمنا · Our values** 🆕
| AR | EN |
|---|---|
| **الشفافية** — نوضح لك كل خطوة وكل تكلفة من البداية. | **Transparency** — We explain every step and every cost from the start. |
| **الدقة** — كل مستند وكل تاريخ في ملفك يُراجَع بعناية. | **Accuracy** — Every document and date in your file is checked with care. |
| **الخصوصية** — بياناتك ومستنداتك أمانة. | **Privacy** — Your data and documents are held in trust. |
| **مواكبة التحديثات** — نتابع تغيّر المتطلبات والسياسات باستمرار. | **Staying current** — We keep track of changing requirements and policies. |
| **الاحترافية** — تعامل محترم وواضح في كل تواصل. | **Professionalism** — Respectful, clear communication every time. |

**كيف نعمل · How we work** — نفس خطوات المساعدة الأربع في الرئيسية (1.6).

**WaysZ و WaysZ Visa** — ✅ نص §4.4 من v2 (فقرة واحدة + رابط للموقع الرئيسي).

**الأرقام والشهادات** ❓ — عدّادات (سنوات الخبرة، عدد الملفات، الفروع…) وشهادات (مثل ISO) وتراخيص الوكالة، تُملأ بأرقام العميل.

**زر:** ابدأ استشارتك · *Start your consultation*

---

## 14. تواصل معنا ✏️ ❓ (`/contact/`)

- **العنوان والنص:** كما في v2.
- **بيانات التواصل:** الهاتف، الخط الساخن (إن وُجد)، واتساب، البريد، العناوين، مواعيد العمل — **كلها في `src/lib/site.ts`، وتأتي من العميل للكيان الجديد.**
- **الفروع** ❓: بطاقة لكل فرع (الاسم، العنوان، رابط الخريطة، مواعيد العمل) لو أكد العميل الفروع.
- **أزرار سريعة:** اتصل بنا · راسلنا على واتساب · أرسل بريدًا إلكترونيًا (نصوص الجزء 05 ✅).
- **بطاقة الاستشارة:** ✅.
- **السوشيال ميديا** ❓: الروابط الفعلية.

---

## 15. سياسة الخصوصية والشروط والأحكام 🆕 ❓

- **لماذا:** الموقع يجمع بيانات شخصية عبر النماذج، والمواقع المرجعية كلها فيها الصفحتان.
- **المحتوى:** نص قانوني من العميل أو محاميه. نجهز مسودة عامة يراجعها العميل.
- **مسودة نقاط (للمراجعة فقط):** ما البيانات التي نجمعها (نموذج الاستشارة) · لماذا (التواصل بخصوص الطلب فقط) · عدم طلب المستندات عبر الموقع · مدة الاحتفاظ · حق الحذف · التواصل بخصوص الخصوصية.

---

## 16. النصوص المشتركة (الجزء 05) ✅ + إضافات 🆕

| العنصر | AR | EN |
|---|---|---|
| زر الأداة | اعرف تأشيرتك | Find your visa |
| رابط «أنواع شائعة» | أنواع شائعة | Common types |
| مجموعات الفئات | زيارة · دراسة · عمل · إقامة واستثمار | Visit · Study · Work · Residence & investment |
| تنبيه الأداة | (§11) | (§11) |
| Validation جديد | يرجى اختيار بلد الإقامة | Please choose your country of residence |

---

## 17. مقترحات لمراحل لاحقة 🆕

- **الموقع الحالي** موقع ثابت بدون backend؛ النماذج ترسل لبريد أو خدمة يحددها العميل.
- **إضافات ممكنة لاحقًا:** صفحة لكل دولة · مدونة أو أخبار التأشيرات · نشرة بريدية · صفحة فعاليات · صفحة وظائف · قناة فيديو أو بودكاست · حجز مواعيد أونلاين · رفع مستندات · تتبع الطلبات · لوحة تحكم.

---

## 18. ❓ أسئلة للعميل (مرتبة بالأولوية)

**✅ تمت الإجابة (27 نوفمبر):** ملكية الموقع القديم (ملكه، والنقل منه مسموح) · أسماء الدول (مسموحة) · الجنسية عن طريق الاستثمار (وكيل معتمد، المصدر gicg.net).

1. **بيانات الكيان الجديد:** الاسم القانوني إن اختلف، الهاتف، واتساب، البريد، العناوين والفروع، مواعيد العمل، السوشيال ميديا، وبريد استقبال النماذج.
2. **مراجعة قائمة الوجهات** (§1.6b و§7b): حذف ما لم يعد يُخدم، وإضافة ما ينقص.
3. **تأكيد الخدمات الجديدة** — أي منها تقدمونه فعلًا: حجز موعد التقديم · حجوزات الطيران والفندق والتأمين (مع أي شركاء؟) · الترجمة والتوثيق (عبر فريق WaysZ؟ وما اللغات؟) · تأشيرات الشركات والوفود · مراجعة الرفض · دعم القبول الجامعي.
4. **برامج الاستثمار:** أسماء البرامج المرخص فيها بالضبط (ورقم الترخيص إن أمكن) · كتيبات PDF للبرامج إن أردتم زر التحميل.
5. **الخدمات الاختيارية:** السيرة الذاتية والبحث عن عمل · التحضير لاختبارات اللغة · خدمة كبار العملاء · التوجيه قبل السفر — نضيف أيًّا منها؟
6. **الاستشارة الأولى:** مجانية أم مدفوعة؟ (لتظهر في صياغة الأزرار.)
7. **الإثبات الاجتماعي:** آراء عملاء · أرقام (سنوات الخبرة، عدد الملفات، الفروع) · شعارات الشركاء · الشهادات والتراخيص.
8. **النصوص القانونية:** سياسة الخصوصية والشروط والأحكام (من محاميكم، أو نجهز مسودة للمراجعة).
9. **الشعار والألوان النهائية** + مراجعة المصطلحات الإنجليزية (معلّق من قبل).
