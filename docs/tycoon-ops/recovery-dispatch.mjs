// Idempotent recovery task materialization. Persist with blob SHA CAS. Does not execute AI.
export function recoverRun(state,{run,receipt,role}) {
 const next=JSON.parse(JSON.stringify(state));
 if(next.processed.includes(run.id)||run.recorded_status==="in_progress")return next;
 if(receipt&&receipt.run_id===run.id&&receipt.verified===true)return next;
 next.processed.push(run.id);
 const id="recover-"+run.id;
 next.tasks.push({id,role,state:"READY",priority:0,source_run:run.id,action:"RECONCILE_EXISTING_ARTIFACTS_THEN_RESUME",reason:"missing verified terminal receipt",attempts:0});
 next.version++;
 return next;
}
