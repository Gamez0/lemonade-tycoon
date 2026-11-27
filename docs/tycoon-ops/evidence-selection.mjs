// Evidence selection is not authentication of reviewer identity.
export function selectReviewRecord(queue,pr){
 const items=queue.items.filter(x=>x.pr===pr.number&&x.source_sha===pr.head_sha);
 if(items.length!==1)return {record:null,reason:"missing_or_ambiguous_task"};
 const item=items[0],r=item.review;
 if(!r||r.head_sha!==pr.head_sha||r.base_sha!==pr.base_sha)return {record:null,reason:"missing_current_review"};
 return {record:r,reason:null};
}
export function integrationHealth(checks,sha){
 const required=[["Android web spike","web-payload","success"],["Reboot checks","simulation","success"],["Reboot checks","windows / packaged-saves","success"],["Reboot checks","deploy","skipped"]];
 const missing=required.filter(([w,j,c])=>checks.filter(x=>x.workflow===w&&x.job===j&&x.head_sha===sha&&x.event==="push").sort((a,b)=>b.run_id-a.run_id||b.attempt-a.attempt)[0]?.conclusion!==c).map(x=>x[1]);
 return {sha,state:missing.length?"UNVERIFIED":"HEALTHY",missing};
}
