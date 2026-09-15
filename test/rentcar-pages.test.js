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
