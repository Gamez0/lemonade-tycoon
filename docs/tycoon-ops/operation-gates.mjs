// Pure decision gates. Caller must independently verify evidence, persist receipts, and enforce these decisions before merge. No credentials or network calls.
export function mergeGate({pr,review,checks,health,policy}) {
 const reasons=[];
 if(!pr||pr.state!=="open"||pr.draft!==false||pr.mergeable!==true)reasons.push("pr_not_mergeable");
 if(pr?.base!==policy.integration_base||!pr?.head?.startsWith(policy.feature_branch_prefix)||policy.legacy_pr_exclusions.includes(pr?.number))reasons.push("protected_target_or_source");
 if(!review||review.verdict!=="passed"||review.head_sha!==pr?.head_sha||review.base_sha!==pr?.base_sha)reasons.push("review_not_current");
 if(!review?.independence_evidence_ref||review?.independence_verified!==true||review?.worker_context===review?.reviewer_context||!review?.worker_context||!review?.reviewer_context)reasons.push("independence_unproven");
 if(review?.approval_required!==false)reasons.push("approval_unresolved");
 if(health?.state!=="HEALTHY"||health?.sha!==pr?.base_sha)reasons.push("integration_health_unverified");
 const required=[["Android web spike","web-payload"],["Reboot checks","simulation"],["Reboot checks","windows / packaged-saves"],["Dependency review","dependency-review"]];
 for(const [workflow,job] of required){const matches=checks.filter(c=>c.workflow===workflow&&c.job===job&&c.head_sha===pr?.head_sha&&c.event==="pull_request").sort((a,b)=>b.run_id-a.run_id);if(matches[0]?.conclusion!=="success")reasons.push("required_check:"+job);}
 const deploy=checks.filter(c=>c.workflow==="Reboot checks"&&c.job==="deploy"&&c.head_sha===pr?.head_sha&&c.event==="pull_request").sort((a,b)=>b.run_id-a.run_id)[0];if(deploy?.conclusion!=="skipped")reasons.push("deploy_not_skipped");
 return {allowed:reasons.length===0,reasons,expected_head_sha:pr?.head_sha};
}
export function executionGate({run,receipt,verifiedArtifacts=[],eligibleIds=[],blockedIds=[],runtimeEvidence=false}) {
 const reasons=[];
 if(!receipt||receipt.run_id!==run.id||receipt.role!==run.role)return {state:"FAILED",reasons:["missing_or_mismatched_receipt"]};
 const start=Date.parse(receipt.started_at),end=Date.parse(receipt.ended_at);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)reasons.push("invalid_timestamps");
 if(!Array.isArray(receipt.completed_artifacts)||receipt.completed_artifacts.some(x=>!verifiedArtifacts.includes(x)))reasons.push("unverified_artifacts");
 const remaining=eligibleIds.filter(x=>!blockedIds.includes(x));
 if(!["no_eligible_work","all_remaining_work_blocked","runtime_limit"].includes(receipt.stop_reason))reasons.push("invalid_stop_reason");
 if(remaining.length&&!(receipt.stop_reason==="runtime_limit"&&runtimeEvidence))reasons.push("eligible_work_abandoned");
 if(receipt.stop_reason==="runtime_limit"&&!runtimeEvidence)reasons.push("runtime_limit_unproven");
 if(receipt.stop_reason==="all_remaining_work_blocked"&&!blockedIds.length)reasons.push("blocked_claim_unproven");
 if(!Array.isArray(receipt.remaining_eligible_ids)||remaining.some(x=>!receipt.remaining_eligible_ids.includes(x)))reasons.push("incomplete_remaining_inventory");
 return {state:reasons.length?"FAILED":receipt.completed_artifacts?.length?"PROGRESS":"NO_ELIGIBLE_WORK",reasons,remaining};
}
