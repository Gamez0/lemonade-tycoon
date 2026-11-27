import {readFileSync} from 'node:fs';
import {mergeGate,executionGate} from './operation-gates.mjs';
const mode=process.argv[2];
try {
 const input=JSON.parse(readFileSync(process.argv[3]??0,'utf8'));
 if(!['merge','execution'].includes(mode))throw Error('unknown mode');
 const result=mode==='merge'?mergeGate(input):executionGate(input);
 console.log(JSON.stringify(result));
 process.exitCode=(mode==='merge'?result.allowed:result.state!=='FAILED')?0:1;
} catch(error){console.error(JSON.stringify({error:String(error)}));process.exitCode=2;}
