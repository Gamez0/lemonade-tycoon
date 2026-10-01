# Pitcher recipe correction — 2026-10-01

The reboot had simplified all three recipe ingredients to per-cup use. The original recipe panel visibly shows pitcher output in the [PC reference screenshot](https://games-cdn.softpedia.com/screenshots/Lemonade-Tycoon_6.jpg). The repository's earlier `src/models/recipe.ts` uses an ice-to-yield table: 0–7 ice per cup produces 10, 11, 12, 14, 16, 20, 25 or 33 cups per pitcher. These values are reused as this project's rules; the screenshot alone does not establish the exact original formula.

Lemon and sugar are consumed once when a pitcher is made. Ice is consumed for the full pitcher (ice per cup × pitcher yield). One paper cup is consumed on each sale. Batch ingredients enter daily cost when produced, so unsold prepared lemonade still costs money. Prepared cups are discarded at the end of a day. Remaining purchased ice melts before the next day, while lemon, sugar and cups carry over. No refrigerator or ice maker exists yet; their effects belong in M6 upgrades.

Save version 2 records the production model, pitchers made, melted ice and current prepared cups. Version 0/1 results preserve their historical cup-based cost and are marked as such in the migrated ledger; subsequent days use pitchers. This avoids recalculating old profit with the new rule.

The recipe inputs keep the explicit minus and plus buttons but hide the browser's hover spinner. The street scene now spaces waiting customers 38 pixels apart and draws departing and passing visitors on a lower lane, preventing the service-position overlap. A review of the preparation flow also found that the longer recipe explanation changed the Start day button position; the panels now share enough minimum height for that content at the tested viewport widths.
