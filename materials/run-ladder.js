/* run-ladder.js - the node side of the canon: prints the same keys as bcr_reference.py.
 * Run: node materials/run-ladder.js > materials/canon-js.json */
var B = require("../assets/bcr-live.js");
var p = B.BASE, e = B.evaluate(p);
function wait(w) {
  var o = B.optionValue(p, w);
  return { commitGood: o.commit.good, commitBad: o.commit.bad, commitEV: o.commit.ev, pilotGood: o.pilot.good,
    pilotBad: o.pilot.bad, pilotBadIfScaled: o.pilot.badIfScaled, pilotEV: o.pilot.ev, value: o.value };
}
function sim(certain) { var s = B.simulate(p, {}, certain); return { p10: s.p10, p50: s.p50, p90: s.p90, mean: s.mean, pNeg: s.pNeg }; }
var sw = {};
B.KEYS.forEach(function (k) { var s = B.switching(p, k); sw[k] = s ? s.value : null; });
var rates = {};
[0.03, 0.06, 0.09, 0.12, 0.15].forEach(function (r) { rates[String(r)] = B.npvAt(e.cf, r); });
var out = {
  base: { cf: e.cf, npv: e.npv, irr: e.irr, payback: e.payback, dpayback: e.dpayback, roi: e.roi },
  sunk: B.evaluate(p, { sunk: true }).npv, cdq: B.evaluate(p, { cdq: true }).npv,
  uplift20: B.evaluate(p, { uplift: 0.2 }).npv, rates: rates,
  tornado: B.tornado(p).rows.map(function (r) { return { key: r.key, npvLow: r.npvLow, npvHigh: r.npvHigh, swing: r.swing }; }),
  switching: sw, sim: sim([]), simCertain: sim(B.KEYS), wait: wait()
};
out.quick = { npv: B.npvAt(B.QUICK.cf, 0.09), irr: B.irr(B.QUICK.cf), payback: B.payback(B.QUICK.cf, null) };
out.twoIrr = B.irrAll(B.TWO_IRR);
out.rungs = B.RUNGS.map(function (r) { var x = B.rung(r); delete x.label; return x; });
[0.3, 0.4, 0.5, 0.7].forEach(function (g) {
  var w = B.copy(B.WAIT); w.pGood = g; out["wait_p" + String(g)] = B.optionValue(p, w).value;
});
process.stdout.write(JSON.stringify(out, null, 1));
