-- 6층 D08·D09를 활성화하고 D10:D11 병합 외의 D12를 독립 주차면으로 활성화합니다.
UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label IN ('D08','D09','D10','D12');

UPDATE parking_spots
SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label='D11';
