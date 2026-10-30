# Official course map - learn-business-cases-roi-with-phoebe ("Business Cases & ROI")

Internal build document. Never link it from an audience page. Built 2026-10-30.
Bucket biz, audience both (data and AI leaders who must get an investment signed, and the analyst
who builds the model). Two tracks, 10 sessions x 45 min: Leader b1-b4 (no code, worked on paper and
on read-only widgets) + Analyst a1-a6 (hands-on, browser widgets running the real engine). a6 is
the bench.

## The running case (constructed, labelled on every page and widget)

**Keelson Mutual**, the invented mid-size insurer from learn-data-strategy-with-phoebe. Maya Okafor
is its first chief data officer; Tom Reyes, the COO, is her sponsor. NEW here: **Ines Carvalho, the
CFO** (name grepped across every course on 2026-10-30: zero hits). In data strategy session 3 the
bench picked three bets: CDQ (claims data quality fixed at source, 260), FTR (fraud triage score at
first notice of loss, 340) and CFT (claims fast-track triage for simple claims, 360), 960 of an
1,100 envelope (thousands). Data strategy session 5 said "CFT's money waits until CDQ's intake record
is in use". Business Cases picks up there: Ines will release CFT's money only against a case her
team will sign.

Every Keelson number is constructed, in thousands, pre-tax and nominal. Pages say "constructed" for
every Keelson example and "your numbers will differ" for any learner exercise.

### CFT inputs (assets/bcr-live.js `BASE` and `RANGES`; low / BASE / high)

