"""Reuse retained audio audit/gallery metadata; never decode or export payloads."""
import argparse
import csv
import hashlib
import json
import re
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--legacy", type=Path, required=True)
p.add_argument("--output", type=Path, required=True)
a = p.parse_args()
root, output = a.legacy.resolve(), a.output.resolve()
if output.is_relative_to(root):
    raise ValueError("Output must be outside preserved inputs")
audit_path = root / ".local/original/archive-audit.json"
gallery_path = root / ".local/original/audio-gallery.html"
audit = json.loads(audit_path.read_text(encoding="utf8"))
assert audit["archiveSha256"] == "9a3a2e367e33e1acea9ab30d5a5718e42d2c180d4313ec052bfa6c6d6e0d2d88"
records = next(s["records"] for s in audit["sections"] if s["kind"] == 3)
gallery = gallery_path.read_text(encoding="utf8")
samples = json.loads(re.search(r"const samples = (.*?);\s*const payloads", gallery, re.S).group(1))
assert len(records) == len(samples) == 21
assert len({r["sha256"] for r in records}) == 17
rows = []
for record, sample in zip(records, samples):
    assert all(sample[k] == v for k, v in record.items())
    assert record["tag"] == 16
    rows.append({**record, "duplicateOf": record.get("duplicateOf", ""),
                 "headHex": sample["headHex"], "codec": "unverified",
                 "sampleRateHz": "unverified", "channels": "unverified",
                 "originalDurationSeconds": "unverified"})
output.mkdir(parents=True, exist_ok=True)
with (output / "audio-records.csv").open("w", encoding="utf8", newline="") as stream:
    writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
report = {"archiveSha256": audit["archiveSha256"], "records": 21, "uniquePayloads": 17,
          "duplicates": {str(r["index"]): r["duplicateOf"] for r in records if "duplicateOf" in r},
          "payloadBytesIncludingDuplicates": sum(r["size"] for r in records),
          "inputHashes": {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
                          for p in (audit_path, gallery_path)},
          "confirmedPlaybackMetadata": False,
          "limitations": ["Tag16 meaning unknown; not a bit-depth assertion",
                          "PCM8 mono and all preview rates are hypotheses",
                          "No original game launch, playback or new decoding",
                          "Archive release version unverified; 1.1.6 runtime linkage unproven",
                          "Need identified loader/playback arguments or authorized runtime sample metadata"]}
(output / "audio-evidence.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
print("PASS: 21 metadata rows / 17 unique hashes; all playback fields unverified")
