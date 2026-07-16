#!/usr/bin/env python3
"""fold-lightlab.py — LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1): fold an exported LIGHT-LAB JSON
snapshot back into the named consts in src/ui/theater-boot.js.

THE LAW (edit-source -> compile-artifact, CLAUDE.md's own discipline, extended to this seam): the
LIGHT-LAB's DOM sliders never write code directly — they mutate an in-memory LIGHT_TUNABLES object and
the EXPORT button hands Adam a JSON snapshot of it (window.Theater._lightLabExport() / the panel's own
EXPORT button, dev/ light-lab-export.json by convention). This script is the ONE place that snapshot is
allowed to become a source edit: it locates each corresponding named const (LIGHT_PROFILES per-profile
ambient/point, STAGE_AMBIENT_FLOOR, GRADE_EXPOSURE_FLOOR, BLOOM_THRESHOLD/STRENGTH, GRADE_TINT_SCALE/MAX,
CELESTIAL_ARC's timing/desaturation keyframes, ITR_SPRITE_EMISSIVE_FLOOR/ITR_SCENE_AMBIENT/
ITR_LIGHT_RENDER_GAIN) and rewrites ONLY its value token, leaving every surrounding comment untouched.

IDEMPOTENT / BYTE-STABLE: if the JSON's values already match the file (nothing to change), this script
writes NOTHING — re-running it on an unmodified export is a true no-op (verified live, see this unit's
own report). Running it twice on the SAME export therefore produces byte-identical output both times.

Run:
  python3 build/fold-lightlab.py <path-to-exported-light-lab.json>   # writes src/ui/theater-boot.js in place
  python3 build/fold-lightlab.py <path> --dry-run                    # report only, no write
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "src/ui/theater-boot.js"

HEX_RE = re.compile(r"^0x[0-9a-fA-F]{6}$")


def fmt_num(v):
    """JSON number -> the shortest JS literal that round-trips it, matching this file's own style
    (bare ints where the source already used one, e.g. `intensity: 7`; trimmed decimals otherwise)."""
    if isinstance(v, bool):
        raise SystemExit(f"fold-lightlab: expected a number, got a bool ({v!r})")
    if isinstance(v, int):
        return str(v)
    r = round(float(v), 6)
    if r == int(r):
        return str(int(r))
    s = f"{r:.6f}".rstrip("0").rstrip(".")
    return s


def fmt_hex(v):
    if not isinstance(v, str) or not HEX_RE.match(v):
        raise SystemExit(f"fold-lightlab: expected a \"0xrrggbb\" color string, got {v!r}")
    return v.lower()


def fold_simple_const(text, name, value_str):
    pattern = re.compile(r"(?m)^(const " + re.escape(name) + r" = )([^;]+)(;)")
    new_text, n = pattern.subn(lambda m: m.group(1) + value_str + m.group(3), text, count=1)
    if n != 1:
        raise SystemExit(f"fold-lightlab: could not find exactly one `const {name} = ...;` (found {n})")
    return new_text


def fold_object_field(text, key, value_str):
    """A `  KEY: <value>,` or `  KEY: <value>` (last field, no comma) line inside a top-level object
    literal — CELESTIAL_ARC's own timing/desaturation keys, each unique enough in the file (they're
    never reused as a dotted-access identifier elsewhere) to match unscoped."""
    pattern = re.compile(r"(?m)^(\s*" + re.escape(key) + r":\s*)([^,\n]+?)(,?)(\s*(?://.*)?)$")
    new_text, n = pattern.subn(lambda m: m.group(1) + value_str + m.group(3) + m.group(4), text, count=1)
    if n != 1:
        raise SystemExit(f"fold-lightlab: could not find exactly one `{key}: ...` field (found {n})")
    return new_text


def profile_key_pattern(key):
    if re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", key):
        return re.escape(key)
    return '"' + re.escape(key) + '"'


def fold_light_profiles(text, profiles_json):
    m = re.search(r"(?ms)^const LIGHT_PROFILES = \{.*?\n\};\n", text)
    if not m:
        raise SystemExit("fold-lightlab: could not locate `const LIGHT_PROFILES = { ... };`")
    block = m.group(0)
    for key, vals in profiles_json.items():
        kp = profile_key_pattern(key)
        start_m = re.search(r"(?m)^  " + kp + r": \{\n", block)
        if not start_m:
            raise SystemExit(f"fold-lightlab: profile {key!r} not found in LIGHT_PROFILES")
        rest = block[start_m.end():]
        next_m = re.search(r'(?m)^  (?:[A-Za-z_$][A-Za-z0-9_$]*|"[^"]+"): \{\n', rest)
        end = start_m.end() + (next_m.start() if next_m else len(rest))
        sub = block[start_m.end():end]

        amb_pattern = re.compile(r"(ambient: \{ color: )(0x[0-9a-fA-F]+)(, intensity: )([^\s}]+)( \})")
        amb_color = fmt_hex(vals["ambientColor"])
        amb_intensity = fmt_num(vals["ambientIntensity"])
        sub, n_amb = amb_pattern.subn(
            lambda mm: mm.group(1) + amb_color + mm.group(3) + amb_intensity + mm.group(5), sub, count=1
        )
        if n_amb != 1:
            raise SystemExit(f"fold-lightlab: ambient line not found for profile {key!r}")

        if vals.get("pointColor") is not None and vals.get("pointIntensity") is not None:
            pt_pattern = re.compile(r"(points: \[ \{ color: )(0x[0-9a-fA-F]+)(, intensity: )([^\s,]+)(,)")
            pt_color = fmt_hex(vals["pointColor"])
            pt_intensity = fmt_num(vals["pointIntensity"])
            sub, n_pt = pt_pattern.subn(
                lambda mm: mm.group(1) + pt_color + mm.group(3) + pt_intensity + mm.group(5), sub, count=1
            )
            if n_pt != 1:
                raise SystemExit(f"fold-lightlab: points line not found for profile {key!r}")
        # a profile with pointColor/pointIntensity == null (overcast: points: []) is left untouched —
        # there is no point entry to patch, and the export never claims one for it.

        block = block[:start_m.end()] + sub + block[end:]
    return text[:m.start()] + block + text[m.end():]


CELESTIAL_FIELDS = ["SUNRISE_MIN", "SUNSET_MIN", "MIN_ELEV_ANGLE", "OVERCAST_DESAT", "OVERCAST_SHADOW_DAMP"]

SIMPLE_CONST_MAP = [
    ("stageAmbientFloor", "STAGE_AMBIENT_FLOOR"),
    ("gradeExposureFloor", "GRADE_EXPOSURE_FLOOR"),
    ("bloomThreshold", "BLOOM_THRESHOLD"),
    ("bloomStrength", "BLOOM_STRENGTH"),
    ("gradeTintScale", "GRADE_TINT_SCALE"),
    ("gradeTintMax", "GRADE_TINT_MAX"),
    ("spriteEmissiveFloor", "ITR_SPRITE_EMISSIVE_FLOOR"),
    ("sceneAmbient", "ITR_SCENE_AMBIENT"),
    ("lightRenderGain", "ITR_LIGHT_RENDER_GAIN"),
]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv
    if not args:
        print(__doc__)
        sys.exit(1)
    json_path = Path(args[0])
    data = json.loads(json_path.read_text())

    orig = TARGET.read_text()
    text = orig
    text = fold_light_profiles(text, data["profiles"])
    for json_key, const_name in SIMPLE_CONST_MAP:
        text = fold_simple_const(text, const_name, fmt_num(data[json_key]))
    for field in CELESTIAL_FIELDS:
        text = fold_object_field(text, field, fmt_num(data["celestialArc"][field]))

    if text == orig:
        print("fold-lightlab: no changes — already byte-identical to", json_path)
        return
    if dry_run:
        changed = sum(1 for a, b in zip(orig.splitlines(), text.splitlines()) if a != b)
        print(f"fold-lightlab: --dry-run, {changed} line(s) would change (not written)")
        return
    TARGET.write_text(text)
    print(f"fold-lightlab: folded {json_path} into {TARGET}")


if __name__ == "__main__":
    main()
