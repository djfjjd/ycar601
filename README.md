# 윤카 차량·주차 관리

윤카 중고차 매매 현장의 입차, 위치 이동, 차량 상태, 상품화, 출고와 이력을 관리하는 Cloudflare Pages 앱입니다. Vite UI, Pages Functions, D1, 비공개 R2, Cloudflare Access 구조를 유지합니다.

## 윤카 전용 리소스

- GitHub: `djfjjd/ycar601`
- Pages: `ycar601` / `ycar601.pages.dev`
- 운영 D1: `ycar601-production`
- 미리보기 D1: `ycar601-preview`
- 비공개 R2: `ycar601-private-files` (`FILES` 바인딩)

기존 프로젝트의 D1 데이터, 사용자, 푸시 구독, 인증 기기, 헤이딜러 기록, R2 객체는 가져오지 않습니다. 기존 마이그레이션이 만드는 주차구역은 윤카의 실제 배치가 확정되기 전 UI·기능 검증용 **임시 배치**입니다. 이미 적용된 마이그레이션은 변경 이력을 보존하고, 실제 윤카 구역은 추후 새 마이그레이션으로 조정합니다.

회사 표시는 [src/site-config.js](src/site-config.js) 한 곳에서 관리합니다. 현재 대표자, 사업자번호, 주소는 모두 `정보 등록 필요`로 표시됩니다. 공식 로고가 준비되기 전까지 `윤카` 텍스트 기반 임시 아이콘을 사용합니다.

## 설치와 검증

```bash
npm install
npm run lint
npm test
npm run build
npx wrangler d1 migrations apply ycar601-production --local
git diff --check
```

Node.js 22 LTS를 권장하며 빌드 출력은 `dist`입니다. `public/_redirects`가 SPA 새로고침을 처리합니다.

## Cloudflare Pages 설정

Cloudflare 대시보드의 **Workers & Pages → ycar601 → Settings**에서 다음을 확인합니다.

- Git 저장소: `djfjjd/ycar601`
- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `dist`
- D1 binding: `DB` → 환경별 윤카 D1
- R2 binding: `FILES` → `ycar601-private-files` (공개 액세스 비활성)
- 런타임: Node.js 22 LTS 권장

Git 연동 프로젝트이므로 Direct Upload 방식으로 전환하지 않습니다. GitHub 앱 접근이 실패하면 **GitHub → Settings → Applications → Installed GitHub Apps → Cloudflare Pages → Configure**에서 `djfjjd/ycar601` 접근을 허용합니다.

일반 환경 변수:

```dotenv
AUTH_MODE=cloudflare-access
ALLOW_DEMO_AUTH=false
ALLOW_ANONYMOUS_WRITES=false
DEVICE_AUTH_ENABLED=false
VAPID_PUBLIC_KEY=
VAPID_SUBJECT=
GOOGLE_CLIENT_EMAIL=
GOOGLE_SHEET_ID=
GOOGLE_SHEET_AUTO_SYNC_TAB=
```

Secret:

- `VAPID_PRIVATE_KEY`
- `GOOGLE_PRIVATE_KEY`

윤카용 Google Spreadsheet와 VAPID 키가 준비되기 전에는 값을 비워 둡니다. 이 상태에서 Sheets 바로가기는 “설정 필요”로 비활성화되고, 백그라운드 자동 동기화는 건너뛰므로 D1 차량 저장은 계속 성공합니다. 실제 비밀키는 저장소나 프론트엔드가 아니라 Pages Secret에만 등록합니다.

## 인증 적용 순서

현재는 첫 화면에 인증 없이 접속할 수 있도록 `src/site-config.js`의 `deviceAuthRequired=false`와 Pages의 `DEVICE_AUTH_ENABLED=false`를 함께 사용합니다. 기기 인증 화면, OTP 등록, 쿠키, 관리자 기기 관리 기능은 삭제하지 않고 보존합니다. `AUTH_MODE=cloudflare-access`, `ALLOW_DEMO_AUTH=false`, `ALLOW_ANONYMOUS_WRITES=false`도 유지합니다.

1. **Zero Trust → Access → Applications**에서 `ycar601.pages.dev` Self-hosted 애플리케이션을 생성 또는 확인합니다.
2. One-time PIN을 로그인 방식으로 설정하고 윤카 직원 이메일만 Allow 정책에 등록합니다.
3. `users`에 윤카 관리자·직원·조회 전용 사용자를 등록합니다. 기존 프로젝트 사용자를 복사하지 않습니다.
4. 미리보기에서 첫 기기 OTP, HttpOnly·Secure 쿠키, 토큰 해시 저장, `/admin` 기기 삭제와 재인증, `admin`·`staff`·`viewer` 권한을 검증합니다.
5. 기기 인증을 운영에 적용할 때만 `src/site-config.js`의 `deviceAuthRequired=true`와 Pages의 `DEVICE_AUTH_ENABLED=true`를 함께 설정합니다.

모든 변경 API는 서버에서 역할을 다시 검사합니다. D1에는 기기 토큰 원문이 아닌 SHA-256 해시만 저장됩니다.

## 데이터베이스 적용

미리보기 DB가 윤카의 빈 신규 DB인지 확인한 뒤 마이그레이션을 적용하고 차량 수가 0인지 확인합니다. 운영 DB도 테이블이나 데이터가 없는 신규 DB임을 먼저 확인한 경우에만 적용합니다.

```bash
npx wrangler d1 migrations apply ycar601-preview --remote
npx wrangler d1 execute ycar601-preview --remote --command "SELECT COUNT(*) AS vehicle_count FROM vehicles;"
npx wrangler d1 migrations apply ycar601-production --remote
```

R2 업로드·다운로드는 기존 Pages Function의 권한, 거래 유형, 파일 형식과 크기 검사를 그대로 사용합니다. 버킷은 공개하지 않습니다.

## 운영 전 확인

- 윤카 실제 주차구역을 새 마이그레이션과 `src/parking-layouts.js`에 반영
- 대표자·사업자번호·주소 및 공식 로고 등록
- 윤카 Google Sheet 및 서비스 계정 권한 설정
- 윤카 VAPID 키와 Subject 설정 후 재구독·테스트 발송
- Cloudflare Access 허용 이메일과 역할 검증
- `/`, `/dashboard`, `/calendar`, `/drive`, `/drive/heydealer`, `/admin` 및 SPA 새로고침 확인
- 390px 모바일, 태블릿, 데스크톱, 인쇄 화면 확인
