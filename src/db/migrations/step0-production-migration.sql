-- ============================================================================
-- Step 0 Production Migration Script
-- Purpose: Apply composite index and CHECK constraints to an existing database
-- with live data without locking out concurrent transactions.
-- ============================================================================

-- 1. Composite index for cutoff job's lockPlacedOrders query
-- Uses CONCURRENTLY to avoid acquiring a table lock that blocks writes.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_campus_status 
  ON "order"(campus_id, order_status);

-- 2. Add non-negative refund constraint to order_item
-- Using NOT VALID allows immediate application without scanning existing rows while holding an exclusive lock.
-- VALIDATE CONSTRAINT subsequently scans rows with a shared lock that allows concurrent writes.
ALTER TABLE order_item 
  ADD CONSTRAINT chk_refund_amount_nonneg CHECK (refund_amount >= 0) NOT VALID;
ALTER TABLE order_item 
  VALIDATE CONSTRAINT chk_refund_amount_nonneg;

-- 3. Add max refund constraint to order_item
ALTER TABLE order_item 
  ADD CONSTRAINT chk_refund_amount_max CHECK (refund_amount <= price_snapshot * quantity) NOT VALID;
ALTER TABLE order_item 
  VALIDATE CONSTRAINT chk_refund_amount_max;

-- 4. Add positive amount constraint to refund table
ALTER TABLE refund 
  ADD CONSTRAINT chk_refund_amount_positive CHECK (amount > 0) NOT VALID;
ALTER TABLE refund 
  VALIDATE CONSTRAINT chk_refund_amount_positive;
