import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('그외주차 차량과 주차구역 차량의 드래그 방향 모두 같은 교환 요청을 사용한다',()=>{
  assert.match(main,/sourceOther=source\.isUnassigned\|\|source\.zoneId==='auto13',targetOther=target\.isUnassigned\|\|target\.zoneId==='auto13'/);
  assert.match(main,/incoming=sourceOther\?source:target,outgoing=sourceOther\?target:source/);
  assert.match(main,/vehicles\/\$\{incoming\.vehicleId\}\/exchange-other/);
  assert.match(main,/spotId:outgoing\.id,incomingVersion:incoming\.vehicleVersion,outgoingVersion:outgoing\.vehicleVersion,spotVersion:outgoing\.version/);
});

test('교환 API는 기존 주차 차량을 미배정하고 그외 차량을 해당 칸에 배정한다',()=>{
  const start=api.indexOf("parts[2]==='exchange-other'");
  const end=api.indexOf("parts[2]==='assign-checked-out'",start);
  assert.ok(start>=0&&end>start);
  const handler=api.slice(start,end);
  assert.match(handler,/current_vehicle_id=\?,version=version\+1/);
  assert.match(handler,/UPDATE vehicles SET current_spot_id=\?,version=version\+1/);
  assert.match(handler,/UPDATE vehicles SET current_spot_id=NULL,version=version\+1/);
  assert.match(handler,/그냥출차/);
  assert.match(handler,/await env\.DB\.batch\(statements\)/);
  assert.match(handler,/Number\(input\?\.incomingVersion\)!==incoming\.version/);
  assert.match(handler,/Number\(input\?\.outgoingVersion\)!==outgoing\.version/);
});