| Input | Low | Base | High | Note |
|---|---|---|---|---|
| Build cost, year 0 | 330 | 360 | 460 | skewed high on purpose: optimism bias |
| Run cost per year | 60 | 70 | 100 | model monitoring, retraining, vendor |
| Simple claims per year | 38,000 | 42,000 | 46,000 | claims eligible for fast-track |
| Share fast-tracked at steady state | 45% | 55% | 65% | |
| Saving per fast-tracked claim | 11 | 14 | 16 | handling cost avoided, currency units |
| Leakage per fast-tracked claim | 2.5 | 4 | 6 | dis-benefit: overpayment on claims no adjuster checked |
| Year-1 adoption | 25% | 50% | 75% | year 2 = (1 + year 1) / 2, year 3 on = 100% |
| Discount rate (Keelson's hurdle) | 7% | 9% | 11% | a constructed company hurdle, not a WACC estimate |
| Years of benefit | 4 | 5 | 6 | no terminal value: the model is retired or rebuilt |

Net cash in year t = claims x share x adoption(t) x (saving - leakage) / 1000 - run cost.
Sunk discovery already spent: 45. CDQ fix: 260. Simulation: 5,000 draws, seed 20261030, each input
from a triangular(low, base, high), years rounded to whole, inputs independent.

## Widget-printed lines (canon; quote ONLY these numbers, verbatim)

Python (materials/bcr_reference.py) and node (materials/run-ladder.js) agree on every value
(materials/compare-ladder.py, exit 0, planted 0.1% fault caught). Format: k = thousands, one decimal.

**Base case cash flows:** year 0 -360.0k · year 1 +45.5k · year 2 +103.3k · years 3-5 +161.0k each.
Adoption 50.0% / 75.0% / 100.0%; claims fast-tracked 11,550 / 17,325 / 23,100.
**Base case:** NPV +111.7k at 9.0% · IRR 18.4% · payback 3.3 years · discounted payback 3.9 years ·
simple ROI (undiscounted) 75.5%.
**Incremental traps (a1):** add the 45k sunk discovery: NPV +66.7k. Charge the 260k CDQ fix: NPV
-148.3k. Both: NPV -193.3k.
**Discounting (a2):** discount factors at 9%: 1.000, 0.917, 0.842, 0.772, 0.708, 0.650; present
values -360.0k, +41.7k, +86.9k, +124.3k, +114.1k, +104.6k. NPV at 3.0% +210.8k · at 6% +157.8k ·
at 9% +111.7k · at 12% +71.2k · at 15% +35.6k.
**Two projects (a3):** Quick win (rules-based triage) cash flows -60, +40, +40, +40: NPV +41.3k at
9.0% · IRR 44.6% · payback 1.5 years · simple ROI 100.0%. CFT simple ROI 75.5%. The NPV lines cross
at 15.4%: below it CFT adds more value, above it the quick win does. IRR ranks the quick win first
at every rate. Two-IRR example: cash flows -100.0k, +235.0k, -136.0k have 2 IRRs: 3.1% and 31.9%.
**Tornado (a4, b3)**, sorted by swing, NPV at low input -> high input:
Saving per fast-tracked claim -111.5k to +260.5k (swing 372.0) · Share fast-tracked -23.6k to
+246.9k (270.5) · Leakage per fast-tracked claim +223.3k to -37.1k (260.4) · Years of benefit +7.0k
to +207.7k (200.6) · Run cost per year +150.6k to -5.0k (155.6) · Year-1 adoption +34.4k to +188.9k
(154.6) · Simple claims per year +40.8k to +182.5k (141.7) · Build cost (year 0) +141.7k to +11.7k
(130.0) · Discount rate +141.7k to +84.1k (57.6).
With the 25% optimism uplift on build: NPV +21.7k (the uplift alone at 20% gives +39.7k).
**Switching values (a4)**, the value where the case breaks, change from base:
Build cost 471.7k (+31.0%) · Run cost 98.7k (+41.0%) · Simple claims 35,696 (-15.0%) · Share
fast-tracked 46.7% (-15.0%) · Saving per claim 12.50 (-10.7%) · Leakage per claim 5.50 (+37.5%) ·
Year-1 adoption 13.9% (-72.2%) · Discount rate 18.4% (+104.7%, it is the IRR) · Years of benefit:
3 years, NPV below zero (-40.0%). The three within 20% of base are highlighted on the widget: simple
claims, share fast-tracked, saving per claim.
**Simulation (a5):** P10 -141.5k · P50 +20.5k · P90 +189.9k · mean +23.1k · chance NPV below zero
44.1%. Base case NPV +111.7k sits well above the middle draw because the ranges are skewed against
the plan (build skewed up, leakage skewed up, saving capped close to base). Break it, every input
held certain: every draw gives +111.7k, "With no uncertainty in the inputs there is no range to
report."
**Option to wait (a5, b4):** saving high = 16, low = 11; chance high 55%. Commit now: +260.5k if
high, -111.5k if low, expected +93.1k, worst case -111.5k. Pilot first (one region, a quarter of
claims, pilot cost 80k, pilot run 20k, 50k of the build reused): +218.3k if high (scale), -79.8k if
low (stop), expected +84.1k, worst case -79.8k. Value of waiting -8.9k at 55%. Below 42.9% the pilot
wins. Scaling after a low result would give -136.2k. Value of waiting at 30% +9.5k, at 40% +2.2k,
at 50% -5.2k, at 70% -20.0k.
**Bench ladder (a6):**

| Rung | NPV | IRR | P10 | P50 | P90 | Chance NPV < 0 |
|---|---|---|---|---|---|---|
| 1. Base case | +111.7k | 18.4% | -141.5k | +20.5k | +189.9k | 44.1% |
| 2. The sponsor's case (saving 16, share 65%, build 330, 6 years) | +606.4k | 49.1% | -40.6k | +163.7k | +371.5k | 15.3% |
| 3. Sunk cost and CDQ charged | -193.3k | -1.5% | -446.5k | -284.5k | -115.1k | 98.1% |
| 4. Optimism uplift on build, +25% | +21.7k | 10.6% | -238.0k | -75.7k | +96.8k | 71.9% |
| 5. Every input held certain (break) | +111.7k | 18.4% | +111.7k | +111.7k | +111.7k | 0.0% |

Rung 2 teaches that a range is only as honest as its bounds: the sponsor moved every base to the
top of its range, so the NPV quintupled and the chance of loss fell to 15.3% without one new fact.
Rung 5 proves the range comes from the inputs, not from the machinery.

## Verified facts (sources)

See `materials/source-facts.md` (written by the source check on 2026-10-30) for the full record.
The facts pages may use are summarised here with their tiers.

Tiers: **read-at-source** (the source check read the body text on 2026-10-30), **reported**
(secondary only; pages say "reported", paraphrase, no page numbers), **constructed** (Keelson).

**F1. HM Treasury, The Green Book (2026)** (read-at-source; gov.uk change notes: 5 Feb 2026 shorter
edition implementing the Green Book Review 2025; **28 Oct 2026 discounting updated**). Earlier
editions withdrawn. Cite as "HM Treasury, The Green Book (2026)". Always show the edition date.
- Five case model: strategic, economic, commercial, financial, management (para 3.12, Table 2);
  developed together, not five separate cases (3.15); the Green Book itself mainly covers the
  strategic and economic cases.
- Options: longlist narrowed to a shortlist of "around five options" (5.17). Business as usual
  MUST always be taken forward to the shortlist (2.16, 5.18) and "does not mean doing nothing"
  (4.15). A shortlist should TYPICALLY include BAU, a do minimum (helps expose gold plating), a
  preferred way forward, a more ambitious and a less ambitious option (5.18). Never say "must
  include a do minimum". The options framework filter is recommended, not mandatory (5.13).
- Social time preference rate (public sector, REAL terms): **3.00% years 1-30, 2.50% years 31-75,
  2.25% from year 76** (para 6.54; supplementary guidance Discounting, October 2026: forward rates,
  composed of 2% risk-free plus 1% systematic risk premium, no discounting beyond year 125). Until
  28 Oct 2026 the rate was 3.5% (2022 and Feb 2026 editions); pages may say "3.5 percent until
  October 2026" as history. No separate health discount rate in the live text (health effects are
  uprated 2% a year instead, 8.58). The STPR is a real social rate for public spending; Keelson's
  9% is a nominal company hurdle. Teaching point: they answer different questions.
