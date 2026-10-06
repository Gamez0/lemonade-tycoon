# PC distribution preparation self-review

Problem: Windows packaging copied the web output, including legacy.html and all public
legacy assets. Their provenance is not cleared for reboot distribution. Web preview
still intentionally preserves them. The PC build now has a dedicated single entry and
no public-directory copy. Vite bundles the actual reboot font; its OFL is emitted explicitly.
The desktop favicon is removed because its provenance has not been established here.
No gameplay/save format changes, source legacy deletion or music adoption occurs.

Checks: desktop inventory permits only index, generated JS/CSS/font and the explicit OFL.
This rejects accidental legacy pages/research images and editor files. It is a structural
check, not automatic licensing clearance or proof that arbitrary JavaScript is safe.
M7/M9 still require actual content/dependency rights review.

Windows CI packages this output and runs existing native save/import/recovery tests.
After recording build-info, it creates and verifies a full SHA-256 inventory before uploading.
Required executable/ASAR/Electron license files must exist. Inventory excludes only its
own manifest and rejects symlinks; added/missing/modified files invalidate verification.
Source commit and PR merge checkout remain distinct. An unsigned manifest detects accidental
corruption against a trusted copy; it is not a digital signature or an authenticity guarantee.

New regression tests cover tampering, additions/deletions, source mismatch, incomplete package
and legacy/reference content. Linux tests cannot establish Windows execution. Current-head
Windows CI and actual clean-PC checks remain separate requirements.

M6 design and M7–M10 plans remain preparation. Steam VDF examples contain placeholders,
Preview enabled and no SetLive; no script invokes Steam, signs a product or pays for anything.
Final names/versions/IDs, music #113, M2 visual acceptance, M4 actual transfer/update,
M5/M6 gameplay and M8 participants are still outstanding.
