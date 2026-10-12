'use strict';
const {Solar}=require('./vendor/lunar.cjs');
function almanac(range){
 const days=[];
 for(let date=range.start;date<=range.end;){
  const [y,m,d]=date.split('-').map(Number),l=Solar.fromYmd(y,m,d).getLunar();
  days.push({date,lunar:l.toString(),dayGanzhi:l.getDayInGanZhi(),yi:l.getDayYi(1),ji:l.getDayJi(1),clashZodiac:l.getDayChongShengXiao(),sha:l.getDaySha(),solarTerm:l.getJieQi(),wealthDirection:l.getDayPositionCaiDesc(),joyDirection:l.getDayPositionXiDesc()});
  const next=new Date(date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);date=next.toISOString().slice(0,10);
 }
 const result={source:'bullshitAI52/OldAlmanac lunar.js',sourceCommit:'0173ff76cddf7d2155ef823066734d0eca1fff25',from:range.start,to:range.end,dayCount:days.length,convention:'日宜忌使用 getDayYi(1)/getDayJi(1)，与黄历页面同口径，保留完整条目；无时辰黄历。'};
 if(range.mode==='year'){
  const counts=key=>Object.entries(days.reduce((acc,day)=>{for(const item of day[key])acc[item]=(acc[item]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]);
  return {...result,scope:'全年逐日计算后汇总；次数不是吉凶概率，不能从汇总推断具体吉日。',solarTerms:days.filter(d=>d.solarTerm).map(d=>({date:d.date,name:d.solarTerm})),yiCounts:counts('yi'),jiCounts:counts('ji')};
 }
 return {...result,scope:range.mode==='month'?'整月逐日黄历；单日宜忌不代表整月。':'所选当日黄历',days};
}
module.exports={almanac};