- Optimism bias: appraisers "must account for optimism bias" with explicit adjustments at the
  outset (6.78), raising costs and durations and lowering benefits; use the organisation's own
  historical forecast errors first (6.79), generic supplementary values only without them (6.80).
- Supplementary Green Book Guidance, Optimism Bias (HM Treasury, gov.uk publication 2013; values
  from Mott MacDonald 2002, "Review of Large Public Procurement in the UK"): Equipment/Development
  (equipment and ICT, software and systems development): **capex upper bound 200%, lower 10%;
  duration upper 54%, lower 10%**. Standard buildings capex 24 / 2, duration 4 / 1. Upper bound is
  the average historic optimism at outline business case stage, a starting point, reduced as
  contributory factors are mitigated; the lower bound is the target by contract award. No sound
  bounds exist for operating expenditure or benefits shortfall: use sensitivity and switching values
  instead (4.1). Evidence is 2002 data; say so.
- Sensitivity and switching values (6.101-6.104): sensitivity analysis tests how changes in key
  assumptions affect results; a switching value is the value a key variable would need to change to
  so the option stops being value for money; at a minimum, required for the preferred option.
- Real options, decision trees, scenarios, Monte Carlo (6.73-6.76): real options analysis assesses
  whether flexibility can be built in and exercised later as information emerges, useful when
  uncertainty is high or investment hard to reverse; caution: scenario probabilities can introduce
  "spurious accuracy". Decision trees for sequential decisions; Monte Carlo for high cost / high
  risk. The phrases "value of waiting" and "option value" do NOT appear in the Green Book: use them
  as general finance terms, not Green Book terms.
- BCR thresholds rejected; a benefit-cost ratio below one is not automatically poor value
  (6.97-6.98). Evaluation: appraisal is distinct from monitoring and evaluation; the Magenta Book
  is the evaluation guidance (process, impact, value for money); build an evaluation plan before
  final approval, include evaluation costs; later check whether costs and benefits materialised
  (ch 10).
- Green Book Review 2025 (June 2025): promised "place-based business cases"; the phrase is NOT in
  the 2026 Green Book or Business Case Guidance. Do not teach it as implemented.

**F2. HM Treasury, Guidance on Developing Business Cases for Projects and Programmes (2026)**
(read-at-source). A separate document from the Green Book. Benefits register covering all benefits,
monetisable or not (8.52); benefits management identifies, plans, tracks and verifies benefits; the
register records monitoring, baseline and who is responsible; each benefit should be assigned an
owner; the register is iterative and attached to the case (11.20-11.22).

