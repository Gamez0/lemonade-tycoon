// State transitions only; callers must persist with GitHub blob-SHA compare-and-swap before dispatch. Independence must be externally established.
export function claim(state,{role,owner,now,ttl=1200000}) {
 const next=JSON.parse(JSON.stringify(state));let changed=false;
 for(const t of next.tasks) if(t.lease&&t.lease.until<=now){t.state=t.state==="REVIEWING"?"READY_REVIEW":"READY";t.lease=null;t.failures=(t.failures||0)+1;if(t.failures>=2)t.state="QUARANTINED";changed=true;}
 const eligible=next.tasks.filter(t=>!t.approval_required&&(role==="reviewer"?t.state==="READY_REVIEW"&&t.author!==owner:t.state==="READY")).sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id));
 const t=eligible[0];if(!t){if(changed)next.version++;return {state:next,job:null};}
 t.state=role==="reviewer"?"REVIEWING":"RUNNING";t.epoch=(t.epoch||0)+1;t.lease={owner,until:now+ttl,epoch:t.epoch};next.version++;
 return {state:next,job:{id:t.id,epoch:t.epoch,role,source_sha:t.source_sha,requirements_ref:t.requirements_ref}};
}
export function settle(state,{id,owner,epoch,now,result}) {
 const next=JSON.parse(JSON.stringify(state)),t=next.tasks.find(x=>x.id===id);
 if(!t||!t.lease||t.lease.owner!==owner||t.lease.epoch!==epoch||t.lease.until<=now)throw Error("stale claim");
 if(t.state==="RUNNING"){if(!result.source_sha||!result.requirements_ref)throw Error("artifact required");t.source_sha=result.source_sha;t.requirements_ref=result.requirements_ref;t.author=owner;t.state="READY_REVIEW";}
 else if(t.state==="REVIEWING"){if(owner===t.author||!result.evidence||result.source_sha!==t.source_sha)throw Error("invalid review");t.review={...result,owner};t.state=result.verdict==="changes_requested"?"READY":result.verdict==="passed"&&result.independence_verified===true?"ACCEPTED":"TECHNICAL_REVIEW";}
 else throw Error("invalid state");
 t.lease=null;next.version++;return next;
}
export function selftest(){
 const s={version:0,tasks:[{id:"a",priority:0,state:"READY"},{id:"b",priority:1,state:"READY"},{id:"c",priority:0,state:"READY",approval_required:true}]};
 const a=claim(s,{role:"worker",owner:"w",now:0,ttl:10});const b=claim(a.state,{role:"worker",owner:"w2",now:1,ttl:10});
 const ready=settle(b.state,{id:"a",owner:"w",epoch:a.job.epoch,now:2,result:{source_sha:"sha",requirements_ref:"req"}});
 const r=claim(ready,{role:"reviewer",owner:"r",now:3,ttl:10});const fixed=settle(r.state,{id:"a",owner:"r",epoch:r.job.epoch,now:4,result:{source_sha:"sha",evidence:"review",verdict:"changes_requested"}});
 let stale=false;try{settle(fixed,{id:"a",owner:"w",epoch:a.job.epoch,now:5,result:{}})}catch{stale=true}
 const recovered=claim(b.state,{role:"worker",owner:"w3",now:12,ttl:10});const rr=claim(ready,{role:"reviewer",owner:"r",now:3,ttl:10});const technical=settle(rr.state,{id:"a",owner:"r",epoch:rr.job.epoch,now:4,result:{source_sha:"sha",evidence:"review",verdict:"passed",independence_verified:false}});
 const checks=[a.job.id==="a",b.job.id==="b",r.job.source_sha==="sha",fixed.tasks[0].state==="READY",stale,recovered.job.id==="a",technical.tasks[0].state==="TECHNICAL_REVIEW",s.version===0,claim(ready,{role:"reviewer",owner:"w",now:3}).job===null];if(checks.some(x=>!x))throw Error("test failure");return checks.length;
}
