UPDATE vehicles
SET color = '블루', updated_at = CURRENT_TIMESTAMP
WHERE trim(color) = '파랑';

UPDATE heydealer_records
SET color = '블루', updated_at = CURRENT_TIMESTAMP
WHERE trim(color) = '파랑';
