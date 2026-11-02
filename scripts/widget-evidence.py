"""Reconcile existing extraction reports without reading/decompressing game assets.

Only CSV/JSON metadata is written. No original pixel, glyph or audio data is copied.
"""
import argparse
import csv
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ARCHIVE = "9a3a2e367e33e1acea9ab30d5a5718e42d2c180d4313ec052bfa6c6d6e0d2d88"
# Existing inspect-original.py resource-composition baseline, not runtime ownership.
MENU = [(0, 32), (1, 137), (2, 159), (3, 158), (4, 156), (5, 166),
        (6, 153), (7, 163), (8, 150)]
PLAY = [(11, 161), (12, 162), (13, 155), (14, 160)] + [(i, 164) for i in range(15, 23)]


class ExistingCandidates(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current = None
        self.caption = False
        self.text = ""
        self.candidates = {}

    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.current = int(dict(attrs)["data-index"])
            self.candidates[self.current] = []
        if tag == "figcaption":
            self.caption = True
            self.text = ""

    def handle_data(self, data):
        if self.caption:
            self.text += data

    def handle_endtag(self, tag):
        if tag == "figcaption":
            match = re.fullmatch(r"Image (\d+), (\d+) vertical slice\(s\)", self.text)
            if match:
                self.candidates[self.current].append(tuple(map(int, match.groups())))
            self.caption = False
        if tag == "article":
            self.current = None


def audit(legacy, output):
    legacy, output = legacy.resolve(), output.resolve()
    if output.is_relative_to(legacy):
        raise ValueError("Output must be outside the preserved legacy worktree.")
    metadata = legacy / "public/assets/original"
    sources = {name: metadata / name for name in ["ui-layouts.json", "preparation-tabs.json", "weather-panel.json", "fonts.json"]}
    sources["widget-gallery.html"] = legacy / ".local/original/widget-gallery.html"
    sources["inspect-original.py"] = legacy / "tools/inspect-original.py"
    data = {name: json.loads(path.read_text(encoding="utf8")) for name, path in sources.items() if name.endswith(".json")}
    layout = data["ui-layouts.json"]
    if layout["sourceSha256"] != ARCHIVE:
        raise ValueError("The established baseline belongs to a different archive.")
    rectangles = layout["rectangles"]
    if len(rectangles) != 462 or [r["index"] for r in rectangles] != list(range(462)):
        raise ValueError("Expected the complete, ordered existing 462-rectangle inventory.")
    parser = ExistingCandidates()
    parser.feed(sources["widget-gallery.html"].read_text(encoding="utf8"))

    bindings = {}
    for index, image in MENU + PLAY:
        bindings[index] = {"role": f"resource-menu-{index}", "image": image, "anchor": 8 if index >= 11 else "",
                           "space": "relative-to-8" if index >= 11 else "root", "status": "resource-image"}
    for tab in data["preparation-tabs.json"]:
        bindings[tab["rectangle"]["index"]] = {"role": "preparation-" + tab["name"], "image": tab["imageIndex"],
                                                   "anchor": "", "space": "root", "status": "resource-image"}
    weather = data["weather-panel.json"]
    bindings[weather["panel"]["index"]] = {"role": "weather-panel", "image": weather["imageIndex"],
                                                "anchor": "", "space": "root", "status": "resource-image"}
    for ordinal, icon in enumerate(weather["icons"]):
        bindings[icon["index"]] = {"role": f"forecast-position-{ordinal + 1}", "image": "", "anchor": weather["panel"]["index"],
                                    "space": "root", "status": "geometry-only"}

    rows = []
    for rect in rectangles:
        index = rect["index"]
        binding = bindings.get(index, {"role": "", "image": "", "anchor": "", "space": "unknown", "status": "unmapped"})
        candidates = parser.candidates.get(index, [])
        image = binding["image"]
        if image != "" and not any(candidate == image for candidate, _ in candidates):
            raise ValueError(f"Baseline rectangle{index}/image{image} no longer matches the existing gallery.")
        x, y = rect["x"], rect["y"]
        if binding["space"] == "relative-to-8":
            x += rectangles[8]["x"]
            y += rectangles[8]["y"]
        if binding["space"] != "unknown" and not (0 <= x <= x + rect["width"] <= 640 and 0 <= y <= y + rect["height"] <= 480):
            raise ValueError(f"Established composition leaves the source frame at rectangle{index}.")
        rows.append({**rect, "status": binding["status"], "resource_role": binding["role"], "image_index": image,
                     "resource_anchor": binding["anchor"], "coordinate_space": binding["space"],
                     "composed_x": x if binding["space"] != "unknown" else "", "composed_y": y if binding["space"] != "unknown" else "",
                     "dimension_candidates_image_slices": ";".join(f"{i}:{s}" for i, s in candidates),
                     "runtime_owner": "unverified", "widget_font": "unverified", "interaction_state_order": "unverified"})
    fonts = data["fonts.json"]
    font_summary = [{key: value for key, value in font.items() if key != "glyphs"} | {"glyphCount": len(font["glyphs"])} for font in fonts]
    if len(fonts) != 6 or sum(font["glyphCount"] for font in font_summary) != 954:
        raise ValueError("Expected the existing six-font/954-glyph metadata, not a new extraction.")
    counts = {status: sum(row["status"] == status for row in rows) for status in ["resource-image", "geometry-only", "unmapped"]}
    counts["unmappedWithCandidates"] = sum(row["status"] == "unmapped" and bool(row["dimension_candidates_image_slices"]) for row in rows)
    counts["unmappedWithoutCandidates"] = counts["unmapped"] - counts["unmappedWithCandidates"]
    report = {"archiveSha256": ARCHIVE, "archiveVersion": "unverified", "nativeFrame": [640, 480], "rectangles": len(rows),
              "counts": counts, "fonts": font_summary,
              "sourceFiles": {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in sources.items()},
              "limits": ["Resource image/geometry bindings do not establish runtime owners, per-widget fonts or interaction-state order.",
                         "Candidate pairs are reused verbatim from the existing gallery; dimensions are not confirmation.",
                         "No original pixel, glyph, audio or executable bytes are included."]}
    output.mkdir(parents=True, exist_ok=True)
    for name, selected in [("widget-bindings.csv", rows), ("widget-unmapped.csv", [r for r in rows if r["status"] == "unmapped"])]:
        with (output / name).open("w", newline="", encoding="utf8") as stream:
            writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(selected)
    (output / "widget-evidence.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"rectangles": len(rows), **counts}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--legacy-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    audit(args.legacy_root, args.output)
