# Offline Korean fonts

The game ships a renamed static Regular (400) derivative of Noto
Sans KR. It retains every modern Hangul syllable, Hangul Jamo, Latin UI text and
the symbol ranges recorded in `noto-sans-kr.json`. The upstream OFL notice is
unchanged and included in desktop distributions. This is a modified font;
the internal family is Willow Lane Korean.

Reproduce from the repository root with Python and a separate authoring venv:

```powershell
python -m venv .local-m4/font-venv
.local-m4/font-venv/Scripts/python.exe -m pip install -r art/fonts/requirements.txt
.local-m4/font-venv/Scripts/python.exe scripts/korean-fonts.py --fetch
```

The script verifies the pinned upstream SHA-256 before processing. Source cache
and Python are authoring inputs only. Generated file hash, source commit,
Unicode coverage and tool version are recorded in the manifest. Static fonts
avoid the memory overhead observed with the full CJK variable source in the
Windows package; coverage is not restricted to the current translation strings.

Bold UI text uses browser synthesis from the same face. Horizontal shaping and
kerning are retained; unused CJK vertical/alternate layout features are removed.
Conjoining Jamo shaping (`ljmo`/`vjmo`/`tjmo`) is explicitly retained and verified,
following [Microsoft's Hangul shaping requirements](https://learn.microsoft.com/en-us/typography/script-development/hangul).
A separate bold font increased the Windows CI private-memory measurements past
the unchanged256MiB budget and is intentionally not shipped.
