# Company price contracts and acquisition basis — #292

Current prices do not change. The historical `legacy-v1` table is independent of
the presentation catalogues and deeply frozen. It includes equipment, wages,
advertising, location charges, unit costs and supply packs. Changing the default
for a future new company must add a new immutable table and select its identifier
at company creation; editing an existing contract is a compatibility break.
No future price schedule or unmeasured original economic coefficient is invented.

Schema14 adds optional company economy metadata: a rule identifier and individual
equipment acquisition prices. New UI companies opt in during fresh creation or
an explicit business reset. An existing save never adopts a new rule in render,
decode, import or day transition. Missing metadata permanently means legacy-v1,
independent of the default for new companies. The low-level newGame factory keeps
this implicit contract for old model fixtures; product creation explicitly calls
withCompanyEconomy. It rejects adoption after purchases, upgrades or opening.

Legacy snapshots remain structurally identical. They derive equipment value from
the frozen historical schedule, not today's catalogue. Explicit contracts record
each acquisition price when purchased; balance sheets sum those records. Quotes
for the next purchase, staff, ads, rent and supplies resolve the company's rule.
Names and non-price roles stay in the catalogues. No subsidy, revaluation, refund,
repurchase or automatic cash adjustment occurs.

The decoder validates the rule, exact equipment levels/prices, cumulative capital
and company-wide rule continuity. New-contract equipment cannot disappear between
days. Older schemas cannot smuggle economy metadata; unknown or malformed rules
fail safely. Old paid openings retain their cached fees and wage/ad charges under
the preserved contract. Current opening quotes and historical ledger values are
separate, and replay does not pay a second time. The save key stays unchanged;
older readers reject the newer schema instead of silently repricing it.

Three actual schema13 snapshots were captured from unchanged alpha24 modules at
1d6776d: bulk/equipment preparation, paid staff/ad/free-ice opening, and a second
day with retained ice/history. The fixture includes full expected completed-day
states. It is preserved rather than regenerated from the new implementation.
Model, browser and native checks replay these alongside existing actualv6/v10/
v11/v12 fixtures. Native schema13 cases extend the existing paid-replay suite.

Counterfactual tests add a future registry entry and mutate the presentation
catalogues' equipment, wage, ad, rent and unit prices. Old-company quotes, assets,
cash and complete schema13 replay outcomes remain unchanged. A separate funded
model study compares implicit and explicit contracts over120 days/12 seeds with
changing staff, ads, upgrades and locations; it asserts equal complete states
apart from the new metadata, including cash and RNG. This is a deterministic
compatibility check, not observed human/original-game economy balance.

The UI adds no implementation terminology. Browser coverage checks a purchase's
recorded $9.00 basis against its next $17.00 quote, persistence through company
switch/relaunch, and all three imported schema13 states. Korean fallback resources
cover the new recovery errors. Final source, full regression, clean package and
required CI evidence are recorded on #292/its PR.
