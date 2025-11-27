-- Fix existing columns to be nullable
ALTER TABLE customer MODIFY COLUMN user_id VARCHAR(50) NULL;
ALTER TABLE business_owner MODIFY COLUMN user_id VARCHAR(50) NULL;

-- Add reservation fee amount column (per-person base amount for risk-based fees)
ALTER TABLE business
    ADD COLUMN IF NOT EXISTS reservation_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER monthly_revenue;
