"""Build data/<region>.js for every region in REGIONS from jsvectormap's world.js
(MIT, (c) 2020 Mustafa Omar) and download any missing flags/<code>.svg from
flag-icons (MIT, (c) 2013 Panayiotis Lipiridis).

Usage:  python tools/extract_map.py
Edit a region's "playable" list (and NAMES) to change which countries appear.
"""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "world.js"
SOURCE_URL = "https://raw.githubusercontent.com/themustafaomar/jsvectormap/08283f02227fbf6b63b8da34a43069adfd89bdc7/packages/maps/src/world.js"
DATA_DIR = ROOT / "data"
FLAGS_DIR = ROOT / "flags"
FLAG_URL = "https://raw.githubusercontent.com/lipis/flag-icons/086f7e97d657358203916dbe84f61c2bccaa81eb/flags/4x3/{code}.svg"

# "frame" (minx, miny, maxx, maxy in source coordinates, 900 x ~441) keeps only the
# parts of playable countries whose centre lies inside it, dropping far-away pieces
# (French Guiana, Svalbard, ...). "exclude" boxes drop pieces inside the frame.
REGIONS = {
    "europa": {
        "playable": [
            "GB", "IE", "IS", "NO", "SE", "FI", "DK", "NL", "BE", "FR", "ES", "PT", "DE",
            "CH", "AT", "IT", "PL", "CZ", "HU", "RO", "BG", "GR", "HR", "UA", "RS",
            "EE", "LV", "LT", "SK", "SI", "BA",
            "AL", "MK", "ME", "MD", "LU", "XK", "CY", "BY", "RU",
        ],
        "frame": (340, 50, 560, 210),
        "partial": ["RU"],
    },
    "noord-amerika": {
        "playable": [
            "CA", "US", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA",
            "CU", "JM", "HT", "DO", "BS", "TT",
        ],
        "frame": (0, 0, 300, 270),
        "exclude": [(0, 200, 100, 260)],  # Hawaii
    },
    "zuid-amerika": {
        "playable": ["CO", "VE", "GY", "SR", "EC", "PE", "BR", "BO", "PY", "UY", "AR", "CL"],
        "frame": (200, 245, 345, 445),
    },
    "afrika": {
        "playable": [
            "MA", "EH", "DZ", "TN", "LY", "EG", "MR", "ML", "NE", "TD", "SD", "ER",
            "SN", "GM", "GW", "GN", "SL", "LR", "CI", "BF", "GH", "TG", "BJ", "NG",
            "CM", "CF", "SS", "ET", "DJ", "SO", "GQ", "GA", "CG", "CD", "UG", "KE",
            "RW", "BI", "TZ", "AO", "ZM", "MW", "MZ", "ZW", "MG", "NA", "BW", "ZA",
            "SZ", "LS",
        ],
        "frame": (360, 180, 560, 385),
    },
    "west-azie": {
        "playable": [
            "TR", "SY", "LB", "IL", "PS", "JO", "IQ", "IR", "SA", "KW", "QA", "AE",
            "OM", "YE", "GE", "AM", "AZ", "KZ", "UZ", "TM", "TJ", "KG",
        ],
        "frame": (480, 120, 620, 265),
    },
    "oost-azie": {
        "playable": [
            "AF", "PK", "IN", "NP", "BT", "BD", "LK", "CN", "MN", "KP", "KR", "JP",
            "TW", "MM", "LA", "VN", "TH", "KH", "MY", "ID", "PH", "BN", "TL",
        ],
        "frame": (570, 120, 800, 320),
    },
}

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
    "CA": "Canada", "US": "Verenigde Staten", "MX": "Mexico", "GT": "Guatemala",
    "BZ": "Belize", "SV": "El Salvador", "HN": "Honduras", "NI": "Nicaragua",
    "CR": "Costa Rica", "PA": "Panama", "CU": "Cuba", "JM": "Jamaica",
    "HT": "Haïti", "DO": "Dominicaanse Republiek", "BS": "Bahama's",
    "TT": "Trinidad en Tobago",
    "CO": "Colombia", "VE": "Venezuela", "GY": "Guyana", "SR": "Suriname",
    "EC": "Ecuador", "PE": "Peru", "BR": "Brazilië", "BO": "Bolivia",
    "PY": "Paraguay", "UY": "Uruguay", "AR": "Argentinië", "CL": "Chili",
    "CY": "Cyprus", "BY": "Belarus", "RU": "Rusland",
    "MA": "Marokko", "EH": "Westelijke Sahara", "DZ": "Algerije", "TN": "Tunesië",
    "LY": "Libië", "EG": "Egypte", "MR": "Mauritanië", "ML": "Mali", "NE": "Niger",
    "TD": "Tsjaad", "SD": "Soedan", "ER": "Eritrea", "SN": "Senegal", "GM": "Gambia",
    "GW": "Guinee-Bissau", "GN": "Guinee", "SL": "Sierra Leone", "LR": "Liberia",
    "CI": "Ivoorkust", "BF": "Burkina Faso", "GH": "Ghana", "TG": "Togo", "BJ": "Benin",
    "NG": "Nigeria", "CM": "Kameroen", "CF": "Centraal-Afrikaanse Republiek",
    "SS": "Zuid-Soedan", "ET": "Ethiopië", "DJ": "Djibouti", "SO": "Somalië",
    "GQ": "Equatoriaal-Guinea", "GA": "Gabon", "CG": "Congo-Brazzaville",
    "CD": "Congo-Kinshasa", "UG": "Oeganda", "KE": "Kenia", "RW": "Rwanda",
    "BI": "Burundi", "TZ": "Tanzania", "AO": "Angola", "ZM": "Zambia", "MW": "Malawi",
    "MZ": "Mozambique", "ZW": "Zimbabwe", "MG": "Madagaskar", "NA": "Namibië",
    "BW": "Botswana", "ZA": "Zuid-Afrika", "SZ": "Eswatini", "LS": "Lesotho",
    "TR": "Turkije", "SY": "Syrië", "LB": "Libanon", "IL": "Israël", "PS": "Palestina",
    "JO": "Jordanië", "IQ": "Irak", "IR": "Iran", "SA": "Saoedi-Arabië", "KW": "Koeweit",
    "QA": "Qatar", "AE": "Verenigde Arabische Emiraten", "OM": "Oman", "YE": "Jemen",
    "GE": "Georgië", "AM": "Armenië", "AZ": "Azerbeidzjan", "KZ": "Kazachstan",
    "UZ": "Oezbekistan", "TM": "Turkmenistan", "TJ": "Tadzjikistan", "KG": "Kirgizië",
    "AF": "Afghanistan", "PK": "Pakistan", "IN": "India", "NP": "Nepal", "BT": "Bhutan",
    "BD": "Bangladesh", "LK": "Sri Lanka", "CN": "China", "MN": "Mongolië",
    "KP": "Noord-Korea", "KR": "Zuid-Korea", "JP": "Japan", "TW": "Taiwan",
    "MM": "Myanmar", "LA": "Laos", "VN": "Vietnam", "TH": "Thailand", "KH": "Cambodja",
    "MY": "Maleisië", "ID": "Indonesië", "PH": "Filipijnen", "BN": "Brunei",
    "TL": "Oost-Timor",
}

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


