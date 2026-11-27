// Pure selection policy; no atomic claim or scheduler enforcement.
export function selectReview(items, now) {
 const eligible=items.filter(x=>x.status==="READY"&&x.source_sha&&x.requirements_ref&&!x.approval_required);
 const sorted=eligible.sort((a,b)=>Number(!!b.recheck)-Number(!!a.recheck)||(a.priority??99)-(b.priority??99)||Date.parse(a.ready_at)-Date.parse(b.ready_at)||a.id.localeCompare(b.id));
 if(sorted.length)return {action:"REVIEW",item:sorted[0]};
 const expired=items.filter(x=>x.status==="RUNNING"&&Number.isFinite(Date.parse(x.lease_until))&&Date.parse(x.lease_until)<=now);
 if(expired.length)return {action:"RECOVER",item:expired[0]};
 return {action:"AUDIT_BACKLOG"};
}
export function selftest(){
 const t=Date.parse("2026-11-27T02:00:00Z"),base={status:"READY",source_sha:"abc",requirements_ref:"V-010",ready_at:"2026-11-27T01:00:00Z"};
 const a={...base,id:"a",priority:1},b={...base,id:"b",recheck:true,priority:2},c={...base,id:"c",approval_required:true},d={...base,id:"d",status:"RUNNING",lease_until:"2026-11-27T01:30:00Z"};
 const checks=[selectReview([a,b],t).item.id==="b",selectReview([c,a],t).item.id==="a",selectReview([d,a],t).action==="REVIEW",selectReview([d],t).action==="RECOVER",selectReview([c],t).action==="AUDIT_BACKLOG",selectReview([{...a,source_sha:null}],t).action==="AUDIT_BACKLOG",selectReview([{...a,status:"ACCEPTED"}],t).action==="AUDIT_BACKLOG"];
 if(checks.some(x=>!x))throw Error("queue assertion");return checks.length;
}
