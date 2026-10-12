'use strict';
const AI_ENDPOINT='https://107.172.32.153:2053/ziwei-api/analyze';
const aiElement=id=>document.getElementById(id);
const nowForAI=new Date();
aiElement('event-date').value=`${nowForAI.getFullYear()}-${String(nowForAI.getMonth()+1).padStart(2,'0')}-${String(nowForAI.getDate()).padStart(2,'0')}`;
times.forEach((name,index)=>aiElement('event-time').add(new Option(name,String(index))));
aiElement('event-year').value=String(nowForAI.getFullYear());
aiElement('event-month').value=aiElement('event-date').value.slice(0,7);
function analysisMode(){return document.querySelector('input[name="analysis-mode"]:checked').value;}
function syncPeriod(){
 const mode=analysisMode();
 for(const name of ['year','month','date']){
  const active=(mode==='day'?'date':mode)===name;
  aiElement(`event-${name}-field`).hidden=!active;
  aiElement(`event-${name}`).disabled=!active;
  aiElement(`event-${name}`).required=active;
 }
 aiElement('event-time-field').hidden=mode!=='day';aiElement('event-time').disabled=mode!=='day';
 aiElement('period-hint').textContent={year:'分析公历整年的总体主题与风险，按农历换年分段，不推断具体某天。',month:'分析公历整月；跨越农历月份时分段说明，不把某一天当作整月。',day:'分析具体公历日期；有明确时辰时，可一并选择。'}[mode];
}
syncPeriod();
document.querySelectorAll('input[name="analysis-mode"]').forEach(radio=>radio.addEventListener('change',()=>{syncPeriod();stopAI('时间范围已切换，请按新的范围重新解读。');aiElement('ai-result').hidden=true;}));
for(const id of ['event-year','event-month','event-date','event-time'])aiElement(id).addEventListener('input',()=>{stopAI('时间范围已修改，请重新解读。');aiElement('ai-result').hidden=true;});

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
document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{aiElement('topic').value=button.dataset.topic;aiElement('question').value=presets[button.dataset.topic].replaceAll('这天',({year:'这一年',month:'这个月',day:'这天'})[analysisMode()]);}));
aiElement('ai-form').addEventListener('submit',async event=>{
 event.preventDefault();
 if(!currentChart||!currentAstrolabe){aiElement('ai-status').textContent='请先填写出生信息并生成命盘。';return;}
 if(!aiElement('ai-form').reportValidity())return;
 const mode=analysisMode();
 const value=mode==='year'?aiElement('event-year').value:mode==='month'?aiElement('event-month').value:aiElement('event-date').value;
 const birth=aiElement('birth-date').value;
 if(value<(mode==='year'?birth.slice(0,4):mode==='month'?birth.slice(0,7):birth)){aiElement('ai-status').textContent='所选时间范围不能早于出生日期。';return;}
 const accessCode=aiElement('access-code').value.trim();
 if(!accessCode){aiElement('ai-status').textContent='请填写个人访问码。';return;}
 try{sessionStorage.setItem('ziwei-access-code',accessCode);}catch{}
 stopAI();
 const controller=new AbortController();pendingAI=controller;
 const timer=setTimeout(()=>controller.abort('timeout'),95000);
 const selectedLabel=mode==='year'?`${value}年（公历）`:mode==='month'?`${value}（公历月）`:value;
 const periodInput=mode==='year'?{targetYear:Number(value)}:mode==='month'?{targetMonth:value}:{targetDate:value};
 const selectedTopic=aiElement('topic').value;
 const selectedTime=mode==='day'?aiElement('event-time').value:'';
 aiElement('ai-submit').disabled=true;aiElement('ai-cancel').hidden=false;aiElement('ai-result').hidden=true;
 aiElement('ai-status').textContent=`正在分析${selectedLabel}，通常需要几十秒……`;
 try{
  const response=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+accessCode},body:JSON.stringify({birthDate:aiElement('birth-date').value,timeIndex:Number(aiElement('time').value),gender:aiElement('gender').value,analysisMode:mode,...periodInput,targetTimeIndex:selectedTime===''?null:Number(selectedTime),topic:selectedTopic,question:aiElement('question').value}),signal:controller.signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'解读失败，请稍后重试。');
  if(pendingAI!==controller)return;
  aiElement('ai-answer').textContent=data.answer;
  aiElement('ai-context').textContent=`${data.date||selectedLabel} · ${selectedTopic} · ${data.model}`;
  aiElement('ai-result').hidden=false;
  aiElement('ai-status').textContent=data.truncated?'已返回分析，因长度限制未完全展开，可缩小问题后重试。':'分析已完成。内容为 AI 生成，请结合实际情况判断。';
 }catch(error){
  if(pendingAI!==controller)return;
  aiElement('ai-status').textContent=controller.signal.aborted?'等待超时，请稍后重试。':error instanceof TypeError?'无法连接解读服务，请检查网络后重试。':error.message;
 }finally{clearTimeout(timer);if(pendingAI===controller){pendingAI=null;aiElement('ai-submit').disabled=false;aiElement('ai-cancel').hidden=true;}}
});
