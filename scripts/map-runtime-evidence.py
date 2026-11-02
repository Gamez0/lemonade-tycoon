"""Measure retained original runtime captures against existing resource compositions.

Writes numeric evidence only. Does not export crops, re-extract archives or launch a game.
"""
import argparse
import csv
import hashlib
import json
import runpy
import sys
from pathlib import Path

CAPTURES = {
    "suburbs": ("animation-frame-00.png", "selling", 11, "actual40C/cloudy"),
    "park": ("map-park.png", "preparation", 11, "forecast37-40C"),
    "downtown": ("map-scene-2.png", "preparation", 11, "forecast37-40C"),
    "train-station": ("map-scene-3.png", "preparation", 11, "forecast37-40C"),
    "beach": ("map-scene-4.png", "preparation", 11, "forecast37-40C"),
    "mall": ("map-scene-5.png", "preparation", 11, "outdoor forecast37-40C"),
    "marina": ("map-scene-6.png", "preparation", 11, "forecast37-40C"),
    "old-square": ("map-scene-7.png", "preparation", 11, "forecast37-40C"),
    "magic-gardens": ("map-scene-8.png", "preparation", 11, "forecast37-40C"),
    "stadium": ("stadium-full-scene.png", "preparation", 18, "forecast27-29C"),
}
ARCHIVE = "9a3a2e367e33e1acea9ab30d5a5718e42d2c180d4313ec052bfa6c6d6e0d2d88"
CROP = (333, 151, 300, 240)


def audit(legacy, captures, output):
    legacy, captures, output = legacy.resolve(), captures.resolve(), output.resolve()
    if output.is_relative_to(legacy) or output.is_relative_to(captures):
        raise ValueError("Output must be outside both preserved input trees.")
    sys.dont_write_bytecode = True
    helper = legacy / "tests/original-maps.py"
    decode = runpy.run_path(str(helper))["decode_png"]
    assets = legacy / "public/assets/original"
    metadata = assets / "maps.json"
    manifest = json.loads(metadata.read_text(encoding="utf8"))
    if manifest["sourceSha256"] != ARCHIVE or set(manifest["locations"]) != set(CAPTURES):
        raise ValueError("Different archive/location baseline; review before comparing.")
    hashes = {}

    def read(path):
        hashes[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
        return decode(path)

    rows = []
    details = []
    for name, (filename, phase, day, weather) in CAPTURES.items():
        sw, sh, actual = read(captures / filename)
        if (sw, sh) != (646, 509):
            raise ValueError(f"Different native-window capture dimensions: {filename}")
        x0, y0, width, height = CROP
        layout = manifest["locations"][name]
        aw, _, atlas = read(assets / f"{name}-objects.png")
        frames = layout["frames"]
        variants = []
        for role in ["background", "shadows"]:
            bw, bh, background = read(assets / f"{name}-{role}.png")
            if (bw, bh) != (width, height):
                raise ValueError(f"Different source map dimensions: {name}")
            for shadow_on in [False, True]:
                reference = bytearray(background)
                shadow = layout["standShadowFrames"][0]
                indices = layout["sceneryFrames"] + ([shadow] if shadow_on and shadow is not None else []) + [layout["standFrame"]]
                indices.sort(key=lambda i: -500 if i == shadow else frames[i]["y"] + frames[i]["height"])
                for index in indices:
                    frame = frames[index]
                    for y in range(frame["height"]):
                        for x in range(frame["width"]):
                            tx, ty = frame["x"] + x, frame["y"] + y
                            if not (0 <= tx < width and 0 <= ty < height):
                                continue
                            source = ((frame["sourceY"] + y) * aw + frame["sourceX"] + x) * 4
                            if atlas[source + 3]:
                                target = (ty * width + tx) * 4
                                reference[target:target + 4] = atlas[source:source + 4]
                mismatches, difference = 0, 0
                for y in range(height):
                    for x in range(width):
                        ref = (y * width + x) * 4
                        live = ((y0 + y) * sw + x0 + x) * 4
                        delta = sum(abs(reference[ref + c] - actual[live + c]) for c in range(3))
                        mismatches += delta != 0
                        difference += delta
                variants.append({"backgroundRole": role, "standShadowIncluded": shadow_on,
                                 "differentPixels": mismatches, "totalPixels": width * height,
                                 "meanAbsoluteChannelDifference": difference / (width * height * 3)})
        best = min(variants, key=lambda v: v["meanAbsoluteChannelDifference"])
        rows.append({"location": name, "capture": filename, "phase": phase, "day": day, "weather": weather,
                     "backgroundImage": layout["backgroundImage"], "shadowImage": layout["shadowBackgroundImage"],
                     "objectAtlas": layout["atlasImage"], "frameGroup": layout["frameGroup"], "resourceFrames": len(frames),
                     "bestOfFourBackground": best["backgroundRole"], "bestOfFourStandShadow": best["standShadowIncluded"],
                     "differentPixels": best["differentPixels"], "totalPixels": best["totalPixels"],
                     "meanAbsoluteChannelDifference": best["meanAbsoluteChannelDifference"]})
        details.append({"location": name, "capture": filename, "variants": variants})
    for filename in ["animation-frame-16.png", "animation-frame-23.png", "mall-high-live.png", "return-suburbs.png", "map-scene-9.png"]:
        path = captures / filename
        hashes[filename] = hashlib.sha256(path.read_bytes()).hexdigest()
    report = {"scope": "Retained1.1.6 session captures versus version-unverified archive compositions; not current product pixel parity.",
              "archiveSha256": ARCHIVE, "nativeWindow": [646, 509], "measuredMapRectangle": list(CROP), "standLevel": 0,
              "helperSha256": hashlib.sha256(helper.read_bytes()).hexdigest(),
              "extractorSha256": hashlib.sha256((legacy / "tools/extract-original.py").read_bytes()).hexdigest(),
              "mapMetadataSha256": hashlib.sha256(metadata.read_bytes()).hexdigest(), "inputFileHashes": hashes,
              "rejectedFilenameInferences": {"return-suburbs.png": "Suburbs card selected, but right viewport still Magic Gardens",
                                           "map-scene-9.png": "Hexa-Stad card selected, but right viewport still Magic Gardens"},
              "limits": ["Best of four is a numerical candidate, not proof of the original layer-selection rule.",
                         "Exact RGB comparison uses no tolerance, rescaling or color normalization.",
                         "Selling captures may include native controls/actors; no pixels are masked.",
                         "Archive version, native color/lighting transforms, complete layer selection and weather/stand matrix remain unverified.",
                         "Sequential screenshot names do not establish a fixed simulation/frame cadence.",
                         "No original pixel/crop/audio/executable bytes are exported."], "comparisons": details}
    output.mkdir(parents=True, exist_ok=True)
    with (output / "map-runtime-ledger.csv").open("w", newline="", encoding="utf8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    (output / "map-runtime-evidence.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"locations": len(rows), "candidateComparisons": len(rows) * 4,
                      "zeroDifferenceScenes": sum(row["differentPixels"] == 0 for row in rows),
                      "minimumDifferentPixels": min(row["differentPixels"] for row in rows),
                      "maximumDifferentPixels": max(row["differentPixels"] for row in rows)}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--legacy-root", type=Path, required=True)
    parser.add_argument("--captures-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    audit(args.legacy_root, args.captures_root, args.output)
