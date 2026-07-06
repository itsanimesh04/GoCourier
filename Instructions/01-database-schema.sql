-- ============================================================
-- CAMPUS FOOD DELIVERY — CORE SCHEMA (Phase 1 / MVP)
-- Postgres. Run in this order (foreign keys depend on it).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- CAMPUS ----------
CREATE TABLE campus (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  cutoff_time     TIME NOT NULL,           -- e.g. 17:00
  delivery_time   TIME NOT NULL,           -- e.g. 19:00
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- USERS (students, ops, admin, delivery — one table, role flag) ----------
CREATE TYPE user_role AS ENUM ('student', 'ops', 'admin', 'delivery_agent');

CREATE TABLE app_user (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT NOT NULL UNIQUE,
  name            TEXT,
  role            user_role NOT NULL DEFAULT 'student',
  campus_id       UUID REFERENCES campus(id),   -- null for admin/ops if multi-campus
  drop_point      TEXT,                          -- student's saved delivery point
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_phone ON app_user(phone);
CREATE INDEX idx_user_role ON app_user(role);

-- ---------- OTP LOGIN ----------
CREATE TABLE otp_request (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT NOT NULL,
  otp_code        TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone ON otp_request(phone);

-- ---------- RESTAURANT ----------
CREATE TABLE restaurant (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id             UUID NOT NULL REFERENCES campus(id),
  name                  TEXT NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  commission_rate       NUMERIC(5,2) DEFAULT 0,   -- for ranking_score, not shown to student
  manual_priority        INT DEFAULT 0,
  refund_risk_penalty   NUMERIC(5,2) DEFAULT 0,   -- computed periodically from history
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurant_campus ON restaurant(campus_id);

-- ---------- MENU ITEM ----------
CREATE TABLE menu_item (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurant(id),
  name            TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  is_veg          BOOLEAN DEFAULT true,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_restaurant ON menu_item(restaurant_id);

-- ---------- BATCH ----------
CREATE TYPE batch_status AS ENUM (
  'open', 'locked', 'procuring', 'ready_for_dispatch', 'out_for_delivery', 'closed'
);

CREATE TABLE batch (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id           UUID NOT NULL REFERENCES campus(id),
  service_date        DATE NOT NULL,
  batch_status        batch_status NOT NULL DEFAULT 'open',
  delivery_agent_id   UUID REFERENCES app_user(id),
  locked_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campus_id, service_date)   -- enforces "unique by campus and date" from spec
);

-- ---------- ORDER ----------
CREATE TYPE order_status AS ENUM (
  'cart', 'placed', 'locked', 'procuring', 'confirmed',
  'out_for_delivery', 'delivered', 'closed', 'cancelled'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'success', 'failed', 'late', 'refunded', 'partially_refunded'
);

CREATE TABLE "order" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES app_user(id),
  campus_id       UUID NOT NULL REFERENCES campus(id),
  restaurant_id   UUID NOT NULL REFERENCES restaurant(id),  -- one-restaurant cart for MVP
  batch_id        UUID REFERENCES batch(id),                -- null until cutoff job runs
  drop_point      TEXT,
  order_status    order_status NOT NULL DEFAULT 'cart',
  payment_status  payment_status NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  placed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT order_drop_point_required_unless_cart
    CHECK (order_status = 'cart' OR (drop_point IS NOT NULL AND btrim(drop_point) <> ''))
);

CREATE INDEX idx_order_student ON "order"(student_id);
CREATE INDEX idx_order_batch ON "order"(batch_id);
CREATE INDEX idx_order_status ON "order"(order_status);
-- Composite index for the cutoff job's lockPlacedOrders query:
-- WHERE campus_id = $1 AND order_status = 'placed' AND payment_status = 'success'
CREATE INDEX idx_order_campus_status ON "order"(campus_id, order_status);

-- ---------- ORDER ITEM ----------
CREATE TYPE order_item_status AS ENUM ('pending', 'confirmed', 'unavailable', 'refunded');

CREATE TABLE order_item (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES menu_item(id),
  item_name_snap  TEXT NOT NULL,      -- snapshot at order time
  price_snapshot  NUMERIC(10,2) NOT NULL,
  quantity        INT NOT NULL CHECK (quantity > 0),
  item_status     order_item_status NOT NULL DEFAULT 'pending',
  refund_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Refund cannot be negative, and cannot exceed what was paid for this line
  CONSTRAINT chk_refund_amount_nonneg   CHECK (refund_amount >= 0),
  CONSTRAINT chk_refund_amount_max      CHECK (refund_amount <= price_snapshot * quantity)
);

CREATE INDEX idx_orderitem_order ON order_item(order_id);

-- ---------- PAYMENT ----------
CREATE TABLE payment (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES "order"(id),
  gateway             TEXT NOT NULL,          -- 'razorpay' etc
  gateway_order_id    TEXT,
  gateway_txn_id      TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  status              TEXT NOT NULL,          -- raw gateway status, mapped to payment_status on order
  webhook_payload     JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_order ON payment(order_id);
CREATE UNIQUE INDEX idx_payment_gateway_order_id ON payment(gateway, gateway_order_id) WHERE gateway_order_id IS NOT NULL;
CREATE UNIQUE INDEX idx_payment_gateway_txn ON payment(gateway_txn_id) WHERE gateway_txn_id IS NOT NULL;
CREATE UNIQUE INDEX idx_payment_one_pending_session_per_order
  ON payment(order_id)
  WHERE gateway = 'razorpay'
    AND gateway_order_id IS NOT NULL
    AND gateway_txn_id IS NULL
    AND status = 'created';

-- ---------- PROCUREMENT TASK ----------
CREATE TYPE procurement_status AS ENUM ('pending', 'placed', 'confirmed', 'issue');

CREATE TABLE procurement_task (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id              UUID NOT NULL REFERENCES batch(id),
  restaurant_id         UUID NOT NULL REFERENCES restaurant(id),
  platform              TEXT,                 -- 'zomato' / 'swiggy' / 'direct'
  external_order_ref    TEXT,
  actual_cost           NUMERIC(10,2),
  status                procurement_status NOT NULL DEFAULT 'pending',
  placed_by             UUID REFERENCES app_user(id),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (batch_id, restaurant_id)
);

-- ---------- REFUND ----------
CREATE TYPE refund_status AS ENUM ('pending', 'initiated', 'processed', 'failed');

CREATE TABLE refund (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES "order"(id),
  order_item_id   UUID REFERENCES order_item(id),   -- null = full order refund
  amount          NUMERIC(10,2) NOT NULL CONSTRAINT chk_refund_amount_positive CHECK (amount > 0),
  reason          TEXT NOT NULL,
  status          refund_status NOT NULL DEFAULT 'pending',
  gateway_refund_id TEXT,
  initiated_by    UUID REFERENCES app_user(id),     -- ops user, or 'system'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX idx_refund_order ON refund(order_id);

-- ---------- DELIVERY ATTEMPT ----------
CREATE TYPE delivery_result AS ENUM ('delivered', 'not_delivered');

CREATE TABLE delivery_attempt (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES "order"(id),
  batch_id        UUID NOT NULL REFERENCES batch(id),
  agent_id        UUID REFERENCES app_user(id),
  result          delivery_result,
  proof_type      TEXT,          -- 'otp' / 'agent_confirmation' / 'photo'
  proof_value     TEXT,
  not_delivered_reason TEXT,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_order ON delivery_attempt(order_id);
CREATE INDEX idx_delivery_batch ON delivery_attempt(batch_id);

-- ---------- AUDIT LOG ----------
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES "order"(id),
  actor_id        UUID REFERENCES app_user(id),   -- null if system job
  action          TEXT NOT NULL,
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_order ON audit_log(order_id);

-- ---------- CUTOFF JOB RUN LOG ----------
-- Each row records one sweep execution. Concurrency is controlled by the
-- advisory lock in cutoffJob.service.ts plus idempotent batch/order updates.
CREATE TABLE cutoff_job_run (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id       UUID NOT NULL REFERENCES campus(id),
  service_date    DATE NOT NULL,
  ran_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
