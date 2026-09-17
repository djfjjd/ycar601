export const PARKING_COLUMNS=['A','B','C','D','E','F','G','H','I','J'];

const baseLayout=(name,overrides={})=>({name,columns:9,rows:20,defaultCellType:'parking',parkingRanges:[],specialAreas:[],...overrides});

// 실제 도면을 반영할 때 specialAreas만 수정합니다.
// {from:'A01',to:'C04',type:'company-area',label:'제이카'}처럼 범위를 지정할 수 있습니다.
export const parkingLayouts={
  pillar11:baseLayout('서서울모터리움 6층',{
    columns:10,
    rows:25,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A08',to:'D20'},{from:'A21',to:'D24'},{from:'F19',to:'J19'}],
    transparentRanges:[{from:'F01',to:'J18'}],
    tintedRanges:[{from:'F19',to:'J19'}],
    rowDividers:[
      {afterRow:8,label:'09번기둥'},
      {afterRow:12,label:'08번기둥'},
      {afterRow:16,label:'07번기둥'},
      {afterRow:20,label:'06번기둥'},
    ],
    specialAreas:[
      {from:'E01',to:'E25',type:'passage',label:'통로'},
      {from:'D08',to:'D09',type:'parking',label:''},
      {from:'D10',to:'D11',type:'parking',label:''},
      {from:'A25',to:'B25',type:'ycar-area',label:'윤카'},
      {from:'C25',to:'D25',type:'facility',label:'E/V · 화장실'},
      {from:'F25',type:'company-area',label:'제이카',borderless:true},
      {from:'G25',to:'H25',type:'company-area',label:'픽카소',borderless:true},
      {from:'I25',to:'J25',type:'office',label:'하나오토',borderless:true},
    ],
  }),
  roof:baseLayout('서서울모터리움 옥상층',{
    rows:20,
    collapsedVisibleRows:[1,2,3,4,5,6,7,8,17,18,19,20],
    toggleBeforeRow:9,
    defaultCellType:'blocked',
    parkingRanges:[],
    specialAreas:[
      {from:'H03',to:'I07',type:'entrance',label:'주차장 출입구 램프'},
      {from:'A17',to:'C17',type:'blocked',label:''},
      {from:'D17',to:'E20',type:'stairs',label:'계단'},
    ],
  }),
  tower:baseLayout('좋은책신사고 새싹타워',{
    columns:5,
    rows:2,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A01',to:'E02'}],
    hideColumnHeaders:true,
    rowLabelWidth:42,
    rowLabels:{1:'B5층',2:'B6층'},
  }),
  auto13:baseLayout('오토플렉스 13층',{
    columns:4,
    visibleRows:[9,10,11,19,20],
    hideCoordinates:true,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A09',to:'D11'}],
    specialAreas:[
      {from:'A19',to:'B19',type:'facility',label:'화장실'},
      {from:'A20',to:'B20',type:'elevator',label:'E/V'},
    ],
  }),
};

export function normalizePosition(value){
  const match=String(value||'').trim().toUpperCase().match(/^([A-J])0?([1-9]|1\d|2[0-5])$/);
  return match?`${match[1]}${String(Number(match[2])).padStart(2,'0')}`:'';
}

export function displayParkingPosition(zoneId,label){
  const position=normalizePosition(label);
  if(zoneId!=='pillar11'||!position||position[0]<'E'||position[0]>'I')return position||label;
  return`${PARKING_COLUMNS[PARKING_COLUMNS.indexOf(position[0])+1]}${position.slice(1)}`;
}

export function positionParts(value){
  const normalized=normalizePosition(value);
  return normalized?{code:normalized,column:PARKING_COLUMNS.indexOf(normalized[0])+1,row:Number(normalized.slice(1))}:null;
}

export function positionInRanges(code,ranges=[]){
  const position=positionParts(code);
  return Boolean(position&&ranges.some(range=>{const from=positionParts(range.from),to=positionParts(range.to||range.from);return from&&to&&position.column>=Math.min(from.column,to.column)&&position.column<=Math.max(from.column,to.column)&&position.row>=Math.min(from.row,to.row)&&position.row<=Math.max(from.row,to.row);}));
}

export function parkingCapacity(layout){
  let total=0;
  for(let row=1;row<=layout.rows;row+=1){
    for(let column=1;column<=layout.columns;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`;
      const area=layout.specialAreas.find(item=>positionInRanges(code,[item]));
      if(area){
        if(area.type==='parking'&&normalizePosition(area.from)===code)total+=1;
        continue;
      }
      if(layout.defaultCellType==='parking'||positionInRanges(code,layout.parkingRanges))total+=1;
    }
  }
  return total;
}
