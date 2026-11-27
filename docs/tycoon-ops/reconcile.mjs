// Deterministic, read-only reconciliation; no claim of scheduler control.
export function reconcile(events, now, leaseMs=20*60*1000) {
  const groups=new Map();
  for(const e of events){if(!e.run_id)continue;const g=groups.get(e.run_id)||{};if(e.ended_at||e.outcome)g.end=e;else if(e.started_at)g.start=e;groups.set(e.run_id,g);}
  const runs=[...groups].map(([id,g])=>({id,role:g.start?.role??g.end?.role,task:g.start?.task_id??g.end?.task_id,at:g.start?.started_at??g.end?.started_at,state:g.end?.ended_at?(g.end.outcome==='progress'?'COMPLETED':'FAILED'):g.start&&now-Date.parse(g.start.started_at)>leaseMs?'INTERRUPTED':'RUNNING',artifact:g.end?.evidence??g.start?.evidence??[]}));
  const active=new Set(); const failures=new Map();
  for(const r of runs.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){const k=r.role+':'+r.task;if(r.state==='RUNNING'){if(active.has(k))r.state='DUPLICATE';else active.add(k);}if(['FAILED','INTERRUPTED'].includes(r.state))failures.set(k,(failures.get(k)||0)+1);else if(r.state==='COMPLETED')failures.set(k,0);}
  return {runs, recovery:runs.filter(r=>r.state==='INTERRUPTED').map(r=>({id:r.id,action:r.artifact.length?'VERIFY_EXISTING':'RESUME_CHECKPOINT'})),isolate:[...failures].filter(([,n])=>n>=2).map(([key])=>key)};
}
export function selftest(){
 const now=3600000, base={role:'worker',task_id:'X',started_at:new Date(0).toISOString()}, events=[{...base,run_id:'a'},{...base,run_id:'b',evidence:['artifact']},{...base,run_id:'c',started_at:new Date(now).toISOString()},{...base,run_id:'d',started_at:new Date(now).toISOString()}];
 const r=reconcile(events,now); if(r.recovery.length!==2||r.recovery[1].action!=='VERIFY_EXISTING'||r.isolate.length!==1||!r.runs.some(x=>x.state==='DUPLICATE'))throw Error('recovery assertion');
 return {passed:4};
}
