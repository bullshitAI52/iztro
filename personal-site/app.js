'use strict';
const $ = id => document.getElementById(id);
const times = ['早子时 00:00–00:59','丑时 01:00–02:59','寅时 03:00–04:59','卯时 05:00–06:59','辰时 07:00–08:59','巳时 09:00–10:59','午时 11:00–12:59','未时 13:00–14:59','申时 15:00–16:59','酉时 17:00–18:59','戌时 19:00–20:59','亥时 21:00–22:59','晚子时 23:00–23:59'];
times.forEach((name,index) => $('time').add(new Option(name,String(index))));
$('time').value='6';
let currentChart = null;
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function renderStars(stars,minor=false){const group=node('div',undefined,minor?'stars minor':'stars');for(const star of stars){const item=node('span',star.name,'star');if(star.brightness)item.append(node('small',star.brightness));if(star.mutagen)item.append(node('b',star.mutagen));group.append(item);}return group;}
function render(chart){
  $('empty').hidden=true;$('summary').hidden=false;$('chart').hidden=false;$('chart-note').hidden=false;
  $('summary').replaceChildren();$('chart').replaceChildren();
  $('result-title').textContent='本命十二宫';
  for(const value of [`公历 ${chart.solarDate}`,`农历 ${chart.lunarDate}`,chart.time,chart.fiveElementsClass,`命主 ${chart.soul}`,`身主 ${chart.body}`])$('summary').append(node('span',value));
  const positions={'巳':[1,1],'午':[1,2],'未':[1,3],'申':[1,4],'酉':[2,4],'戌':[3,4],'亥':[4,4],'子':[4,3],'丑':[4,2],'寅':[4,1],'卯':[3,1],'辰':[2,1]};
  const ordered=Object.keys(positions).map(branch=>chart.palaces.find(p=>p.earthlyBranch===branch)).filter(Boolean);
  for(const p of ordered){const card=node('article',undefined,`palace ${p.name==='命宫'?'soul':''}`);const [row,col]=positions[p.earthlyBranch];card.style.gridRow=String(row);card.style.gridColumn=String(col);const title=node('h3',p.name+(p.isBodyPalace?' · 身':''));title.append(node('small',p.heavenlyStem+p.earthlyBranch));card.append(title);card.append(p.majorStars.length?renderStars(p.majorStars):node('div','无主星','stars minor'));card.append(renderStars(p.minorStars,true));card.append(renderStars(p.adjectiveStars,true));if(p.decadal?.range)card.append(node('div',`大限 ${p.decadal.range.join('–')} 岁`,'age'));$('chart').append(card);}
  const center=node('div',undefined,'center');center.append(node('strong','紫微命盘'));center.append(node('p',`${chart.chineseDate}\n${chart.zodiac} · ${chart.sign}`));$('chart').append(center);$('export').disabled=false;
}
function generate(){try{if(!window.iztro)throw new Error('排盘库加载失败，请刷新页面重试。');const date=$('birth-date').value;if(!date||!$('birth-form').reportValidity())return;const time=Number($('time').value);const chart=iztro.astro.bySolar(date,time,$('gender').value,true,'zh-CN');const data=chart.toJSON();if(data.palaces.length!==12)throw new Error('命盘数据不完整，请重新输入。');currentChart=data;render(data);$('status').textContent='命盘已生成，出生信息未上传。';}catch(error){$('status').textContent=error.message||'排盘失败，请检查出生信息。';}}
$('birth-form').addEventListener('submit',event=>{event.preventDefault();generate();});
$('birth-form').addEventListener('input',()=>{if(currentChart){currentChart=null;$('export').disabled=true;$('chart').hidden=true;$('summary').hidden=true;$('chart-note').hidden=true;$('empty').hidden=false;$('result-title').textContent='信息已修改，请重新生成';$('status').textContent='请点击生成命盘以应用新信息。';}});
$('example').addEventListener('click',()=>{$('birth-date').value='2000-08-16';$('time').value='2';$('gender').value='女';generate();$('status').textContent='当前为示例：2000 年 8 月 16 日，寅时，女。';});
$('export').addEventListener('click',()=>{if(!currentChart)return;const blob=new Blob([JSON.stringify({engine:'iztro@2.6.1',calendar:'solar',timeCorrection:'none',chart:currentChart},null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=node('a');link.href=url;link.download=`ziwei-${currentChart.solarDate}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