def inside(pt, box):
    x, y = pt
    return box[0] <= x <= box[2] and box[1] <= y <= box[3]


def keep_part(pt, region):
    return inside(pt, region["frame"]) and not any(inside(pt, b) for b in region.get("exclude", []))


def overlaps(b, v):
    return not (b[2] < v[0] or b[0] > v[2] or b[3] < v[1] or b[1] > v[3])


def main():
    world = load_source()
    all_codes = []
    for key, region in REGIONS.items():
        print(f"== {key}")
        build_region(world, key, region)
        all_codes += region["playable"]
    fetch_flags(all_codes)


def build_region(world, key, region):
    codes = region["playable"]
    missing = [c for c in codes if c not in world]
    if missing:
        raise SystemExit(f"Codes not in source: {missing}")

    partial = region.get("partial", [])
    playable = []
    all_pts = []
    for code in codes:
        if code in partial:
            continue
        subs = parse_subpaths(world[code]["d"])
        kept = []
        for chunk, pts in subs:
            _, c = area_centroid(pts)
            if keep_part(c, region):
                kept.append((chunk, pts))
            else:
                print(f"  dropped outlying part of {code} at {c[0]:.0f},{c[1]:.0f}")
        largest = max(kept, key=lambda s: area_centroid(s[1])[0])
        _, (cx, cy) = area_centroid(largest[1])
        pts = [p for _, ps in kept for p in ps]
        b = bbox(pts)
        all_pts.extend(pts)
        print(f"{code} {world[code]['name']:<22} bbox {b[0]:.0f},{b[1]:.0f} - {b[2]:.0f},{b[3]:.0f}")
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

    # "partial" countries (Russia in Europa) are playable but don't widen the map:
    # keep the parts that reach into the view and put the ring on the visible part.
    for code in partial:
        visible = [(ch, pts) for ch, pts in parse_subpaths(world[code]["d"]) if overlaps(bbox(pts), view)]
        largest = max(visible, key=lambda s: area_centroid(s[1])[0])
        b = bbox(largest[1])
        cx = (max(b[0], view[0]) + min(b[2], view[2])) / 2
        cy = (max(b[1], view[1]) + min(b[3], view[3])) / 2
        print(f"{code} {world[code]['name']:<22} partial, {len(visible)} visible parts, ring at {cx:.0f},{cy:.0f}")
        playable.append({
            "code": code,
            "name": NAMES.get(code, world[code]["name"]),
            "d": "".join(ch for ch, _ in visible),
            "cx": round(cx, 2),
            "cy": round(cy, 2),
        })
    playable.sort(key=lambda c: codes.index(c["code"]))

    context = []
    for code, entry in world.items():
        if code in codes:
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
    out = DATA_DIR / f"{key}.js"
    body = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    out.write_text(header + "export default " + body + ";\n", encoding="utf-8")
    print(f"viewBox {data['viewBox']}; {len(playable)} playable, {len(context)} context -> {out}\n")


def fetch_flags(codes):
    FLAGS_DIR.mkdir(exist_ok=True)
    fetched = 0
    for code in codes:
        target = FLAGS_DIR / f"{code.lower()}.svg"
        if not target.exists():
            urllib.request.urlretrieve(FLAG_URL.format(code=code.lower()), target)
            fetched += 1
    print(f"flags: {len(codes)} needed, {fetched} downloaded -> {FLAGS_DIR}")


if __name__ == "__main__":
    main()
