const clean=value=>String(value||'').replace(/\u00a0/g,' ').trim();
const normalizeColor=value=>{const color=clean(value);if(/화이트/i.test(color))return'흰색';if(/블루/i.test(color))return'블루';if(/은색|실버|그레이/i.test(color))return'쥐색';if(/블랙/i.test(color))return'검정';return color;};
const normalizeManager=value=>{const manager=clean(value).replace(/\s+/g,'');if(manager==='대표'||manager==='대표님'||/^[가-힣]{2,4}대표님?$/.test(manager))return'대표님';const match=manager.match(/^([가-힣]{2,4})(대리|주임)$/);return match?`${match[1]}${match[2]}`:'';};
const managerPattern=/^(?:대표님?|[가-힣]{2,4}\s*(?:대표님?|대리|주임))$/;

function nextValue(lines,label,predicate=Boolean){
  const index=lines.findIndex(line=>line===label);
  if(index<0)return'';
  return lines.slice(index+1).find(value=>predicate(value))||'';
}

function valuesAfterLabel(lines,labels,stopLabels){
  const index=lines.findIndex(line=>labels.includes(line));
  if(index<0)return[];
  const values=[];
  for(const line of lines.slice(index+1)){
    if(stopLabels.test(line))break;
    values.push(line);
  }
  return values;
}

function pickupSchedule(lines){
  const actualPickupIndex=lines.findIndex(line=>/^탁송\s*정보/.test(line));
  const pickupIndex=actualPickupIndex>=0?actualPickupIndex:lines.findIndex(line=>/^탁송(?:인수)?\s*정보/.test(line));
  if(pickupIndex<0)return'';
  const section=lines.slice(pickupIndex+1),end=section.findIndex(line=>/^(차대금\s*입금|거래 마무리|거래종결|입금 상태|차대금)$/.test(line)),values=end<0?section:section.slice(0,end);
  const scheduleIndex=values.findIndex(line=>/^(일정|탁송일정|탁송 일정|출발일정|출발 일정|출발 예정시간)$/.test(line));
  if(scheduleIndex>=0)return values[scheduleIndex+1]||'';
  const inline=values.map(line=>line.match(/^(?:탁송\s*)?(?:출발\s*)?일정\s*[:：-]?\s*(.+)$/)).find(Boolean);
  if(inline?.[1])return inline[1];
  return values.find(line=>/(?:\d{4}[-./년]\s*\d{1,2}|오전|오후).*(?:\d{1,2}:\d{2}|\d{1,2}시(?!간)|출발\s*예정)/.test(line))||'';
}

