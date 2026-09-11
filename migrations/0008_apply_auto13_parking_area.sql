-- 윤카 구역 확정 전 기능 검증용 오토플렉스 13층 임시 배치입니다.
-- 기존 배정 차량과 이동 이력은 삭제하거나 비활성화하지 않습니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='auto13'
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
      AND vehicles.checked_out_at IS NULL
  );

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='auto13'
  AND substr(label,1,1) BETWEEN 'A' AND 'D'
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 9 AND 11;
