// Adapter-driven execution: persist claims before dispatch; use a real isolated executor in production.
export async function transact(store, transition, attempts=3) {
 for(let i=0;i<attempts;i++){const current=await store.read();const next=transition(current.state);if(next.state.version===current.state.version)return next;try{await store.write(current.sha,next.state);return next;}catch(e){if(!store.isConflict(e)||i===attempts-1)throw e;}}
}
export async function tick({store,claim,settle,executor,role,owner,clock,ttl}) {
 const selected=await transact(store,s=>claim(s,{role,owner,now:clock(),ttl}));if(!selected.job)return {outcome:"no_eligible_job"};
 const job=selected.job;
 // Executor receives immutable task metadata, not worker conversation. Identity is not proof of independence.
 const result=await executor(job);
 const committed=await transact(store,s=>({state:settle(s,{id:job.id,owner,epoch:job.epoch,now:clock(),result}),job}));
 return {outcome:"settled",job,version:committed.state.version};
}
export async function runWindow({tick,clock,budgetMs=1800000,maxSteps=100}) {
 const start=clock(),receipts=[];let stop="step_limit";
 while(receipts.length<maxSteps){if(clock()-start>=budgetMs){stop="budget";break;}const r=await tick();if(r.outcome==="no_eligible_job"){stop="no_eligible_job";break;}receipts.push(r);}
 return {receipts,elapsedMs:clock()-start,stop};
}
