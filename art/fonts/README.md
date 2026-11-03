# Offline Korean fonts

The game ships renamed static Regular (400) and Bold (700) derivatives of Noto
Sans KR. Both retain every modern Hangul syllable, Hangul Jamo, Latin UI text and
the symbol ranges recorded in `noto-sans-kr.json`. The upstream OFL notice is
unchanged and included in desktop distributions. These are modified fonts;
the internal family is Willow Lane Korean.

Reproduce from the repository root with Python and a separate authoring venv:

```powershell
python -m venv .local-m4/font-venv
.local-m4/font-venv/Scripts/python.exe -m pip install -r art/fonts/requirements.txt
.local-m4/font-venv/Scripts/python.exe scripts/korean-fonts.py --fetch
```

The script verifies the pinned upstream SHA-256 before processing. Source cache
and Python are authoring inputs only. Generated file hashes, source commit,
Unicode coverage and tool version are recorded in the manifest. Static fonts
avoid the memory overhead observed with the full CJK variable source in the
Windows package; coverage is not restricted to the current translation strings.
