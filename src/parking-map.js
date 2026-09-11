import {PARKING_COLUMNS,normalizePosition,positionInRanges,positionParts} from './parking-layouts.js';
import {STATUS} from './data.js';

const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const lastFour=plate=>String(plate||'').slice(-4);
const vehicleColorClass=value=>({검정:'black',흰색:'white',쥐색:'gray',회색:'gray',은색:'gray',녹색:'green',빨강:'red',파랑:'blue',베이지:'beige',노랑:'yellow'}[String(value||'').trim()]||'black');

function areaBounds(area){
  const from=positionParts(area.from),to=positionParts(area.to||area.from);
  return from&&to?{column:Math.min(from.column,to.column),row:Math.min(from.row,to.row),columnSpan:Math.abs(to.column-from.column)+1,rowSpan:Math.abs(to.row-from.row)+1}:null;
}

function areaAt(layout,column,row){
  return layout.specialAreas.map(area=>({area,bounds:areaBounds(area)})).find(({bounds})=>bounds&&column>=bounds.column&&column<bounds.column+bounds.columnSpan&&row>=bounds.row&&row<bounds.row+bounds.rowSpan);
}

function parkingCell(code,spot,visible,column,gridRow,columnSpan=1,rowSpan=1,tinted=false){
  const position=`grid-column:${column+1}/span ${columnSpan};grid-row:${gridRow}/span ${rowSpan}`;
  if(!spot)return`<div class="parking-cell is-vacant is-virtual${tinted?' is-company-tint':''}" style="${position}" role="gridcell" aria-label="${code} 빈 자리"></div>`;
  const occupied=Boolean(spot.plate),checkedOut=occupied&&spot.isCheckedOut,alerts=occupied?(spot.alerts||[]).map(id=>STATUS.find(status=>status.id===id)).filter(Boolean):[],classes=['parking-cell',occupied?'is-occupied':'is-vacant',occupied?`vehicle-color-${vehicleColorClass(spot.color)}`:'',checkedOut?'is-checked-out':'',visible?'':'is-filtered'].filter(Boolean).join(' '),alertIcons=alerts.length?`<span class="parking-alert-icons" aria-label="${escapeHtml(alerts.map(status=>status.label).join(', '))}">${alerts.map(status=>`<img src="/${escapeHtml(status.icon.normalize('NFD'))}" alt="${escapeHtml(status.label)}">`).join('')}</span>`:'';
  return`<button class="${classes}${tinted&&!occupied?' is-company-tint':''}" data-spot="${escapeHtml(spot.id)}" ${occupied?'draggable="true"':''} style="${position}" role="gridcell" aria-label="${code} ${occupied?`${spot.plate} ${checkedOut?'출고됨':'주차 중'}`:'빈 자리'}">${occupied?`<strong>${escapeHtml(lastFour(spot.plate))}</strong><span>${checkedOut?'(출고됨) ':''}${escapeHtml(spot.model||'차량')}</span>${alertIcons}`:''}</button>`;
}

function blockedCell(code,column,gridRow){
  return`<div class="parking-cell is-layout-blocked" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비주차 구역"></div>`;
}

export function renderParkingMap(layout,spots,visibleIds=new Set(spots.map(spot=>spot.id)),options={}){
  const byPosition=new Map(spots.map(spot=>[normalizePosition(spot.label),spot]));
  const allRows=Array.from({length:layout.rows},(_,index)=>index+1),hasToggle=Boolean(layout.collapseBeforeRow||layout.collapsedVisibleRows),collapsed=hasToggle&&!options.expanded,showCoordinates=!collapsed,showColumnHeaders=showCoordinates&&!layout.hideColumnHeaders,showRowLabels=showCoordinates||Boolean(layout.rowLabels),headerRows=1,collapsedRows=layout.collapsedVisibleRows||allRows.filter(row=>row>=layout.collapseBeforeRow),visibleRows=collapsed?collapsedRows:allRows,columns=options.expanded&&layout.expandedColumns?layout.expandedColumns:layout.columns,gridRowByActual=new Map(visibleRows.map((row,index)=>[row,index+1+headerRows])),cells=[];
  if(showColumnHeaders)cells.push('<span class="map-corner" style="grid-column:1;grid-row:1" aria-hidden="true"></span>',...PARKING_COLUMNS.slice(0,columns).map((column,index)=>`<b class="map-column" style="grid-column:${index+2};grid-row:1" aria-hidden="true">${column}</b>`));
  for(const row of visibleRows){
    const gridRow=gridRowByActual.get(row);
    if(showRowLabels)cells.push(`<b class="map-row" style="grid-column:1;grid-row:${gridRow}" aria-hidden="true">${escapeHtml(layout.rowLabels?.[row]||String(row).padStart(2,'0'))}</b>`);
    for(let column=1;column<=columns;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`,match=areaAt(layout,column,row);
      if(match){
        if(column!==match.bounds.column||row!==match.bounds.row)continue;
        const areaGridRow=gridRowByActual.get(match.bounds.row);
        if(!areaGridRow)continue;
        if(match.area.type==='parking'){
          const spot=byPosition.get(normalizePosition(match.area.from));
          cells.push(parkingCell(code,spot,!spot||visibleIds.has(spot.id),column,areaGridRow,match.bounds.columnSpan,match.bounds.rowSpan));
        }else{
          cells.push(`<div class="parking-special type-${escapeHtml(match.area.type)}${match.area.borderless?' is-borderless':''}" style="grid-column:${column+1}/span ${match.bounds.columnSpan};grid-row:${areaGridRow}/span ${match.bounds.rowSpan}" role="gridcell"><strong>${escapeHtml(match.area.label)}</strong></div>`);
        }
        continue;
      }
      const spot=byPosition.get(code),parking=layout.defaultCellType==='parking'||positionInRanges(code,layout.parkingRanges);
      cells.push(parking?parkingCell(code,spot,!spot||visibleIds.has(spot.id),column,gridRow,1,1,positionInRanges(code,layout.tintedRanges)):blockedCell(code,column,gridRow));
    }
  }
  return`<section class="parking-map" data-map-zone="${escapeHtml(options.zoneId||'')}" aria-label="${escapeHtml(layout.name)} 주차장 배치"><div class="parking-map-head"><h2>${escapeHtml(layout.name)}</h2>${hasToggle?`<button class="map-head-toggle" data-toggle-map="${escapeHtml(options.zoneId||'')}" aria-expanded="${options.expanded?'true':'false'}"><span aria-hidden="true">${options.expanded?'▲':'▼'}</span> ${options.expanded?'접기':'펼치기'}</button>`:''}</div><div class="parking-map-scroll"><div class="parking-map-grid" role="grid" style="--map-columns:${columns};--map-rows:${visibleRows.length};--map-header-rows:${headerRows};--cell-width:${layout.cellWidth||62}px;--cell-height:${layout.cellHeight||39}px;--row-label-width:${layout.rowLabelWidth||20}px">${cells.join('')}</div></div></section>`;
}
