"""Verify bounded original equipment instruction anchors; no game execution."""
import argparse
import hashlib
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("image", type=Path)
args = parser.parse_args()
image = args.image.read_bytes()
assert hashlib.sha256(image).hexdigest() == "f0f8c2f87336904fc44398e95dbf355b84384a168d05ae16d12d2b39ec025aec", "Different retained image"
anchors = {0x4035a5: "68c7320000", 0x4036e8: "8d8370560000",
           0x4036ee: "89839c570000", 0x403386: "c743440f000000",
           0x404a11: "8b8e9c570000", 0x404a26: "034644", 0x40793a: "8a4110c3"}
for address, encoded in anchors.items():
    expected = bytes.fromhex(encoded)
    assert image[address - 0x400000:address - 0x400000 + len(expected)] == expected, hex(address)
print("PASS: 7 retained instruction anchors; no live timing or capacity claim")
