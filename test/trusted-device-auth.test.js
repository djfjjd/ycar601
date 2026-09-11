import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0016_add_trusted_devices.sql',import.meta.url),'utf8');
const config=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
const siteConfig=readFileSync(new URL('../src/site-config.js',import.meta.url),'utf8');

test('인증 기기 토큰은 HttpOnly 쿠키와 D1 해시로 관리한다',()=>{
  assert.match(api,/HttpOnly; Secure; SameSite=Lax/);
  assert.match(api,/crypto\.subtle\.digest\('SHA-256'/);
  assert.match(migration,/token_hash TEXT NOT NULL UNIQUE/);
  assert.doesNotMatch(migration,/token TEXT/);
});

test('인증 기기 목록 조회와 해제 API를 제공한다',()=>{
  assert.match(api,/parts\[1\]==='devices'/);
  assert.match(api,/method==='DELETE'.*parts\[1\]==='devices'/);
  assert.match(api,/revoked_at=CURRENT_TIMESTAMP/);
  assert.match(ui,/인증 기기 관리/);
  assert.match(ui,/data-device-delete/);
});

test('익명 쓰기를 끄고 삭제된 기기의 이메일 재인증을 요구한다',()=>{
  assert.match(config,/ALLOW_ANONYMOUS_WRITES = "false"/);
  assert.match(api,/DEVICE_REAUTH_REQUIRED/);
  assert.match(api,/recentAccessAuthentication/);
  assert.match(ui,/device_reauth=1/);
});

test('운영 적용 전에는 기기 인증을 설정으로 우회한다',()=>{
  assert.match(config,/DEVICE_AUTH_ENABLED = "false"/);
  assert.match(siteConfig,/deviceAuthRequired:false/);
  assert.match(ui,/SITE\.deviceAuthRequired&&!await ensureDeviceAccess\(\)/);
  assert.match(ui,/function renderDeviceGate/);
  assert.match(api,/deviceAuthEnabled=env=>env\.DEVICE_AUTH_ENABLED==='true'/);
  assert.match(api,/if\(!user&&!deviceAuthEnabled\(env\)\)user=await sharedActor\(env\)/);
  assert.match(api,/authenticated:true,bypass:true/);
});
