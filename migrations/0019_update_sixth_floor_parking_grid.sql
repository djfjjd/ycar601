-- 6층 배치 변경: A01:D07 비활성화, D09:D11 병합, A21:D24 추가.
-- 기존 주차면과 차량 이력은 삭제하지 않고 활성 상태만 조정합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 21 UNION ALL SELECT value+1 FROM rows WHERE value<24),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<4)
SELECT 'pillar11-grid-'||char(64+cols.value)||printf('%02d',rows.value),
       'pillar11',
       char(64+cols.value)||printf('%02d',rows.value)
FROM rows CROSS JOIN cols;

UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND (
  (substr(label,1,1) BETWEEN 'A' AND 'D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 7)
  OR label IN ('D10','D11')
);

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND (
  (substr(label,1,1) BETWEEN 'A' AND 'D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 8 AND 24)
  OR (substr(label,1,1) BETWEEN 'E' AND 'I' AND CAST(substr(label,2) AS INTEGER)=15)
) AND label NOT IN ('D10','D11');
