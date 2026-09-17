import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('주차 도면 차량 클릭은 상세 대신 상품화출차 팝업을 연다',()=>{
  assert.match(main,/state\.mode=used\(selected\)\?'productization':'assign'/);
  assert.match(main,/state\.mode==='productization'\?'상품화출차'/);
  assert.match(main,/state\.mode==='productization'\?productizationForm\(s\)/);
});

test('상품화출차 팝업은 작업 5종과 오늘 날짜 및 작업별 입력을 제공한다',()=>{
  assert.match(main,/\['performance','성능'\],\['body','판금'\],\['dent','덴트'\],\['polish','광택'\],\['car-center','카센터\(기타\)'\]/);
  assert.match(main,/name="serviceDate" value="\$\{today\}" required/);
  assert.doesNotMatch(main,/data-service-detail="performance"/);
  assert.match(main,/name="exteriorCount"[\s\S]*name="bodyNote"[\s\S]*placeholder="외판부위"/);
  assert.match(main,/name="dentNote"[\s\S]*name="dentCost"/);
  assert.match(main,/class="polish-vendors"[\s\S]*type="radio" name="polishType" value="스타"[\s\S]*type="radio" name="polishType" value="신화"/);
  assert.match(main,/input\[value="주유소세차"\].*value="주유소세차".*<span>주유소세차<\/span>/);
  assert.match(main,/name="carCenterNote"[\s\S]*placeholder="작업 내용"[\s\S]*수리업체명[\s\S]*name="carCenterVendor"[\s\S]*placeholder="예: 신평카"/);
  assert.match(main,/`\$\{carCenterNote\} \(\$\{carCenterVendor\}\)`/);
  assert.match(main,/bindProductizationFields/);
  assert.match(main,/input\.dataset\.wasChecked=String\(input\.checked\)/);
  assert.match(main,/if\(input\.dataset\.wasChecked==='true'\)input\.checked=false/);
  assert.match(css,/\.productization-tabs\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/\.modal \.polish-vendors label\{[^}]*font-size:17px/);
  assert.match(css,/#productization-form \.productization-detail\[hidden\]\{display:none!important\}/);
});

test('상품화출차 차량 정보 오른쪽에 저장된 경고등 파비콘을 표시한다',()=>{
  assert.match(main,/warningIcons=\(s\.alerts\|\|\[\]\)\.map\(id=>STATUS\.find\(status=>status\.id===id\)\)\.filter\(Boolean\)/);
  assert.match(main,/class="productization-warning-icons".*status\.icon\.normalize\('NFD'\).*status\.label/s);
  assert.match(css,/\.productization-warning-icons\{grid-column:2;grid-row:1\/3;[^}]*justify-content:flex-end/);
  assert.match(css,/\.productization-warning-icons img\{width:40px;height:40px/);
});

test('상품화출차 차량 정보 오른쪽 연필 버튼에서 차량 상세 수정 화면을 연다',()=>{
  assert.match(main,/data-productization-edit aria-label="\$\{esc\(s\.plate\)\} 차량 정보 수정"/);
  assert.match(main,/document\.querySelector\('\[data-productization-edit\]'\)\?\.addEventListener\('click',\(\)=>\{state\.mode='detail';render\(\);\}\)/);
});

test('상품화출차 팝업은 기존 주차면 해제 버튼을 그냥출차로 표시한다',()=>{
  assert.match(main,/state\.mode==='productization'/);
  assert.match(main,/class="ghost danger" data-unassign>그냥출차<\/button>/);
  assert.doesNotMatch(main,/data-unassign>취소<\/button>/);
  assert.match(main,/>상품화출차<\/button>/);
});

test('상품화출차는 주차면 해제와 서비스·이동·감사·알림 이력을 함께 저장한다',()=>{
  assert.match(api,/parts\[2\]==='productization'/);
  assert.match(api,/INSERT INTO service_records/);
  assert.match(api,/productization_checkout/);
  assert.match(api,/notifyVehicleAction\(context,vehicle,'상품화출차',`상품화\(\$\{type\.label\}\)`,eventId\)/);
  assert.match(main,/vehicles\/\$\{s\.vehicleId\}\/productization/);
});

test('미배정 차량도 상품화출차하고 작업 종류를 위치에 표시한다',()=>{
  assert.match(api,/if\(!vehicle\)return json\(\{message:'차량현황판에서 차량을 찾을 수 없습니다\.'/);
  assert.match(api,/const vehicleResultIndex=statements\.length/);
  assert.match(api,/current_spot_id IS \?/);
  assert.match(api,/notifyVehicleAction\(context,vehicle,'상품화출차',`상품화\(\$\{type\.label\}\)`/);
  assert.match(api,/latest_movement_note/);
  assert.match(api,/latest_productization_date/);
  assert.match(main,/const productizationLocation=note=>/);
  assert.match(main,/productizationDate:productization\?date:''/);
  assert.match(main,/<time datetime="\$\{esc\(s\.productizationDate\)\}">\$\{esc\(s\.productizationDate\)\}<\/time>/);
});

test('차량현황판 상세 수정은 차량 행이 아닌 연필 버튼으로만 연다',()=>{
  assert.match(main,/data-edit-vehicle="\$\{esc\(s\.vehicleId\|\|s\.id\)\}"/);
  assert.match(main,/querySelectorAll\('\[data-edit-vehicle\]'\)/);
  assert.doesNotMatch(main,/role="button" tabindex="0" data-queue/);
});

test('현황판 판금·광택·수리 열에서 작업 항목을 바로 추가한다',()=>{
  assert.match(main,/data-service-add="\$\{type\}"/);
  assert.match(main,/serviceAddButton\(s,'body','판금'\)/);
  assert.match(main,/serviceAddButton\(s,'polish','광택'\)/);
  assert.match(main,/serviceAddButton\(s,'car-center','수리'\)/);
  assert.match(main,/state\.productizationType=serviceButton\.dataset\.serviceAdd/);
  assert.match(main,/state\.mode='service-entry'/);
  assert.match(main,/state\.mode==='service-entry'\?'수리내용입력'/);
  assert.match(main,/function serviceEntryForm\(s\)/);
  assert.match(main,/service-entry-actions/);
  assert.match(css,/\.modal-actions\.service-entry-actions\s*\{\s*justify-content:flex-end/);
  assert.match(main,/function bindServiceEntryShortcut\(form\)/);
  assert.match(main,/event\.key!=='Enter'/);
  assert.match(main,/form\.requestSubmit\(\)/);
  assert.match(main,/service-note/);
  assert.match(api,/parts\[2\]==='service-note'/);
  assert.match(api,/add_service_note/);
  assert.match(api,/const sheet=await autoSyncVehicles\(context,user,\[vehicle\.id\],`service-note:/);
  assert.match(api,/수리내용을 저장하고 스프레드시트에 동기화했습니다/);
  const serviceNote=api.slice(api.indexOf("parts[2]==='service-note'"));
  assert.doesNotMatch(serviceNote,/notifyVehicleAction/);
  assert.doesNotMatch(serviceNote,/UPDATE vehicles SET current_spot_id=NULL/);
  assert.match(main,/bindDashboardProductization\(\)/);
  assert.match(css,/\.board-service-cell:hover \.board-service-add/);
  assert.match(css,/\.board-service-add\{position:absolute;z-index:5;top:50%;left:50%/);
  assert.match(css,/transform:translate\(-50%,-50%\)/);
  assert.match(css,/\.board-repair-cell\{display:grid;align-items:center\}/);
});
