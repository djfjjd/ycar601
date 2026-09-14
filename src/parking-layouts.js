export const PARKING_COLUMNS=['A','B','C','D','E','F','G','H','I','J'];

const baseLayout=(name,overrides={})=>({name,columns:9,rows:20,defaultCellType:'parking',parkingRanges:[],specialAreas:[],...overrides});

// 실제 도면을 반영할 때 specialAreas만 수정합니다.
// {from:'A01',to:'C04',type:'company-area',label:'제이카'}처럼 범위를 지정할 수 있습니다.
export const parkingLayouts={
  pillar11:baseLayout('서서울모터리움 6층',{
    rows:25,
    collapseBeforeRow:8,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A08',to:'D20'},{from:'A21',to:'D24'},{from:'E19',to:'I19'}],
    tintedRanges:[{from:'E19',to:'I19'}],
    specialAreas:[
      {from:'D08',type:'blocked',label:''},
      {from:'D09',to:'D11',type:'parking',label:''},
      {from:'A25',to:'B25',type:'ycar-area',label:'윤카'},
      {from:'C25',to:'D25',type:'facility',label:'E/V · 화장실'},
      {from:'E25',type:'company-area',label:'제이카',borderless:true},
      {from:'F25',to:'G25',type:'company-area',label:'픽카소',borderless:true},
      {from:'H25',to:'I25',type:'office',label:'하나오토',borderless:true},
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
    columns:10,
    rows:2,
    parkingRanges:[{from:'A01',to:'E02'}],
    hideColumnHeaders:true,
    rowLabelWidth:42,
    rowLabels:{1:'B5층',2:'B6층'},
  }),
  auto13:baseLayout('오토플렉스 13층',{
    columns:4,
    expandedColumns:9,
    collapsedVisibleRows:[9,10,11,19,20],
    toggleBeforeRow:9,
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
