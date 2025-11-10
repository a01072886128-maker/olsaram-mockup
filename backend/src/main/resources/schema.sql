-- Fix existing columns to be nullable
ALTER TABLE customer MODIFY COLUMN user_id VARCHAR(50) NULL;
ALTER TABLE business_owner MODIFY COLUMN user_id VARCHAR(50) NULL;
