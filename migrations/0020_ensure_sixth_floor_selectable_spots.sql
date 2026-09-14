-- 6층 신규 배치 주차면을 보정해 화면에서 선택·배정할 수 있도록 합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 19 UNION ALL SELECT value+1 FROM rows WHERE value<19),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<9)
SELECT 'pillar11-grid-'||char(64+cols.value)||printf('%02d',rows.value),
       'pillar11',char(64+cols.value)||printf('%02d',rows.value)
FROM rows CROSS JOIN cols;

INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 21 UNION ALL SELECT value+1 FROM rows WHERE value<24),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<4)
SELECT 'pillar11-grid-'||char(64+cols.value)||printf('%02d',rows.value),
       'pillar11',char(64+cols.value)||printf('%02d',rows.value)
FROM rows CROSS JOIN cols;

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND (
  (substr(label,1,1) BETWEEN 'A' AND 'D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 9 AND 24)
  OR (substr(label,1,1) BETWEEN 'E' AND 'I' AND CAST(substr(label,2) AS INTEGER)=19)
) AND label NOT IN ('D10','D11');
