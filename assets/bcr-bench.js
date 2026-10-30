/* bcr-bench.js - the business case widgets. Renders into any element with class "bcr-widget":
 *   data-mode="cashflow"  Analyst session 1, only the cash that changes (sunk cost, the CDQ charge)
 *   data-mode="discount"  Analyst session 2, discount factors, present values, the NPV profile
 *   data-mode="metrics"   Analyst session 3, NPV vs IRR vs payback on two projects, two IRRs
 *   data-mode="tornado"   Analyst session 4 (and Leader session 3), tornado and switching values
 *   data-mode="range"     Analyst session 5, the seeded simulation, hold inputs certain
 *   data-mode="wait"      Analyst session 5 (and Leader session 4), commit now or pilot first
 *   data-mode="bench"     Analyst session 6, the business case bench
 * Every number is computed by bcr-live.js when the page loads or a control changes. */
(function () {
  "use strict";
  var B = window.BCR;
  if (!B) return;
  var HONEST = "Keelson Mutual is constructed; every input is invented for teaching. The arithmetic is real and runs in your browser.";
  var STEP = { build: 5, run: 5, claims: 500, share: 0.01, save: 0.5, leak: 0.5, ramp: 0.05, rate: 0.005, years: 1 };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rd(x, k) { return Math.floor(x * k + 0.5) / k; }
  function k1(x) { var v = rd(x, 10); return (v > 0 ? "+" : v < 0 ? "-" : "") + Math.abs(v).toFixed(1) + "k"; }
  function pc(x) { return x == null ? "none" : rd(x * 100, 10).toFixed(1) + "%"; }
  function yrs(x) { return x == null ? "never" : rd(x, 10).toFixed(1) + " years"; }
  function fmtIn(k, v) {
    if (k === "share" || k === "ramp" || k === "rate") return rd(v * 100, 10).toFixed(1) + "%";
    if (k === "claims") return Math.round(v).toLocaleString("en-US");
    if (k === "years") return Math.round(v) + " years";
    if (k === "save" || k === "leak") return rd(v, 100).toFixed(2) + " per claim";
    return rd(v, 10).toFixed(1) + "k";
  }
  function shell(root, title, hint) {
    var w = el("div", "wk bcr-wk"), h = el("div", "wk-head");
    h.appendChild(el("b", null, title)); if (hint) h.appendChild(el("span", "wk-hint", hint));
    var body = el("div", "wk-body"), foot = el("div", "wk-foot");
    var k = el("span", "bcr-kind", "constructed inputs · real arithmetic"); foot.appendChild(k);
    foot.appendChild(document.createTextNode(" " + HONEST));
    w.appendChild(h); w.appendChild(body); w.appendChild(foot); root.appendChild(w); return body;
  }
  function metrics(box, list) {
    var m = el("div", "mb-metrics bcr-metrics");
    list.forEach(function (x) {
      var c = el("div", "mb-metric" + (x.bad ? " bcr-neg" : ""));
      c.appendChild(el("span", "mb-mvalue", x.v)); c.appendChild(el("span", "mb-mlabel", x.l)); m.appendChild(c);
    });
    box.appendChild(m); return m;
  }
  function table(head, rows) {
    var w = el("div", "mk-tablewrap"), t = el("table", "mk-table bcr-table"), tr = el("tr");
    head.forEach(function (h) { tr.appendChild(el("th", null, h)); });
    var th = el("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr", r.cls || null);
      r.cells.forEach(function (c) { row.appendChild(el("td", null, c)); });
      tb.appendChild(row);
    });
    t.appendChild(tb); w.appendChild(t); return w;
  }
  function check(parent, label, on, cb) {
    var lab = el("label", "mb-ctl"), inp = document.createElement("input"); inp.type = "checkbox"; inp.checked = !!on;
    inp.setAttribute("aria-label", label); inp.addEventListener("change", function () { cb(inp.checked); });
    lab.appendChild(inp); lab.appendChild(document.createTextNode(label)); parent.appendChild(lab); return inp;
  }
  function slider(parent, label, min, max, step, value, fmt, cb) {
    var lab = el("label", "mb-ctl mb-range bcr-range"); lab.appendChild(el("span", "bcr-rlabel", label));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    inp.setAttribute("aria-label", label);
    var out = el("b", null, fmt(+value));
    inp.addEventListener("input", function () { out.textContent = fmt(+inp.value); cb(+inp.value); });
    lab.appendChild(inp); lab.appendChild(out); parent.appendChild(lab);
    return { input: inp, set: function (v) { inp.value = v; out.textContent = fmt(+v); } };
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  /* tornado as HTML bars around the base NPV */
  function tornadoBars(box, p, opts) {
    var t = B.tornado(p, opts), lo = t.base, hi = t.base;
    t.rows.forEach(function (r) { lo = Math.min(lo, r.npvLow, r.npvHigh); hi = Math.max(hi, r.npvLow, r.npvHigh); });
    var pad = (hi - lo) * 0.04 || 1; lo -= pad; hi += pad;
    var x = function (v) { return (100 * (v - lo) / (hi - lo)).toFixed(2) + "%"; };
    var wrap = el("div", "bcr-tornado");
    var axis = el("div", "bcr-trow bcr-taxis"); axis.appendChild(el("span", "bcr-tlab", ""));
    var at = el("span", "bcr-ttrack"), z = el("i", "bcr-zero"); z.style.left = x(0); at.appendChild(z);
    var bl = el("i", "bcr-baseline"); bl.style.left = x(t.base); at.appendChild(bl);
    var zl = el("em", "bcr-zlab", "NPV 0"); zl.style.left = x(0); at.appendChild(zl);
    var blb = el("em", "bcr-blab", "base " + k1(t.base)); blb.style.left = x(t.base); at.appendChild(blb);
    [[zl, 0], [blb, t.base]].forEach(function (pair) {   /* keep labels inside the track */
      if ((pair[1] - lo) / (hi - lo) > 0.6) pair[0].classList.add("is-flip");
    });
    axis.appendChild(at); axis.appendChild(el("span", "bcr-tval", "")); wrap.appendChild(axis);
    t.rows.forEach(function (r, i) {
      var row = el("div", "bcr-trow" + (i === 0 ? " is-top" : ""));
      row.appendChild(el("span", "bcr-tlab", r.label));
      var tr = el("span", "bcr-ttrack"), a = Math.min(r.npvLow, r.npvHigh), b = Math.max(r.npvLow, r.npvHigh);
      var z2 = el("i", "bcr-zero"); z2.style.left = x(0); tr.appendChild(z2);
      var bar = el("i", "bcr-bar"); bar.style.left = x(a); bar.style.width = "calc(" + (100 * (b - a) / (hi - lo)).toFixed(2) + "% + 2px)"; tr.appendChild(bar);
      var b2 = el("i", "bcr-baseline"); b2.style.left = x(t.base); tr.appendChild(b2);
      row.appendChild(tr);
      row.appendChild(el("span", "bcr-tval", k1(r.npvLow) + " to " + k1(r.npvHigh)));
      wrap.appendChild(row);
    });
    box.appendChild(wrap);
    return t;
  }
  function switchTable(box, p, opts) {
    var rows = B.switchingTable(p, opts).map(function (r) {
      var cell = r.value == null ? "no value in reach" : fmtIn(r.key, r.value) + (r.key === "years" ? ", NPV below zero" : "");
      var ch = r.change == null ? "" : (r.change > 0 ? "+" : "") + rd(r.change * 100, 10).toFixed(1) + "%";
      var near = r.change != null && Math.abs(r.change) < 0.2;
      return { cls: near ? "bcr-near" : null, cells: [r.label, fmtIn(r.key, r.base), cell, ch] };
    });
    box.appendChild(table(["Input", "Base case", "Case breaks at", "Change from base"], rows));
  }
  function histogram(box, sim) {
    var s = sim.sorted, n = s.length, lo = s[0], hi = s[n - 1];
    var wrap = el("div", "bcr-hist");
    if (hi - lo < 1e-9) {
      wrap.appendChild(el("p", "bcr-flat", "Every draw gives the same NPV, " + k1(lo) + ". With no uncertainty in the inputs there is no range to report."));
      box.appendChild(wrap); return;
    }
    var bins = 30, w = (hi - lo) / bins, cnt = [], i, max = 0;
    for (i = 0; i < bins; i++) cnt.push(0);
    for (i = 0; i < n; i++) cnt[Math.min(bins - 1, Math.floor((s[i] - lo) / w))]++;
    cnt.forEach(function (c) { max = Math.max(max, c); });
    var bars = el("div", "bcr-hbars");
    cnt.forEach(function (c, j) {
      var b = el("i", (lo + (j + 1) * w) <= 0 ? "is-neg" : ""); b.style.height = (100 * c / max).toFixed(1) + "%"; bars.appendChild(b);
    });
    wrap.appendChild(bars);
    var ax = el("div", "bcr-hax"); ax.appendChild(el("span", null, k1(lo))); ax.appendChild(el("span", null, k1(hi))); wrap.appendChild(ax);
    box.appendChild(wrap);
  }
  function simMetrics(box, sim) {
    return metrics(box, [
      { v: k1(sim.p10), l: "P10: 1 draw in 10 is worse", bad: sim.p10 < 0 },
      { v: k1(sim.p50), l: "P50: the middle draw", bad: sim.p50 < 0 },
      { v: k1(sim.p90), l: "P90: 1 draw in 10 is better", bad: sim.p90 < 0 },
      { v: pc(sim.pNeg), l: "chance NPV is below zero", bad: sim.pNeg > 0.5 }
    ]);
  }
  function evalMetrics(box, e) {
    return metrics(box, [
      { v: k1(e.npv), l: "NPV at the hurdle rate", bad: e.npv < 0 },
      { v: pc(e.irr), l: "IRR" },
      { v: yrs(e.payback), l: "payback (undiscounted)" },
      { v: yrs(e.dpayback), l: "discounted payback" }
    ]);
  }

  /* ---------- a1: only the cash that changes ---------- */
  function cashflowMode(root) {
    var body = shell(root, "Keelson CFT · cash flows", "Toggle what belongs in the case");
    var o = { sunk: false, cdq: false }, ctl = el("div", "mb-ctls"), out = el("div");
    check(ctl, "Add the 45k discovery already spent", false, function (v) { o.sunk = v; draw(); });
    check(ctl, "Charge the 260k CDQ fix to this case", false, function (v) { o.cdq = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var p = B.BASE, e = B.evaluate(p, o), rows = [];
      e.cf.forEach(function (c, t) {
        if (t === 0) {
          var note = "build " + k1(-p.build) + (o.sunk ? ", discovery " + k1(-B.SUNK) : "") + (o.cdq ? ", CDQ " + k1(-B.CDQ) : "");
          rows.push({ cls: (o.sunk || o.cdq) ? "bcr-flag" : null, cells: ["Year 0", "-", "-", note, k1(c)] });
        } else {
          var a = B.adoption(p, t), claims = p.claims * p.share * a;
          rows.push({ cells: ["Year " + t, pc(a), Math.round(claims).toLocaleString("en-US"),
            "net " + k1(claims * (p.save - p.leak) / 1000) + ", run " + k1(-p.run), k1(c)] });
        }
      });
      out.appendChild(table(["Year", "Adoption", "Claims fast-tracked", "What moves", "Net cash"], rows));
      evalMetrics(out, e);
    }
    draw();
  }

  /* ---------- a2: time value ---------- */
  function discountMode(root) {
    var body = shell(root, "Keelson CFT · discounting", "Slide the rate, watch each year shrink");
    var rate = B.BASE.rate, ctl = el("div", "mb-ctls"), out = el("div");
    slider(ctl, "Discount rate", 0, 0.2, 0.005, rate, function (v) { return pc(v); }, function (v) { rate = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    var cf = B.cashflows(B.BASE), r0 = B.irr(cf);
    function draw() {
      clear(out);
      var rows = cf.map(function (c, t) {
        var f = 1 / Math.pow(1 + rate, t);
        return { cells: ["Year " + t, k1(c), rd(f, 1000).toFixed(3), k1(c * f)] };
      });
      out.appendChild(table(["Year", "Cash", "Discount factor", "Present value"], rows));
      var v = B.npvAt(cf, rate);
      metrics(out, [{ v: k1(v), l: "NPV at " + pc(rate), bad: v < 0 }, { v: pc(r0), l: "IRR: the rate where NPV is zero" }]);
      var prof = el("div", "bcr-profile"), bars = el("div", "bcr-pbars"), mx = 0, vals = [];
      for (var i = 0; i <= 20; i++) { var npv = B.npvAt(cf, i / 100); vals.push(npv); mx = Math.max(mx, Math.abs(npv)); }
      vals.forEach(function (npv, i) {
        var col = el("span", "bcr-pcol" + (Math.abs(i / 100 - rate) < 0.0025 ? " is-here" : ""));
        var b = el("i", npv < 0 ? "is-neg" : ""); b.style.height = (50 * Math.abs(npv) / mx).toFixed(1) + "%";
        if (npv < 0) b.style.top = "50%"; else b.style.bottom = "50%";
        col.appendChild(b); col.title = i + "%: " + k1(npv); bars.appendChild(col);
      });
      prof.appendChild(bars);
      var ax = el("div", "bcr-hax"); ax.appendChild(el("span", null, "0%")); ax.appendChild(el("span", null, "NPV profile, rate 0% to 20%")); ax.appendChild(el("span", null, "20%"));
      prof.appendChild(ax); out.appendChild(prof);
    }
    draw();
  }

  /* ---------- a3: NPV vs IRR vs payback ---------- */
  function metricsMode(root) {
    var body = shell(root, "Two projects, four verdicts", "CFT against a quick rules-based win");
    var rate = B.BASE.rate, ctl = el("div", "mb-ctls"), out = el("div");
    slider(ctl, "Hurdle rate", 0, 0.3, 0.005, rate, function (v) { return pc(v); }, function (v) { rate = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    var cfA = B.cashflows(B.BASE), cfB = B.QUICK.cf;
    function cross() {
      var lo = 0, hi = 0.5, f = function (r) { return B.npvAt(cfA, r) - B.npvAt(cfB, r); };
      if (f(lo) * f(hi) > 0) return null;
      for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
      return (lo + hi) / 2;
    }
    var x = cross();
    function draw() {
      clear(out);
      var a = { npv: B.npvAt(cfA, rate), irr: B.irr(cfA), pb: B.payback(cfA, null), roi: B.simpleRoi(cfA) };
      var b = { npv: B.npvAt(cfB, rate), irr: B.irr(cfB), pb: B.payback(cfB, null), roi: B.simpleRoi(cfB) };
      var w = function (p, q, hiWins) { return hiWins ? (p > q ? "CFT" : "Quick win") : (p < q ? "CFT" : "Quick win"); };
      out.appendChild(table(["Measure", "CFT (5 years)", "Quick win (3 years)", "Picks"], [
        { cells: ["Upfront cost", k1(cfA[0]), k1(cfB[0]), ""] },
        { cells: ["NPV at " + pc(rate), k1(a.npv), k1(b.npv), w(a.npv, b.npv, true)] },
        { cells: ["IRR", pc(a.irr), pc(b.irr), w(a.irr, b.irr, true)] },
        { cells: ["Payback", yrs(a.pb), yrs(b.pb), w(a.pb, b.pb, false)] },
        { cells: ["Simple ROI (undiscounted)", pc(a.roi), pc(b.roi), w(a.roi, b.roi, true)] }
      ]));
      out.appendChild(el("p", "bcr-note", x == null ? "The two NPV lines never cross between 0% and 50%." :
        "The NPV lines cross at " + pc(x) + ": below it CFT adds more value, above it the quick win does. IRR ranks the quick win first at every rate."));
      var two = B.irrAll(B.TWO_IRR);
      out.appendChild(el("p", "bcr-note", "A build, earn, then unwind project with cash flows " + B.TWO_IRR.map(function (c) { return k1(c); }).join(", ") +
        " changes sign twice and has " + two.length + " IRRs: " + two.map(pc).join(" and ") + ". Neither one is the answer; NPV at the hurdle rate is."));
    }
    draw();
  }

  /* ---------- a4 / b3: tornado and switching values ---------- */
  function tornadoMode(root) {
    var body = shell(root, "Which assumption does the work", "Each input to its low and high, the rest at base");
    var o = { uplift: 0 }, ctl = el("div", "mb-ctls"), out = el("div");
    check(ctl, "Apply a 25% optimism uplift to the build cost", false, function (v) { o.uplift = v ? 0.25 : 0; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var p = B.BASE;
      evalMetrics(out, B.evaluate(p, o));
      tornadoBars(out, p, o);
      if (root.getAttribute("data-switch") !== "off") switchTable(out, p, o);
    }
    draw();
  }

  /* ---------- a5: the range ---------- */
  function rangeMode(root) {
    var body = shell(root, "5,000 seeded draws", "Each input drawn from its low, base, high triangle");
    var certain = [], ctl = el("div", "mb-ctls"), out = el("div"), boxes = {};
    B.KEYS.forEach(function (k) {
      boxes[k] = check(ctl, "Hold " + B.LABELS[k].toLowerCase() + " certain", false, function (v) {
        var i = certain.indexOf(k); if (v && i === -1) certain.push(k); if (!v && i !== -1) certain.splice(i, 1); draw();
      });
    });
    var br = el("button", "mb-break", "Break it: hold every input certain");
    br.type = "button";
    br.addEventListener("click", function () { certain = B.KEYS.slice(); B.KEYS.forEach(function (k) { boxes[k].checked = true; }); draw(); });
    var rs = el("button", "mb-break bcr-reset", "Release every input");
    rs.type = "button";
    rs.addEventListener("click", function () { certain = []; B.KEYS.forEach(function (k) { boxes[k].checked = false; }); draw(); });
    body.appendChild(ctl); var bb = el("div", "mb-ctls"); bb.appendChild(br); bb.appendChild(rs); body.appendChild(bb); body.appendChild(out);
    function draw() {
      clear(out);
      var sim = B.simulate(B.BASE, {}, certain), base = B.evaluate(B.BASE).npv;
      simMetrics(out, sim);
      histogram(out, sim);
      out.appendChild(el("p", "bcr-note", "Base case NPV " + k1(base) + "; middle draw " + k1(sim.p50) + "; mean " + k1(sim.mean) + ". Seed " + B.SEED + ", " + sim.n.toLocaleString("en-US") + " draws."));
    }
    draw();
  }

  /* ---------- a5 / b4: the option to wait ---------- */
  function waitMode(root) {
    var body = shell(root, "Commit now, or pilot first", "One region for a year, then scale only if it works");
    var w = B.copy(B.WAIT), ctl = el("div", "mb-ctls"), out = el("div");
    slider(ctl, "Chance the saving comes in high", 0.1, 0.9, 0.05, w.pGood, function (v) { return pc(v); }, function (v) { w.pGood = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function breakeven() {
      var lo = 0, hi = 1, f = function (g) { var q = B.copy(w); q.pGood = g; return B.optionValue(B.BASE, q).value; };
      if (f(lo) * f(hi) > 0) return null;
      for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
      return (lo + hi) / 2;
    }
    function draw() {
      clear(out);
      var o = B.optionValue(B.BASE, w);
      out.appendChild(table(["Path", "Saving high (" + w.saveGood + ")", "Saving low (" + w.saveBad + ")", "Expected NPV", "Worst case"], [
        { cells: ["Commit now: build for everyone", k1(o.commit.good), k1(o.commit.bad), k1(o.commit.ev), k1(Math.min(o.commit.good, o.commit.bad))] },
        { cells: ["Pilot first: one region, then decide", k1(o.pilot.good) + " (scale)", k1(o.pilot.bad) + " (stop)", k1(o.pilot.ev), k1(Math.min(o.pilot.good, o.pilot.bad))] }
      ]));
      var be = breakeven();
      metrics(out, [
        { v: k1(o.value), l: "value of waiting (pilot minus commit)", bad: o.value < 0 },
        { v: be == null ? "none" : pc(be), l: "below this chance, the pilot wins" }
      ]);
      out.appendChild(el("p", "bcr-note", "The pilot costs " + w.pilotCost + "k and reuses " + w.reuse + "k of the build if Keelson scales. Scaling after a low result would give " + k1(o.pilot.badIfScaled) + ", which is why the pilot path stops instead."));
    }
    draw();
  }

  /* ---------- a6: the bench ---------- */
  function benchMode(root) {
    var body = shell(root, "The business case bench", "Pick a rung, then move anything");
    var p = B.copy(B.BASE), o = { sunk: false, cdq: false, uplift: 0 }, certain = [], ctrls = {}, flags = {};
    var pre = el("div", "mb-presets bcr-rungs"), inputs = el("div", "bcr-inputs"), tog = el("div", "mb-ctls"), out = el("div");
    B.RUNGS.forEach(function (r, i) {
      var lab = el("label", "mb-preset" + (r.id === "certain" ? " is-anti" : "") + (i === 0 ? " is-on" : ""));
      var inp = document.createElement("input"); inp.type = "radio"; inp.name = "bcr-rung"; inp.checked = i === 0;
      inp.setAttribute("aria-label", r.label);
      inp.addEventListener("change", function () {
        pre.querySelectorAll(".mb-preset").forEach(function (x) { x.classList.remove("is-on"); }); lab.classList.add("is-on"); apply(r);
      });
      lab.appendChild(inp); lab.appendChild(el("span", "mb-pname", (i + 1) + ". " + r.label)); pre.appendChild(lab);
    });
    B.KEYS.forEach(function (k) {
      ctrls[k] = slider(inputs, B.LABELS[k], B.RANGES[k][0], B.RANGES[k][1], STEP[k], p[k], function (v) { return fmtIn(k, v); }, function (v) { p[k] = v; draw(); });
    });
    flags.sunk = check(tog, "Add the 45k sunk discovery", false, function (v) { o.sunk = v; draw(); });
    flags.cdq = check(tog, "Charge the 260k CDQ fix", false, function (v) { o.cdq = v; draw(); });
    var up = slider(tog, "Optimism uplift on build", 0, 0.5, 0.05, 0, function (v) { return pc(v); }, function (v) { o.uplift = v; draw(); });
    flags.certain = check(tog, "Hold every input certain", false, function (v) { certain = v ? B.KEYS.slice() : []; draw(); });
    body.appendChild(pre); body.appendChild(inputs); body.appendChild(tog); body.appendChild(out);
    function apply(r) {
      p = B.copy(B.BASE); for (var k in r.set) p[k] = r.set[k];
      o = { sunk: !!r.opts.sunk, cdq: !!r.opts.cdq, uplift: r.opts.uplift || 0 }; certain = r.certain.slice();
      B.KEYS.forEach(function (k) { ctrls[k].set(p[k]); });
      flags.sunk.checked = o.sunk; flags.cdq.checked = o.cdq; flags.certain.checked = certain.length > 0; up.set(o.uplift);
      draw();
    }
    function draw() {
      clear(out);
      var e = B.evaluate(p, o), sim = B.simulate(p, o, certain);
      out.appendChild(el("h4", "bcr-h", "The point estimate"));
      evalMetrics(out, e);
      out.appendChild(el("h4", "bcr-h", "The range"));
      simMetrics(out, sim); histogram(out, sim);
      out.appendChild(el("h4", "bcr-h", "Which input moves it"));
      tornadoBars(out, p, o);
      out.appendChild(el("h4", "bcr-h", "Where each input breaks the case"));
      switchTable(out, p, o);
      out.appendChild(el("h4", "bcr-h", "The ladder, every rung computed"));
      out.appendChild(table(["Rung", "NPV", "IRR", "P10", "P50", "P90", "Chance NPV below zero"], B.RUNGS.map(function (r) {
        var x = B.rung(r);
        return { cells: [r.label, k1(x.npv), pc(x.irr), k1(x.p10), k1(x.p50), k1(x.p90), pc(x.pNeg)] };
      })));
    }
    draw();
  }

  var MODES = { cashflow: cashflowMode, discount: discountMode, metrics: metricsMode, tornado: tornadoMode, range: rangeMode, wait: waitMode, bench: benchMode };
  document.querySelectorAll(".bcr-widget").forEach(function (root) {
    var f = MODES[root.getAttribute("data-mode")];
    if (f) f(root);
  });
}());
