# Korean interface — #286

English remains the default. Help / Settings offers English and 한국어; the
`willow-lane.locale.v1` preference belongs to the interface, outside company saves.
Existing English installs keep their behavior. Unsupported preferences fall back
to English. Currency remains US dollars and temperature remains Celsius; Korean
dates use 년/월/일, quantities use the relevant Korean unit.

English messages are stable fallback IDs in `content/translations.ts`. Static
text, dynamic messages and accessible labels use the same view translator. A
missing translation leaves the English text readable, including unknown backend
recovery errors. Source messages are retained for switching back to English.
Player company names and editable data are excluded from translation. No enums,
save keys, prices, acquisition values, simulation rules or random seeds change.

Coverage includes the company menu/recovery, seven business tabs, catalogues,
weather/news, customer reactions, reports, help and save errors. The native failed
save/quit warning follows the interface language through a sender-checked IPC;
its small native preference is separate from both company saves and the browser
language preference. Native persistence failure leaves the session functional.

Offline fonts are renamed a static Regular Noto Sans KR derivative, with all
11,172 modern Hangul syllables, not a subset of current translated words. Source
commit/hash, modified outputs and coverage are in `art/fonts/noto-sans-kr.json`;
`scripts/korean-fonts.py` with pinned FontTools reproduces the output exactly.
The upstream OFL is shipped unchanged. See `art/fonts/README.md` for reproduction.

The initial full CJK variable font exceeded the existing256MiB private-memory
budget. Two static full-Hangul faces passed locally, but exact-head Windows CI
measured259.113MiB and correctly failed. The final version ships one Regular face,
uses browser bold synthesis, and excludes unused CJK vertical/alternate layout
features while retaining horizontal shaping and every modern Hangul syllable.
The cap is unchanged. The single-face package passed Korean70-layout validation,
all5 locale browser cases, and20-day performance with maximum phase mean244.953MiB
and idle draws0. Final exact-head CI is recorded on the issue/PR.

One earlier local run lost its report when a browser test cleared the shared
output folder; that run is not counted as a completed pass. Report writing now
guarantees app cleanup and recreates its output folder.

Native Korean validation passed70 combinations: five forced Windows scale
factors100/125/150/175/200%, two content sizes800×600 and512×350, seven tabs.
It also checked offline font availability, preference/relaunch, exact actual-v12
paid replay, and native save-warning buttons. Browser locale tests check both
switch directions with unchanged game bytes, unknown preference/error fallback,
player names that match translation IDs, narrow catalogue controls and old paid
replay while switching languages. These are engineering checks, not human beta
or physical monitor acceptance.

Windows CI runs all15 baseline suites and an additional Korean performance pass,
retaining English and Korean reports separately. Full baseline regression and
exact-head CI evidence are recorded on #286/its PR.
