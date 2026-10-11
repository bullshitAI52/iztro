'use strict';
// Pure calculation helpers shared by the page and boundary checks.
(function (root) {
  const labels = ['禄', '权', '科', '忌'];
  function calculate(astrolabe, year) {
    const birth = astrolabe.solarDate.split('-').map(Number);
    if (!Number.isInteger(year) || year < birth[0] || year < 1900 || year > 2100) {
      throw new Error(`请选择 ${Math.max(1900, birth[0])}–2100 年之间的整数年份。`);
    }
    const isLaterBirthday = year === birth[0] && (birth[1] > 7 || (birth[1] === 7 && birth[2] > 1));
    const targetDate = isLaterBirthday ? astrolabe.solarDate : `${year}-07-01`;
    const h = astrolabe.horoscope(targetDate, 6).toJSON();
    const yearly = h.yearly;
    const decadalPalace = astrolabe.palaces[h.decadal.index];
    const range = decadalPalace?.decadal.range;
    const isInRange = range && h.age.nominalAge >= range[0] && h.age.nominalAge <= range[1];
    const decadalText = decadalPalace ? (isInRange ? `${decadalPalace.name} · ${range.join('–')} 岁` : `${h.decadal.name} · ${decadalPalace.name}`) : '超出本盘大限范围';
    return {
      year, targetDate, age: h.age.nominalAge, yearly, decadal: h.decadal, decadalText,
      soulPalace: astrolabe.palaces[yearly.index]?.name || '未知',
      transformations: yearly.mutagen.map((star, index) => {
        const palaceIndex = astrolabe.palaces.findIndex(p => [...p.majorStars, ...p.minorStars].some(s => s.name === star));
        return {label: labels[index], star, originPalace: astrolabe.palaces[palaceIndex]?.name || '未定位', yearlyPalace: yearly.palaceNames[palaceIndex] || '未定位'};
      }),
    };
  }
  root.ZiweiForecast = { calculate, series: (astrolabe, startYear) => Array.from({length: Math.min(5, 2101 - startYear)}, (_, index) => calculate(astrolabe, startYear + index)) };
})(typeof window !== 'undefined' ? window : globalThis);