function normalizeDepartureTime(value){
  const source=clean(value);
  if(!source)return'';
  const date=source.match(/(\d{4})\s*(?:[-./년])\s*(\d{1,2})\s*(?:[-./월])\s*(\d{1,2})\s*(?:일)?/);
  const weekday=source.match(/\(([월화수목금토일])(?:요일)?\)/)?.[1];
  const koreanTime=source.match(/(오전|오후)\s*(\d{1,2})\s*(?::|시)\s*(\d{1,2})?\s*분?/);
  const clockTime=source.match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?:\s|$|출발)/);
  let hours,minutes;
  if(koreanTime){
    hours=Number(koreanTime[2])%12+(koreanTime[1]==='오후'?12:0);
    minutes=Number(koreanTime[3]||0);
  }else if(clockTime){
    hours=Number(clockTime[1]);
    minutes=Number(clockTime[2]);
  }
  if(hours===undefined)return source;
  const time=`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
  if(!date)return time;
  const formattedDate=`${date[1]}-${String(date[2]).padStart(2,'0')}-${String(date[3]).padStart(2,'0')}`;
  return `${formattedDate}${weekday?` (${weekday})`:''} ${time}${/출발\s*예정/.test(source)?' 출발예정':''}`;
}

export function parseHeydealerText(raw){
  const lines=String(raw||'').split(/\r?\n/).map(clean).filter(Boolean);
  const platePattern=/\d{2,3}[가-힣]\s?\d{4}/;
  const plateLine=lines.find(line=>platePattern.test(line)&&!line.includes('원부정보'))||lines.find(line=>platePattern.test(line))||'';
  const plate=clean(plateLine.match(platePattern)?.[0]).replace(/\s/g,'');
  const plateIndex=lines.indexOf(plateLine);
  const model=plateIndex<0?'':lines.slice(plateIndex+1).find(line=>line!==plate&&!line.includes('원부정보')&&!/^\d{4}-\d{2}/.test(line)&&!/^\d[\d,]*km$/.test(line))||'';
  const yearLine=lines.find(line=>/^\d{4}-\d{2}\s*\(\d{2}년형\)/.test(line))||'';
  const mileage=lines.find(line=>/^\d[\d,]*\s*km$/i.test(line))?.replace(/\s+/g,'')||'';
  const specLine=lines.find(line=>line.includes('ㆍ')&&/(휘발유|경유|전기|하이브리드|LPG)/i.test(line))||'';
  const specIndex=lines.indexOf(specLine);
  const nextSection=/^(출고정보|출고 정보|거래 주요정보|원부정보|내 견적|선택날짜|견적 재확인|탁송정보|탁송 정보|탁송인수 정보|차대금 입금|거래 마무리|거래종결|입금 상태|차대금|입금 계좌|안내사항|경매|경매종료|제로|특이사항|출발시간|탁송 출발시간|탁송출발시간)$/;
  const optionStopSection=/^(출고정보|출고 정보|거래 주요정보|원부정보|내 견적|선택날짜|견적 재확인|탁송정보|탁송 정보|탁송인수 정보|차대금 입금|거래 마무리|거래종결|입금 상태|차대금|입금 계좌|안내사항|경매|경매종료|제로|특이사항|출발시간|탁송 출발시간|탁송출발시간)$|^[^가-힣A-Za-z0-9]*(?:출고\s*정보|신차\s*정가|등록증\s*출고가)(?:\s|[:：]|$)/;
  const optionCandidate=specIndex<0?'':lines[specIndex+1]||'';
  const labeledOptions=valuesAfterLabel(lines,['옵션'],optionStopSection);
  const options=(labeledOptions.length?labeledOptions:optionStopSection.test(optionCandidate)?[]:[optionCandidate]).filter(Boolean).join(',');
  const noteValues=valuesAfterLabel(lines,['특이사항'],nextSection),notes=lines.includes('법인명')?'법인':noteValues.includes('법인')?'법인':noteValues.includes('개인')||lines.includes('개인')?'개인':'';
  const calendarTime=lines.find(line=>/^[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2}.*·.*\d{1,2}:\d{2}/)||'';
  const departureTime=normalizeDepartureTime(nextValue(lines,'출발시간')||nextValue(lines,'탁송 출발시간')||nextValue(lines,'탁송출발시간')||pickupSchedule(lines)||calendarTime.split('·')[1]||'');
  const selectedDate=nextValue(lines,'선택날짜',value=>/^\d{4}-\d{2}-\d{2}$/.test(value))||nextValue(lines,'경매종료',value=>/^\d{4}-\d{2}-\d{2}$/.test(value));
  return{
    manager:normalizeManager(lines.find(line=>managerPattern.test(line))||''),
    modelYear:yearLine.match(/^\d{4}-\d{2}/)?.[0]||'',plate,model,
    color:normalizeColor(specLine.split('ㆍ').at(-1)),mileage,options,notes,
    price:nextValue(lines,'차대금',value=>/[\d,]+만원/.test(value)),
    account:nextValue(lines,'입금 계좌'),
    origin:lines.find(line=>/^[가-힣]+\s+[가-힣]+(?:시|군|구)$/.test(line))||'',
    departureTime,date:selectedDate||'',
  };
}
