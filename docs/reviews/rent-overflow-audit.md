# Rent overflow and visual audit - 2026-10-25

The user repeated the Rent horizontal-scroll report and requested visual
inspection. Previous alpha15 hid the scrollbar while keeping ten cards in
a horizontal strip. In100 actual Windows observations (ten locations,1100x850
and800x600, forced100/125/150/175/200% renderer scales), the native scrollbar
was hidden, but scrollWidth exceeded clientWidth by1186..1520px. Every sample
accepted a horizontal scrollLeft change. Contact sheets show partly cut cards
at the strip edges. Absence of a painted scrollbar was not sufficient evidence
that horizontal overflow was fixed.

Rent now lays out only three visible cards in three minmax(0,1fr) grid columns.
The window follows selection and clamps at catalogue ends. The other seven
cards are hidden from layout and keyboard focus. Previous/Next and arrow keys
still reach all ten locations, including locked previews. There is no scroll
position to recenter; overflow:clip prevents a scroll container being created.
Business transactions, weather, saves and customer art are unchanged.

The browser regression now checks actual extent and attempted scrollLeft,
in addition to scrollbar height, selected-card visibility and page width.
Desktop tests navigate through the real visible controls instead of directly
clicking offscreen cards. A dedicated Windows audit takes100 real Rent crops
and ten full-window captures, creates five contact sheets for visual review,
checks nested/ancestor horizontal scrollers, selection, keyboard wrapping and
unchanged durable save. It is included in required Windows CI.

Run test:desktop:rent with LEMONADE_DESKTOP_EXE pointing to the real package.
Evidence defaults to test-results/desktop-rent. Set LEMONADE_RENT_BASELINE=1
only when measuring the old package; that mode records rather than asserting
zero overflow. Forced renderer scales are not physical-monitor acceptance.
Final exact-head CI, measured results and visual observations are recorded in
the PR/issue before integration. Candidate version is alpha16 to distinguish
this structural fix from alpha15's scrollbar hiding.
