import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizePosition,parkingCapacity,parkingLayouts} from '../src/parking-layouts.js';
import {renderParkingMap} from '../src/parking-map.js';
import {STATUS,zones} from '../src/data.js';

test('기존 위치 라벨을 두 자리 행 좌표로 정규화한다',()=>{
  assert.equal(normalizePosition('A1'),'A01');
  assert.equal(normalizePosition('I20'),'I20');
  assert.equal(normalizePosition('J2'),'J02');
  assert.equal(normalizePosition('A21'),'A21');
  assert.equal(normalizePosition('D25'),'D25');
});

test('6층 주차면 좌표는 기존 E:I를 그대로 사용한다',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/label:s\.label/);
  assert.doesNotMatch(main,/displayParkingPosition/);
});

test('전체 주차면은 실제 parking Cell만 합산한다',()=>{
  assert.equal(parkingCapacity(parkingLayouts.pillar11),71);
  assert.equal(parkingLayouts.b3,undefined);
  assert.equal(parkingLayouts.b5,undefined);
  assert.equal(parkingCapacity(parkingLayouts.roof),0);
  assert.equal(parkingCapacity(parkingLayouts.tower),10);
  assert.equal(parkingCapacity(parkingLayouts.auto13),12);
  assert.equal(Object.values(parkingLayouts).reduce((sum,layout)=>sum+parkingCapacity(layout),0),93);
});

test('초기 화면 구역 목록은 제거된 B3·B5 레이아웃을 참조하지 않는다',()=>{
  assert.equal(zones.some(zone=>zone.id==='b3'||zone.id==='b5'),false);
  assert.equal(zones.find(zone=>zone.id==='pillar11')?.count,71);
  assert.equal(zones.find(zone=>zone.id==='roof'),undefined);
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/parkingLayouts\[zone\.id\]\?parkingCapacity\(parkingLayouts\[zone\.id\]\):Number\(zone\.count\)\|\|0/);
});

test('새싹타워는 A~E열의 B5·B6층 10면으로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower'});
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,10);
  assert.match(html,/aria-label="A01 빈 자리"/);
  assert.match(html,/aria-label="E02 빈 자리"/);
  assert.match(html,/>B5층<\/b>/);
  assert.match(html,/>B6층<\/b>/);
  assert.doesNotMatch(html,/aria-label="F01|aria-label="J02/);
  assert.doesNotMatch(html,/class="map-column"/);
  assert.match(html,/--map-header-rows:1;--cell-width:62px;--cell-height:39px;--row-label-width:42px/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.doesNotMatch(css,/data-map-zone="tower"\] \.parking-map-grid\{--cell-height/);
  assert.match(html,/class="map-row" style="grid-column:1;grid-row:2"[^>]*>B5층<\/b>/);
  assert.match(html,/class="map-row" style="grid-column:1;grid-row:3"[^>]*>B6층<\/b>/);
  assert.doesNotMatch(html,/data-toggle-map="tower"/);
});

test('빈 자리에는 주차 가능 보조 문구를 표시하지 않는다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:true});
  assert.doesNotMatch(html,/주차 가능/);
  assert.doesNotMatch(html,/>빈 자리</);
});

test('빈 주차면은 문구 대신 검정 그림자가 있는 빨간 소문자 o로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-vacant::before\{content:"o"/);
  assert.match(css,/color:#e33e3e/);
  assert.match(css,/text-shadow:1px 1px 0 #111/);
  assert.doesNotMatch(css,/\.parking-cell\.is-vacant::after/);
});

test('차량 Cell에는 차량번호 뒤 4자리만 크게 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[{id:'spot-1',label:'A08',plate:'186저9439',model:'쏘나타',alerts:[]}],undefined,{expanded:true});
  assert.match(html,/<strong>9439<\/strong>/);
  assert.match(html,/data-spot="spot-1"/);
});

test('주차 차량 Cell에는 차량 색상 클래스가 적용된다',()=>{
  const white=renderParkingMap(parkingLayouts.pillar11,[{id:'white-car',label:'A08',plate:'11가1234',model:'차량',color:'흰색',alerts:[]}],undefined,{expanded:true});
  const gray=renderParkingMap(parkingLayouts.pillar11,[{id:'gray-car',label:'A08',plate:'11가5678',model:'차량',color:'은색',alerts:[]}],undefined,{expanded:true});
  const yellow=renderParkingMap(parkingLayouts.pillar11,[{id:'yellow-car',label:'A08',plate:'11가9012',model:'차량',color:'노란색',alerts:[]}],undefined,{expanded:true});
  assert.match(white,/vehicle-color-white/);
  assert.match(gray,/vehicle-color-gray/);
  assert.match(yellow,/vehicle-color-yellow/);
  assert.match(white,/draggable="true"/);
});

