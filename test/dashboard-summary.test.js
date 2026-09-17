import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('차량 현황판에 총 주행거리·색상·입고일·옵션을 순서대로 표시한다',()=>{
  assert.match(main,/<span>연식<\/span><span>총 주행거리<\/span><span>색상<\/span><span>입고일<\/span><span>옵션<\/span>/);
  assert.match(main,/String\(s\.checkedInAt\|\|''\)\.slice\(0,10\)/);
});

test('상단 브랜드를 간결하게 표시하고 미설정 Sheets 링크를 안전하게 비활성화한다',()=>{
  assert.doesNotMatch(main,/HANA AUTO/);
  assert.match(main,/SITE\.googleSheetsUrl\?/);
  assert.match(main,/Google Sheets 설정 필요/);
  assert.match(main,/<img src="\/sheets\.png" alt="">/);
  assert.match(main,/<a href="\/drive">헤이딜러제로<\/a>/);
  assert.match(css,/\.brand::after \{ content:'ver\.Beta';[^}]*color:#a8b0ab;[^}]*font-size:10px/);
});

test('첫 화면 제목 오른쪽에 이번 달 일정 미니 캘린더를 표시한다',()=>{
  assert.match(main,/function parkingMiniCalendar\(\)/);
  assert.match(main,/state\.calendarRecords\.map\(heydealerScheduleDate\)/);
  assert.match(main,/class="parking-mini-calendar"/);
  assert.match(main,/data-parking-schedule-date="\$\{date\}"/);
  assert.match(main,/function openParkingDaySchedule\(date\)/);
  assert.match(main,/state\.calendarRecords\.filter\(record=>heydealerScheduleDate\(record\)===date\)/);
  assert.match(main,/차량번호 \$\{records\.length\}대/);
  assert.match(main,/openParkingDaySchedule\(button\.dataset\.parkingScheduleDate\)/);
  assert.match(main,/class="parking-schedule-detail" href="\/calendar\?month=\$\{esc\(date\.slice\(0,7\)\)\}">일정상세보기 →<\/a>/);
  assert.match(main,/class="parking-schedule-vehicle"><strong>\$\{esc\(record\.plate\)\|\|'차량번호 미입력'\}<\/strong>/);
  assert.match(main,/<\/strong>\$\{customerBadge\(record\.customer_type\)\?`<b>\$\{customerBadge\(record\.customer_type\)\}<\/b>`:''\}<\/span><button/);
  assert.match(main,/class="parking-schedule-info" data-parking-schedule-record="\$\{esc\(record\.id\)\}"/);
  assert.match(main,/openCalendarRecord\(record\)/);
  assert.match(main,/Promise\.all\(\[api\('dashboard'\),api\('heydealer'\)\.catch/);
  assert.match(css,/\.parking-mini-calendar\{position:absolute;right:max\(24px,calc\(\(100vw - 1280px\)\/2\)\);top:18px;width:340px;[^}]*background:transparent/);
  assert.match(css,/@media\(max-width:800px\)\{\.parking-mini-calendar\{right:0;width:205px/);
  assert.match(css,/\.parking-mini-day>i\{[^}]*border-radius:50%;background:#9aa29d/);
  assert.match(css,/\.parking-mini-day:is\(button\)\{[^}]*background:transparent;cursor:pointer/);
  assert.match(css,/\.parking-schedule-modal ul\{[^}]*overflow-y:auto/);
  assert.match(css,/\.parking-schedule-detail\{position:absolute;top:70px;right:24px/);
  assert.match(css,/\.parking-schedule-vehicle\{display:flex;align-items:center;gap:6px/);
  assert.match(css,/\.parking-schedule-info\{[^}]*border-radius:50%/);
});

test('차량 현황판의 주차위치현황 링크는 투명 배경과 테마 글자색을 사용한다',()=>{
  assert.match(css,/body:has\(\.board-page\) \.topbar \.board-nav a\[href="\/"\]\{color:var\(--lime\);background:transparent\}/);
});

test('주차 차량과 상품화 차량을 분리해 다섯 개 통계 카드로 표시한다',()=>{
  assert.match(main,/occupied:parked,productization/);
  assert.match(main,/metric\('주차 차량',c\.occupied,'IN USE','dark'\)\}\$\{metric\('상품화',c\.productization,'PRODUCT','product'\)\}\$\{metric\('빈 자리'/);
  assert.match(css,/\.summary\s*\{[^}]*grid-template-columns:repeat\(5,1fr\)/);
});

test('미배정 차량은 그외주차구역에 표시하고 상품화출차 차량만 상품화로 분류한다',()=>{
  assert.match(main,/zoneId:productization\?'productization':'other-parking'/);
  assert.match(main,/isProductization:Boolean\(productization\)/);
  assert.match(main,/otherVehicles=state\.unassigned\.filter\(spot=>!spot\.isProductization\)/);
  assert.match(main,/processed=state\.unassigned\.filter\(spot=>spot\.isProductization/);
  assert.match(main,/name:'그외주차구역',columns:5,rows/);
  assert.match(main,/rows=Math\.max\(2,Math\.ceil\(shown\.length\/5\)\)/);
  assert.match(main,/index%5/);
  assert.match(main,/hideCoordinates:true,rowLabelWidth:0/);
  assert.match(main,/state\.zone==='other-parking'\?renderOtherParking\(\)/);
  assert.match(main,/productization=new Set\(activeVehicles\.filter\(s=>s\.isProductization\|\|/);
});

test('확인 필요에 성능일 120일 경과 차량부터 재성능 표시와 함께 집계한다',()=>{
  assert.match(main,/\(today-service\)\/86400000>=120/);
  assert.match(main,/performanceAlerts=activeVehicles\.filter\(s=>isPerformanceOverdue\(s\.reperformanceDate\|\|s\.performanceDate\)\)/);
  assert.match(main,/alertVehicles=new Set\(attentionVehicles\(\)\.map\(s=>s\.vehicleId\|\|s\.id\)\)/);
  assert.match(main,/performanceAlertLabels=c\.performanceAlerts\.map\(s=>`\$\{esc\(String\(s\.plate\)\.slice\(-4\)\)\}\(재성능\)`\)/);
  assert.match(main,/metric\('확인 필요',c\.alerts,'CHECK','amber',performanceAlertLabels\)/);
  assert.match(main,/state\.filter==='alert'&&needsCheck/);
  assert.match(css,/\.metric\.amber \{[^}]*background:var\(--ink\);[^}]*border-color:var\(--ink\)/);
  assert.match(css,/\.metric\.amber \.metric-details \{[^}]*color:#ff8179;[^}]*font-size:12px/);
  assert.match(css,/\.metric\.amber \.metric-details span \{ color:#fff;/);
  assert.match(css,/\.metric\.amber \.metric-details button \{[^}]*color:#ff8179/);
});

test('검색 결과가 많아도 다섯 행 높이 안에서 스크롤한다',()=>{
  assert.match(css,/\.parking-search-results\{[^}]*max-height:335px[^}]*overflow-y:auto/);
});

test('첫 화면 검색 결과는 보조 제목 없이 실제 값을 큰 글씨로 표시한다',()=>{
  assert.doesNotMatch(main,/<small>주차구역<\/small>|<small>차종<\/small>|<small>색상<\/small>|<small>담당자<\/small>|<small>입고날짜<\/small>|<small>특이사항<\/small>/);
  assert.match(css,/\.parking-search-results strong\{font-size:17px\}/);
  assert.match(css,/\.parking-search-results span\{[^}]*font-size:15px[^}]*font-weight:600/);
});

test('새싹타워 검색 결과는 행에 따라 B5층과 B6층을 구분한다',()=>{
  assert.match(main,/import \{normalizePosition,parkingCapacity,parkingLayouts\} from '\.\/parking-layouts\.js'/);
  assert.match(main,/function parkingSearchZoneLabel\(spot\)/);
  assert.match(main,/spot\.zoneId==='tower'/);
  assert.match(main,/row==='01'\)return'새싹 B5층'/);
  assert.match(main,/row==='02'\)return'새싹 B6층'/);
  assert.match(main,/zoneLabel=parkingSearchZoneLabel\(s\)/);
});

test('주차 검색 목록은 네 자리 완전 일치가 아닌 부분검색을 유지한다',()=>{
  assert.match(main,/matches=searchPool\.filter\(s=>used\(s\)&&\[s\.plate,s\.model,s\.color,s\.manager,s\.label,s\.zone\]\.some\(value=>String\(value\)\.toLowerCase\(\)\.includes\(query\)\)\)/);
  assert.doesNotMatch(main,/renderParkingSearchResults\(\)[^}]*endsWith\(query\)/);
});

test('검색 결과는 상품화출차 작업과 그외주차구역을 구분해 표시한다',()=>{
  assert.match(main,/if\(spot\.isUnassigned\)return spot\.isProductization\?spot\.label:'그외주차구역'/);
});
