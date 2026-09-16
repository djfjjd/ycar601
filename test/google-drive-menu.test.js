import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('상단 매입정보 메뉴와 첫 화면 Sheets·캘린더 바로가기를 분리해 표시한다',()=>{
  assert.match(main,/class="external-menu purchase-menu"/);
  assert.match(main,/data-purchase-menu aria-expanded="false" aria-haspopup="true">매입정보/);
  assert.match(main,/class="external-submenu"><a href="\/drive">헤이딜러제로<\/a>/);
  assert.match(main,/<a href="\/drive\/heydealer">선택차량목록<\/a>/);
  assert.match(main,/class="header-actions">\$\{sheetShortcut\(\)\}<a class="header-dashboard-link" href="\/dashboard">차량 현황판<\/a>/);
  assert.match(main,/class="header-actions">\$\{sheetShortcut\(\)\}<nav class="board-nav"><a href="\/">주차 위치 현황<\/a>/);
  assert.match(main,/class="external-submenu"><a href="\/drive">헤이딜러제로<\/a><a href="\/drive\/heydealer">선택차량목록<\/a><a href="\/rentcar">렌터카매입정보<\/a><a href="\/rentcar\/vehicles">렌터카매입목록<\/a><\/div>/);
  assert.match(css,/\.external-tools>a:not\(\.drive-icon-link\)\{font-size:15px\}\.external-tools>\.external-menu>button\{font-size:16px\}/);
  assert.match(css,/\.header-sheet-link img\{display:block;width:30px;height:30px/);
  assert.match(css,/\.external-menu:hover \.external-submenu/);
  assert.match(css,/\.external-menu:focus-within \.external-submenu/);
  assert.match(main,/function todayCalendarLabel\(now=new Date\(\)\)/);
  assert.match(main,/timeZone:'Asia\/Seoul'/);
  assert.match(main,/class="parking-title"><a class="parking-calendar" href="\/calendar" aria-label="차량 일정 캘린더로 이동">\$\{todayCalendarLabel\(\)\}<\/a>/);
  assert.ok(main.indexOf('>새싹타워정기권</a>')<main.indexOf('>엔카진단예약</a>'));
  assert.match(css,/\.parking-calendar\{position:absolute;left:50%;top:10px;min-height:44px;[^}]*font-size:17px/);
  assert.match(css,/\.parking-title h1 \{ margin-top:12px;/);
});

test('내부 월간 캘린더는 헤이딜러 차량과 법인 첨부파일을 날짜별로 표시한다',()=>{
  assert.match(main,/async function renderCalendarPage\(\)/);
  assert.match(main,/<h1>윤카 일정표<\/h1>/);
  assert.doesNotMatch(main,/HEYDEALER CALENDAR/);
  assert.doesNotMatch(main,/헤이딜러 프롬프트양식에 저장한 차량을 날짜별로 확인합니다\./);
  assert.match(main,/class="calendar-month-picker"><button type="button" data-calendar-month/);
  assert.match(main,/data-calendar-month-menu hidden/);
  assert.match(main,/const calendarMonthChoices=month=>/);
  assert.match(main,/data-calendar-month-choice="\$\{value\}"/);
  assert.match(main,/let selectedMonth=initial;const draw=/);
  assert.match(main,/document\.addEventListener\('click',event=>\{if\(!monthPicker\.contains\(event\.target\)\)/);
  assert.match(main,/data-calendar-shift="-1" aria-label="이전 달">&lt;/);
  assert.match(main,/data-calendar-shift="1" aria-label="다음 달">&gt;/);
  assert.match(main,/calendarMonthGrid\(selectedMonth,records\)/);
  assert.match(main,/function heydealerScheduleDate\(record\)/);
  assert.match(main,/String\(record\.departure_time\|\|''\)\.match/);
  assert.match(main,/탁송\\s\*일정\\s\*확인\\s\*중/);
  assert.match(main,/class="calendar-pending"><strong>탁송일정확인중<\/strong>/);
  assert.match(main,/records\.filter\(heydealerSchedulePending\)/);
  assert.match(main,/customerBadge\(record\.customer_type\)/);
  assert.match(main,/class="calendar-vehicle"><span class="calendar-vehicle-text"><button/);
  assert.match(main,/isCorporateCustomer\(record\.customer_type\)&&record\.files\?\.length/);
  assert.match(main,/data-calendar-files=/);
  assert.match(main,/openHeydealerFiles\(record\)/);
  assert.match(main,/data-calendar-record=/);
  assert.match(main,/function openCalendarRecord\(record\)/);
  assert.match(main,/class="calendar-record-fields"/);
  assert.match(main,/\['옵션',record\.options\],\['입금계좌',record\.account\],\['차대금',record\.price\],\['특이사항',record\.customer_type\]/);
  assert.match(main,/class="calendar-option-output"/);
  assert.match(main,/class="calendar-option-info" tabindex="0"/);
  assert.match(main,/role="tooltip">\$\{esc\(value\)\}/);
  assert.match(main,/function calendarAccountParts\(value\)/);
  assert.match(main,/summary\.replace\(\/\\D\/g,''\)/);
  assert.match(main,/class="calendar-account-output"/);
  assert.match(main,/data-calendar-account-copy="\$\{account\.digits\}"/);
  assert.match(main,/navigator\.clipboard\.writeText\(event\.currentTarget\.dataset\.calendarAccountCopy\)/);
  assert.match(main,/String\(file\.mime_type\|\|''\)\.startsWith\('image\/'\)/);
  assert.match(main,/inlineUrl=`\$\{url\}\?inline=1`/);
  assert.match(main,/data-calendar-image="\$\{inlineUrl\}"/);
  assert.match(main,/function openCalendarImage\(url,filename\)/);
  assert.match(main,/data-calendar-image-close aria-label="이미지 닫기"/);
  assert.match(main,/openCalendarImage\(button\.dataset\.calendarImage,button\.dataset\.calendarImageName\)/);
  assert.doesNotMatch(main,/href="\$\{inlineUrl\}" target="_blank"/);
  assert.match(main,/data-calendar-print="\$\{inlineUrl\}"/);
  assert.match(main,/function printCalendarImage\(url\)/);
  assert.match(main,/document\.createElement\('iframe'\)/);
  assert.match(main,/frame\.contentWindow\.print\(\)/);
  assert.doesNotMatch(main,/window\.open\(url,'_blank'\)/);
  assert.match(main,/data-calendar-file-list/);
  assert.match(main,/data-calendar-download-all/);
  assert.match(main,/data-calendar-file-download/);
  assert.match(main,/querySelectorAll\('\[data-calendar-file-download\]'\)\.forEach\(link=>link\.click\(\)\)/);
  assert.match(main,/openCalendarRecord\(record\)/);
  assert.match(main,/location\.pathname==='\/calendar'/);
  assert.match(css,/\.calendar-grid\{display:grid;grid-template-columns:repeat\(7/);
  assert.match(css,/\.calendar-file-gallery\{display:grid/);
  assert.match(css,/\.calendar-image-thumb:hover \.calendar-image-actions/);
  assert.match(css,/\.calendar-image-actions button,.calendar-image-actions a\{/);
  assert.match(css,/\.calendar-image-backdrop\{z-index:40/);
  assert.match(css,/\.calendar-image-close\{position:absolute/);
  assert.match(css,/\.calendar-record-files-head\{display:flex/);
  assert.match(css,/\.calendar-print-frame\{position:fixed;left:-10000px/);
  assert.match(css,/\.calendar-option-output>output\{[^}]*text-overflow:ellipsis;white-space:nowrap/);
  assert.match(css,/\.calendar-option-info:hover>\[role=tooltip\],\.calendar-option-info:focus>\[role=tooltip\]\{display:block\}/);
  assert.match(css,/\.calendar-option-info>\[role=tooltip\]\{[^}]*width:260px;max-width:calc\(100vw - 80px\)/);
  assert.match(css,/\.calendar-controls>button\{border:0;border-radius:50%\}/);
  assert.match(css,/\.calendar-month-picker>button\{[^}]*border:0;border-radius:999px/);
  assert.match(css,/\.calendar-month-menu\{[^}]*grid-template-columns:repeat\(12,44px\)/);
  assert.match(css,/\.calendar-month-menu button\{[^}]*border:0;border-radius:50%/);
  assert.match(css,/\.calendar-account-output\{display:grid;grid-template-columns:minmax\(0,1fr\) 34px/);
  assert.match(css,/\.calendar-account-output>button\{[^}]*border:0;background:transparent/);
  assert.match(css,/\.calendar-vehicle-number\{width:100%;min-width:0/);
  assert.match(css,/\.calendar-vehicle \[data-calendar-files\]\{[^}]*width:27px/);
  assert.doesNotMatch(css,/\.calendar-vehicle button\{[^}]*width:27px/);
  assert.match(css,/\.calendar-topline>h1\{[^}]*text-align:center/);
  assert.match(css,/\.calendar-vehicle-text>b\{[^}]*color:#c82020/);
  assert.match(css,/\.calendar-vehicle\{grid-template-columns:minmax\(0,1fr\) 27px\}/);
  assert.match(main,/renderCalendarPage\(\).*addExternalTools\(\)/);
  assert.match(main,/renderCalendarPage\(\).*sheetShortcut\(\).*class="header-dashboard-link"/);
});

test('새싹 입·출고 후 정기권 수정 안내와 무시·바로가기를 표시한다',()=>{
  assert.match(main,/function showTowerPassReminder\(\)/);
  assert.match(main,/정기권-차고지임대\(렌터카\)를 수정해주세요/);
  assert.match(main,/data-tower-ignore>무시/);
  assert.match(main,/data-tower-link>바로가기/);
  assert.match(main,/TOWER_PASS_URL=SITE\.externalLinks\.towerPass/);
  assert.match(main,/target\.zoneId==='tower'/);
  assert.match(main,/parked\?\.zoneId==='tower'/);
});

test('매입정보 버튼은 이동하지 않고 하위 메뉴만 열며 Escape로 닫는다',()=>{
  assert.match(main,/tools\.querySelector\('\.purchase-menu'\),button=tools\.querySelector\('\[data-purchase-menu\]'\)/);
  assert.match(main,/button\.onclick=\(\)=>\{const open=!menu\.classList\.contains\('is-open'\)/);
  assert.doesNotMatch(main,/button\.onclick=\(\)=>\{location\.href='\/drive'/);
  assert.match(main,/if\(event\.key==='Escape'\)/);
});

test('헤이딜러 페이지 상단은 차량 현황판 링크만 표시한다',()=>{
  assert.match(css,/body:has\(\.drive-prompt-panel\) \.topbar \.board-nav a\[href="\/"\][^,]*,body:has\(\.heydealer-list-page\) \.topbar \.board-nav a\[href="\/drive"\]\{display:none\}/);
  assert.match(css,/body:has\(\.drive-prompt-panel\) \.topbar \.board-nav a\[href="\/dashboard"\][^{]*\{[^}]*background:var\(--lime\)/);
  assert.match(css,/body:has\(\.heydealer-list-page\) \.topbar \.board-nav a\[href="\/dashboard"\][^{]*\{[^}]*background:var\(--lime\)/);
});

test('/drive 경로에 Google API 연결 전 안전한 프롬프트 화면을 제공한다',()=>{
  assert.match(main,/function renderDrivePage\(\)/);
  assert.match(main,/class="drive-prompt-panel"/);
  assert.doesNotMatch(main,/class="drive-prompt-panel"><p class="eyebrow">GOOGLE DRIVE<\/p><h1>구글드라이브<\/h1>/);
  assert.match(main,/id="drive-prompt"[^>]*maxlength="12000"/);
  assert.match(main,/parseHeydealerText\(prompt\.value\)/);
  assert.match(main,/driveField\('manager','담당자'\)/);
  assert.match(main,/driveField\('departureTime','출발시간'\)/);
  assert.match(main,/id="drive-payment-prompt"/);
  assert.match(main,/\(탁송인수 정보\)/);
  assert.match(main,/\(차대금 입금\)/);
  assert.match(main,/mergeParsed\(parsed\)/);
  assert.doesNotMatch(main,/거래 정보는 D1에 저장되며 법인 첨부파일은 비공개 R2에 보관됩니다/);
  assert.match(main,/class="drive-prompt-title">헤이딜러 거래 화면 전체를 아래 프롬프트에 붙여넣으면 거래 정보가 자동 입력됩니다/);
  assert.match(main,/data-sheet-tab hidden aria-hidden="true"/);
  assert.doesNotMatch(main,/sheet-sync-target/);
  assert.doesNotMatch(main,/구글드라이브 바로가기/);
  assert.match(main,/loadGoogleSheetTabs\(sheetSelect,status,true\)/);
  assert.match(main,/location\.pathname==='\/drive'/);
  assert.match(css,/\.drive-prompt-panel\{/);
  assert.match(css,/\.drive-prompt-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.drive-prompt-title\{color:#111/);
});

test('헤이딜러 입력은 초기화와 저장을 지원하고 목록 페이지에서 확인한다',()=>{
  assert.match(main,/data-drive-reset>초기화/);
  assert.match(main,/data-drive-save>저장/);
  assert.match(main,/drive-saving-label/);
  assert.match(main,/status\.textContent='저장 중'/);
  assert.match(main,/await api\('heydealer'/);
  assert.match(main,/for\(const file of corporateFiles\)await uploadHeydealerFile\(savedRecordId,file\)/);
  assert.match(main,/location\.href='\/drive\/heydealer'/);
  assert.match(main,/function renderHeydealerRecordsPage\(\)/);
  assert.match(main,/location\.pathname==='\/drive\/heydealer'/);
  assert.match(main,/<div class="heydealer-list-head"><h1>선택차량목록<\/h1><div class="heydealer-list-actions"><button type="button" data-sheet-sync-all disabled>전체 동기화<\/button><a href="\/drive">\+ 새 거래 입력<\/a>/);
  assert.match(main,/await loadGoogleSheetTabs\(sheetSelect,syncStatus,true\);syncAllButton\.disabled=!sheetSelect\.value/);
  assert.match(main,/<select data-sheet-tab hidden aria-hidden="true" disabled>/);
  assert.doesNotMatch(main,/class="sheet-bulk-sync"/);
  assert.match(css,/\.heydealer-list-actions\{display:flex/);
  assert.doesNotMatch(main,/GOOGLE DRIVE · HEYDEALER|헤이딜러 저장 목록|거래 정보는 D1, 법인 첨부파일은 비공개 R2에 저장됩니다/);
  assert.match(css,/\.heydealer-record-list\{/);
});

test('프롬프트양식 저장 완료 요청에 캘린더 푸시 알림 표시를 전달한다',()=>{
  assert.match(main,/recordId:savedRecordId,tab:sheetSelect\.value,notifyCalendar:true/);
});

test('특이사항은 필수 개인·법인 선택이며 법인만 파일 첨부를 활성화한다',()=>{
  assert.match(main,/driveField\('notes','특이사항'\)/);
  assert.match(main,/required-mark">\(필수\)<\/small>/);
  assert.match(main,/CUSTOMER_TYPES=\['개인','법인','법인\(비사업용\)'\]/);
  assert.match(main,/name="corporateFile"[^>]*multiple disabled/);
  assert.match(main,/const enabled=isCorporateCustomer\(customerSelect\.value\)/);
  assert.match(main,/fileInput\.disabled=!enabled/);
  assert.match(main,/>📎<\/span><b>파일 업로드<\/b>/);
  assert.match(css,/\.drive-file-button\.is-disabled/);
});

test('프롬프트 입력은 특이사항 개인·법인 선택값을 자동 변경하지 않는다',()=>{
  assert.match(main,/if\(name==='notes'\)return;const field=form\.elements\.namedItem\(name\)/);
  assert.match(main,/const reset=\(\)=>\{savedRecordId='';fileUploaded=false;fillDriveFields\(form,empty\)/);
});

test('헤이딜러 거래는 옵션만 선택이고 나머지 입력값을 필수로 검증한다',()=>{
  assert.match(main,/const required=name!=='options'/);
  assert.doesNotMatch(main,/driveField\('date','날짜'/);
  assert.match(main,/driveField\('mileage','총 주행거리'\)/);
  assert.match(main,/requiredNames=\['manager','modelYear','plate','model','color','mileage','notes','price','account','origin','departureTime'\]/);
  assert.match(main,/status\.textContent='필수사항을 입력하세요\.'/);
  assert.match(main,/status\.classList\.add\('is-error'\)/);
  assert.match(css,/\.drive-parse-status\{[^}]*text-align:right/);
  assert.match(css,/\.drive-prompt-panel>\.drive-parse-status\.is-error\{color:#c82020/);
});

test('선택차량목록은 기본 접힘·10개 페이지·삭제 기능을 제공한다',()=>{
  assert.match(main,/class="heydealer-record-details" \$\{editing\?'open':''\}><summary>\$\{editing\?'접기':'펼치기'\}<\/summary>/);
  assert.match(main,/records\.slice\(\(currentPage-1\)\*10,currentPage\*10\)/);
  assert.match(main,/>맨처음<\/button>/);
  assert.match(main,/>맨끝<\/button>/);
  assert.match(main,/data-heydealer-delete/);
  assert.match(main,/api\(`heydealer\/\$\{record\.id\}`,\{method:'DELETE'\}\)/);
  assert.match(css,/\.heydealer-delete\{[^}]*color:#c82020/);
});

test('선택차량목록 연필 버튼은 항목을 펼쳐 D1 정보를 수정한다',()=>{
  assert.match(main,/class="heydealer-edit" data-heydealer-edit=/);
  assert.match(main,/heydealerRecord\(record,record\.id===editingRecordId\)/);
  assert.match(main,/class="heydealer-record\$\{editing\?' is-editing':''\}"/);
  assert.match(main,/class="heydealer-edit-form" data-heydealer-edit-form=/);
  assert.match(main,/api\(`heydealer\/\$\{record\.id\}`,\{method:'PATCH'/);
  assert.match(handler,/if\(method==='PATCH'&&parts\[1\]&&!parts\[2\]\)/);
  assert.match(handler,/UPDATE heydealer_records SET manager=\?,record_date=\?/);
  assert.match(handler,/'update','heydealer_record'/);
});

test('선택차량 수정 중 법인 선택 시 클립 버튼으로 파일을 업로드한다',()=>{
  assert.match(main,/class="heydealer-edit-file-button \$\{corporate\?'':'is-disabled'\}"/);
  assert.match(main,/name="corporateFile"[^>]*multiple \$\{corporate\?'':'disabled'\}/);
  assert.match(main,/HEYDEALER_EDIT_FILES\.set\(form\.dataset\.heydealerEditForm,files\)/);
  assert.match(main,/for\(const file of pendingFiles\)await uploadHeydealerFile\(editedRecordId,file\)/);
  assert.match(css,/\.heydealer-edit-file-button\{/);
});

test('선택차량목록의 법인 차량만 R2 첨부파일 다운로드 기능을 제공한다',()=>{
  assert.match(main,/corporate=isCorporateCustomer\(record\.customer_type\)/);
  assert.match(main,/class="corporate-label">\$\{customerBadge\(record\.customer_type\)\}<\/span><button type="button" class="heydealer-download"/);
  assert.match(main,/data-heydealer-files/);
  assert.match(main,/openHeydealerFiles\(record\)/);
  assert.match(main,/async function openHeydealerFiles\(record\).*await api\('heydealer'\)/);
  assert.match(main,/record\.files=files/);
  assert.match(main,/data-files-download-all>전체다운로드/);
  assert.match(main,/querySelectorAll\('li a\[download\]'\)\.forEach\(link=>link\.click\(\)\)/);
  assert.match(css,/\.heydealer-download-all\{[^}]*position:absolute;top:66px;right:22px/);
  assert.match(main,/업로드된 파일이 없습니다\./);
  assert.match(main,/\/api\/heydealer\/\$\{esc\(record\.id\)\}\/files\/\$\{esc\(file\.id\)\}/);
});