test('노란색 차량은 노란색 배경과 검정 글씨로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.vehicle-color-yellow\{[^}]*color:#000;background:#ffd800/);
  assert.match(css,/\.vehicle-color-yellow strong,[^{]+\.vehicle-color-yellow span\{color:#000!important\}/);
});

test('하·허·호 번호판 렌터카는 차량번호를 빨간색으로 표시한다',()=>{
  for(const plate of ['123하4567','12허3456','123호7890']){
    const html=renderParkingMap(parkingLayouts.pillar11,[{id:plate,label:'A08',plate,model:'렌터카',color:'흰색',alerts:[]}],undefined,{expanded:true});
    assert.match(html,/is-rental-plate/);
  }
  const regular=renderParkingMap(parkingLayouts.pillar11,[{id:'regular',label:'A08',plate:'123가4567',model:'일반차량',color:'흰색',alerts:[]}],undefined,{expanded:true});
  assert.doesNotMatch(regular,/is-rental-plate/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-occupied\.is-rental-plate strong\{color:#f02f2f!important/);
});

test('확인 필요 차량은 강조 배경 없이 왼쪽 아래에 경고등 이미지를 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[{id:'alert-car',label:'A08',plate:'11가1234',model:'차량',color:'검정',alerts:['battery','engine']}],undefined,{expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.doesNotMatch(html,/has-alert/);
  assert.match(html,/class="parking-alert-icons"/);
  assert.match(html,/alt="배터리경고등"/);
  assert.match(html,/alt="엔진경고등"/);
  assert.equal((html.match(/parking-alert-icons[\s\S]*?<\/span>/)?.[0].match(/<img /g)||[]).length,2);
  assert.match(css,/\.parking-cell \.parking-alert-icons\{position:absolute;left:3px;bottom:2px/);
  assert.match(css,/\.parking-cell>strong,\.parking-cell>span:not\(\.parking-alert-icons\)\{position:relative;z-index:2\}/);
  assert.match(css,/\.parking-alert-icons[^}]*z-index:0;pointer-events:none/);
  assert.match(css,/\.parking-alert-icons img\{width:26px;height:26px/);
  assert.doesNotMatch(css,/\.parking-cell\.has-alert\{/);
});

test('차량 구역 경고등 PNG는 흰 배경 대신 투명 알파 채널을 사용한다',()=>{
  for(const status of STATUS){
    const image=readFileSync(new URL(`../public/${status.icon.normalize('NFD')}`,import.meta.url));
    assert.ok(image.includes(Buffer.from('tRNS')),`${status.label} 아이콘에 투명도 정보가 필요합니다.`);
  }
});

test('녹색 차량은 주차구역에서 차종을 흰색으로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.vehicle-color-green span\{color:#fff!important\}/);
});

test('출고 후 주차 중인 차량은 빨간 글씨와 출고됨 표시를 사용한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[{id:'checked-out-car',label:'A08',plate:'335모6853',model:'A6',color:'검정',isCheckedOut:true,alerts:[]}],undefined,{expanded:true});
  assert.match(html,/is-checked-out/);
  assert.match(html,/<strong>6853<\/strong><span>\(출고됨\) A6<\/span>/);
  assert.match(html,/335모6853 출고됨/);
});

test('출고 차량의 빨간 글씨에는 그림자를 표시하지 않는다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-occupied\.is-checked-out strong,[^{]+\{[^}]*text-shadow:none/);
});

test('6층은 펼치기와 통로 없이 전체 25행과 기존 병합 주차면을 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11'});
  assert.match(html,/class="parking-map" data-map-zone="pillar11"/);
  assert.doesNotMatch(html,/class="parking-map" data-zone=/);
  assert.doesNotMatch(html,/data-toggle-map="pillar11"/);
  assert.match(html,/--map-columns:9;--map-rows:25;/);
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,71);
  assert.equal((html.match(/is-company-tint/g)||[]).length,5);
  assert.match(html,/>윤카<\/strong>/);
  assert.match(html,/aria-label="A01 비주차 구역"/);
  assert.match(html,/aria-label="D07 비주차 구역"/);
  assert.match(html,/aria-label="A08 빈 자리"/);
  assert.match(html,/grid-row:9\/span 2[^>]+aria-label="D08 빈 자리"/);
  assert.doesNotMatch(html,/aria-label="D09 빈 자리"/);
  assert.match(html,/grid-row:11\/span 2[^>]+aria-label="D10 빈 자리"/);
  assert.doesNotMatch(html,/aria-label="D11 빈 자리"/);
  assert.match(html,/aria-label="D12 빈 자리"/);
  assert.match(html,/aria-label="D20 빈 자리"/);
  assert.match(html,/aria-label="A21 빈 자리"/);
  assert.match(html,/aria-label="D24 빈 자리"/);
  assert.match(html,/aria-label="E19 빈 자리"/);
  assert.match(html,/aria-label="I19 빈 자리"/);
  assert.doesNotMatch(html,/aria-label="J19 빈 자리"/);
  assert.doesNotMatch(html,/type-passage|>통로<\/strong>/);
  assert.match(html,/type-ycar-area[^>]+><strong>윤카<\/strong>/);
  assert.match(html,/type-office is-borderless[^>]+><strong>하나오토<\/strong>/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-special\.type-ycar-area\{border:3px solid #193426/);
  assert.doesNotMatch(css,/\.parking-special\.type-passage/);
  assert.match(css,/\.parking-pillar-divider span\{[^}]*font-size:14px/);
  assert.equal(parkingCapacity(parkingLayouts.pillar11),71);
  assert.match(html,/class="parking-pillar-divider" style="grid-column:2\/span 4;grid-row:10" aria-label="09번기둥"/);
  assert.match(html,/aria-label="08번기둥"/);
  assert.match(html,/aria-label="07번기둥"/);
  assert.match(html,/aria-label="06번기둥"/);
  assert.match(html,/grid-column:2\/span 2;grid-row:26\/span 1[^>]+><strong>윤카<\/strong>/);
});

