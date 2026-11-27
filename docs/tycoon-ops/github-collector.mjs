// Dependency-injected read-only GitHub collector. Authentication belongs to caller.
export async function collectGitHub({get,repo,number}) {
 const root="/repos/"+repo;
 const p=await get(root+"/pulls/"+number);
 const pr={number:p.number,state:p.state,draft:p.draft,mergeable:p.mergeable,head:p.head.ref,head_sha:p.head.sha,base:p.base.ref,base_sha:p.base.sha};
 const checks=[];
 for(const [sha,event] of [[pr.head_sha,"pull_request"],[pr.base_sha,"push"]]){
 const data=await get(root+"/actions/runs?head_sha="+sha+"&event="+event+"&per_page=100");
 for(const r of data.workflow_runs.filter(x=>x.head_sha===sha&&x.event===event&&["Android web spike","Reboot checks","Dependency review"].includes(x.name))){
 const jobs=await get(root+"/actions/runs/"+r.id+"/attempts/"+r.run_attempt+"/jobs?per_page=100");
 for(const j of jobs.jobs)checks.push({workflow:r.name,job:j.name,head_sha:sha,event,run_id:r.id,attempt:r.run_attempt,conclusion:r.status==="completed"?j.conclusion:null});
 }}
 return {pr,checks};
}
