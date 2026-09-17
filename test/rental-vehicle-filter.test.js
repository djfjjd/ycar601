import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('렌터카차량은 주차구역이 아닌 하·허·호 번호판 필터 탭이다',()=>{
  assert.match(main,/isRentalVehicle=s=>\/\[하허호\]\/\.test\(String\(s\.plate\|\|''\)\.replace\(\/\\s\/g,''\)\)/);
  assert.match(main,/state\.zone==='rental'&&isRentalVehicle\(s\)/);
  assert.match(main,/data-zone="rental"[^>]*>렌터카차량<\/button>/);
  assert.match(main,/state\.zone==='rental'\?renderRentalVehicles\(\)/);
  assert.match(main,/class="zone-card rental-vehicles"/);
  assert.doesNotMatch(main,/data-map-zone="rental"/);
  assert.match(css,/\.zone-tabs \.rental-zone-tab\{margin-left:auto\}/);
});

test('렌터카 탭은 검색 안내 문구를 바꾸고 검색 결과도 렌터카로 제한한다',()=>{
  assert.match(main,/searchControl\(state\.zone==='rental'\?'하, 허, 호 포함된 차량'/);
  assert.match(main,/state\.zone!=='rental'\|\|isRentalVehicle\(s\)/);
});
