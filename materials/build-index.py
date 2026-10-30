#!/usr/bin/env python3
"""Writes index.html (landing page) with the knowledge map data serialised by json.dumps.
Internal build script; never linked from an audience page."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
B = [("b1-what-a-case-is-for", "What a business\ncase is for", "#34D399", ["Written to decide", "With versus without", "The option ladder"]),
     ("b2-reading-a-case-like-a-cfo", "Reading a case\nlike a CFO", "#34D399", ["Three questions", "The IRR flatters", "Hurdle is a policy"]),
     ("b3-the-assumption-doing-the-work", "The assumption\ndoing the work", "#FBBF24", ["Optimism bias", "Reading a tornado", "Switching values"]),
     ("b4-after-the-yes", "After the yes", "#FB923C", ["Benefit owners", "The register", "Stage gates"])]
A = [("a1-only-the-cash-that-changes", "Only the cash\nthat changes", "#34D399", ["With minus without", "Sunk and opportunity", "Shared costs"]),
     ("a2-time-value-and-the-hurdle-rate", "Time value and\nthe hurdle rate", "#34D399", ["Discount factors", "The NPV profile", "Social vs company"]),
     ("a3-npv-irr-and-payback", "NPV, IRR\nand payback", "#FBBF24", ["The crossover rate", "Two IRRs", "Payback's blind spot"]),
     ("a4-swing-every-assumption", "Swing every\nassumption", "#FBBF24", ["One at a time", "The tornado", "Switching values"]),
     ("a5-the-range-and-the-option-to-wait", "The range and\nthe option to wait", "#FB923C", ["Seeded draws", "Chance of loss", "Pilot first"]),
     ("a6-the-business-case-bench", "The business\ncase bench", "#F87171", ["Five rungs", "Break it", "One sentence"])]
MM = {"title": "Business cases\n& ROI", "centerColor": "#2F0F3B",
      "sessions": [{"label": s[1], "href": "courses/%s.html" % s[0], "color": s[2],
                    "concepts": [{"label": c, "href": "courses/%s.html" % s[0]} for c in s[3]]} for s in B + A]}
tpl = open(os.path.join(HERE, "index.template.html")).read()
out = tpl.replace("/*MINDMAP*/", "window.MINDMAP_DATA = " + json.dumps(MM, indent=2) + ";")
open(os.path.join(HERE, "..", "index.html"), "w").write(out)
print("index.html written")
