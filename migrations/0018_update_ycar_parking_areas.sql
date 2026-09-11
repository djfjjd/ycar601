-- 윤카 확정 배치: 6층 확장, B3/B5 제거, 옥상 주차면 비활성화.
-- 기존 차량 및 이력은 삭제하지 않으며, 적용 전 차량 수가 0인지 확인합니다.
UPDATE parking_zones
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE id IN ('b3','b5');

UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id IN ('pillar11','b3','b5','roof');

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND (
  (substr(label,1,1) BETWEEN 'A' AND 'D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 20)
  OR (substr(label,1,1) BETWEEN 'E' AND 'I' AND CAST(substr(label,2) AS INTEGER)=15)
);
