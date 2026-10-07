"""Build a Font Awesome subset with only the icons the site uses.

Run after adding a new icon (needs: pip install fonttools brotli):  python3 scripts/fa_subset.py .
"""
import re, subprocess, sys, pathlib
ROOT = pathlib.Path(sys.argv[1])
SRC = ROOT / "scripts/fontawesome-src"
CSS = SRC / "fontawesome.min.css"
FONTS = ROOT / "public/frontend/assets/fonts/fontawesome"
OUT_CSS = ROOT / "public/frontend/assets/css/fontawesome.subset.css"

# 1. Icon names referenced anywhere in the code (pages, components, theme JS, inline helpers).
sources = [p for d in ["app", "components", "lib"] for p in (ROOT / d).rglob("*") if p.suffix in {".tsx", ".ts", ".css"}]
sources += [ROOT / "public/frontend/assets/js/main.v2.js", ROOT / "public/js/site.js"]
used = set()
for p in sources:
    used |= set(re.findall(r"fa-([a-z0-9]+(?:-[a-z0-9]+)*)", p.read_text(errors="ignore")))

css = CSS.read_text()
# 2. Split the minified CSS into top-level rules.
rules, depth, start = [], 0, 0
for i, ch in enumerate(css):
    if ch == "{": depth += 1
    elif ch == "}":
        depth -= 1
        if depth == 0:
            rules.append(css[start:i + 1]); start = i + 1
header = rules[0][: rules[0].index("*/") + 2] if rules and rules[0].lstrip().startswith("/*") else ""
if header: rules[0] = rules[0][len(header):]

ICON = re.compile(r"^(\.fa-[a-z0-9-]+:(?:before|after)(,|$))+")
kept, codepoints, icons_kept = [], set(), set()
for r in rules:
    sel = r[: r.index("{")].strip()
    if sel.startswith("@font-face"):
        if "Duotone" in r or "fa-thin" in r: continue
        r = re.sub(r',url\([^)]*\.ttf\) format\("truetype"\)', "", r)
        r = r.replace(".woff2)", ".subset.woff2)")
        kept.append(r); continue
    parts = [s for s in sel.split(",")]
    if all(re.fullmatch(r"\.fa-[a-z0-9-]+:(before|after)", s) for s in parts):
        if any(s.endswith(":after") for s in parts): continue  # duotone second layer, not used
        names = [s[4:s.index(":")] for s in parts]
        keep = [s for s, n in zip(parts, names) if n in used]
        if not keep: continue
        icons_kept |= {n for n in names if n in used}
        body = r[r.index("{"):]
        codepoints |= {int(h, 16) for h in re.findall(r"\\([0-9a-f]{4})", body)}
        kept.append(",".join(keep) + body); continue
    if re.search(r"\.fad|duotone|fa-thin|\.fat\b", sel) and not re.search(r"\.fa[lrsb]\b|\.fa-(light|regular|solid|brands)\b", sel):
        continue
    kept.append(r)

# 3. Glyphs the theme stylesheets use directly via content:"\fxxx".
for p in [ROOT / "public/frontend/assets/css/style.css", ROOT / "public/css/custom.css"]:
    codepoints |= {int(h, 16) for h in re.findall(r"\\([ef][0-9a-f]{3})\b", p.read_text())}

missing = sorted(n for n in used if n not in icons_kept and not re.fullmatch(r"(\d+x|2xs|xs|sm|lg|xl|2xl|fw|ul|li|border|spin|pulse|beat|fade|bounce|flip|shake|rotate-\d+|inverse|stack|stack-1x|stack-2x|light|regular|solid|brands|duotone|thin|sharp)", n))
OUT_CSS.write_text(header + "\n/* Subset: only the icons used on this site. Regenerate with: python3 scripts/fa_subset.py . when adding icons. */\n" + "".join(kept))
uni = ",".join(f"U+{c:04X}" for c in sorted(codepoints))
for name in ["fa-light-300", "fa-regular-400", "fa-solid-900", "fa-brands-400"]:
    subprocess.run(["pyftsubset", str(SRC / f"{name}.ttf"), f"--unicodes={uni}", "--flavor=woff2", "--layout-features=*",
                    f"--output-file={FONTS / (name + '.subset.woff2')}"], check=True)
print("icons used:", len(used), "kept:", len(icons_kept), "glyphs:", len(codepoints))
print("names with no glyph rule (utility classes or typos):", missing)
print("css bytes:", OUT_CSS.stat().st_size)
