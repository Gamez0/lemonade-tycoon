# Rent expense caption — #302

The Korean daily/cumulative report previously reused `Rent` from the location
navigation tab and displayed `장소` beside a monetary charge. The actual30-day
challenge's Downtown report showed `장소 $5.00`. The report now uses a distinct
`Rent expense` message ID, translated as `임대료`; the navigation tab keeps
`Rent`/`장소`. No numeric accounting, save, formula or progression changes.

The existing report/reload cases check the daily and cumulative captions in
both languages while retaining the amount and the separate navigation label.
Type/model and native small-layout checks remain the integration evidence.
Human visual acceptance is separate in #97.
