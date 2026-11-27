// Read-only recovery classification; not an atomic lock or scheduler.
export function reconcile(events, now, leaseMs=20*60*1000) {
 const groups=new Map();
 for(const e of events){if(!e.run_id)continue;const g=groups.get(e.run_id)||[];g.push(e);groups.set(e.run_id,g);}
 const runs=[...groups].map(([id,g])=>{const start=g.find(e=>e.started_at),end=g.find(e=>e.ended_at&&e.outcome),latest=g.at(-1),artifact=[...new Set(g.flatMap(e=>e.evidence||[]))],at=start?.started_at,age=now-Date.parse(at);let state=end?(end.outcome==='progress'&&artifact.length?'COMPLETED':end.outcome==='blocked'?'BLOCKED':'FAILED'):latest.approval_required?'BLOCKED':!Number.isFinite(age)?'UNKNOWN':age>=leaseMs?'INTERRUPTED':'RUNNING';return {id,role:start?.role??latest.role,task:start?.task_id??latest.task_id,at,state,artifact,checkpoint:latest.next_task??start?.next_task??null};});
 const active=new Set(),failures=new Map();
 for(const r of runs.sort((a,b)=>(Date.parse(a.at)||0)-(Date.parse(b.at)||0))){const k=r.role+':'+r.task;if(r.state==='RUNNING'){if(active.has(k))r.state='DUPLICATE';else active.add(k);}if(['FAILED','INTERRUPTED'].includes(r.state))failures.set(k,(failures.get(k)||0)+1);else if(r.state==='COMPLETED')failures.set(k,0);}
 return {runs,recovery:runs.filter(r=>['INTERRUPTED','FAILED'].includes(r.state)).map(r=>({id:r.id,action:r.artifact.length?'VERIFY_EXISTING':r.checkpoint?'RESUME_CHECKPOINT':'DISCOVER_EXISTING_ARTIFACT',checkpoint:r.checkpoint})),isolate:[...failures].filter(([,n])=>n>=2).map(([key])=>key)};
}
export function selftest(){
 const now=3600000,base={role:'worker',task_id:'X',started_at:new Date(0).toISOString()},fresh=new Date(now).toISOString();
 const events=[{...base,run_id:'a',next_task:'build'},{...base,run_id:'b',evidence:['artifact']},{...base,run_id:'c',started_at:fresh},{...base,run_id:'d',started_at:fresh},{...base,run_id:'e',approval_required:true},{...base,run_id:'f',ended_at:fresh,outcome:'progress'},{run_id:'g'}];
 const r=reconcile(events,now),by=id=>r.runs.find(x=>x.id===id),action=id=>r.recovery.find(x=>x.id===id)?.action;
 const checks=[by('a').state==='INTERRUPTED',action('a')==='RESUME_CHECKPOINT',action('b')==='VERIFY_EXISTING',r.isolate.includes('worker:X'),by('d').state==='DUPLICATE',by('e').state==='BLOCKED',by('f').state==='FAILED',by('g').state==='UNKNOWN'];
 if(checks.some(x=>!x))throw Error('recovery assertion');return {passed:checks.length};
}
