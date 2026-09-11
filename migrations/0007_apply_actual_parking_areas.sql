-- 윤카 구역 확정 전 기능 검증용 임시 배치입니다. 레코드와 이력은 삭제하지 않습니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id IN ('pillar11','b5','roof')
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE vehicles.current_spot_id=parking_spots.id AND vehicles.checked_out_at IS NULL);

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11'
  AND substr(label,1,1) BETWEEN 'E' AND 'I'
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 20;

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='b5'
  AND substr(label,1,1) BETWEEN 'A' AND 'E'
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 16;

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='roof' AND (
  (substr(label,1,1) BETWEEN 'E' AND 'I' AND CAST(substr(label,2) AS INTEGER)=1)
  OR (substr(label,1,1) BETWEEN 'A' AND 'C' AND CAST(substr(label,2) AS INTEGER)=7)
  OR (substr(label,1,1) BETWEEN 'F' AND 'G' AND CAST(substr(label,2) AS INTEGER)=8)
  OR (label='A17')
  OR (substr(label,1,1) BETWEEN 'A' AND 'C' AND CAST(substr(label,2) AS INTEGER) BETWEEN 18 AND 20)
);
