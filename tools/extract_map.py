"""Build data/europe.js from jsvectormap's world.js (MIT, (c) 2020 Mustafa Omar).

Usage:  python tools/extract_map.py
Edit PLAYABLE to change which countries appear in the quiz.
"""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "world.js"
SOURCE_URL = "https://raw.githubusercontent.com/themustafaomar/jsvectormap/08283f02227fbf6b63b8da34a43069adfd89bdc7/packages/maps/src/world.js"
OUT = ROOT / "data" / "europe.js"

PLAYABLE = [
    "GB", "IE", "IS", "NO", "SE", "FI", "DK", "NL", "BE", "FR", "ES", "PT", "DE",
    "CH", "AT", "IT", "PL", "CZ", "HU", "RO", "BG", "GR", "HR", "UA", "RS",
    "EE", "LV", "LT", "SK", "SI", "BA",
    "AL", "MK", "ME", "MD", "LU", "XK",
]

# The source uses placeholder keys (_0, _1, ...) for some territories.
CODE_BY_NAME = {"Kosovo": "XK", "N. Cyprus": "CY-N", "Somaliland": "SO-S"}

# Dutch display names shown in the game (source names are English).
NAMES = {
    "GB": "Verenigd Koninkrijk", "IE": "Ierland", "IS": "IJsland", "NO": "Noorwegen",
    "SE": "Zweden", "FI": "Finland", "DK": "Denemarken", "NL": "Nederland",
    "BE": "België", "FR": "Frankrijk", "ES": "Spanje", "PT": "Portugal",
    "DE": "Duitsland", "CH": "Zwitserland", "AT": "Oostenrijk", "IT": "Italië",
    "PL": "Polen", "CZ": "Tsjechië", "HU": "Hongarije", "RO": "Roemenië",
    "BG": "Bulgarije", "GR": "Griekenland", "HR": "Kroatië", "UA": "Oekraïne",
    "RS": "Servië", "EE": "Estland", "LV": "Letland", "LT": "Litouwen",
    "SK": "Slowakije", "SI": "Slovenië", "BA": "Bosnië en Herzegovina",
    "AL": "Albanië", "MK": "Noord-Macedonië", "ME": "Montenegro",
    "MD": "Moldavië", "LU": "Luxemburg", "XK": "Kosovo",
}

# Map-coordinate frame (source space is 900 x ~441) used to drop far-away
# overseas parts (e.g. French Guiana, Svalbard) from playable countries.
EUROPE_FRAME = (340, 50, 560, 210)  # minx, miny, maxx, maxy

PAD = 0.04


def load_source():
    if not SOURCE.exists():
        urllib.request.urlretrieve(SOURCE_URL, SOURCE)
    text = SOURCE.read_text(encoding="utf-8")
    pattern = re.compile(r'"?([A-Z]{2}|_\d+)"?:\{path:"([^"]+)",name:"([^"]+)"\}')
    return {
        CODE_BY_NAME.get(name, code): {"d": d, "name": name}
        for code, d, name in pattern.findall(text)
    }


def parse_subpaths(d):
    """Return list of polygons (lists of absolute points). Source uses only M, l, Z."""
    polys = []
    for chunk in re.findall(r"M[^M]*", d):
        nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?(?:e-?\d+)?", chunk)]
        x, y = nums[0], nums[1]
        pts = [(x, y)]
        for i in range(2, len(nums) - 1, 2):
            x += nums[i]
            y += nums[i + 1]
            pts.append((x, y))
        polys.append((chunk.strip(), pts))
    return polys


def bbox(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)


def area_centroid(pts):
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    a /= 2
    if abs(a) < 1e-9:
        b = bbox(pts)
        return 0.0, ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
    return abs(a), (cx / (6 * a), cy / (6 * a))


def in_frame(pt):
    x, y = pt
    fx0, fy0, fx1, fy1 = EUROPE_FRAME
    return fx0 <= x <= fx1 and fy0 <= y <= fy1


def overlaps(b, v):
    return not (b[2] < v[0] or b[0] > v[2] or b[3] < v[1] or b[1] > v[3])


def main():
    world = load_source()
    missing = [c for c in PLAYABLE if c not in world]
    if missing:
        raise SystemExit(f"Codes not in source: {missing}")

    playable = []
    all_pts = []
    for code in PLAYABLE:
        subs = parse_subpaths(world[code]["d"])
        kept = []
        for chunk, pts in subs:
            _, c = area_centroid(pts)
            if in_frame(c):
                kept.append((chunk, pts))
            else:
                print(f"  dropped outlying part of {code} at {c[0]:.0f},{c[1]:.0f}")
        largest = max(kept, key=lambda s: area_centroid(s[1])[0])
        _, (cx, cy) = area_centroid(largest[1])
        pts = [p for _, ps in kept for p in ps]
        b = bbox(pts)
        all_pts.extend(pts)
        print(f"{code} {world[code]['name']:<16} bbox {b[0]:.0f},{b[1]:.0f} - {b[2]:.0f},{b[3]:.0f}")
        playable.append({
            "code": code,
            "name": NAMES.get(code, world[code]["name"]),
            "d": "".join(ch for ch, _ in kept),
            "cx": round(cx, 2),
            "cy": round(cy, 2),
        })

    x0, y0, x1, y1 = bbox(all_pts)
    w, h = x1 - x0, y1 - y0
    vb = (x0 - w * PAD, y0 - h * PAD, w * (1 + 2 * PAD), h * (1 + 2 * PAD))
    view = (vb[0], vb[1], vb[0] + vb[2], vb[1] + vb[3])

    context = []
    for code, entry in world.items():
        if code in PLAYABLE:
            continue
        subs = [(ch, pts) for ch, pts in parse_subpaths(entry["d"]) if overlaps(bbox(pts), view)]
        if subs:
            context.append({"code": code, "d": "".join(ch for ch, _ in subs)})

    data = {
        "viewBox": " ".join(f"{v:.2f}" for v in vb),
        "playable": playable,
        "context": context,
    }
    header = (
        "// GENERATED by tools/extract_map.py - do not edit by hand.\n"
        "// Map path data from jsvectormap (https://github.com/themustafaomar/jsvectormap),\n"
        "// Copyright (c) 2020 Mustafa Omar, MIT License. See THIRD_PARTY_NOTICES.md.\n"
    )
    OUT.write_text(header + "export default " + json.dumps(data, separators=(",", ":"), ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"\nviewBox {data['viewBox']}; {len(playable)} playable, {len(context)} context -> {OUT}")


if __name__ == "__main__":
    main()
