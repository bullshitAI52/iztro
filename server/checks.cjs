const assert=require('node:assert/strict');
process.env.DEEPSEEK_API_KEY='test-only';process.env.ZIWEI_ACCESS_KEY='test-access';
const {prepare,server}=require('./server.cjs');
const input={birthDate:'2000-08-16',timeIndex:2,gender:'女',targetDate:'2027-05-20',targetTimeIndex:null,topic:'婚姻关系',question:'讨论婚礼预算时有哪些需要核实的条件？'};
const p=prepare(input);
assert.equal(p.natal.palaces.length,12);
assert.equal(p.date,'2027-05-20');
assert.equal(p.timing.yearly.heavenlyStem,'丁');
assert.equal(p.timing.daily.palaces.length,12);
assert.equal(p.timing.monthly.palaces.length,12);
assert.equal(p.timing.hourly,undefined);
assert.equal(p.timing.yearly.palaces.find(p=>p.layerPalace==='夫妻').earthlyBranch,'巳');
assert.equal(p.timing.yearly.palaces.find(p=>p.layerPalace==='夫妻').natalPalace,'兄弟');
assert(prepare({...input,targetTimeIndex:7}).timing.hourly);
assert.throws(()=>prepare({...input,targetDate:'2027-02-30'}));
assert.throws(()=>prepare({...input,targetDate:'1999-01-01'}));
assert.throws(()=>prepare({...input,timeIndex:20}));
assert.throws(()=>prepare({...input,question:'a'.repeat(2001)}));
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 try {
 assert.equal((await fetch(url+'/health')).status,200);
 assert.equal((await fetch(url+'/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})).status,401);
 assert.equal((await fetch(url+'/analyze',{method:'POST',headers:{Origin:'https://invalid.example',Authorization:'Bearer test-access','Content-Type':'application/json'},body:JSON.stringify(input)})).status,403);
 const preflight=await fetch(url+'/analyze',{method:'OPTIONS',headers:{Origin:'https://bullshitai52.github.io'}});
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://bullshitai52.github.io');
 assert.equal((await fetch(url+'/analyze',{method:'POST',headers:{Authorization:'Bearer test-access','Content-Type':'application/json'},body:'{'})).status,400);
 console.log('PASS: date validation, daily/monthly scope, optional hours, auth, CORS and malformed requests. No DeepSeek calls made.');
 }finally{server.close();server.closeAllConnections();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
