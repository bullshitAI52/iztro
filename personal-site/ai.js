'use strict';
const AI_ENDPOINT='https://107.172.32.153:2053/ziwei-api/analyze';
const aiElement=id=>document.getElementById(id);
const nowForAI=new Date();
aiElement('event-date').value=`${nowForAI.getFullYear()}-${String(nowForAI.getMonth()+1).padStart(2,'0')}-${String(nowForAI.getDate()).padStart(2,'0')}`;
times.forEach((name,index)=>aiElement('event-time').add(new Option(name,String(index))));
try{aiElement('access-code').value=sessionStorage.getItem('ziwei-access-code')||'';}catch{}
let pendingAI=null;
function stopAI(message){if(pendingAI){pendingAI.abort();pendingAI=null;}aiElement('ai-submit').disabled=false;aiElement('ai-cancel').hidden=true;if(message)aiElement('ai-status').textContent=message;}
function invalidateAI(){stopAI('出生信息已修改，请重新生成命盘后再解读。');aiElement('ai-result').hidden=true;}
aiElement('birth-form').addEventListener('input',invalidateAI);
aiElement('birth-form').addEventListener('submit',()=>{aiElement('ai-result').hidden=true;stopAI('命盘更新后，请按需要重新解读。');});
aiElement('example').addEventListener('click',()=>{aiElement('ai-result').hidden=true;stopAI('当前是示例出生信息，请确认后再解读。');});
aiElement('ai-cancel').addEventListener('click',()=>stopAI('已停止等待；服务器请求可能仍在完成，请勿连续重试。'));
aiElement('forget-code').addEventListener('click',()=>{aiElement('access-code').value='';try{sessionStorage.removeItem('ziwei-access-code');}catch{}aiElement('ai-status').textContent='已清除当前标签页保存的访问码。';});
const presets={
 '婚姻关系':'这天想和伴侣讨论结婚安排，目前对预算和双方家庭参与方式有分歧。沟通时应注意什么？哪些风险需要提前处理？',
 '财运规划':'这天计划重新安排个人预算和储蓄。请区分传统命理参考与现实财务风险，告诉我做决定前需要核实哪些收支、负债和备用金信息。',
 '事业工作':'这天计划讨论一份新工作机会，但薪资、试用期和岗位职责还没完全明确。有哪些谈判准备和现实风险需要注意？'
};
document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{aiElement('topic').value=button.dataset.topic;aiElement('question').value=presets[button.dataset.topic];}));
aiElement('ai-form').addEventListener('submit',async event=>{
 event.preventDefault();
 if(!currentChart||!currentAstrolabe){aiElement('ai-status').textContent='请先填写出生信息并生成命盘。';return;}
 if(!aiElement('ai-form').reportValidity())return;
 if(aiElement('event-date').value<aiElement('birth-date').value){aiElement('ai-status').textContent='目标日期不能早于出生日期。';return;}
 const accessCode=aiElement('access-code').value.trim();
 if(!accessCode){aiElement('ai-status').textContent='请填写个人访问码。';return;}
 try{sessionStorage.setItem('ziwei-access-code',accessCode);}catch{}
 stopAI();
 const controller=new AbortController();pendingAI=controller;
 const timer=setTimeout(()=>controller.abort('timeout'),95000);
 const selectedDate=aiElement('event-date').value,selectedTopic=aiElement('topic').value;
 const selectedTime=aiElement('event-time').value;
 aiElement('ai-submit').disabled=true;aiElement('ai-cancel').hidden=false;aiElement('ai-result').hidden=true;
 aiElement('ai-status').textContent='正在根据本命、流年、流月和流日分析，通常需要几十秒……';
 try{
  const response=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+accessCode},body:JSON.stringify({birthDate:aiElement('birth-date').value,timeIndex:Number(aiElement('time').value),gender:aiElement('gender').value,targetDate:selectedDate,targetTimeIndex:selectedTime===''?null:Number(selectedTime),topic:selectedTopic,question:aiElement('question').value}),signal:controller.signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'解读失败，请稍后重试。');
  if(pendingAI!==controller)return;
  aiElement('ai-answer').textContent=data.answer;
  aiElement('ai-context').textContent=`${selectedDate} · ${selectedTopic} · ${data.model}`;
  aiElement('ai-result').hidden=false;
  aiElement('ai-status').textContent=data.truncated?'已返回分析，因长度限制未完全展开，可缩小问题后重试。':'分析已完成。内容为 AI 生成，请结合实际情况判断。';
 }catch(error){
  if(pendingAI!==controller)return;
  aiElement('ai-status').textContent=controller.signal.aborted?'等待超时，请稍后重试。':error instanceof TypeError?'无法连接解读服务，请检查网络后重试。':error.message;
 }finally{clearTimeout(timer);if(pendingAI===controller){pendingAI=null;aiElement('ai-submit').disabled=false;aiElement('ai-cancel').hidden=true;}}
});
