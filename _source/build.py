# Re-assemble the HTML pages from _source/src + _source/partials.
# Run from the repo root:  python _source/build.py
import os
B = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(B)
rd = lambda p: open(os.path.join(B, p), encoding="utf-8").read()
H, N, F = rd("partials/head.html"), rd("partials/nav.html"), rd("partials/foot.html")
for f in os.listdir(os.path.join(B, "src")):
    s = rd("src/" + f).replace("{{HEAD}}", H).replace("{{NAV}}", N).replace("{{FOOT}}", F)
    open(os.path.join(R, f), "w", encoding="utf-8").write(s); print("built", f)
