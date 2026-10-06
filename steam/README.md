# SteamPipe template preparation

These examples have placeholders and are not executable submission configuration.
No Steam command, account setup, payment or upload is performed by repository scripts.
See [M7–M10 acceptance plan](../docs/reviews/m7-m10-acceptance-plan.md).

After M9 acceptance, authorized Steamworks access and latest official documentation review,
copy both `.example` files into an operator-owned directory using matching AppID/DepotID.
Resolve ContentRoot to the exact verified Windows package, BuildOutput to a separate writable
logs directory, and make the app's depot reference point to the edited depot VDF.
Keep Preview enabled for the first configuration validation. A preview is not an uploaded build.
Do not add SetLive for public release. Select a private test branch through the authorized
Steamworks workflow only after an actual build is available.

Launch configuration: Windows x64, `Lemonade Tycoon.exe`, working directory package root.
No arguments or separately installed Node runtime are required. Validate this in the Steam
client before claiming support. Save files remain in the Windows user-data directory.
Templates do not establish distribution rights or a finished game.
