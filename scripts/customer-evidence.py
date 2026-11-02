"""Audit retained customer group/frame-bank links using existing table evidence.

Read-only binary inspection; no game execution, new table discovery or asset export.
"""
import argparse
import csv
import hashlib
import json
import struct
from pathlib import Path

IMAGE_SHA = "f0f8c2f87336904fc44398e95dbf355b84384a168d05ae16d12d2b39ec025aec"
BASE = 0x400000


def audit(legacy, runtime, output):
    legacy, runtime, output = legacy.resolve(), runtime.resolve(), output.resolve()
    if output.is_relative_to(legacy) or output.is_relative_to(runtime):
        raise ValueError("Output must be outside both preserved input trees.")
    image_path = runtime / "original-loaded-image-live.bin"
    table_path = runtime / "map-profile-analysis.json"
    frames_path = legacy / "public/assets/original/customers.json"
    image = image_path.read_bytes()
    if hashlib.sha256(image).hexdigest() != IMAGE_SHA:
        raise ValueError("Different retained image; instruction/table claims require re-review.")
    profiles = json.loads(table_path.read_text(encoding="utf8"))[0]["profiles"]
    frames = json.loads(frames_path.read_text(encoding="utf8"))["frames"]
    if len(profiles) != 11 or len(frames) != 980:
        raise ValueError("Expected the already-recovered eleven-group/980-frame evidence.")
    # Bounded anchors independently disassembled in the audit. This is not a decoder.
    anchors = {
        0x401e95: "8b0487",       # profile[chosenSlot] -> eax
        0x401e9b: "894648",       # chosen group -> visitor+0x48
        0x402413: "8b4148c3",     # render getter -> visitor+0x48
        0x40337f: "c7434046000000",  # constructor default clock quantum70
    }
    for address, hex_bytes in anchors.items():
        expected = bytes.fromhex(hex_bytes)
        if image[address - BASE:address - BASE + len(expected)] != expected:
            raise ValueError(f"Instruction anchor changed at{address:#x}.")
    frame_bank = []
    for index in range(196):
        start, count = struct.unpack_from("<2I", image, 0x464cbc - BASE + index * 12)
        if (start, count) != (index * 5, 5):
            raise ValueError(f"Different frame-bank layout at group{index}.")
        frame_bank.append({"group": index, "startFrame": start, "count": count})

    rows = []
    selected = {}
    for ordinal, profile in enumerate(profiles, 1):
        address = int(profile["address"], 16)
        values = struct.unpack_from("<11I", image, address - BASE)
        choices = values[:5]
        if values[5] != profile["patience"] or any(value % 4 or value > 192 for value in choices):
            raise ValueError(f"Unexpected existing group recordP{ordinal}.")
        characters = [value // 4 for value in choices]
        for character in set(characters):
            selected.setdefault(character, []).append(f"P{ordinal}")
            if not all(str(index) in frames for index in range(character * 20, character * 20 + 20)):
                raise ValueError("Extracted roster lacks a corresponding structural frame ordinal.")
        rows.append({"group": f"P{ordinal}", "recordAddress": hex(address),
                     "rawAppearanceGroups": ";".join(map(str, choices)),
                     "programCharacterSlots": ";".join(map(str, characters)),
                     "programCharacterFrameStarts": ";".join(str(character * 20) for character in characters),
                     "basePatienceSteps": values[5], "preferredPriceCents": values[6], "maximumPriceCents": values[9],
                     "normalNominalInputClockUnits": values[5] * 70, "toggle10xNominalInputClockUnits": values[5] * 7,
                     "realSeconds": "unverified", "semanticIdentity": "unverified"})
    report = {"retainedImageSha256": IMAGE_SHA,
              "existingProfileTableSha256": hashlib.sha256(table_path.read_bytes()).hexdigest(),
              "existingFrameMetadataSha256": hashlib.sha256(frames_path.read_bytes()).hexdigest(),
              "groups": 11, "appearanceSlotsPerGroup": 5, "directionGroupsPerCharacter": 4,
              "framesPerDirectionGroup": 5, "validatedDirectionGroups": len(frame_bank),
              "sharedProgramCharacters": {str(k): v for k, v in selected.items() if len(v) > 1},
              "charactersNotSelectedByTheseElevenRecords": sorted(set(range(49)) - selected.keys()),
              "sourceFacts": {
                  "choice": "0x401e81..0x401e9b requests random0..4, reads profile[slot], stores visitor+0x48",
                  "render": "getter0x402413 called at0x40c480;0x40c580..0x40c5a1 adds direction and indexes stride12 table0x464cbc, then adds pose",
                  "waiting": "0x401f52 state2 calls0x402152, which decrements visitor+8 once per visitor update",
                  "quantum": "constructor0x40337f initializes game+0x40 to70;0x404167..0x40416e adds it each simulation step",
                  "speed": "game+0x18 multiplies incoming elapsed units at0x40411a;0x40c9c5 toggles1/10, quick-finish paths0x40ca21 and0x417ad0 set30000",
                  "patienceModifiers": "0x401eaf..0x401ed7 subtracts10 for weather code>3, adds getter0x404a0e and uses5 only if result is negative",
                  "bonus": "0x404a0e returns game+0x57cc, plus game+0x44 when object at+0x579c is active; constructor+0x44 default is15"},
              "limits": ["Semantic person names are not encoded by this audit; shared figures do not imply shared patience/budgets.",
                         "Program frame-bank ordinals are confirmed. Parent archive version is unverified, so cross-version pixel identity is not asserted.",
                         "Five slots may repeat; exact RNG distribution was not remeasured.",
                         "Nominal clock units cover base waiting steps only, excluding modifiers, phase alignment and scheduler jitter.",
                         "The upstream clock API/unit and real seconds remain unverified. Source fast10x is not product fast4x.",
                         "The modifier object's semantic identity and complete equipment effects need their separate evidence chain.",
                         "No binary, sprite or glyph data is exported and no original executable is launched."]}
    output.mkdir(parents=True, exist_ok=True)
    with (output / "customer-group-links.csv").open("w", newline="", encoding="utf8") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    (output / "customer-evidence.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"groups": 11, "validatedDirectionGroups": len(frame_bank),
                      "sharedCharacters": report["sharedProgramCharacters"],
                      "notSelectedByTheseRecords": report["charactersNotSelectedByTheseElevenRecords"]}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--legacy-root", type=Path, required=True)
    parser.add_argument("--runtime-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    audit(args.legacy_root, args.runtime_root, args.output)
