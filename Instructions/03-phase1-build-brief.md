# Phase 1 Build Brief — Campus Food Delivery MVP

Target: working operational MVP, live payments (manual-fallback refunds), by Aug 1.

## Before writing any code — answer these (blocks nothing below, but blocks final refund logic)
1. Can students cancel after payment but before cutoff?
2. Refund policy if student is absent at delivery?
3. Is email required, or phone-only?

Proceed with defaults if client hasn't answered: **no cancellation after payment,
no refund for absence, phone-only.** Flag these as assumptions in the client doc
so they're easy to flip later.

---

## Week 1 — Foundation
- Run `01-database-schema.sql` on Postgres instance
- Auth: OTP request/verify, JWT issuance, role middleware
- Admin: campus CRUD, restaurant CRUD, menu item CRUD (needed to seed test data for everything after)
- **Claude review point:** confirm role middleware actually blocks cross-role access before moving on — don't let Codex mark this "done" on UI-hiding alone.

## Week 2 — Customer flow
- Campus selector, browse/search, restaurant ranking (simple sort first — commission_boost/refund_risk_penalty formula tuned later)
- One-restaurant cart with the 409 conflict rule
- Order creation + cutoff-time server check
- **Claude review point:** test cart conflict logic and cutoff enforcement with actual clock manipulation, not just reading the code.

## Week 3 — Payment + Cutoff job + Batching
- Payment gateway integration (sandbox first, live keys once KYC clears)
- Webhook handler with idempotency check (test by firing the same webhook twice manually)
- Cutoff background job: create/reuse batch, lock orders, group by restaurant
- **Claude review point:** run the cutoff job twice on the same campus+date on purpose. If it creates a duplicate batch, this is not done — the `UNIQUE(campus_id, service_date)` constraint should throw, and the job should catch and no-op gracefully.

## Week 4 — Ops, Refunds, Delivery, Launch prep
- Ops procurement dashboard (batch-grouped view)
- Mark unavailable → auto-refund-task creation
- Refund queue (manual initiate, ops-reviewed — not fully automated end-to-end yet)
- Delivery partner interface: batch view, deliver/not-delivered
- Smoke test full flow: place order → cutoff → procure → mark one item unavailable → refund → deliver rest → close order
- **Claude review point:** full audit_log trail exists for a single order from cart to close, with no gaps.

---

## What ships Aug 1 vs. what's flagged as v1.1
**Ships:** everything above.
**Flagged to client explicitly as post-launch hardening:** fully automated refund webhook reconciliation, WhatsApp notifications (pending Meta approval anyway), ranking algorithm tuning, delivery OTP/photo proof (ship with agent-confirmation only first).

---

## How Claude + Codex actually split this week to week
- I write the spec/acceptance criteria for each week's block **before** Codex touches it (like the master brief pattern already in use for Narnolia/Codex).
- You run Codex against that spec in your real dev environment.
- Bring the output back here — I review diffs/logic against the acceptance criteria above, especially the three idempotency/security points flagged, before you mark a week done.
- Nothing marked "confirmed" on procurement or refund logic without an actual test run, not just a code read-through.
