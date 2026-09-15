import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0011_add_vehicle_board_order.sql',import.meta.url),'utf8');

test('담당자별 차량을 10대씩 독립적으로 페이지 처리한다',()=>{
  assert.match(main,/const BOARD_PAGE_SIZE=10/);
  assert.match(main,/state\.managerPages\[manager\]/);
  assert.match(main,/start\+BOARD_PAGE_SIZE/);
  assert.match(css,/\.board-row\[hidden\]\{display:none!important\}/);
});

test('차량현황판은 지정된 담당자 탭과 정렬 순서를 사용한다',()=>{
  assert.match(main,/const MANAGER_ORDER=\['대표님','박이사님','이부장님','임회장님','오승한','김상윤','담당자 미지정'\]/);
  assert.match(main,/categories=\[\['all','전체'\],\['대표님','대표님'\],\['박이사님','박이사님'\],\['이부장님','이부장님'\],\['임회장님','임회장님'\],\['오승한','오승한'\],\['김상윤','김상윤'\]\]/);
});

test('차량 목록에 순번과 6점 드래그 핸들을 표시하고 D1에 순서를 저장한다',()=>{
  assert.match(main,/data-board-sequence/);
  assert.match(main,/data-board-drag[^>]+[^<]*>⠿<\/button>/);
  assert.match(main,/bindDashboardDragAndDrop/);
  assert.match(main,/api\('vehicles\/reorder'/);
  assert.match(api,/parts\.join\('\/'\)==='vehicles\/reorder'/);
  assert.match(migration,/ADD COLUMN board_order INTEGER NOT NULL DEFAULT 0/);
  assert.match(css,/\.board-drag-handle\{/);
});

test('순번 왼쪽 연필 버튼으로 숫자 수정 모드와 저장 모드를 전환한다',()=>{
  assert.match(main,/class="sequence-edit-button" data-sequence-edit[^>]*>✎<\/button><span>순번<\/span>/);
  assert.match(main,/function toggleDashboardSequenceEdit\(group,button\)/);
  assert.match(main,/cell\.innerHTML=`<input type="number" min="1" step="1"/);
  assert.match(main,/button\.textContent='저장'/);
  assert.match(main,/entries\.sort\(\(a,b\)=>a\.order-b\.order\|\|a\.index-b\.index\)/);
  assert.match(main,/saveDashboardOrder\(group\)/);
  assert.match(css,/\.sequence-edit-button\{/);
  assert.match(css,/\.board-sequence input\{/);
  assert.match(css,/\.board-sequence input\[type=number\]\{appearance:textfield/);
  assert.match(css,/::-webkit-inner-spin-button/);
});

test('순번 편집 중에는 차량 수정 연필을 눌러도 상세정보를 열지 않는다',()=>{
  assert.match(main,/button\.closest\('\.manager-group'\)\?\.classList\.contains\('is-sequence-editing'\).*return/);
});

test('대표님 59다3609 차량은 순번 0으로 고정하고 순번 편집과 드래그에서 제외한다',()=>{
  assert.match(main,/PINNED_BOARD_PLATE='59다3609'/);
  assert.match(main,/data-board-pinned="\$\{pinned\}"/);
  assert.match(main,/pinned\?0:index\+\(hasPinned\?0:1\)/);
  assert.match(main,/editableRows=rows\.filter\(row=>row\.dataset\.boardPinned!=='true'\)/);
  assert.match(main,/rows\.filter\(row=>row\.dataset\.boardPinned!=='true'\)\.forEach/);
});

test('페이지 탐색에 맨처음·이전·번호·다음·맨끝을 제공한다',()=>{
  assert.match(main,/>맨처음<\/button>/);
  assert.match(main,/aria-label="이전 페이지"/);
  assert.match(main,/aria-label="다음 페이지"/);
  assert.match(main,/>맨끝<\/button>/);
  assert.match(css,/\.board-pagination\{/);
});

test('담당자명 옆에 차량 대수를 표시하고 전체 펼치기와 10대 접기를 전환한다',()=>{
  assert.match(main,/expandedManagers:new Set\(\)/);
  assert.match(main,/class="manager-heading"><h2>/);
  assert.match(main,/data-manager-expand/);
  assert.match(main,/expanded\?\'접기\':\'펼치기\'/);
  assert.match(main,/pager\.hidden=expanded/);
  assert.match(main,/!expanded&&\(index<start\|\|index>=start\+BOARD_PAGE_SIZE\)/);
  assert.match(css,/\.manager-heading\{display:flex;align-items:center;gap:10px\}/);
  assert.match(css,/\.board-pagination\[hidden\]\{display:none\}/);
});