test('6층 E01:I18 비활성 칸만 투명하게 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11'});
  assert.match(html,/is-layout-blocked is-layout-transparent[^>]+aria-label="E01 비주차 구역"/);
  assert.match(html,/is-layout-blocked is-layout-transparent[^>]+aria-label="I18 비주차 구역"/);
  assert.doesNotMatch(html,/is-layout-blocked is-layout-transparent[^>]+aria-label="D07 비주차 구역"/);
  assert.match(html,/aria-label="E19 빈 자리"/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-layout-blocked\.is-layout-transparent\{border:0;background:transparent;pointer-events:none\}/);
});

test('옥상층 기존 주차면 20칸은 모두 회색 비주차 구역으로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.roof,[],new Set(),{expanded:true});
  assert.equal(parkingCapacity(parkingLayouts.roof),0);
  assert.doesNotMatch(html,/is-vacant/);
  assert.match(html,/type-blocked/);
  assert.match(html,/주차장 출입구 램프/);
  assert.match(html,/grid-column:5\/span 2;grid-row:18\/span 4[^>]+><strong>계단<\/strong>/);
  assert.doesNotMatch(html,/A21|D21|I21/);
  assert.match(html,/>09<\/b>/);
  assert.match(html,/>▲<\/span> 접기/);
});

test('오토플렉스 13층은 펼치기 없이 지정 행과 12개 주차면만 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.auto13,[],new Set(),{zoneId:'auto13',expanded:false});
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,12);
  assert.doesNotMatch(html,/>09<\/b>/);
  assert.doesNotMatch(html,/>08<\/b>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:5\/span 1[^>]+><strong>화장실<\/strong>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:6\/span 1[^>]+><strong>E\/V<\/strong>/);
  assert.doesNotMatch(html,/GRID|차량번호 뒤 4자리 표시/);
  assert.doesNotMatch(html,/>E<\/b>/);
  assert.doesNotMatch(html,/E09/);
  assert.match(html,/--map-columns:4;/);
  assert.doesNotMatch(html,/class="map-head-toggle" data-toggle-map="auto13"/);
});

test('그외주차구역은 왼쪽 행 번호와 행 번호 폭을 숨긴다',()=>{
  const layout={name:'그외주차구역',columns:5,rows:2,defaultCellType:'blocked',parkingRanges:[{from:'A01',to:'E02'}],specialAreas:[],hideColumnHeaders:true,hideCoordinates:true,rowLabelWidth:0};
  const html=renderParkingMap(layout,[],new Set(),{zoneId:'other-parking'});
  assert.match(html,/--map-columns:5;--map-rows:2;/);
  assert.match(html,/--row-label-width:0px/);
  assert.doesNotMatch(html,/class="map-row"/);
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,10);
});

test('접이식 옥상층은 토글을 제목 행 오른쪽에 표시한다',()=>{
  for(const zoneId of ['roof']){
    const collapsed=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:false});
    const expanded=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:true});
    for(const html of [collapsed,expanded]){
      assert.match(html,new RegExp(`class="map-head-toggle" data-toggle-map="${zoneId}"`));
      assert.ok(html.indexOf('map-head-toggle')<html.indexOf('parking-map-scroll'));
      assert.doesNotMatch(html,/map-row-toggle/);
    }
  }
});

test('특수 공간 범위는 하나의 CSS Grid 영역으로 합쳐진다',()=>{
  const layout={name:'테스트',columns:9,rows:20,specialAreas:[{from:'A01',to:'C04',type:'company-area',label:'제이카'}]};
  const html=renderParkingMap(layout,[]);
  assert.match(html,/grid-column:2\/span 3;grid-row:2\/span 4/);
  assert.equal((html.match(/class="parking-special/g)||[]).length,1);
  assert.doesNotMatch(html,/<small>company-area<\/small>/);
  assert.equal((html.match(/class="parking-cell/g)||[]).length,168);
});
