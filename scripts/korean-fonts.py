"""Reproduce renamed static Korean fonts from a pinned OFL variable source.

Authoring only: create .local-m4/font-venv and install art/fonts/requirements.txt.
The game ships generated fonts, not Python or the large variable source.
"""
import argparse
import hashlib
import json
import urllib.request
from io import BytesIO
from pathlib import Path

import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
COMMIT = 'b38c5c93af322c45f633e17ac440ec1e6c94d489'
URL = 'https://raw.githubusercontent.com/google/fonts/' + COMMIT + '/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
SOURCE_HASH = '194018e6b2b293a7964f037b25c0249ce1418bc9ab3c971060a03aa57861e252'
RANGES = [(0x20, 0x24F), (0x1100, 0x11FF), (0x2000, 0x206F), (0x20A0, 0x20CF),
          (0x2190, 0x21FF), (0x2460, 0x24FF), (0x2600, 0x26FF), (0x3130, 0x318F),
          (0xA960, 0xA97F), (0xAC00, 0xD7A3), (0xD7B0, 0xD7FF), (0xFFFD, 0xFFFD)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch', action='store_true')
    parser.add_argument('--check', action='store_true', help='Verify reproduction without changing generated files')
    args = parser.parse_args()
    source = ROOT / '.local-m4/font-sources/NotoSansKR-wght.ttf'
    if args.fetch and not source.exists():
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(urllib.request.urlopen(URL, timeout=60).read())
    if not source.exists() or hashlib.sha256(source.read_bytes()).hexdigest() != SOURCE_HASH:
        raise ValueError('Missing or changed pinned Noto source; use --fetch')
    characters = {point for start, end in RANGES for point in range(start, end + 1)}
    hangul = set(range(0xAC00, 0xD7A4))
    # Keep common UI text together; uncommon player-name syllables load bounded
    # offline fragments instead of decoding all Hangul for one rare character.
    common = {ord(character) for character in (ROOT / 'src/game/content/translations.ts').read_text(encoding='utf8')}
    jamo = {point for start, end in [(0x1100, 0x11FF), (0x3130, 0x318F), (0xA960, 0xA97F), (0xD7B0, 0xD7FF)] for point in range(start, end + 1)}
    primary = (characters - hangul - jamo) | (common & hangul)
    groups = [('Regular', primary), ('Jamo', jamo)]
    for start in range(0xAC00, 0xD7A4, 512):
        points = (set(range(start, min(start + 512, 0xD7A4))) & hangul) - primary
        if points:
            groups.append(('Hangul' + format((start - 0xAC00) // 512, '02d'), points))
    original = TTFont(source, recalcTimestamp=False)
    modified = original['head'].modified
    instantiateVariableFont(original, {'wght': 400}, inplace=True)
    static = BytesIO()
    original.recalcTimestamp = False
    original['head'].modified = modified
    original.save(static)
    original.close()
    artifacts, faces, covered = [], [], set()
    def unicode_ranges(points):
        ranges = []
        for point in sorted(points):
            if ranges and point == ranges[-1][1] + 1:
                ranges[-1][1] = point
            else:
                ranges.append([point, point])
        return ','.join('U+' + format(a, 'X') + ('-' + format(b, 'X') if a != b else '') for a, b in ranges)
    for fragment, points in groups:
        weight, style = 400, 'Regular'
        font = TTFont(BytesIO(static.getvalue()), recalcTimestamp=False)
        options = subset.Options()
        options.name_IDs = ['*']
        options.name_legacy = True
        options.name_languages = ['*']
        # Horizontal UI only; retain shaping/kerning without CJK vertical alternates.
        options.layout_features = ['ccmp', 'locl', 'ljmo', 'vjmo', 'tjmo', 'rlig', 'kern', 'mark', 'mkmk', 'liga', 'clig', 'calt']
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=points)
        subsetter.subset(font)
        cmap = set(font.getBestCmap())
        if not (points & hangul).issubset(cmap):
            raise ValueError('Generated fragment lost Hangul syllables')
        covered |= cmap & hangul
        features = sorted({record.FeatureTag for record in font['GSUB'].table.FeatureList.FeatureRecord}) if 'GSUB' in font else []
        if fragment == 'Jamo' and not {'ljmo', 'vjmo', 'tjmo'}.issubset(features):
            raise ValueError('Conjoining Hangul Jamo shaping must be retained')
        names = {1: 'Willow Lane Korean', 2: style, 3: 'WillowLaneKorean-1.0-' + style,
                 4: 'Willow Lane Korean ' + style, 5: 'Version1.0; Noto source ' + COMMIT[:7],
                 6: 'WillowLaneKorean-' + style, 16: 'Willow Lane Korean', 17: style}
        font['name'].names = [name for name in font['name'].names if name.nameID not in {*names, 25}]
        for name_id, value in names.items():
            font['name'].setName(value, name_id, 3, 1, 0x409)
            font['name'].setName(value, name_id, 0, 3, 0)
        font['OS/2'].usWeightClass = weight
        font['OS/2'].fsSelection = (font['OS/2'].fsSelection & ~0x60) | (0x20 if weight == 700 else 0x40)
        font['head'].macStyle = (font['head'].macStyle & ~1) | int(weight == 700)
        font.recalcTimestamp = False
        font['head'].modified = modified
        target = ROOT / ('public/fonts/WillowLaneKorean-' + fragment + '.ttf')
        rendered = BytesIO()
        font.save(rendered, reorderTables=True)
        if args.check:
            if not target.exists() or target.read_bytes() != rendered.getvalue():
                raise ValueError('Font does not reproduce: ' + target.name)
        else:
            target.write_bytes(rendered.getvalue())
        artifacts.append({'file': target.relative_to(ROOT).as_posix(), 'weight': weight,
                          'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                          'modernHangulSyllables': len(cmap & hangul), 'unicodeRange': unicode_ranges(points),
                          'layoutFeatures': features, 'modified': True})
        faces.append('@font-face { font-family: "Tycoon Korean"; src: url("./' + target.name + '") format("truetype"); font-weight: 400; font-style: normal; font-display: swap; unicode-range: ' + unicode_ranges(points) + '; }')
        font.close()
    if covered != hangul:
        raise ValueError('Fragments must retain all11172 modern Hangul syllables')
    css = '\n'.join(faces) + '\n'
    if args.check:
        if (ROOT / 'public/fonts/korean.css').read_text(encoding='utf8') != css:
            raise ValueError('Font CSS does not reproduce')
    else:
        (ROOT / 'public/fonts/korean.css').write_text(css, encoding='utf8')
    report = {'source': {'url': URL, 'upstreamCommit': COMMIT, 'sha256': SOURCE_HASH,
                         'bytes': source.stat().st_size, 'license': 'SIL-OFL-1.1'},
              'tool': 'fonttools==' + fontTools.__version__, 'family': 'Willow Lane Korean',
              'modernHangulSyllables': len(covered), 'unicodeRanges': [[hex(start), hex(end)] for start, end in RANGES], 'artifacts': artifacts}
    metadata = json.dumps(report, indent=2) + '\n'
    if args.check:
        if (ROOT / 'art/fonts/noto-sans-kr.json').read_text(encoding='utf8') != metadata:
            raise ValueError('Font manifest does not reproduce')
    else:
        (ROOT / 'art/fonts/noto-sans-kr.json').write_text(metadata, encoding='utf8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
