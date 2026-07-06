# Campus Food Delivery — API Contract (Phase 1)

Base URL: `/api/v1`
Auth: Bearer token (issued after OTP verify). Role is embedded in the token; backend
must enforce role checks on every route below, not just hide UI buttons.

---

## 1. AUTH (all roles)

### POST /auth/otp/request
Body: `{ "phone": "9876543210" }`
→ Sends OTP, creates row in `otp_request`. Rate-limit: max 3 requests / phone / 10 min.

### POST /auth/otp/verify
Body: `{ "phone": "9876543210", "otp_code": "1234" }`
→ `{ "token": "...", "user": { id, phone, name, role, campus_id } }`
If phone not in `app_user`, create as role=student with campus_id = null (set on first campus select).

---

## 2. CUSTOMER (student)

### GET /campuses
→ list of active campuses (for campus selector).

### POST /me/campus
Body: `{ "campus_id" }` → sets student's default campus.

### GET /restaurants?campus_id=&q=
→ ranked list per `ranking_score` formula. Supports search by name or item.
Response includes: name, offer badges, availability_confidence, is_promoted (never expose commission_rate itself).

### GET /restaurants/:id/menu
→ menu items, availability flags.

### POST /cart
Body: `{ "restaurant_id", "items": [{ "menu_item_id", "quantity" }] }`
→ Server computes subtotal + fee. Enforces one-restaurant-per-cart: reject if an
open cart with a different restaurant_id exists for this student — return 409 with
a clear "clear cart to switch restaurants" message.

### GET /cart
→ current cart with campus cutoff time, expected delivery time, totals.

### POST /orders
Body: `{ "drop_point" }` (cart → order, status = 'cart' still, awaiting payment)
→ `{ "order_id", "total_amount" }`

### POST /orders/:id/pay
→ initiates payment gateway session, returns gateway payment intent/session id.
**Server must re-check cutoff time at this exact moment** before creating the
payment session — not just at cart time.

### POST /webhooks/payment
(Not customer-facing, but documented here since it drives order state)
→ Verify signature. On success before cutoff: order_status='placed', payment_status='success'.
On success after cutoff: payment_status='late' → auto-create refund task.
**Must be idempotent** — check `payment.gateway_txn_id` uniqueness before applying.

### GET /orders/:id
→ full order detail incl. item statuses, refund status, delivery status — powers the tracking page.

### GET /orders (my orders, paginated)

---

## 3. ADMIN

### Restaurant & menu management
- `POST /admin/restaurants`
- `PATCH /admin/restaurants/:id` (incl. manual_priority, is_active)
- `POST /admin/restaurants/:id/menu-items`
- `PATCH /admin/menu-items/:id` (price, is_available)

### Campus management
- `POST /admin/campuses`
- `PATCH /admin/campuses/:id` (cutoff_time, delivery_time)

### Oversight
- `GET /admin/batches?campus_id=&date=` — batch list with status, order count, revenue
- `GET /admin/orders?status=&campus_id=&date=` — full order search/filter
- `GET /admin/refunds?status=` — refund oversight across all campuses
- `GET /admin/reports/daily-summary?date=` — orders, GMV, refund rate, delivery success rate

---

## 4. OPERATIONS

### GET /ops/batches/:id
→ Batch detail grouped by restaurant (matches the doc's Section 5 mockup exactly):
```json
{
  "batch_id": "...",
  "campus": "Poornima University",
  "total_orders": 87,
  "restaurants": [
    {
      "restaurant_id": "...",
      "name": "Burger Farm",
      "items": [{ "menu_item_name": "Classic Burger", "total_quantity": 12 }],
      "procurement_task": { "status": "pending", "external_order_ref": null, "actual_cost": null }
    }
  ]
}
```

### POST /ops/procurement-tasks/:id
Body: `{ "external_order_ref", "actual_cost", "platform", "status": "placed" }`

### POST /ops/order-items/:id/mark-unavailable
Body: `{ "reason" }`
→ Sets `order_item.item_status = 'unavailable'`, **automatically creates a `refund`
row** (server-side, not manual) per the doc's refund rule: student should never
have to request it. This is the one endpoint I'd unit-test hardest.

### POST /ops/order-items/:id/mark-confirmed

### GET /ops/refunds?status=pending
### POST /ops/refunds/:id/initiate
→ Calls gateway refund API, sets status='initiated'.

### POST /webhooks/refund
→ Gateway confirms refund processed/failed. Idempotent on `gateway_refund_id`.

---

## 5. DELIVERY PARTNER

### GET /delivery/my-batches
→ Batches assigned to this agent, today.

### GET /delivery/batches/:id
→ Orders in batch with drop points, student names, phone (masked), items.

### POST /delivery/batches/:id/start
→ Sets batch_status='out_for_delivery', triggers student notifications.

### POST /delivery/orders/:id/deliver
Body: `{ "proof_type": "otp" | "agent_confirmation" | "photo", "proof_value" }`
→ Creates `delivery_attempt` row, result='delivered', order_status='delivered'.

### POST /delivery/orders/:id/not-delivered
Body: `{ "reason" }`
→ result='not_delivered'. Does **not** auto-refund — routes to ops for
refund-or-no-refund decision per policy (this is one of the "Open Decisions"
from the original doc — needs an answer before this endpoint's downstream logic is final).

---

## Cross-cutting rules for Codex to follow everywhere

1. **Every write to `order`, `order_item`, `refund`, `procurement_task` gets an `audit_log` row.** No exceptions — this is what protects you in a support dispute.
2. **All money fields are NUMERIC, never float.**
3. **Every webhook handler checks for a duplicate before applying state change.**
4. **Role check middleware on every route** — a student token must not be able to hit any `/ops/*` or `/admin/*` route even by guessing the URL.
5. **Cutoff time check happens server-side at payment-initiation, not just at cart-add.**
