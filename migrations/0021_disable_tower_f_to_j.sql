-- 새싹타워 지하 5층·6층 F:J 주차면 10칸을 비활성화합니다.
UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND substr(label,1,1) BETWEEN 'F' AND 'J'
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 2;
