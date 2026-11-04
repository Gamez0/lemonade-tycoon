# Forecast range and three periods — #293

Fresh preparation shows the minimum–maximum of the saved three forecast
temperatures, plus three ordered weather icons with period/weather/temperature
accessible names. Equal temperatures collapse to one value. The Mall shows its
20°C indoor temperature and explicitly labels the icons as outside forecasts.

During selling, the large reading and icon show the current actual observation;
the separate three-icon strip continues to show the original forecast, never
future actual observations. Paid opening recovery is labelled as saved opening
weather. Legacy paid saves without a forecast keep their one saved reading and
hide the three-period strip. No forecast or actual data is invented for them.

This changes presentation only. Weather generation, RNG, quotas/transitions,
cooling, cash and saved snapshots retain their current rules/schema14. English
and Korean labels are provided, and common font fragments are regenerated for
the new Korean text without reducing Hangul/Jamo coverage.

Browser coverage checks the range, all three accessible icons, original forecast
versus changing actual readings, paid reload and exact final history, oldv6 paid
fallback, both languages and375–1280px layouts with unchanged save bytes. Native
UI/DPI and Korean70-layout checks also require all visible forecast icons to fit
their panel. Original visual/human acceptance remains a separate gate. Final
source, screenshots and current-commit CI evidence are recorded on #293/its PR.
