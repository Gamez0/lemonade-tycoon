# M10 Steam preparation

Status: local materials only. Real AppID/DepotID and partner permission have not
been supplied. No Steam upload, installation, review submission, fee or public
release was performed. M8 human/environment gates and rights/name clearance remain
open. A prototype manifest and generated VDF are not evidence of Steam acceptance.

Official documentation checked 2026-10-08:
[SteamPipe](https://partner.steamgames.com/doc/sdk/uploading),
[review](https://partner.steamgames.com/doc/store/review_process),
[onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding),
[store art](https://partner.steamgames.com/doc/store/assets/standard),
[library art](https://partner.steamgames.com/doc/store/assets/libraryassets).
Valve reviews both store presence and product build. Store features must reflect
implemented content, and screenshots must show gameplay. Distribution rights must
be confirmed; the draft title and contributor rights are not yet cleared.

## Local preparation

Steamworks mapping: one Windows x64 depot belonging to the real app; launch
executable `Lemonade Tycoon.exe`, working directory `.`, Windows platform. Keep
these compatibility names through first release. Do not mount source/research,
personal saves, credentials or the Steam SDK contentbuilder directory in the depot.
Select only the verified Windows package as ContentRoot. SDK/API integration,
Cloud, achievements and overlay functionality are not claimed.

Templates: `steam/app_build.template.vdf`, `steam/depot_build.template.vdf`.
With real IDs run:

```powershell
node scripts/steam-prepare.cjs APP_ID DEPOT_ID VERIFIED_PACKAGE OUTPUT_DIRECTORY
```

The generator verifies every manifest checksum, rejects example/missing IDs and
places scripts outside the depot. Preview is enabled and SetLive is empty. These
scripts never run SteamCMD or upload. Preview builds produce manifests/logs only.
When explicit upload authorization and partner access exist, the operator can run
the SDK SteamCMD with `+login USER +run_app_build ABSOLUTE_APP_VDF +quit` and inspect
the preview mappings. Do not put a password in a committed file or CLI history.
For an authorized private upload, change Preview to0, upload, and assign the build
manually to a password-protected test branch in Steamworks. Keep default unpublished.

## Actual external acceptance (all pending)

- Confirm account onboarding, correct AppID/depot ownership, upload role and rights.
- Finish M2 visual, music listening, five human testers and deferred Windows checks.
- Verify fresh package checksums and final source-head CI before upload.
- Confirm store copy/language/specs against tested features; inspect all art previews.
- Private branch: Steam client download, launch offline, first3days, earned unlock,
  save, close, update, continued business, reinstall retaining user data, rollback.
- Record app/depot/build IDs, branch, source hash, machine/date and actual outcomes.
- Only after these pass, separately authorize submission for Valve review.
- Record Valve's store/build review separately; do not infer approval from upload.

No price, launch date, public visibility or purchase has been configured.
