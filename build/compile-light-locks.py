#!/usr/bin/env python3
"""Validate the authored Light Lab 2.0 lock and compile its browser classic-script form."""

from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data/light-profile-locks.json"
DEFAULT_OUTPUT = ROOT / "data/light-profile-locks.js"
HEX_COLOR = re.compile(r"^0x[0-9a-fA-F]{6}$")
ALLOWED_MODES = {
    "diagnostic-neutral",
    "diagnostic-studio",
    "production-practical",
    "production-environment",
}
ALLOWED_SOURCE_CLASSES = {
    "diagnostic",
    "physical-practical",
    "environmental",
    "celestial",
}
MAX_LIGHTS_PER_PROFILE = 4
ALLOWED_LIGHT_TYPES = {"environment", "directional", "point", "spot"}
ALLOWED_POSITION_STRATEGIES = {"board-relative", "socket-relative"}
ALLOWED_TONE_MAPS = {"none", "agx"}
ALLOWED_MOUNTS = {"none", "floor", "wall", "ceiling"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def finite_number(value: object, label: str, low: float, high: float) -> None:
    require(
        isinstance(value, (int, float)) and not isinstance(value, bool),
        f"{label} must be a number",
    )
    require(low <= float(value) <= high, f"{label} must be in [{low}, {high}]")


def validate_color(value: object, label: str) -> None:
    require(isinstance(value, str) and HEX_COLOR.match(value) is not None,
            f"{label} must be 0xRRGGBB")


def validate_vec3(value: object, label: str, low: float, high: float) -> None:
    require(isinstance(value, dict), f"{label} must be an object")
    require(set(value) == {"x", "y", "z"}, f"{label} must contain exactly x/y/z")
    for axis in ("x", "y", "z"):
        finite_number(value[axis], f"{label}.{axis}", low, high)


def merge_defaults(defaults: object, value: object) -> object:
    """Deep default merge; authored values always win and arrays stay atomic."""
    if not isinstance(defaults, dict) or not isinstance(value, dict):
        return copy.deepcopy(value)
    merged = copy.deepcopy(defaults)
    for key, child in value.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(child, dict):
            merged[key] = merge_defaults(merged[key], child)
        else:
            merged[key] = copy.deepcopy(child)
    return merged


def expand_lock(raw_lock: dict) -> dict:
    """Expand compact authored profile/light defaults into a complete compiled lock."""
    lock = copy.deepcopy(raw_lock)
    defaults = lock.get("defaults", {})
    profile_defaults = defaults.get("profile", {}) if isinstance(defaults, dict) else {}
    light_defaults = defaults.get("light", {}) if isinstance(defaults, dict) else {}
    profiles = lock.get("profiles", {})
    if isinstance(profiles, dict):
        for key, profile in list(profiles.items()):
            if not isinstance(profile, dict):
                continue
            expanded = merge_defaults(profile_defaults, profile)
            if isinstance(expanded.get("lights"), list):
                expanded["lights"] = [
                    merge_defaults(light_defaults, light) if isinstance(light, dict) else light
                    for light in expanded["lights"]
                ]
            profiles[key] = expanded
    return lock


def validate_lock(lock: object) -> dict:
    require(isinstance(lock, dict), "lock root must be an object")
    lock = expand_lock(lock)
    require(lock.get("kind") == "light-profile-lock-set",
            "kind must be light-profile-lock-set")
    require(lock.get("schemaVersion") == 2, "schemaVersion must be 2")
    require(isinstance(lock.get("id"), str) and lock["id"], "id is required")
    finite_number(lock.get("version"), "version", 1, 1_000_000)

    settings = lock.get("settings")
    require(isinstance(settings, dict), "settings must be an object")
    for name, bounds in {
        "stageAmbientFloor": (0, 1.5),
        "gradeExposureFloor": (0, 0.3),
        "bloomThreshold": (0, 2),
        "bloomStrength": (0, 3),
        "gradeTintScale": (0, 1.5),
        "gradeTintMax": (0, 0.5),
        "spriteEmissiveFloor": (0, 0.3),
        "sceneAmbient": (0, 0.5),
        "lightRenderGain": (0, 10),
    }.items():
        finite_number(settings.get(name), f"settings.{name}", *bounds)
    arc = settings.get("celestialArc")
    require(isinstance(arc, dict), "settings.celestialArc must be an object")
    for name, bounds in {
        "SUNRISE_MIN": (0, 720),
        "SUNSET_MIN": (720, 1440),
        "MIN_ELEV_ANGLE": (0, 1),
        "OVERCAST_DESAT": (0, 1),
        "OVERCAST_SHADOW_DAMP": (0, 1),
    }.items():
        finite_number(arc.get(name), f"settings.celestialArc.{name}", *bounds)
    require(arc["SUNRISE_MIN"] < arc["SUNSET_MIN"],
            "SUNRISE_MIN must be earlier than SUNSET_MIN")

    profiles = lock.get("profiles")
    require(isinstance(profiles, dict) and profiles, "profiles must be a non-empty object")
    rolled_count = 0
    for key, profile in profiles.items():
        label = f"profiles.{key}"
        require(isinstance(profile, dict), f"{label} must be an object")
        require(profile.get("id") == key, f"{label}.id must equal its registry key")
        require(isinstance(profile.get("label"), str) and profile["label"],
                f"{label}.label is required")
        require(isinstance(profile.get("rolled"), bool), f"{label}.rolled must be boolean")
        rolled_count += int(profile["rolled"])
        require(profile.get("mode") in ALLOWED_MODES, f"{label}.mode is invalid")
        if profile["rolled"]:
            require(profile["mode"].startswith("production-"),
                    f"{label}: rolled profiles must be production modes")
        else:
            require(profile["mode"].startswith("diagnostic-"),
                    f"{label}: unrolled profiles must be diagnostic modes")

        source = profile.get("source")
        require(isinstance(source, dict), f"{label}.source must be an object")
        require(source.get("class") in ALLOWED_SOURCE_CLASSES,
                f"{label}.source.class is invalid")
        require(isinstance(source.get("label"), str) and source["label"],
                f"{label}.source.label is required")
        require(isinstance(source.get("loreNative"), bool),
                f"{label}.source.loreNative must be boolean")
        require(isinstance(source.get("visibleEmitterRequired"), bool),
                f"{label}.source.visibleEmitterRequired must be boolean")
        if profile["mode"] == "production-practical":
            require(source["loreNative"], f"{label}: production practicals must be lore-native")
            require(source["visibleEmitterRequired"],
                    f"{label}: production practicals require a visible emitter")

        ambient = profile.get("ambient")
        require(isinstance(ambient, dict), f"{label}.ambient must be an object")
        validate_color(ambient.get("color"), f"{label}.ambient.color")
        finite_number(ambient.get("intensity"), f"{label}.ambient.intensity", 0, 1.5)
        finite_number(profile.get("exposureFloor"), f"{label}.exposureFloor", 0, 0.3)
        tone_map = profile.get("toneMap")
        require(isinstance(tone_map, dict), f"{label}.toneMap must be an object")
        require(tone_map.get("profile") in ALLOWED_TONE_MAPS,
                f"{label}.toneMap.profile is invalid")
        finite_number(tone_map.get("strength"), f"{label}.toneMap.strength", 0, 1)
        bloom = profile.get("bloom")
        require(isinstance(bloom, dict), f"{label}.bloom must be an object")
        finite_number(bloom.get("threshold"), f"{label}.bloom.threshold", 0, 2)
        finite_number(bloom.get("strength"), f"{label}.bloom.strength", 0, 3)
        require(profile.get("atmosphereFact") is None
                or isinstance(profile.get("atmosphereFact"), str),
                f"{label}.atmosphereFact must be null or a canonical fact id")
        sprite = profile.get("spriteResponse")
        require(isinstance(sprite, dict), f"{label}.spriteResponse must be an object")
        finite_number(sprite.get("emissiveFloor"), f"{label}.spriteResponse.emissiveFloor", 0, 0.3)
        require(isinstance(sprite.get("materialRecipe"), str) and sprite["materialRecipe"],
                f"{label}.spriteResponse.materialRecipe is required")
        invariants = sprite.get("invariants")
        require(isinstance(invariants, dict), f"{label}.spriteResponse.invariants must be an object")
        require(invariants.get("colorSpace") == "srgb",
                f"{label}: sprite colorSpace is invariant srgb")
        require(invariants.get("magnificationFilter") == "nearest",
                f"{label}: sprite magnificationFilter is invariant nearest")
        require(invariants.get("minificationFilter") == "linear",
                f"{label}: sprite minificationFilter is invariant linear")
        require(invariants.get("alphaMode") == "registry-cutoff",
                f"{label}: sprite alphaMode is invariant registry-cutoff")

        lights = profile.get("lights")
        require(isinstance(lights, list), f"{label}.lights must be an array")
        require(len(lights) <= MAX_LIGHTS_PER_PROFILE,
                f"{label}.lights exceeds the {MAX_LIGHTS_PER_PROFILE}-light bound")
        light_ids: set[str] = set()
        for index, light in enumerate(lights):
            llabel = f"{label}.lights[{index}]"
            require(isinstance(light, dict), f"{llabel} must be an object")
            require(isinstance(light.get("id"), str) and light["id"], f"{llabel}.id is required")
            require(light["id"] not in light_ids, f"{llabel}.id is duplicated")
            light_ids.add(light["id"])
            require(isinstance(light.get("label"), str) and light["label"],
                    f"{llabel}.label is required")
            require(isinstance(light.get("enabled"), bool), f"{llabel}.enabled must be boolean")
            require(light.get("type") in ALLOWED_LIGHT_TYPES, f"{llabel}.type is invalid")
            finite_number(light.get("temperatureK"), f"{llabel}.temperatureK", 1000, 20000)
            require(isinstance(light.get("colorOverride"), bool),
                    f"{llabel}.colorOverride must be boolean")
            validate_color(light.get("color"), f"{llabel}.color")
            require(isinstance(light.get("intensityUnit"), str) and light["intensityUnit"],
                    f"{llabel}.intensityUnit is required")
            require(isinstance(light.get("physicalIntensityUnit"), str)
                    and light["physicalIntensityUnit"],
                    f"{llabel}.physicalIntensityUnit is required")
            finite_number(light.get("intensity"), f"{llabel}.intensity", 0, 30)
            finite_number(light.get("physicalIntensity"), f"{llabel}.physicalIntensity", 0, 30)
            require(light.get("positionStrategy") in ALLOWED_POSITION_STRATEGIES,
                    f"{llabel}.positionStrategy is invalid")
            validate_vec3(light.get("pos"), f"{llabel}.pos", -4, 8)
            finite_number(light.get("heightM"), f"{llabel}.heightM", 0, 20)
            finite_number(light.get("rangeM"), f"{llabel}.rangeM", 0, 100)
            finite_number(light.get("falloff"), f"{llabel}.falloff", 0, 2)
            finite_number(light.get("azimuthDeg"), f"{llabel}.azimuthDeg", -360, 360)
            finite_number(light.get("elevationDeg"), f"{llabel}.elevationDeg", -90, 90)
            spot = light.get("spot")
            require(isinstance(spot, dict), f"{llabel}.spot must be an object")
            finite_number(spot.get("coneDeg"), f"{llabel}.spot.coneDeg", 1, 179)
            finite_number(spot.get("penumbra"), f"{llabel}.spot.penumbra", 0, 1)
            shadow = light.get("shadow")
            require(isinstance(shadow, dict), f"{llabel}.shadow must be an object")
            require(isinstance(shadow.get("cast"), bool), f"{llabel}.shadow.cast must be boolean")
            finite_number(shadow.get("bias"), f"{llabel}.shadow.bias", -0.1, 0.1)
            finite_number(shadow.get("normalBias"), f"{llabel}.shadow.normalBias", 0, 1)
            require(shadow.get("mapSize") in {256, 512, 1024, 2048},
                    f"{llabel}.shadow.mapSize must be 256/512/1024/2048")
            finite_number(shadow.get("budgetPriority"), f"{llabel}.shadow.budgetPriority", 0, 3)
            flicker = light.get("flicker")
            require(isinstance(flicker, dict), f"{llabel}.flicker must be an object")
            require(isinstance(flicker.get("recipeId"), str) and flicker["recipeId"],
                    f"{llabel}.flicker.recipeId is required")
            finite_number(flicker.get("amplitude"), f"{llabel}.flicker.amplitude", 0, 0.5)
            finite_number(flicker.get("cadenceMs"), f"{llabel}.flicker.cadenceMs", 100, 5000)
            require(light.get("mount") in ALLOWED_MOUNTS, f"{llabel}.mount is invalid")
            validate_vec3(light.get("emitterLocal"), f"{llabel}.emitterLocal", -4, 4)
            if source["visibleEmitterRequired"]:
                require(isinstance(light.get("fixtureId"), str) and light["fixtureId"],
                        f"{llabel}: visible-emitter sources require fixtureId")
                require(light.get("mount") in {"floor", "wall", "ceiling"},
                        f"{llabel}: visible-emitter sources require a physical mount")
                require(light.get("positionStrategy") == "socket-relative",
                        f"{llabel}: visible-emitter sources must be socket-relative")

    require(rolled_count == 10, f"expected 10 rolled production profiles, found {rolled_count}")
    require("clay-neutral-truth" in profiles, "missing clay-neutral-truth diagnostic recipe")
    require("clay-opposing-pair" in profiles, "missing clay-opposing-pair diagnostic recipe")
    require(len(profiles["clay-opposing-pair"]["lights"]) == 2,
            "clay-opposing-pair must carry exactly two lights")
    return lock


def compile_js(lock: dict) -> str:
    payload = json.dumps(lock, indent=2, sort_keys=False)
    return (
        "/* GENERATED by build/compile-light-locks.py from data/light-profile-locks.json.\n"
        "   Persistent Light Lab 2.0 authored locks. Never hand-edit this file. */\n"
        f"var LIGHT_PROFILE_LOCKS_COMPILED = {payload};\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true",
                        help="validate and confirm the compiled output is current without writing")
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    lock = validate_lock(json.loads(source.read_text(encoding="utf-8")))
    compiled = compile_js(lock)
    if args.check:
        require(output.exists(), f"compiled output is missing: {output}")
        require(output.read_text(encoding="utf-8") == compiled,
                f"compiled output is stale: run {Path(__file__).name}")
        print(f"light-locks: OK ({len(lock['profiles'])} profiles, compiled output current)")
        return 0
    output.write_text(compiled, encoding="utf-8")
    print(f"light-locks: wrote {output.relative_to(ROOT)} ({len(lock['profiles'])} profiles)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
