import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHeydealerText} from '../src/heydealer-parser.js';

const sample=`경매장
홍길동 대표
219더4124

BMW 1시리즈 (F40) 120i M 스포츠
2023-10 (23년형)
18,634km
경남 창원시
휘발유ㆍ오토ㆍ현금/할부ㆍ알파인 화이트

거래 주요정보
내 견적
2,420만원
선택날짜
2026-09-01
차대금
2,420만원
입금 계좌
우리은행 296-969767-18-810 (예금주: (주)피알앤디컴퍼니)`;

test('헤이딜러 전체 복사문에서 거래 입력값을 추출한다',()=>{
  assert.deepEqual(parseHeydealerText(sample),{
    manager:'대표님',modelYear:'2023-10',plate:'219더4124',
    model:'BMW 1시리즈 (F40) 120i M 스포츠',color:'흰색',mileage:'18,634km',options:'',notes:'',
    price:'2,420만원',account:'우리은행 296-969767-18-810 (예금주: (주)피알앤디컴퍼니)',
    origin:'경남 창원시',departureTime:'',date:'2026-09-01',
  });
});

test('헤이딜러 담당자의 직급 표기를 일반 규칙으로 정규화한다',()=>{
  const parseManager=manager=>parseHeydealerText(`${manager}\n219더4124\nBMW 120i`).manager;
  assert.equal(parseManager('홍길동 대표'),'대표님');
  assert.equal(parseManager('대표님'),'대표님');
  assert.equal(parseManager('김윤카 대리'),'김윤카대리');
  assert.equal(parseManager('박자동 주임'),'박자동주임');
  assert.equal(parseManager('알 수 없는 담당자'),'');
});

test('헤이딜러 색상명을 현장 표준 색상으로 정규화한다',()=>{
  const parseColor=color=>parseHeydealerText(`219더4124\nBMW 120i\n휘발유ㆍ오토ㆍ${color}`).color;
  assert.equal(parseColor('알파인 화이트'),'흰색');
  assert.equal(parseColor('딥 오션 블루'),'블루');
  assert.equal(parseColor('메탈릭 실버'),'쥐색');
  assert.equal(parseColor('스페이스 그레이'),'쥐색');
  assert.equal(parseColor('사파이어 블랙'),'검정');
});

test('제원 바로 아래의 옵션 문구를 자동 입력한다',()=>{
  const result=parseHeydealerText(sample.replace('\n거래 주요정보','\n선루프,1인신조\n거래 주요정보'));
  assert.equal(result.options,'선루프,1인신조');
});

test('옵션 다음 여러 줄과 특이사항 및 출발시간을 인식한다',()=>{
  const source=`219더4124\nBMW 120i\n2023-10 (23년형)\n휘발유ㆍ오토ㆍ흰색\n옵션\n선루프\n1인신조\n어라운드뷰\n특이사항\n법인\n출발시간\n18:00`;
  const result=parseHeydealerText(source);
  assert.equal(result.options,'선루프,1인신조,어라운드뷰');
  assert.equal(result.notes,'법인');
  assert.equal(result.departureTime,'18:00');
});

test('옵션은 출고정보 전까지만 추출한다',()=>{
  const result=parseHeydealerText('219더4124\nBMW 120i\n옵션\n선루프\n어라운드뷰\n출고정보\n출고지 서울\n탁송기사 홍길동');
  assert.equal(result.options,'선루프,어라운드뷰');
});

test('금액이 붙은 신차 정가와 출고 정보부터는 옵션에 포함하지 않는다',()=>{
  const priceResult=parseHeydealerText('219더4124\nBMW 120i\n옵션\n선루프\n통풍시트\n🏷 신차정가 약 4,890만원\n📄 등록증출고가 4,081만원');
  const deliveryResult=parseHeydealerText('219더4124\nBMW 120i\n옵션\n선루프\n어라운드뷰\n출고 정보: 2026-09-03\n탁송기사 홍길동');
  assert.equal(priceResult.options,'선루프,통풍시트');
  assert.equal(deliveryResult.options,'선루프,어라운드뷰');
});

test('매수자 인적사항에 법인명이 있으면 특이사항을 법인으로 선택한다',()=>{
  const result=parseHeydealerText('매수자 인적사항\n법인명\n윤카\n법인 번호\n110111-0000000');
  assert.equal(result.notes,'법인');
});

test('차대금 원문처럼 차량번호가 없으면 차종을 임의 추출하지 않는다',()=>{
  const result=parseHeydealerText('차대금\n2,020만원\n입금 계좌\n우리은행 123-456');
  assert.equal(result.model,'');
  assert.equal(result.price,'2,020만원');
});

test('탁송정보 다음 일정에서 출발시간을 인식한다',()=>{
  const result=parseHeydealerText('탁송정보\n일정\n2026-09-03 오후 2:30\n탁송기사 배정 대기\n차대금 입금');
  assert.equal(result.departureTime,'2026-09-03 14:30');
});

test('탁송 일정이 한 줄로 표시되어도 출발시간을 인식한다',()=>{
  const result=parseHeydealerText('탁송인수 정보\n탁송 일정: 2026. 9. 3. 18:00\n차대금 입금');
  assert.equal(result.departureTime,'2026-09-03 18:00');
});

test('탁송정보 일정의 실제 출발예정 문구를 출발시간으로 입력한다',()=>{
  const result=parseHeydealerText('탁송정보\n일정\n2026-09-04(금) 오전 10시 출발예정\n탁송기사 배정 대기\n차대금 입금');
  assert.equal(result.departureTime,'2026-09-04 (금) 10:00 출발예정');
});

test('일정과 출발예정 문구가 같은 줄이어도 인식한다',()=>{
  const result=parseHeydealerText('탁송인수 정보\n일정 2026-09-04(금) 오전 10시 출발예정\n차대금 입금');
  assert.equal(result.departureTime,'2026-09-04 (금) 10:00 출발예정');
});

test('입금 안내의 2시간 전 문구를 출발시간으로 오인하지 않는다',()=>{
  const result=parseHeydealerText('탁송정보\n원활한 탁송을 위해 탁송 출발 2시간 전까지 입금해 주세요.\n차대금 입금');
  assert.equal(result.departureTime,'');
});

test('앞쪽 탁송인수 정보보다 뒤쪽 실제 탁송정보의 일정을 우선한다',()=>{
  const source=`탁송인수 정보
차대금 입금
거래 마무리
거래종결
매수자 인적사항
탁송정보
탁송기사님이 송금과 서류 확인을 담당합니다.
일정
2026-09-04 (금) 오전 10시 출발예정
탁송받을 주소
서울 강서구 양천로53길 30`;
  const result=parseHeydealerText(source);
  assert.equal(result.departureTime,'2026-09-04 (금) 10:00 출발예정');
});
