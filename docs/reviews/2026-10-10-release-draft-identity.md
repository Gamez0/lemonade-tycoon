# Internal release rerun identity

Alpha10 evidence updates demonstrated that a GitHub draft metadata edit can alter
its tag and hidden URL. The old discovery used only the version tag, so rerunning
the workflow could miss an already uploaded same-version draft and create another.

Discovery now considers the exact generated release name and version-delimited
package asset prefix as well as the tag. A renamed or duplicated version identity
fails before creation/upload. Existing drafts must retain the expected source,
numeric id, version tag and prerelease state; the final API response must retain
the same id too. Published and different-source releases are preserved. Identity
repair remains an explicit operation rather than silently modifying old releases.

Meaningful regression cases: lost tag, renamed display name with uploaded bundle,
two matching drafts, source mismatch, published release, changed id/prerelease and
unrelated versions. Local release9/9, Node syntax and whitespace checks PASS.
Game behavior, save v6 and the verified alpha10 package are unchanged. Continue
runtime/error-path audits while the fresh current-head CI verifies integration.
