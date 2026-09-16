import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0025_add_rentcar_records.sql',import.meta.url),'utf8');

test('상단 헤이딜러 왼쪽에 렌터카매입정보 메뉴와 두 하위 페이지를 표시한다',()=>{
  assert.match(main,/렌터카매입정보[\s\S]*헤이딜러/);
  assert.match(main,/<a href="\/rentcar">차량정보입력<\/a><a href="\/rentcar\/vehicles">렌터카매입차량목록<\/a>/);
});

test('렌터카 입력 및 목록 경로를 렌더링한다',()=>{
  assert.match(main,/function renderRentcarPage\(\)/);
  assert.match(main,/function renderRentcarRecordsPage\(\)/);
  assert.match(main,/location\.pathname==='\/rentcar\/vehicles'/);
  assert.match(main,/location\.pathname==='\/rentcar'/);
});

test('렌터카 매입 차량은 별도 D1 테이블과 CRUD API를 사용한다',()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS rentcar_records/);
  assert.match(api,/if\(parts\[0\]==='rentcar'\)/);
  assert.match(api,/INSERT INTO rentcar_records/);
  assert.match(api,/UPDATE rentcar_records/);
  assert.match(api,/DELETE FROM rentcar_records/);
});

test('렌터카 양식은 담당자와 색상을 선택하고 선택 항목과 원문 제거를 반영한다',()=>{
  assert.match(main,/rentcarSelect\('manager','담당자',MANAGERS\)/);
  assert.match(main,/rentcarSelect\('color','색상',VEHICLE_COLORS\)/);
  assert.match(main,/rentcarField\('options','옵션',true\)/);
  assert.match(main,/rentcarField\('departureTime','인수예정시간',true\)/);
  assert.doesNotMatch(main,/data-rentcar-vehicle-text|data-rentcar-payment-text/);
});

test('초기화면 신규 입고 차량은 렌터카 매입차량 목록에도 중복 없이 저장한다',()=>{
  const checkIn=api.slice(api.indexOf("parts.join('/')==='vehicles/check-in'"),api.indexOf("method==='PATCH'&&parts[0]==='vehicles'",api.indexOf("parts.join('/')==='vehicles/check-in'")));
  assert.match(checkIn,/SELECT id FROM rentcar_records WHERE replace\(plate,' ',''\)=\?/);
  assert.match(checkIn,/if\(!rentcarRecord\)\{const rentcarRecordId=id\(\);statements\.push\(env\.DB\.prepare\('INSERT INTO rentcar_records/);
  assert.match(checkIn,/create_from_check_in/);
  assert.match(checkIn,/차량 현황판과 렌터카 매입차량 목록에 입고 등록되었습니다/);
});
