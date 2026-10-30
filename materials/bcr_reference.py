"""bcr_reference.py - Python mirror of assets/bcr-live.js, written independently so the two can be
compared by value (materials/compare-ladder.py). Stdlib only. Every Keelson number is constructed.

Run:  python3 materials/bcr_reference.py > materials/canon-py.json
"""
from __future__ import annotations

import json
import math
import sys

BASE = {"build": 360, "run": 70, "claims": 42000, "share": 0.55, "save": 14, "leak": 4,
        "ramp": 0.5, "rate": 0.09, "years": 5}
KEYS = ["build", "run", "claims", "share", "save", "leak", "ramp", "rate", "years"]
RANGES = {"build": (330, 460), "run": (60, 100), "claims": (38000, 46000), "share": (0.45, 0.65),
          "save": (11, 16), "leak": (2.5, 6), "ramp": (0.25, 0.75), "rate": (0.07, 0.11),
          "years": (4, 6)}
BRACKET = {"build": (0, 3000), "run": (0, 400), "claims": (0, 200000), "share": (0, 1),
           "save": (0, 60), "leak": (0, 40), "ramp": (0, 1), "rate": (0, 2), "years": (1, 30)}
SUNK, CDQ, SEED, DRAWS = 45, 260, 20261030, 5000
WAIT = {"pGood": 0.55, "saveGood": 16, "saveBad": 11, "pilotCost": 80, "pilotRun": 20,
        "pilotShare": 0.25, "reuse": 50}


def js_round(x: float) -> int:
    """Math.round: halves go up."""
    return math.floor(x + 0.5)


def adoption(p: dict, t: int) -> float:
    if t == 1:
        return p["ramp"]
    if t == 2:
        return (1 + p["ramp"]) / 2
    return 1.0


def cashflows(p: dict, opts: dict | None = None) -> list[float]:
    opts = opts or {}
    c0 = -p["build"] * (1 + opts.get("uplift", 0))
    if opts.get("sunk"):
        c0 -= SUNK
    if opts.get("cdq"):
        c0 -= CDQ
    cf = [c0]
    for t in range(1, js_round(p["years"]) + 1):
        cf.append(p["claims"] * p["share"] * adoption(p, t) * (p["save"] - p["leak"]) / 1000 - p["run"])
    return cf


def npv_at(cf: list[float], r: float) -> float:
    return sum(v / (1 + r) ** t for t, v in enumerate(cf))


def irr(cf: list[float]) -> float | None:
    lo, hi = -0.99, 10.0
    flo, fhi = npv_at(cf, lo), npv_at(cf, hi)
    if flo * fhi > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        fm = npv_at(cf, mid)
        if flo * fm < 0:
            hi = mid
        else:
            lo, flo = mid, fm
    return (lo + hi) / 2


def payback(cf: list[float], r: float | None) -> float | None:
    cum = 0.0
    for t, v0 in enumerate(cf):
        v = v0 if r is None else v0 / (1 + r) ** t
        nxt = cum + v
        if t > 0 and nxt >= 0 and cum < 0:
            return (t - 1) + (-cum) / v
        if t == 0 and nxt >= 0:
            return 0.0
        cum = nxt
    return None


def evaluate(p: dict, opts: dict | None = None) -> dict:
    cf = cashflows(p, opts)
    return {"cf": cf, "npv": npv_at(cf, p["rate"]), "irr": irr(cf), "payback": payback(cf, None),
            "dpayback": payback(cf, p["rate"]), "roi": sum(cf) / -cf[0] if cf[0] < 0 else None}


def with_input(p: dict, k: str, v: float) -> dict:
    q = dict(p)
    q[k] = v
    return q


def tornado(p: dict) -> list[dict]:
    rows = []
    for k in KEYS:
        lo = evaluate(with_input(p, k, RANGES[k][0]))["npv"]
        hi = evaluate(with_input(p, k, RANGES[k][1]))["npv"]
        rows.append({"key": k, "npvLow": lo, "npvHigh": hi, "swing": abs(hi - lo)})
    rows.sort(key=lambda r: (-r["swing"], r["key"]))
    return rows


def switching(p: dict, k: str) -> float | None:
    def f(x: float) -> float:
        return evaluate(with_input(p, k, x))["npv"]

    if k == "years":
        b0 = f(p["years"]) >= 0
        y = p["years"]
        step = -1 if b0 else 1
        while BRACKET[k][0] <= y <= BRACKET[k][1]:
            if (f(y) >= 0) != b0:
                return y
            y += step
        return None
    lo, hi = BRACKET[k]
    flo, fhi = f(lo), f(hi)
    if flo * fhi > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        fm = f(mid)
        if flo * fm <= 0:
            hi = mid
        else:
            lo, flo = mid, fm
    return (lo + hi) / 2


def rng(seed: int):
    a = seed & 0xFFFFFFFF
    M = 0xFFFFFFFF

    def imul(x: int, y: int) -> int:
        return (x * y) & M

    def nxt() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & M
        t = a
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) & M)) & M
        return ((t ^ (t >> 14)) & M) / 4294967296

    return nxt


def tri(u: float, a: float, m: float, b: float) -> float:
    if b == a:
        return m
    c = (m - a) / (b - a)
    if u < c:
        return a + math.sqrt(u * (b - a) * (m - a))
    return b - math.sqrt((1 - u) * (b - a) * (b - m))


