import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('렌터카차량은 별도 목록이 아닌 기존 주차 도면의 하·허·호 강조 필터다',()=>{
  assert.match(main,/isRentalVehicle=s=>\/\[하허호\]\/\.test\(String\(s\.plate\|\|''\)\.replace\(\/\\s\/g,''\)\)/);
  assert.match(main,/state\.zone==='rental'&&isRentalVehicle\(s\)/);
  assert.match(main,/data-zone="rental"[^>]*>렌터카차량<\/button>/);
  assert.match(main,/container\.classList\.toggle\('is-all',state\.zone==='all'\|\|state\.zone==='rental'\)/);
  assert.match(main,/state\.zone==='all'\|\|state\.zone==='rental'\?renderOverview\(\)\+renderProductization\(\)/);
  assert.match(main,/renderParkingMap\(parkingLayouts\[zone\.id\],all,matches/);
  assert.match(main,/state\.zone==='rental'\?otherVehicles:otherVehicles\.filter/);
  assert.match(main,/state\.zone==='rental'\?matches:new Set\(mapped\.map\(spot=>spot\.id\)\)/);
  assert.doesNotMatch(main,/renderRentalVehicles|class="zone-card rental-vehicles"/);
  assert.doesNotMatch(main,/data-map-zone="rental"/);
  assert.match(css,/\.parking-cell\.is-filtered\{opacity:\.2\}/);
  assert.match(css,/\.zone-tabs \.rental-zone-tab\{margin-left:auto\}/);
});

test('렌터카 탭은 검색 안내 문구를 바꾸고 검색 결과도 렌터카로 제한한다',()=>{
  assert.match(main,/searchControl\(state\.zone==='rental'\?'하, 허, 호 포함된 차량'/);
  assert.match(main,/state\.zone!=='rental'\|\|isRentalVehicle\(s\)/);
});

test('선택된 렌터카 탭을 다시 누르면 전체 보기로 돌아간다',()=>{
  assert.match(main,/button\.onclick=\(\)=>\{state\.zone=state\.zone==='rental'&&button\.dataset\.zone==='rental'\?'all':button\.dataset\.zone;render\(\);\}/);
  assert.doesNotMatch(main,/document\.querySelectorAll\('\.zone-tabs button\[data-zone\]'\)\.forEach\(e=>e\.onclick=/);
});
