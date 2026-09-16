-- 병합된 6층 D08:D09 주차면은 D08을 대표 활성 주차면으로 사용합니다.
UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label='D08';

UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label='D09';
