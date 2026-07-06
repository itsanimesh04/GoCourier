You are building Week 1 of a campus food delivery backend. Three reference
files are attached: 01-database-schema.sql, 02-api-contract.md, 03-phase1-build-brief.md.

SCOPE FOR THIS SESSION — Week 1 ONLY. Do not build payment, cutoff jobs,
ops dashboard, or delivery flow yet, even if it seems convenient to scaffold now.

Build exactly this:
1. Run/apply 01-database-schema.sql against Postgres (use [your stack — Node/Express/Prisma
   or your framework of choice], match the schema exactly, do not rename fields or add
   convenience columns without asking).
2. Auth endpoints: POST /auth/otp/request, POST /auth/otp/verify — per section 1 of the
   API contract. Use [your SMS provider] for OTP delivery in production, but stub it with
   console-logged OTP codes in dev mode so I can test without burning SMS credits.
3. JWT issuance on verified login, containing user id, role, campus_id.
4. Role-check middleware that reads the JWT and blocks access to any route the role
   doesn't own. I will explicitly test that a 'student' token gets a 403 on any
   /admin/* or /ops/* route — build this so that test passes, not just so the UI hides buttons.
5. Admin CRUD: campus, restaurant, menu_item — per section 3 of the API contract.

Non-negotiable rules from the brief's "cross-cutting rules" section:
- Money fields are NUMERIC/Decimal, never float.
- Every state-changing write should be structured so an audit_log row is easy to
  add later — don't hardcode away from that.
- Do not invent new endpoints or fields not in 02-api-contract.md. If something's
  ambiguous, ask me rather than guessing.

Deliverable: working code + a short list of any assumptions you made, so I can
review them before Week 2.