**F3. Aswath Damodaran** (read-at-source): Corporate Finance Spring 2026 note packet (slides) and
Applied Corporate Finance 3rd edition chapters 5 and 6 (book). Cite as "Aswath Damodaran, Applied
Corporate Finance and NYU Stern corporate finance notes (Spring 2026)".
- Sunk costs are not incremental and should not be considered (book ch5; slides). He adds that
  managers struggle to ignore them, and that a firm must still cover sunk costs over time.
- Opportunity costs: a resource the business already owns is priced at its next best use (slides,
  book ch6); ignoring them "can lead to bad investments".
- Allocated overhead: only the incremental component belongs; NUANCE: firms still need to cover
  headquarters costs, so a fixed charge for shared costs may be reasonable. Never teach "ignore all
  overhead".
- Side costs and side benefits, synergies, embedded options (delay, expand, abandon) belong in a
  project's returns (slides; book ch6).
- One sign change gives one IRR; more than one sign change gives more than one IRR (book ch5). NPV
  tends to be larger for large projects, IRR higher for small ones, so mutually exclusive projects
  can rank differently. NPV assumes reinvestment at the hurdle rate; IRR at the IRR, which overstates
  the return when IRR is high and life long. He calls NPV "much simpler to estimate and use" after
  the multiple-IRR fixes; do NOT put "always use NPV" in his mouth.
- Payback ignores what happens after the investment is recouped and treats early and late cash the
  same (book ch5); discounted payback is presented as one simplistic fix (slides).
- Equivalent annuity = NPV x r / (1 - (1 + r)^-n), for projects with different lives (book ch6).
  His Spring 2026 slide prints a multiply where it should divide; teach the book formula.
- Hurdle rate should reflect the project's risk: riskier projects need a higher cost of capital;
  using the firm's rate for every project over-invests in risky projects and under-invests in safe
  ones (book ch5; slides).

**F4. Flyvbjerg and Budzier, "Why Your IT Project May Be Riskier than You Think", Harvard Business
Review, September 2011** (read-at-source via the authors' manuscript): 1,471 IT projects; average
cost overrun 27%; one in six was a black swan with an average cost overrun of 200% and a schedule
overrun of almost 70%. Mostly public agencies (92%) and US-based (83%); ERP, MIS, CRM systems.
**F5. Reference class forecasting** (read-at-source: Flyvbjerg 2006, Project Management Journal):
take the outside view using actual outcomes of a reference class of comparable past projects, in
three steps (identify the class, establish its distribution, place the project in it). Safe
attribution: Kahneman and Tversky (1979) introduced the planning fallacy and the outside view;
Kahneman and Lovallo (1993) developed the inside view; Flyvbjerg turned it into a forecasting
method (2004-06). UK DfT and HM Treasury adopted it in 2004 for large transport projects.
**F6. Benefits management terms** - APM's benefits definition (read-at-source on APM's page):
"the identification, definition, planning, tracking and realisation of benefits". MSP's benefit
profile, benefit owner, benefits map and dis-benefit: **reported** only (manual paywalled); pages say
"in programme-management practice such as MSP (reported)", never quote it.
**F7. AI value-capture figures (contested; teach the disagreement)** - MIT NANDA, "The GenAI Divide:
State of AI in Business 2025" (July 2025, preliminary): headline that 95% get zero return; the body
measures custom enterprise GenAI tools reaching production with sustained P&L or productivity
impact, from 52 interviews, 153 conference surveys and 300+ public initiatives, six months after
pilot; the report lists its own selection-bias and short-window limits; critics call the sample
small and non-random and the definition narrow. RAND RR-A2680-1 (August 2024): "by some estimates"
more than 80% of AI projects fail (reported; RAND cites an outside estimate rather than measuring
it). Never quote either as a measured failure rate; present both as contested.

## Per-session coverage

### Leader track (no code)
- **b1 What a business case is for** (diff green): a case is a decision document, not a sales
  document; the counterfactual (what happens if we do nothing); the option ladder (business as usual,
  do minimum, full build, pilot then scale); the Green Book five case model as a checklist of the
  five questions a funder asks. Keelson: Ines asks for options, not a proposal. Build-along: write
  Keelson's option ladder and the counterfactual on one page.
