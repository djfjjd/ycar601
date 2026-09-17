import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('신규 입고 모달은 저장된 헤이딜러·렌터카 차량과 직접입력을 선택할 수 있다',()=>{
  assert.match(main,/class="heydealer-vehicle-picker"/);
  assert.match(main,/<option value="">차량 불러오기<\/option>/);
  assert.match(main,/<option value="manual" selected>직접입력<\/option>/);
  assert.match(main,/Promise\.all\(\[api\('heydealer'\).*api\('rentcar'\)/);
  assert.match(main,/state\.heydealerRecords=heydealer\.records\|\|\[\]/);
  assert.match(main,/state\.rentcarRecords=rentcar\.records\|\|\[\]/);
  assert.match(main,/document\.querySelectorAll\('\[data-new\]'\)\.forEach\(el=>el\.onclick=openNewVehicle\)/);
});

test('차량목록과 담당자 선택 글씨는 색상 선택과 같은 크기로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/#vehicle-form \.form-row select\{font-size:17px\}/);
  assert.match(css,/#vehicle-form \.heydealer-vehicle-picker select,#vehicle-form select\[name=manager\]\{font-size:17px\}/);
});

test('신규입고 담당자 선택은 지정된 담당자를 표시한다',()=>{
  assert.match(main,/const MANAGERS=\['대표님','박이사님','황이사님','이부장님','임회장님','오승한','김상윤'\]/);
});

test('차량 색상은 파랑을 블루로 통합한다',()=>{
  assert.match(main,/const VEHICLE_COLORS=\['검정','흰색','쥐색','녹색','빨강','블루','베이지','노랑'\]/);
  assert.match(main,/color==='파랑'\?'블루'/);
});

test('신규입고 양식에는 확인이 필요한 상태 카테고리를 표시하지 않는다',()=>{
  assert.doesNotMatch(main,/확인이 필요한 상태|name="alerts"/);
});

test('저장 차량 선택 시 현재 입고 양식의 일치 필드를 자동 입력한다',()=>{
  assert.match(main,/record\?\{plate:record\.plate,model:record\.model,modelYear:record\.model_year,mileage:record\.mileage,color:normalizeVehicleColor\(record\.color\),manager:record\.manager,options:record\.options\}/);
  assert.match(main,/for\(const \[name,value\] of Object\.entries\(values\)\)/);
  assert.match(main,/field\.value=value\|\|''/);
  assert.match(main,/if\(select\.value==='manual'\)form\.elements\.namedItem\('plate'\)\?\.focus\(\)/);
});

test('신규 입고 양식은 직접입력을 기본으로 활성화하고 차량 불러오기도 선택할 수 있다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(main,/<fieldset class="checkin-fields">/);
  assert.doesNotMatch(main,/<fieldset class="checkin-fields" disabled>/);
  assert.match(main,/fields\.disabled=!select\.value/);
  assert.match(main,/select\.addEventListener\('change',sync\);sync\(\)/);
  assert.match(css,/#vehicle-form \.checkin-fields:disabled\{opacity:\.45\}/);
});

test('신규 입고 팝업은 차량현황판 위치 문구를 표시하지 않는다',()=>{
  assert.match(main,/const hideLocation=state\.mode==='checkout'\|\|state\.mode==='productization'\|\|state\.mode==='warning-entry'\|\|state\.mode==='service-entry'\|\|state\.mode==='reperformance'\|\|s\.id==='draft'/);
  assert.match(main,/\$\{hideLocation\?'':`<p class="eyebrow">\$\{s\.zone\} · \$\{s\.label\}<\/p>`\}/);
});

test('입고에 사용한 선택차량은 기록을 유지하고 다음 입고 목록에서 제외한다',()=>{
  assert.match(main,/const vehicleImportOptions=\(\)=>\{const importedPlates=new Set\(boardVehicles\(\)\.map/);
  assert.match(main,/label="헤이딜러 선택차량"/);
  assert.match(main,/label="렌터카 매입차량"/);
  assert.match(main,/api\('rentcar'\)\.catch/);
  assert.doesNotMatch(main,/importedRecordId&&importedRecordId!=='manual'/);
  assert.doesNotMatch(main,/차량은 입고됐지만 선택차량목록 정리가 실패했습니다/);
});
