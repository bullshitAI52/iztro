'use strict';
const $ = id => document.getElementById(id);
const times = ['早子时 00:00–00:59','丑时 01:00–02:59','寅时 03:00–04:59','卯时 05:00–06:59','辰时 07:00–08:59','巳时 09:00–10:59','午时 11:00–12:59','未时 13:00–14:59','申时 15:00–16:59','酉时 17:00–18:59','戌时 19:00–20:59','亥时 21:00–22:59','晚子时 23:00–23:59'];
times.forEach((name,index) => $('time').add(new Option(name,String(index))));
$('time').value='6';
let currentChart = null;
let currentAstrolabe = null;
let currentForecast = null;
const calendarYear = new Date().getFullYear();
$('target-year').value = String(calendarYear + 1);
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function renderStars(stars,minor=false){const group=node('div',undefined,minor?'stars minor':'stars');for(const star of stars){const item=node('span',star.name,'star');if(star.brightness)item.append(node('small',star.brightness));if(star.mutagen)item.append(node('b',star.mutagen));group.append(item);}return group;}
function render(chart, forecast = null){
  $('empty').hidden=true;$('summary').hidden=false;$('chart').hidden=false;$('chart-note').hidden=false;
  $('summary').replaceChildren();$('chart').replaceChildren();
  $('result-title').textContent=forecast ? `${forecast.year} 年 · 流年叠盘` : '本命十二宫';
  if(!forecast)$('chart-note').textContent='按地支固定位置排列；手机端按相同顺序展开为宫位卡片。大限区间采用排盘库的年龄口径。';
  for(const value of [`公历 ${chart.solarDate}`,`农历 ${chart.lunarDate}`,chart.time,chart.fiveElementsClass,`命主 ${chart.soul}`,`身主 ${chart.body}`])$('summary').append(node('span',value));
  const positions={'巳':[1,1],'午':[1,2],'未':[1,3],'申':[1,4],'酉':[2,4],'戌':[3,4],'亥':[4,4],'子':[4,3],'丑':[4,2],'寅':[4,1],'卯':[3,1],'辰':[2,1]};
  const ordered=Object.keys(positions).map(branch=>chart.palaces.find(p=>p.earthlyBranch===branch)).filter(Boolean);
  for(const p of ordered){const card=node('article',undefined,`palace ${p.name==='命宫'?'soul':''}`);const [row,col]=positions[p.earthlyBranch];card.style.gridRow=String(row);card.style.gridColumn=String(col);const title=node('h3',p.name+(p.isBodyPalace?' · 身':''));title.append(node('small',p.heavenlyStem+p.earthlyBranch));card.append(title);if(forecast){const i=chart.palaces.indexOf(p);card.append(node('div',`流年 ${forecast.yearly.palaceNames[i]}`,'annual-palace'));}card.append(p.majorStars.length?renderStars(p.majorStars):node('div','无主星','stars minor'));card.append(renderStars(p.minorStars,true));card.append(renderStars(p.adjectiveStars,true));if(forecast){const i=chart.palaces.indexOf(p);const yearlyStars=forecast.yearly.stars?.[i] || [];if(yearlyStars.length)card.append(node('div','流年星：'+yearlyStars.map(s=>s.name).join(' · '),'annual-stars'));for(const t of forecast.transformations.filter(t=>t.originPalace===p.name))card.append(node('div',`流年 ${t.star}化${t.label}`,'annual-palace'));}if(p.decadal?.range)card.append(node('div',`大限 ${p.decadal.range.join('–')} 岁`,'age'));$('chart').append(card);}
  const center=node('div',undefined,'center');center.append(node('strong',forecast ? `${forecast.year} 流年` : '紫微命盘'));center.append(node('p',`${chart.chineseDate}\n${chart.zodiac} · ${chart.sign}`));$('chart').append(center);$('export').disabled=false;
}
function generate(){try{if(!window.iztro)throw new Error('排盘库加载失败，请刷新页面重试。');const date=$('birth-date').value;if(!date||!$('birth-form').reportValidity())return;const time=Number($('time').value);const chart=iztro.astro.bySolar(date,time,$('gender').value,true,'zh-CN');const data=chart.toJSON();if(data.palaces.length!==12)throw new Error('命盘数据不完整，请重新输入。');currentChart=data;currentAstrolabe=chart;currentForecast=null;render(data);$('forecast').hidden=false;$('annual-summary').hidden=true;$('mutagens').hidden=true;$('outlook').hidden=true;$('forecast-status').textContent='命盘已就绪，点击明年或选择年份查看流年。';$('target-year').min=String(Math.max(1900,Number(date.slice(0,4))));$('status').textContent='命盘已生成，出生信息未上传。';}catch(error){$('status').textContent=error.message||'排盘失败，请检查出生信息。';}}
$('birth-form').addEventListener('submit',event=>{event.preventDefault();generate();});
$('birth-form').addEventListener('input',()=>{if(currentChart){currentChart=null;currentAstrolabe=null;currentForecast=null;$('forecast').hidden=true;$('export').disabled=true;$('chart').hidden=true;$('summary').hidden=true;$('chart-note').hidden=true;$('empty').hidden=false;$('result-title').textContent='信息已修改，请重新生成';$('status').textContent='请点击生成命盘以应用新信息。';}});
$('example').addEventListener('click',()=>{$('birth-date').value='2000-08-16';$('time').value='2';$('gender').value='女';generate();$('status').textContent='当前为示例：2000 年 8 月 16 日，寅时，女。';});
$('export').addEventListener('click',()=>{if(!currentChart)return;const blob=new Blob([JSON.stringify({engine:'iztro@2.6.1',calendar:'solar',timeCorrection:'none',chart:currentChart,forecast:currentForecast},null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const link=node('a');link.href=url;link.download=`ziwei-${currentChart.solarDate}${currentForecast ? '-'+currentForecast.year : ''}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});

// Optional name is for display and AI context only; the four pillars come from iztro.
let currentName = '';
document.querySelectorAll('.note p').forEach(el=>{el.textContent=el.textContent.replace('排盘由 iztro 2.6.1 计算','排盘由 zwm 计算');});
const almanacLink=node('a');almanacLink.href='https://bullshitai52.github.io/OldAlmanac/';almanacLink.target='_blank';almanacLink.rel='noopener';almanacLink.textContent='打开老黄历 ↗';almanacLink.className='secondary';document.querySelector('header').append(almanacLink);
if(!$('name')){const birthDate=$('birth-date');const label=node('label');label.htmlFor='name';label.textContent='姓名（可选）';const input=node('input');input.id='name';input.type='text';input.maxLength=40;input.autocomplete='name';input.placeholder='例如：张三';birthDate.before(label,input);}
$('birth-form').addEventListener('submit',()=>setTimeout(()=>{currentName=$('name').value.trim();if(currentChart){render(currentChart,currentForecast);const bazi=node('span',`八字 ${currentChart.chineseDate}`);$('summary').prepend(bazi);if(currentName)$('summary').prepend(node('span',`姓名 ${currentName}`));}},0));

function showYear(year) {
  if (!currentAstrolabe) return;
  try {
    const forecast = ZiweiForecast.calculate(currentAstrolabe, year);
    const series = ZiweiForecast.series(currentAstrolabe, year);
    currentForecast = forecast;
    $('target-year').value = String(year);
    render(currentChart, forecast);
    $('annual-summary').replaceChildren(node('strong', `${year} 年 · ${forecast.yearly.heavenlyStem}${forecast.yearly.earthlyBranch}流年`));
    $('annual-summary').append(node('p', `虚岁 ${forecast.age} · 流年命宫落在本命${forecast.soulPalace}`));
    $('annual-summary').append(node('p', `所在大限 / 童限：${forecast.decadalText}`));
    $('mutagens').replaceChildren();
    for (const t of forecast.transformations) {
      const box = node('div', undefined, 'mutagen');
      box.append(node('strong', `${t.star}化${t.label}`));
      box.append(node('p', `本命${t.originPalace} · 流年${t.yearlyPalace}`));
      $('mutagens').append(box);
    }
    $('outlook-body').replaceChildren();
    for (const item of series) {
      const row = node('tr', undefined, item.year === year ? 'selected' : '');
      const yearCell = node('td');
      const button = node('button', `${item.year} · ${item.age}岁`);
      button.type = 'button'; button.addEventListener('click', () => showYear(item.year));
      yearCell.append(button); row.append(yearCell);
      row.append(node('td', item.soulPalace)); row.append(node('td', item.decadalText));
      row.append(node('td', item.transformations.map(t => `${t.star}化${t.label}`).join(' · ')));
      $('outlook-body').append(row);
    }
    $('annual-summary').hidden=false; $('mutagens').hidden=false; $('outlook').hidden=false;
    $('forecast-status').textContent=`已显示 ${year} 年流年，计算参考日 ${forecast.targetDate}。宫位标题与原星曜标记为本命，紫色流年标签为所选年份。`;
    $('chart-note').textContent='本命星曜位置保留；“流年”标签展示所选年份的宫位、流曜和四化。每宫底部年龄为该本命宫的大限区间，不代表流年持续时长。';
  } catch(error) {
    $('forecast-status').textContent=error.message || '该年份无法计算，请重新选择。';
  }
}
$('year-form').addEventListener('submit', event => {event.preventDefault(); if($('year-form').reportValidity())showYear(Number($('target-year').value));});
$('this-year').addEventListener('click', () => showYear(calendarYear));
$('next-year').addEventListener('click', () => showYear(calendarYear + 1));
$('origin').addEventListener('click', () => {
  if(!currentChart)return;
  currentForecast=null; render(currentChart);
  $('annual-summary').hidden=true; $('mutagens').hidden=true; $('outlook').hidden=true;
  $('forecast-status').textContent='已返回本命盘。';
  $('chart-note').textContent='按地支固定位置排列；手机端按相同顺序展开为宫位卡片。大限区间采用排盘库的年龄口径。';
});