- **b2 Reading a case like a CFO** (green): which question each number answers (NPV: does it add
  value at our hurdle; IRR: how much margin over the hurdle, with its traps; payback: how long the
  money is at risk); the hurdle rate is a policy set by finance and should match the project's risk;
  simple ROI ignores time. Keelson: CFT against the quick win; Ines reads both. Build-along: read a
  one-page case and write the three questions to ask.
- **b3 The assumption doing the work** (yellow): optimism bias and reference classes; reading a
  tornado; switching values as the sentence a board can hold ("the case breaks if the saving per
  claim falls by 10.7 percent"); ranges, not points. Read-only tornado widget. Build-along: rewrite
  Keelson's headline from a point to a range plus the one assumption to test.
- **b4 After the yes** (orange): benefits realisation: owners, baseline, benefits map with the
  dis-benefit (leakage), review dates and the post-investment review; stage gates and the option to
  wait. Wait widget read-only. Build-along: Keelson's benefits register for CFT.

### Analyst track (hands-on)
- **a1 Only the cash that changes** (green): with versus without; sunk costs out; opportunity costs
  in (team-months); allocated overhead versus incremental cost; side effects (leakage as a
  dis-benefit); the CDQ dependency: charge it only if CDQ happens because of CFT. Widget: cashflow.
- **a2 Time value and the hurdle rate** (green): discount factors; present value; NPV; the NPV
  profile; real versus nominal must match; a public-sector social rate (Green Book 2026 STPR, 3.0% real) against a
  company hurdle; a project-specific rate. Widget: discount.
- **a3 NPV, IRR and payback** (yellow): ranking clash on scale and life (CFT vs quick win, crossover
  15.4%); two IRRs when signs change twice; payback and discounted payback; simple ROI; equivalent
  annual value for unequal lives (self-study). Widget: metrics.
- **a4 Swing every assumption** (yellow): one-at-a-time sensitivity, the tornado, switching values,
  scenarios versus sensitivity, the optimism uplift. Widget: tornado.
- **a5 The range and the option to wait** (orange): triangular inputs, seeded simulation, P10/P50/P90,
  chance of loss, the break button, independence as an assumption; the pilot tree and the value of
  waiting. Widgets: range, wait.
- **a6 The business case bench** (red): every rung, then break it. Widget: bench.

## Seams (link with absolute URLs; we pick this side out loud)

- **learn-data-strategy-with-phoebe** owns funding MODELS (central, chargeback, co-funded) and the
  leading/lagging value signals; this course owns the NPV/IRR/payback maths for one bet and the
  benefits register after approval. Link: https://phoebefu6.github.io/learn-data-strategy-with-phoebe/courses/05-funding-and-value-tracking.html
  and the bet selection https://phoebefu6.github.io/learn-data-strategy-with-phoebe/courses/03-the-first-three-bets.html
- **learn-value-investing-with-phoebe** owns valuing a whole company (owner earnings, DCF by hand,
  reverse DCF, "which input moves the answer" for a company). This course values one internal
  project from its incremental cash. Never reuse the title "Which input moves the answer". Link:
  https://phoebefu6.github.io/learn-value-investing-with-phoebe/courses/p4-a-dcf-by-hand.html
- **learn-finance-with-phoebe** owns the three statements, cash versus profit, sizing a funding
  requirement. Link: https://phoebefu6.github.io/learn-finance-with-phoebe/
- **learn-decision-intelligence-with-phoebe** owns weighing options in general. Link:
  https://phoebefu6.github.io/learn-decision-intelligence-with-phoebe/
- **learn-data-monetisation-with-phoebe** (PLANNED: mention as "planned", no link) owns selling data
  externally. This course covers internal savings and revenue cases.
- **learn-experimentation-with-phoebe** owns measuring a benefit with a controlled test. Link:
  https://phoebefu6.github.io/learn-experimentation-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Not covered (say so where relevant)

Tax and depreciation shields in detail; estimating a WACC from market data (CAPM, beta); lease
versus buy; full real-options pricing (Black-Scholes, binomial lattices); public-sector social
cost-benefit valuation of non-market impacts; portfolio optimisation across many cases; accounting
treatment of capitalised software. Certificates: none; this is a reasoning course.
