-- 6층 D08:D09를 하나의 비활성화 구역으로 병합합니다.
UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label IN ('D08','D09');
