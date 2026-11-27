# Android integration CI

Feature pull requests target `tycoon-base/android-spike`. Before merge, verify Android web payload, Reboot checks and dependency review for the current PR head. After merge, verify integration push checks. Deployment remains restricted to main.


## Verification and recovery

- Before merging, record the exact PR head SHA and current base SHA. Verify the Android web-payload, Reboot simulation and Windows packaging, and dependency-review jobs completed successfully for that PR head; skipped or missing required checks do not pass. Recheck the head and base immediately before merging and use the expected head SHA.
- Only the independent reviewer may merge into the integration branch. Never merge the legacy draft PR #307 or deploy from this branch.
- After merging, record the actual merge commit SHA and verify the integration push Android and Reboot checks for that SHA. Deployment must be skipped.
- If post-merge checks fail or are missing, mark the integration unhealthy, pause further merges, record the failing run and SHA in the incident backlog, and prepare an isolated corrective or revert PR. Resume merges only after the corrective change passes the required checks and integration health is restored. Do not force-push or change main.
