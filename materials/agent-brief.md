# Agent brief - shared by every fan-out page of learn-business-cases-roi-with-phoebe

Internal build document, filled from course-builder/references/agent-brief.template.md on
2026-10-30. Never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup
   EXACTLY, including how many options each question has (4, lettered "A · ", "B · ", ...):
   - Leader: `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/courses/b1-what-a-case-is-for.html`
   - Analyst: `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/courses/a1-only-the-cash-that-changes.html`
   Also skim the bench page for voice: `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/courses/a6-the-business-case-bench.html`
2. The source map: every verified fact with its tier, the Keelson case, per-session coverage, the
   seams, and the exact "Widget-printed lines". Use ONLY its numbers; never invent a statistic; if
   a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/assets/style.css`
4. If your page carries a widget, read `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-business-cases-roi-with-phoebe/assets/bcr-bench.js`
   for what that mode renders (labels, controls), so your steps name real controls.

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-business-cases-roi-with-phoebe</a> / Leader
session N of 4` or `... / Analyst session N of 6`, #toggle-all, #zoom-toggle) · masthead (eyebrow
"Learn Business Cases &amp; ROI with Phoebe · Leader session N of 4" or "· Analyst session N of 6",
h1 with one `<span class="accent">`, .sub, .chip-row with the level chip (b2 "🟢 Leader", b3
"🟡 Leader", b4 "🟠 Leader"; a2 "🟢 Analyst", a3 and a4 "🟡 Analyst", a5 "🟠 Analyst") plus the two
audience chips and the time chip exactly as your template, .agenda a1-a4) · main.wrap ·
section#intro (Part 0 "Where we start": kicker, .lede, .legend pills, .callout.win "★ What you walk
out with tonight.") · 3 Parts, each `section.section#part-N` with section-kicker (klabel "Part N ·
covers ...", h2, `.tag.concept "5 min live"`), a `.lede`, ONE figure, `details.card` accordions
(summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example`
with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker
`.tag.demo "★ 22 min · everyone works it through"` on Leader pages, `"★ 22 min · everyone builds"`
on Analyst pages, .lede, the widget if your outline names one, ONE figure, `.steps > .step`, each
with a `.prompt-box.good` carrying a `span.label`) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, 4 `button.qopt` "A · ...", `p.qwhy`;
one `p.quiz-score` after the last; vary the correct letter across the three) · section#official,
h2 EXACTLY "What this session teaches, and where it came from", `.covered > .covered-row` (pill
solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY "Every fact on this page, and its
verification tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3
"Leader session N cheat sheet <span>· pin this</span>" or "Analyst session N cheat sheet ...",
.grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot ·
scripts.

Head: the template's social meta block with this page's own description/title/url;
`<title>Leader session N · <Title> - learn business cases and ROI with phoebe</title>` (or Analyst);
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.
Scripts at the end: pages WITHOUT a widget: only `<script src="../assets/app.js?v=1"></script>`.
Pages WITH a widget: exactly as a1, i.e. `bcr-live.js?v=1`, `bcr-bench.js?v=1`, then `app.js?v=1`.
The widget is `<div class="bcr-widget" data-mode="MODE"></div>` placed right after the build-along
.lede, before its figure (Leader b3 adds `data-switch="off"` to hide the switching table).

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "Analyst session 5" style cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map. Widget numbers: quote ONLY the lines under "Widget-printed
  lines" in the map, verbatim and in the same format (k = thousands, one decimal, e.g. +111.7k).
  For a hand calculation you show (a discount factor, a year's cash), show the arithmetic and check
  it; it must agree with the map. Never invent a Keelson number the engine does not print.
- Contested evidence (AI failure-rate headlines): teach the disagreement and what each study
  measured; never quote them as measured population rates.
- Citations in the exact form of the map's F1-F7. "Reported" items (MSP terms, RAND 80%) say
  "reported" and are paraphrased. Green Book is ALWAYS "The Green Book (2026)"; its social rate is
  3.0% real for years 1-30 (it was 3.5% until 28 October 2026; you may say so as history). Never
  say the Green Book "requires a do minimum" (it says typically). Never call "value of waiting" a
  Green Book term. Never write "always use NPV" as Damodaran's words. Benefits register and
  benefit owners come from HM Treasury's Guidance on Developing Business Cases (2026), not the
  Green Book.
- NEVER "lottery" or "lotteries"; say the mechanism ("a random draw", "a seeded draw").
- Default to the English word. No Chinese terms needed here.
- Titles, widget ids and class names must not collide with siblings. Do not use these titles:
  "Which input moves the answer", "A DCF by hand", "Value is a range", "The margin of safety",
  "Funding and value tracking", "The first three bets", "The intrinsic value bench". Do not invent
  new CSS classes; use the template's classes only.
- Running case: Keelson Mutual (constructed insurer), Maya Okafor (CDO), Tom Reyes (COO, sponsor),
  Ines Carvalho (CFO), the claims operations lead (unnamed). CFT = claims fast-track triage; CDQ =
  claims data quality fix; quick win = rules-based triage. Say "constructed" on the page for every
  Keelson example ("Constructed Keelson Mutual example." at the end of each Real world callout that
  uses Keelson). Never Phoebe's own employer, clients or projects.
- Learner exercises on their own project: say "your numbers will differ".

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#211A25` · muted `#5B5160` · accent `#4A1A5C`
· accent-deep `#2F0F3B` · accent-mid `#63307A` · accent-soft `#D9C3E3` · accent-50 `#F5EEF8` ·
faint `#CDC5D1` · hairline `#E7E1EA` · brass (contrast) `#7D5A0E` · brass-ink `#4F3807` ·
brass-50 `#FAF2E0` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way
panel or a below-zero mark.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `<page id><letter>`, e.g. `b2a`, `b2b`,
  `b2c`, `b2d` (b2's four figures), `a3a` ... Never reuse another page's prefix.
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  accent line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink
  stroke 1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#211A25"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation
  (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, accent-50, the hachure
  for "the pile" or "the data", and the brass ONLY for the one thing the figure is about. One doodle
  anchor per figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading ·
  `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px brass-ink · `.PV` 800 16-20px
  accent-deep value · `.PW` 800 12px white on a fill (brass or accent only) · `.PA` 700 11px
  accent-deep axis caption · `.PR` 700 11px #991B1B for a below-zero or wrong-way label · `.PN`
  400 12px muted note. Hand-stacked items must not overlap as painted rects (the gate flags a pile).
  Text over a hachure fill sits on a white rect placed OUTSIDE the filtered group.
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it by
  8px. No path may cross a text label (the gate flags line-through-text). Keep every label inside
  the box it describes. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (a discount factor
  shrinking each year's bar; two NPV lines crossing at the crossover rate; an NPV profile cutting
  zero twice; a tornado's bars around the base line; the switching value as the point a slider
  crosses zero; a triangle distribution feeding draws; a two-branch pilot tree with its payoffs; a
  benefits map from output to benefit with the dis-benefit branch), never a metaphor literally,
  never decoration.

## Voice and honesty

Every Part gets a real-world story: a sourced fact from the map where one exists (Flyvbjerg's
1,471 IT projects, the Green Book's optimism-bias table, Damodaran's rules), otherwise a
constructed Keelson story labelled as such. Keelson numbers a widget prints are quoted from the
map; nothing else about Keelson gets a number.

## Cross-links (absolute URLs)

- Funding models and value signals (never re-teach them): https://phoebefu6.github.io/learn-data-strategy-with-phoebe/courses/05-funding-and-value-tracking.html
- How the three bets were chosen: https://phoebefu6.github.io/learn-data-strategy-with-phoebe/courses/03-the-first-three-bets.html
- Valuing a whole company, DCF by hand (seam: never re-teach company valuation): https://phoebefu6.github.io/learn-value-investing-with-phoebe/courses/p4-a-dcf-by-hand.html
- The three statements, cash versus profit: https://phoebefu6.github.io/learn-finance-with-phoebe/
- Weighing options in general: https://phoebefu6.github.io/learn-decision-intelligence-with-phoebe/
- Measuring a benefit with a controlled test: https://phoebefu6.github.io/learn-experimentation-with-phoebe/
- Data monetisation (selling data): PLANNED, mention as "planned", no link.
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chains and session titles

Leader: b1 What a business case is for → b2 Reading a case like a CFO → b3 The assumption doing
the work → b4 After the yes (b4's next: "Next: Only the cash that changes →" to
a1-only-the-cash-that-changes.html).
Analyst: a1 Only the cash that changes → a2 Time value and the hurdle rate → a3 NPV, IRR and
payback → a4 Swing every assumption → a5 The range and the option to wait → a6 The business case
bench.
Footer left: "Leader session N of 4 · learn-business-cases-roi-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>" (or Analyst N of 6).
Footer right: "<a href="PREV.html">← Prev: Title</a> &nbsp;·&nbsp; <a href="NEXT.html">Next: Title →</a>".
Files: b2-reading-a-case-like-a-cfo.html, b3-the-assumption-doing-the-work.html,
b4-after-the-yes.html, a2-time-value-and-the-hurdle-rate.html, a3-npv-irr-and-payback.html,
a4-swing-every-assumption.html, a5-the-range-and-the-option-to-wait.html.

Session titles (exact, sentence case, one accent span in h1): b2 "Reading a case like a CFO", b3
"The assumption doing the work", b4 "After the yes", a2 "Time value and the hurdle rate", a3 "NPV,
IRR and payback", a4 "Swing every assumption", a5 "The range and the option to wait".
