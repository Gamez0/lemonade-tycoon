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

Offline fonts are renamed static Noto Sans KR fragments. All11,172 modern Hangul
syllables and conjoining Jamo are retained across24 shipped files. A154,980-byte
primary face contains common UI syllables and Latin/symbols; a separate319,988-byte face retains Jamo shaping;
22 disjoint fallback blocks cover the remaining syllables. CSS unicode ranges
load uncommon company-name characters on demand. The upstream OFL is unchanged.
All fragments, source hashes and ranges are recorded in art/fonts/noto-sans-kr.json
and checked by the build/archive audits. The pinned generator reproduces all
outputs byte-for-byte, including CSS; --check verifies without writing.

Earlier monolithic fonts passed locally but exceeded the unchanged256MiB budget
in Windows CI (final monolithic mean259.505MiB). Font sharding reduces normal-play
font decoding without dropping uncommon characters. Browser coverage includes an
actual rare-Hangul company name that loads offline fallback fragments. Required
conjoining Jamo features are retained and asserted in the dedicated Jamo face. Final
local and current-commit CI memory measurements are recorded on the issue/PR.

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
