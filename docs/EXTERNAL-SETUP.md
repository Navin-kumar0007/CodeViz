# External setup — the parts CodeViz can't self-provision

Two Phase-3 items are built as far as they can go without **your** external accounts.
This is the checklist to finish them. Nothing here blocks the rest of the product.

---

## 1. Activate team billing (finishes P3-H5)

The team/seat engine is **done and live** — teams, seats, member management, and
plan inheritance all work. The only dormant half is *taking payment*. Today an
admin activates a team by hand (EDU grant); a webhook should do it automatically.

**What exists now**
- `Team` model with `status` (`inactive` → `active`) and a dormant `gatewaySubscriptionId`.
- Members inherit the team plan **only while `status` is active/trialing** (exploit-safe).
- Admin activation stands in for billing: `POST /api/teams/:id/activate { seats }`.

**To go live with Razorpay**
1. Razorpay Dashboard → create two subscription plans (Pro monthly, Team/seat).
2. Put the IDs + keys in `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   RAZORPAY_PLAN_PRO=plan_xxx
   RAZORPAY_PLAN_TEAM=plan_xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   ```
3. Razorpay → Webhooks → point at `https://<domain>/api/billing/webhook` (signature
   verify already exists). On `subscription.activated`, set the buyer's `Team.status =
   'active'` and `Team.seats` to the purchased quantity — i.e. call the same code path
   `activateTeam` uses. That's the one wire-up left.
4. Test with a Razorpay test purchase → confirm the team flips to `active` and a member
   gains the team plan (`GET /api/entitlements`).

---

## 2. SSO + LMS/LTI (P3-H2) — not started, needs your apps

Schools won't adopt without this, but it can't be built or tested without external
registrations. Provision these, hand me the credentials, and it's ~1 focused session.

### Google SSO (do first — widest reach)
1. Google Cloud Console → new project → **OAuth consent screen** (External).
2. **Credentials → OAuth client ID → Web application.**
3. Authorized redirect URI: `https://<domain>/api/auth/google/callback`.
4. Give me the **Client ID** + **Client secret** → I add `passport-google-oauth20`, a
   `/api/auth/google` login button, and link/create the CodeViz user on callback.

### Microsoft SSO (optional, same shape)
- Azure Portal → App registrations → redirect `https://<domain>/api/auth/microsoft/callback`
  → hand me the Application (client) ID + secret + tenant.

### Canvas / Moodle LTI 1.3 (the real B2B unlock)
LTI lets a class launch CodeViz from inside their LMS. You register CodeViz as a tool;
the LMS gives back a set of IDs/URLs. Collect these from **one** LMS to start:
- **Client ID** (issued by the LMS)
- **Deployment ID**
- **Platform issuer** (e.g. `https://canvas.instructure.com`)
- **OIDC auth URL**, **token URL**, **JWKS/keyset URL**
- Tool URLs I'll give you to paste into the LMS: login `…/api/lti/login`,
  launch `…/api/lti/launch`, JWKS `…/api/lti/jwks`.

With those, I add an LTI 1.3 launch (validate the platform JWT → SSO the student →
drop them into the assigned problem/classroom). Test from a free Canvas/Moodle sandbox.

---

## Suggested order
1. **Razorpay** — smallest lift, turns on revenue for the team engine that already works.
2. **Google SSO** — quick, high-reach login.
3. **LTI** — most setup, biggest institutional payoff; do once a pilot school is real.
