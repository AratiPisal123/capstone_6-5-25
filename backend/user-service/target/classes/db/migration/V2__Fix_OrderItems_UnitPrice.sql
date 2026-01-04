-- Fix the unitPrice field in order_items table to allow NULL or provide default value
-- Note: The actual column name might be 'unitPrice' not 'unit_price'

-- Try with the exact column name from the error
ALTER TABLE order_items MODIFY COLUMN unitPrice DOUBLE NOT NULL DEFAULT 0.0;

-- Also fix totalPrice field to ensure consistency
ALTER TABLE order_items MODIFY COLUMN totalPrice DOUBLE NOT NULL DEFAULT 0.0;

-- Update any existing NULL records
UPDATE order_items SET unitPrice = 0.0 WHERE unitPrice IS NULL;
UPDATE order_items SET totalPrice = 0.0 WHERE totalPrice IS NULL;
