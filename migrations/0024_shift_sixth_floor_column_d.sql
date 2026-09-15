-- 6층 D08:D09는 비활성화하고 D10:D12는 D10 한 칸으로 병합합니다.
UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label IN ('D08','D09','D11','D12');

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label='D10';
