# Original widget evidence ledger - 2026-11-02

This #232 audit reconciles the existing parent reconstruction with the product.
It does not extract fonts/images again or claim complete original UI ownership.
The full [462-row ledger](widget-evidence/widget-bindings.csv), the
[430 remaining rows](widget-evidence/widget-unmapped.csv), and
[input hashes/counts](widget-evidence/widget-evidence.json) are numeric metadata;
no original pixels, glyphs, audio or executable bytes are included.

## Result and evidence levels

| Classification | Rectangles | Meaning |
| --- | ---: | --- |
| Established resource-image composition | 29 | Existing menu/Play-panel, seven preparation tabs and weather panel |
| Established geometry only | 3 | Three forecast icon positions; the selected image varies with weather |
| Unmapped with existing dimension candidates | 194 | Candidate dimensions do not establish an image, parent or state |
| Unmapped without dimension candidates | 236 | May be text, non-image controls, compound content or unknown; no role assigned |
| Total | 462 | Every existing rectangle appears exactly once |

There are **no newly proven runtime-owner, per-widget-font or interaction-state
bindings**. The ledger says `unverified` for each of those fields. In particular,
a unique size match is still a candidate. The three forecast positions are not
three fixed weather identities and are not evidence of 12:00/18:00 boundaries.

The menu baseline reuses `tools/inspect-original.py`'s `MENU_REFERENCE_LAYERS`
and `PLAY_PANEL_LAYERS`: root resources0..8, then Play controls11..22 anchored
to resource rectangle8. Unlabelled menu controls keep numeric role names rather
than invented semantics. The seven tab bindings use rectangles236..242 and
images218/224/221/216/213/214/211. Panel243 uses image222; positions244..246 are
21x21. Play coordinates are composed relative to anchor8; other established
positions use root coordinates. Unknown coordinates are not silently promoted
to absolute positions. The script checks that established compositions remain
inside the640x480 source frame and agree with the existing gallery candidates.

Six existing font records/images45..50 and954 glyphs are accounted for; the
59-glyph symbol subset remains distinct. This is completed extraction evidence.
The parent's use of bitmap font3 for headings/numbers is a remake selection,
not an original per-widget binding. Likewise, first-slice rendering, hover tint
and disabled alpha do not prove original idle/hover/pressed/disabled ordering.

## Comparison boundaries

| Evidence | Confirmed comparison | Limit |
| --- | --- | --- |
| Parent archive, SHA256 `9a3a2e367e33e1acea9ab30d5a5718e42d2c180d4313ec052bfa6c6d6e0d2d88` | Same-byte resources and640x480 composition above | Archive release version is unverified; source geometry is not a running UI capture |
| Retained1.1.6 legitimate live audit | Original preparation/trading/report observations and numeric rules; see [audit](original-116-live-audit.md) | Trial ended2026-10-14; this audit does not launch it again or bypass access limits |
| Prior1.1.5 captures/reviews | Existing same-place/size comparisons remain evidence for their stated source version | Do not relabel them1.1.6 or assert equality with the parent archive |
| Product alpha20/main389f507 | Own art/fonts, seven preparation screens, weather periods, eight companies, native containment/replay verified | Product is a separate implementation; source pixels and original per-widget fonts are not shipped |

The product's [company lobby review](../reviews/company-lobby-ui.md),
[map fit review](../reviews/map-viewport-fit.md),
[weather boundary](../reviews/weather-period-compatibility.md) and
[customer review](../reviews/eleven-customer-profiles.md) describe implemented
differences and validation. The lobby intentionally uses a new composition
inside the classic logical frame. Existing controlled comparisons are not
upgraded into a new same-version runtime comparison by this ledger. Human
visual acceptance #97/#16 remains open. #229 engineering completion does not
mean all462 original widgets or six original weather names were recovered.

## Reproduce without re-extraction

Run with Python3.10+ in the product worktree:

```powershell
python scripts/widget-evidence.py --legacy-root C:/Users/dobin/Documents/Projects/lemonade-tycoon --output .local-m4/widget-evidence-check
```

Inputs are the existing `public/assets/original/{ui-layouts,preparation-tabs,
weather-panel,fonts}.json`, `.local/original/widget-gallery.html`, and the
original inspector source for provenance. The tool reads gallery candidate
numbers with an HTML parser; it never decodes its embedded images or executes
its JavaScript. It refuses a different archive hash and any output inside the
preserved parent worktree. Repeated runs against the same input bytes produce
the same three reports. Source-file hashes make changed legacy metadata visible.

## Remaining evidence, not assumed mappings

1. Match the exact archive to a running original release before calling a new
   comparison version-controlled. Keep native640x480, identical location, plan,
   equipment, mode and preparation/trading/report state in the capture record.
2. Trace each remaining widget constructor/parent and font selector, or capture
   its actual owning screen. Start with the194 candidate-bearing rows; keep the
  236 no-candidate rows until text/compound-control evidence is available.
3. Capture idle, pointer-over, pointer-down, released, disabled and keyboard
   focus states for each sheet family. Slice count alone is insufficient.
4. Retain a valid, licensed original execution environment for new live evidence;
   do not restart an expired trial or treat static resource reconstruction as
   runtime acceptance. Existing retained-image static analysis remains available
   for bounded follow-ups, with image hash and addresses recorded separately.

This completes the reproducible connection/candidate/unknown ledger requested by
#232. It leaves those evidence gaps explicit rather than assigning unsupported
owners, font roles or state names. Research findings do not authorize original
asset distribution or automatically add product scope.
