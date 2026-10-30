/* bcr-live.js - the business case engine for learn-business-cases-roi-with-phoebe.
 * Pure functions, no DOM. Runs in the browser (window.BCR) and in node (module.exports).
 * materials/bcr_reference.py mirrors every function; materials/compare-ladder.py checks the two
 * agree by value. Every Keelson Mutual number is CONSTRUCTED for teaching (thousands, pre-tax,
 * nominal). The arithmetic is real: NPV, IRR, payback, tornado, switching values and the seeded
 * simulation are computed, never looked up. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BCR = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Claims fast-track triage (CFT) at Keelson Mutual. Units: build/run/sunk/cdq in thousands;
   * claims per year; share and ramp as fractions; save/leak per fast-tracked claim in currency
   * units; rate as a fraction; years whole. */
  var BASE = { build: 360, run: 70, claims: 42000, share: 0.55, save: 14, leak: 4, ramp: 0.5, rate: 0.09, years: 5 };
  var KEYS = ["build", "run", "claims", "share", "save", "leak", "ramp", "rate", "years"];
  var LABELS = {
    build: "Build cost (year 0)", run: "Run cost per year", claims: "Simple claims per year",
    share: "Share fast-tracked", save: "Saving per fast-tracked claim", leak: "Leakage per fast-tracked claim",
    ramp: "Year-1 adoption", rate: "Discount rate", years: "Years of benefit"
  };
  var RANGES = {
    build: [330, 460], run: [60, 100], claims: [38000, 46000], share: [0.45, 0.65], save: [11, 16],
    leak: [2.5, 6], ramp: [0.25, 0.75], rate: [0.07, 0.11], years: [4, 6]
  };
  /* where to search for a switching value (wide, outside the plausible range on purpose) */
  var BRACKET = {
    build: [0, 3000], run: [0, 400], claims: [0, 200000], share: [0, 1], save: [0, 60],
    leak: [0, 40], ramp: [0, 1], rate: [0, 2], years: [1, 30]
  };
  var SUNK = 45;          /* discovery work already paid for */
  var CDQ = 260;          /* claims data quality fix that CFT depends on */
  var SEED = 20261030;
  var DRAWS = 5000;

  function copy(o) { var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k]; return r; }
  function withInput(p, k, v) { var q = copy(p); q[k] = v; return q; }

  function adoption(p, t) {           /* fraction of steady state reached in year t */
    if (t === 1) return p.ramp;
    if (t === 2) return (1 + p.ramp) / 2;
    return 1;
  }
  function netPerClaim(p) { return p.save - p.leak; }

  /* opts: { sunk: bool, cdq: bool, uplift: fraction added to build } */
  function cashflows(p, opts) {
    opts = opts || {};
    var yrs = Math.round(p.years), cf = [];
    var c0 = -p.build * (1 + (opts.uplift || 0));
    if (opts.sunk) c0 -= SUNK;
    if (opts.cdq) c0 -= CDQ;
    cf.push(c0);
    for (var t = 1; t <= yrs; t++) {
      cf.push(p.claims * p.share * adoption(p, t) * netPerClaim(p) / 1000 - p.run);
    }
    return cf;
  }
  function npvAt(cf, r) {
    var s = 0;
    for (var t = 0; t < cf.length; t++) s += cf[t] / Math.pow(1 + r, t);
    return s;
  }
  function signChanges(cf) {
    var n = 0, prev = 0;
    for (var t = 0; t < cf.length; t++) {
      var s = cf[t] > 0 ? 1 : cf[t] < 0 ? -1 : 0;
      if (s !== 0) { if (prev !== 0 && s !== prev) n++; prev = s; }
    }
    return n;
  }
  /* IRR by bisection on [-0.99, 10]; null when NPV does not change sign there */
  function irr(cf) {
    var lo = -0.99, hi = 10, flo = npvAt(cf, lo), fhi = npvAt(cf, hi);
    if (flo === 0) return lo;
    if (flo * fhi > 0) return null;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2, fm = npvAt(cf, mid);
      if (fm === 0) return mid;
      if (flo * fm < 0) { hi = mid; } else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
  }
  /* years until cumulative cash turns non-negative, linear within the year; null if never */
  function payback(cf, r) {
    var cum = 0;
    for (var t = 0; t < cf.length; t++) {
      var v = r == null ? cf[t] : cf[t] / Math.pow(1 + r, t);
      var next = cum + v;
      if (t > 0 && next >= 0 && cum < 0) return (t - 1) + (-cum) / v;
      if (t === 0 && next >= 0) return 0;
      cum = next;
    }
    return null;
  }
  function simpleRoi(cf) {           /* undiscounted net gain over the upfront cost */
    var gain = 0;
    for (var t = 0; t < cf.length; t++) gain += cf[t];
    return cf[0] < 0 ? gain / -cf[0] : null;
  }
  function evaluate(p, opts) {
    var cf = cashflows(p, opts);
    return {
      cf: cf, npv: npvAt(cf, p.rate), irr: irr(cf), payback: payback(cf, null),
      dpayback: payback(cf, p.rate), roi: simpleRoi(cf), signChanges: signChanges(cf)
    };
  }

  /* tornado: each input to its low then high, others at base; sorted by swing */
  function tornado(p, opts) {
    var base = evaluate(p, opts).npv, rows = [];
    KEYS.forEach(function (k) {
      var lo = evaluate(withInput(p, k, RANGES[k][0]), opts).npv;
      var hi = evaluate(withInput(p, k, RANGES[k][1]), opts).npv;
      rows.push({ key: k, label: LABELS[k], low: RANGES[k][0], high: RANGES[k][1], npvLow: lo, npvHigh: hi, swing: Math.abs(hi - lo) });
    });
    rows.sort(function (a, b) { return b.swing - a.swing || (a.key < b.key ? -1 : 1); });
    return { base: base, rows: rows };
  }

  /* switching value: the input value at which NPV = 0, others at base; null if none in bracket */
  function switching(p, k, opts) {
    var f = function (x) { return evaluate(withInput(p, k, x), opts).npv; };
    var lo = BRACKET[k][0], hi = BRACKET[k][1];
    if (k === "years") {             /* whole years: first year count at which the sign flips */
      var b0 = f(p.years) >= 0;
      var step = b0 ? -1 : 1;
      for (var y = p.years; y >= lo && y <= hi; y += step) {
        if ((f(y) >= 0) !== b0) return { value: y, whole: true };
      }
      return null;
    }
    var flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) return null;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2, fm = f(mid);
      if (flo * fm <= 0) { hi = mid; } else { lo = mid; flo = fm; }
    }
    return { value: (lo + hi) / 2, whole: false };
  }
  function switchingTable(p, opts) {
    return KEYS.map(function (k) {
      var s = switching(p, k, opts);
      return { key: k, label: LABELS[k], base: p[k], value: s ? s.value : null, change: s ? (s.value - p[k]) / p[k] : null };
    });
  }

  /* mulberry32: identical in materials/bcr_reference.py */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tri(u, a, m, b) {         /* triangular inverse CDF */
    if (b === a) return m;
    var c = (m - a) / (b - a);
    return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
  }
  function quant(sorted, q) { return sorted[Math.floor(q * (sorted.length - 1))]; }
  /* certain: list of keys held at base (the break button holds all of them) */
  function simulate(p, opts, certain, n, seed) {
    n = n || DRAWS; certain = certain || [];
    var r = rng(seed == null ? SEED : seed), out = [], neg = 0;
    for (var i = 0; i < n; i++) {
      var q = copy(p);
      for (var j = 0; j < KEYS.length; j++) {
        var k = KEYS[j], u = r();
        if (certain.indexOf(k) === -1) q[k] = tri(u, RANGES[k][0], p[k], RANGES[k][1]);
      }
      q.years = Math.round(q.years);
      var v = evaluate(q, opts).npv;
      if (v < 0) neg++;
      out.push(v);
    }
    var s = out.slice().sort(function (a, b) { return a - b; }), mean = 0;
    for (i = 0; i < n; i++) mean += out[i];
    return { n: n, p10: quant(s, 0.1), p50: quant(s, 0.5), p90: quant(s, 0.9), mean: mean / n, pNeg: neg / n, sorted: s };
  }

  /* the option to wait: commit now, or pilot one region for a year and scale only if it works */
  var WAIT = { pGood: 0.55, saveGood: 16, saveBad: 11, pilotCost: 80, pilotRun: 20, pilotShare: 0.25, reuse: 50 };
  function commitNow(p, w) {
    w = w || WAIT;
    var good = evaluate(withInput(p, "save", w.saveGood)).npv;
    var bad = evaluate(withInput(p, "save", w.saveBad)).npv;
    return { good: good, bad: bad, ev: w.pGood * good + (1 - w.pGood) * bad };
  }
  function pilotFirst(p, w) {
    w = w || WAIT;
    function branch(save, scale) {
      var q = withInput(p, "save", save), cf = [-w.pilotCost];
      cf.push(w.pilotShare * q.claims * q.share * q.ramp * netPerClaim(q) / 1000 - w.pilotRun);
      if (scale) {
        cf[1] -= (q.build - w.reuse);
        var full = cashflows(q);
        for (var t = 1; t < full.length; t++) cf.push(full[t]);
      }
      return { cf: cf, npv: npvAt(cf, p.rate) };
    }
    var good = branch(w.saveGood, true), bad = branch(w.saveBad, false), badScaled = branch(w.saveBad, true);
    var ev = w.pGood * good.npv + (1 - w.pGood) * bad.npv;
    return { good: good.npv, bad: bad.npv, badIfScaled: badScaled.npv, ev: ev };
  }
  function optionValue(p, w) {
    var c = commitNow(p, w), f = pilotFirst(p, w);
    return { commit: c, pilot: f, value: f.ev - c.ev };
  }


  /* a second, smaller project for the NPV-versus-IRR ranking clash (Analyst session 3) */
  var QUICK = { name: "Rules-based triage (quick win)", cf: [-60, 40, 40, 40] };
  /* every IRR on a grid from -90% to 300%: more than one when cash flows change sign twice */
  function irrAll(cf) {
    var out = [], step = 0.0005, prev = npvAt(cf, -0.9);
    for (var i0 = 1; -0.9 + i0 * step <= 3 + 1e-9; i0++) {
      var r = -0.9 + i0 * step, cur = npvAt(cf, r);
      if (prev === 0 || prev * cur < 0) {
        var lo = r - step, hi = r, flo = npvAt(cf, lo);
        for (var i = 0; i < 100; i++) {
          var mid = (lo + hi) / 2, fm = npvAt(cf, mid);
          if (flo * fm <= 0) { hi = mid; } else { lo = mid; flo = fm; }
        }
        out.push((lo + hi) / 2);
      }
      prev = cur;
    }
    return out;
  }
  /* a decommissioning example with two IRRs: build, earn, then pay to unwind */
  var TWO_IRR = [-100, 235, -136];

  /* the bench ladder (Analyst session 6): each rung changes one thing */
  var RUNGS = [
    { id: "base", label: "Base case", set: {}, opts: {}, certain: [] },
    { id: "sponsor", label: "The sponsor's case", set: { save: 16, share: 0.65, build: 330, years: 6 }, opts: {}, certain: [] },
    { id: "charged", label: "Sunk cost and CDQ charged", set: {}, opts: { sunk: true, cdq: true }, certain: [] },
    { id: "uplift", label: "Optimism uplift on build, +25%", set: {}, opts: { uplift: 0.25 }, certain: [] },
    { id: "certain", label: "Every input held certain (break)", set: {}, opts: {}, certain: KEYS.slice() }
  ];
  function rung(r) {
    var p = copy(BASE);
    for (var k in r.set) if (Object.prototype.hasOwnProperty.call(r.set, k)) p[k] = r.set[k];
    var e = evaluate(p, r.opts), s = simulate(p, r.opts, r.certain);
    return { id: r.id, label: r.label, npv: e.npv, irr: e.irr, payback: e.payback, p10: s.p10, p50: s.p50, p90: s.p90, pNeg: s.pNeg };
  }

  return {
    BASE: BASE, KEYS: KEYS, LABELS: LABELS, RANGES: RANGES, BRACKET: BRACKET, SUNK: SUNK, CDQ: CDQ,
    SEED: SEED, DRAWS: DRAWS, WAIT: WAIT,
    copy: copy, withInput: withInput, adoption: adoption, cashflows: cashflows, npvAt: npvAt,
    signChanges: signChanges, irr: irr, payback: payback, simpleRoi: simpleRoi, evaluate: evaluate,
    tornado: tornado, switching: switching, switchingTable: switchingTable, rng: rng, tri: tri,
    simulate: simulate, commitNow: commitNow, pilotFirst: pilotFirst, optionValue: optionValue,
    QUICK: QUICK, irrAll: irrAll, TWO_IRR: TWO_IRR, RUNGS: RUNGS, rung: rung
  };
}));