def simulate(p: dict, certain: list[str] | None = None, n: int = DRAWS, seed: int = SEED) -> dict:
    certain = certain or []
    r = rng(seed)
    out = []
    for _ in range(n):
        q = dict(p)
        for k in KEYS:
            u = r()
            if k not in certain:
                q[k] = tri(u, RANGES[k][0], p[k], RANGES[k][1])
        q["years"] = js_round(q["years"])
        out.append(evaluate(q)["npv"])
    s = sorted(out)
    qn = lambda x: s[math.floor(x * (n - 1))]  # noqa: E731
    return {"p10": qn(0.1), "p50": qn(0.5), "p90": qn(0.9), "mean": sum(out) / n,
            "pNeg": sum(1 for v in out if v < 0) / n}


def option_value(p: dict, w: dict = WAIT) -> dict:
    good = evaluate(with_input(p, "save", w["saveGood"]))["npv"]
    bad = evaluate(with_input(p, "save", w["saveBad"]))["npv"]
    commit_ev = w["pGood"] * good + (1 - w["pGood"]) * bad

    def branch(save: float, scale: bool) -> float:
        q = with_input(p, "save", save)
        cf = [-w["pilotCost"],
              w["pilotShare"] * q["claims"] * q["share"] * q["ramp"] * (q["save"] - q["leak"]) / 1000
              - w["pilotRun"]]
        if scale:
            cf[1] -= q["build"] - w["reuse"]
            cf.extend(cashflows(q)[1:])
        return npv_at(cf, p["rate"])

    pg, pb = branch(w["saveGood"], True), branch(w["saveBad"], False)
    pilot_ev = w["pGood"] * pg + (1 - w["pGood"]) * pb
    return {"commitGood": good, "commitBad": bad, "commitEV": commit_ev, "pilotGood": pg,
            "pilotBad": pb, "pilotBadIfScaled": branch(w["saveBad"], True), "pilotEV": pilot_ev,
            "value": pilot_ev - commit_ev}


QUICK = [-60, 40, 40, 40]
TWO_IRR = [-100, 235, -136]
RUNGS = [
    ("base", {}, {}, []),
    ("sponsor", {"save": 16, "share": 0.65, "build": 330, "years": 6}, {}, []),
    ("charged", {}, {"sunk": True, "cdq": True}, []),
    ("uplift", {}, {"uplift": 0.25}, []),
    ("certain", {}, {}, list(KEYS)),
]


def irr_all(cf: list[float]) -> list[float]:
    out, step = [], 0.0005
    prev = npv_at(cf, -0.9)
    i = 1
    while True:
        r = -0.9 + i * step
        if r > 3 + 1e-9:
            break
        cur = npv_at(cf, r)
        if prev == 0 or prev * cur < 0:
            lo, hi = r - step, r
            flo = npv_at(cf, lo)
            for _ in range(100):
                mid = (lo + hi) / 2
                fm = npv_at(cf, mid)
                if flo * fm <= 0:
                    hi = mid
                else:
                    lo, flo = mid, fm
            out.append((lo + hi) / 2)
        prev = cur
        i += 1
    return out


def simulate_opts(p: dict, opts: dict, certain: list[str]) -> dict:
    r = rng(SEED)
    out = []
    for _ in range(DRAWS):
        q = dict(p)
        for k in KEYS:
            u = r()
            if k not in certain:
                q[k] = tri(u, RANGES[k][0], p[k], RANGES[k][1])
        q["years"] = js_round(q["years"])
        out.append(evaluate(q, opts)["npv"])
    s = sorted(out)
    qn = lambda x: s[math.floor(x * (DRAWS - 1))]  # noqa: E731
    return {"p10": qn(0.1), "p50": qn(0.5), "p90": qn(0.9), "pNeg": sum(1 for v in out if v < 0) / DRAWS}


def rungs() -> list[dict]:
    res = []
    for rid, st, opts, certain in RUNGS:
        p = {**BASE, **st}
        e = evaluate(p, opts)
        s = simulate_opts(p, opts, certain)
        res.append({"id": rid, "npv": e["npv"], "irr": e["irr"], "payback": e["payback"], **s})
    return res


def canon() -> dict:
    p = BASE
    e = evaluate(p)
    out = {"base": {k: e[k] for k in ("cf", "npv", "irr", "payback", "dpayback", "roi")},
           "sunk": evaluate(p, {"sunk": True})["npv"], "cdq": evaluate(p, {"cdq": True})["npv"],
           "uplift20": evaluate(p, {"uplift": 0.2})["npv"],
           "rates": {str(r): npv_at(e["cf"], r) for r in (0.03, 0.06, 0.09, 0.12, 0.15)},
           "tornado": tornado(p),
           "switching": {k: switching(p, k) for k in KEYS},
           "sim": simulate(p), "simCertain": simulate(p, KEYS),
           "wait": option_value(p)}

    out["quick"] = {"npv": npv_at(QUICK, 0.09), "irr": irr(QUICK), "payback": payback(QUICK, None)}
    out["twoIrr"] = irr_all(TWO_IRR)
    out["rungs"] = rungs()
    for g in (0.3, 0.4, 0.5, 0.7):
        out["wait_p" + str(g)] = option_value(p, {**WAIT, "pGood": g})["value"]
    return out


if __name__ == "__main__":
    json.dump(canon(), sys.stdout, indent=1)
