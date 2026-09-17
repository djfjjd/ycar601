import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('모바일 입력 자동 확대는 막고 두 손가락 확대·축소는 허용한다',()=>{
  assert.match(html,/name="viewport" content="width=780, maximum-scale=5, user-scalable=yes"/);
  assert.match(css,/\.search input,\.compact-assign input\{font-size:var\(--mobile-control-font-size,18px\)!important\}/);
  assert.match(css,/\.modal input,\.modal select,\.modal textarea,\.vehicle-list-search input\{font-size:var\(--modal-control-font-size,var\(--mobile-control-font-size,18px\)\)!important\}/);
  assert.match(main,/function syncMobileControlScale\(\)/);
  assert.match(main,/--mobile-control-font-size/);
  assert.match(main,/visualViewport\?\.addEventListener\('resize',syncMobileControlScale\)/);
  assert.match(main,/Math\.ceil\(16\/scale\)/);
});

test('모바일 통계 카드 다섯 개를 한 줄로 표시한다',()=>{
  assert.match(css,/@media\(max-width:800px\)\{\.summary\.parking-summary\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.parking-summary \.metric\{min-height:110px;padding:14px\}/);
});

test('모든 페이지 로딩 안내를 화면 중앙 아래에 고정한다',()=>{
  assert.match(css,/\.loading \{ position:fixed; top:62%; left:50%; z-index:8;/);
  assert.match(css,/transform:translate\(-50%,-50%\)/);
});

test('모바일에서 6층 도면을 다시 그릴 때마다 왼쪽 끝에 맞춘다',()=>{
  assert.match(main,/if\(state\.loading\|\|!matchMedia/);
  assert.match(main,/\['pillar11'\]\.forEach\(zoneId=>/);
  assert.match(main,/scroll\.scrollLeft=0/);
  assert.match(main,/bindParkingDragAndDrop\(container\);alignPinnedMobileParkingMaps\(\);/);
  assert.doesNotMatch(main,/initialRightScrolledMaps/);
});

test('좌우 스와이프로 주차 현황과 차량 현황판 사이를 이동하지 않는다',()=>{
  assert.match(main,/function disableMobileHistorySwipe\(\)/);
  assert.match(main,/location\.replace\(link\.getAttribute\('href'\)\)/);
  assert.match(main,/event\.preventDefault\(\);\},\{passive:false\}\)/);
  assert.match(css,/overscroll-behavior-x:none/);
});

test('모바일 상단 업무 메뉴를 표시하고 통계와 검색 사이 간격을 줄인다',()=>{
  assert.match(css,/\.summary\.parking-summary \{ margin-bottom:0; \}/);
  assert.match(css,/@media\(max-width:800px\)\{\.topbar \.external-tools,\.topbar \.board-nav\{display:flex\}\}/);
});

test('넓은 차량 현황판 표는 상단 화면 폭을 밀어내지 않고 내부에서만 스크롤한다',()=>{
  assert.match(css,/\.manager-groups,\.manager-group,\.board-table\{min-width:0;max-width:100%\}/);
  assert.match(css,/\.manager-group\{overflow:hidden\}/);
  assert.match(css,/body:has\(\.board-page\)\{width:780px;max-width:780px;overflow-x:hidden\}/);
  assert.match(css,/\.board-page\{width:780px;max-width:780px;overflow-x:hidden\}/);
  assert.match(css,/\.board-table\{width:100%;max-width:100%;overflow-x:auto\}/);
});

test('모바일 당겨서 새로고침 안내를 두 배 크기로 표시한다',()=>{
  assert.match(css,/\.pull-refresh\{[^}]*min-width:380px[^}]*padding:20px 32px[^}]*font-size:24px/);
  assert.match(main,/distance-90/);
  assert.match(main,/translate\(-50%, -90px\)/);
});

test('모바일에서 팝업이 열리면 메인 화면 스크롤을 잠근다',()=>{
  assert.match(css,/@media\(max-width:800px\)\{html:has\(\.modal-backdrop\),body:has\(\.modal-backdrop\)\{overflow:hidden;overscroll-behavior:none\}\}/);
  assert.match(css,/\.modal-backdrop \{[^}]*overflow:auto;[^}]*overscroll-behavior:contain/);
});

test('주차·차량현황판·거래입력·캘린더 화면의 상단 브랜드에 public 파비콘을 사용한다',()=>{
  assert.equal((main.match(/<img class="brand-mark" src="\/favicon-32\.png" alt="">/g)||[]).length,7);
});

test('통계 카드의 영문 라벨을 숨기고 빈 자리 숫자를 빨간색으로 표시한다',()=>{
  assert.match(main,/class="metric \$\{t\}"><div><strong>\$\{v\}<\/strong><small>\$\{l\}<\/small><\/div>/);
  assert.match(css,/\.metric \{[^}]*justify-content:flex-start/);
  assert.match(css,/\.metric\.green strong \{ color:#c43d35; \}/);
});

test('모든 주차 도면 Cell은 가독성 크기로 표시한다',()=>{
  assert.match(css,/grid-template-columns:var\(--row-label-width,20px\) repeat\(var\(--map-columns\),var\(--cell-width,62px\)\)/);
  assert.match(css,/grid-template-rows:repeat\(var\(--map-header-rows,1\),23px\) repeat\(var\(--map-rows\),var\(--cell-height,39px\)\)/);
  assert.match(css,/\.parking-cell\.is-vacant strong\{font-size:12px;letter-spacing:-\.06em;white-space:nowrap\}/);
  assert.match(css,/\.parking-cell\.is-occupied span\{color:#111!important\}/);
  assert.match(css,/vehicle-color-black span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-gray span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-red span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-blue span\{color:#fff!important\}/);
});

test('전체 보기에서 6층 제목과 새싹 제목을 맞추고 그외주차구역을 바로 아래에 배치한다',()=>{
  assert.match(css,/data-map-zone="pillar11"\]\{grid-column:1\/span 3;grid-row:1\}/);
  assert.doesNotMatch(css,/data-map-zone="roof"/);
  assert.doesNotMatch(css,/data-map-zone="b3"/);
  assert.doesNotMatch(css,/data-map-zone="b5"/);
  assert.match(css,/\.parking-map-stack\{grid-column:4\/span 3;grid-row:1;display:grid;gap:0;align-content:start\}/);
  assert.doesNotMatch(css,/data-map-zone="auto13"|margin-top:106\.5px/);
  assert.match(css,/\.parking-map\[data-map-zone="other-parking"\] \.parking-map-grid\{grid-template-rows:0 repeat\(var\(--map-rows\),var\(--cell-height,39px\)\)\}/);
  assert.match(css,/data-map-zone="other-parking"\] \.parking-map-scroll\{height:123px;overflow-y:auto\}/);
  assert.match(css,/@media\(max-width:800px\)\{\.zones\.is-all\{position:relative;display:block\}/);
  assert.match(css,/\.zones\.is-all>\.parking-map-stack\{position:absolute;z-index:3;top:0;right:0;width:50%/);
  assert.match(css,/\.zones\.is-all>\.parking-map-stack\{pointer-events:none\}/);
  assert.match(css,/\.zones\.is-all>\.parking-map-stack>\.parking-map\{pointer-events:auto\}/);
  assert.doesNotMatch(css,/\.zones\.is-all:has\(\.parking-map\[data-map-zone="pillar11"\] \.map-head-toggle/);
  assert.match(css,/data-map-zone="pillar11"\]>\.parking-map-scroll\{overflow-x:hidden\}/);
});
