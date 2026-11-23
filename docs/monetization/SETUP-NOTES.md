# Concrete Dragon — Ko-fi + itch.io setup notes (prep, 2026-11-18)

Read-only prep. No accounts created, nothing spent. Sources: repo
mhvnsnt/ConcreteDragon at head 5280d74c, itch.io docs (read 2026-11-18),
ko-fi.com/pricing (read 2026-11-18), irs.gov, ssa.gov, dds.georgia.gov,
georgia.gov.

## Game facts (from the repo)

- Title: **Concrete Dragon**. Tagline: "Tap. Beat them down. Next enemy
  walks in. Every KO different."
- Live URL: https://mhvnsnt.github.io/ConcreteDragon/ (verified 200 today)
- Genre: Action. Tags: beat-em-up, brawler, fighting, godot, 2d, cartoon,
  singleplayer, street. Classification: Games. Kind: HTML (browser).
  Release status: In development.
- Pricing decided: **Pay what you want, $0 minimum** (free to play, tips
  welcome). itch.io revenue share: default 10%. Revisit fixed price
  ($1.99–$4.99) only at real traction.
- Payments decided: **"Direct to you"** (connect his PayPal or Stripe;
  money lands instantly, no itch.io tax interview, no hold, no minimum).
- Studio: Orion Enterprises LLC. Engine: Godot 4.
- Tip link already in the game: [PayPal tip link — kept off the repo; see the itch page]
- Ko-fi goal decided: **"$25 — Google Play developer fee"**. Suggested
  Ko-fi page name: `concretedragon` or his studio name.
- Milestone ladder: $25 earnings → pay the Play developer fee from
  earnings → Play Console unlocks.

## Files ready in this folder

- `itch-draft.md` — full paste-ready itch.io page draft (title, tagline,
  description, tags, pricing, payment mode).
- `screenshots/01-fighter-select.png` — 1280×800, "PICK YOUR FIGHTER".
  ⚠️ Title logo overflows ("CONCRETE DRAG…" cut off at 1280px).
- `screenshots/02-wave-intro.png` — 1280×800, "STREET BRAWL" wave intro.
  ⚠️ In-game splash said STREET BRAWL at capture; PUBLISHING.md notes the
  rename to CONCRETE DRAGON already landed, so re-capture ideally.
- `screenshots/03-mid-fight.png` — 1280×800, mid-fight action. Best shot.
- `monetization-plan.md`, `PUBLISHING.md`, `README.md` — repo copies for
  reference.

## Still missing before publish (from the draft)

- Cover art 630×500 (itch.io recommended size) — NOT made yet.
- Animated GIF of the tap-to-punch loop — NOT captured yet.
- KO-moment screenshot — NOT captured yet.
- Confirm ROOK and VEX are canon-approved fighter names (owner call).
- Re-capture screenshots after the title-logo fix.

## CI build artifacts (latest green "Build Concrete Dragon" run)

Run 42400079651, main, 2026-11-07, head 5280d74c. Artifacts valid until
2027-02-05, NOT expired:
- `godot-2d-web-parked` (57.6 MB) — the 2D web build. NOTE: the repo docs
  call this `street-brawl-web` — that name is STALE. The real artifact is
  `godot-2d-web-parked`.
- `concrete-dragon-3d` (39.2 MB) — a 3D build also exists now.
- `street-brawl-android` (195.0 MB) — Android artifact (contains the APK).

OPEN QUESTION for Mars/parent: which web build goes on itch — the 2D
"parked" build (matches the screenshots) or the 3D build (matches the
live site)? The browser task should not guess; ask.

## Ko-fi — step-by-step for the browser task

1. Go to https://ko-fi.com/account/register — sign up free. The page
   shows "or sign up with" (social sign-up options incl. Google per
   guides). Use Google sign-in (fmmg.mars@gmail.com) if offered, else
   email signup. Must be 18+.
2. Claim page name: `concretedragon` (or studio name if taken).
3. **CRITICAL — switch off Standard mode.** New accounts default to
   "Standard": 5% service fee on ALL payments including tips. Go to
   Settings → Payment and switch to the free tier: **0% on tips** (5%
   only on memberships/shop/commissions). Gold is $12/mo for 0% on
   everything — do NOT buy Gold.
4. Connect PayPal (and/or Stripe) in Payment Settings. Money goes
   DIRECTLY to his PayPal/Stripe instantly — Ko-fi never holds it, no
   minimum, no payout schedule. PayPal personal account works.
5. Set profile text + funding goal: "$25 — Google Play developer fee".
6. Publish the page. Hand the link back so it can be wired into the
   itch page, README, and game builds.

Ko-fi tax position: Ko-fi is NOT the merchant of record and does NOT
collect tax info or issue tax forms. No SSN/EIN/tax form at Ko-fi.
Tax forms come from PayPal/Stripe. STOP point: if Stripe asks for
identity verification (SSN/EIN + government ID + bank) to activate,
STOP and report — never fill those in. PayPal connection should need
no new tax step if his PayPal is already verified.

## itch.io — step-by-step for the browser task

1. Go to https://itch.io/register — username + email + password
   (confirmed path; Google sign-in could not be verified — use it if
   the form offers it, else email signup). Username becomes the page
   URL: `https://<username>.itch.io/concrete-dragon`. Verify the email
   address (itch.io emails a confirmation link).
2. Dashboard → Create new project.
3. Paste from `itch-draft.md`: title, tagline, description, tags.
   Classification: Games. Kind: HTML. Release status: In development.
   Genre: Action.
4. Pricing: **Pay what you want, minimum $0**.
5. Payments: choose **"Direct to you"** — NOT "Collected by itch.io".
   Connect PayPal (preferred — his PayPal exists) and/or Stripe.
6. Uploads: the web build ZIP (see open question above — which build),
   check "This file will be played in the browser"; upload
   `street-brawl.apk` from the `street-brawl-android` artifact as an
   Android download.
7. Upload the 3 screenshots. Cover art: skip for now (not made yet) or
   use screenshot 03 as a stand-in — do NOT generate fake cover art.
8. AI disclosure field: the form asks about AI-generated content. The
   repo does not state any AI-generated content is used — answer per
   Mars's direction; do not guess.
9. Save as Draft first; publish only when Mars says go.

itch.io tax position: in **"Direct to you"** mode there is NO itch.io
tax interview — tax identity goes to PayPal/Stripe, not itch.io.
The tax interview (TIN: SSN, EIN, ITIN, or local tax number) exists
ONLY in "Collected by itch.io (Payouts)" mode, which also has a $5
payout minimum, 7-day hold per transaction, 7–14 day staff review,
PayPal-or-Payoneer payouts, a one-time $3 tax-identity fee, and 30%
default withholding without a valid TIN. That is the mode to AVOID.
STOP point: if the flow ever shows a tax interview / TIN / SSN / EIN
screen, STOP and report — it means the wrong payment mode was picked
(or PayPal/Stripe is asking for its own verification).

## Tax / EIN / ID — verified facts (follow-up research)

### (1) itch.io: does an SSN work, or is an EIN required?
SSN works. itch.io's own docs: "During the tax interview, you must
provide a Tax Identification Number (eg. Social Security Number, EIN,
ITIN, local Tax Number, etc.)." SSN is listed first. An EIN is NOT
required for an individual US creator. And in "Direct to you" mode no
itch.io tax form exists at all. If he ever sells as Orion Enterprises
LLC (a business entity), the LLC would use its own EIN — but as an
individual/sole proprietor, his SSN is enough everywhere.

### (2) Getting an EIN from the IRS
- FREE, online at irs.gov ("Apply for an EIN"), issued IMMEDIATELY in
  the same session. Never pay — scam sites charge for the free form.
- What it needs: business entity type + the responsible party's
  **SSN or ITIN** (a person, not a company) + business name/address.
  No documents are uploaded. **No birth certificate anywhere in this
  chain** — you only need to KNOW the SSN, not prove it.
- Hours (ET): Mon–Fri 6:00 a.m.–1:00 a.m., Sat 6:00 a.m.–9:00 p.m.,
  Sun 6:00 p.m.–12:00 a.m. One session only (15-min inactivity
  timeout, can't save). Limit: 1 EIN per responsible party per day.
- Sole proprietor with no employees generally does NOT need an EIN
  and can use their SSN. Form the LLC/corp with the state BEFORE
  applying for its EIN.
- So: if Mars knows his SSN, the EIN is a free 10-minute form. The
  "runaround" is only real if he does NOT know his SSN or can't prove
  his identity somewhere — which points at the ID chain below.

### (3) The ID chain (if the real blocker is documents)
- SSA replacement Social Security card: FREE. Online via a my Social
  Security account (needs a valid state ID/driver's license, US
  citizen 18+, no name change) — no documents to mail. In person or
  by mail (Form SS-5): needs proof of IDENTITY (current driver's
  license, state ID, or US passport — photo ID) AND proof of
  citizenship/age (birth certificate or passport). **A birth
  certificate does NOT prove identity to SSA** — it proves citizenship
  and age only. Limit: 3 replacement cards/year, 10 in a lifetime.
- Georgia DDS state ID card: $32 for 8 years, in person at a Customer
  Service Center. Needs: (a) 1 proof of identity — certified US birth
  certificate with raised seal OR US passport; (b) full SSN on the
  application form (verified electronically — physical proof like the
  SS card, W-2, or paystub only if verification fails); (c) 2 proofs
  of Georgia residency from separate sources, dated within 6 months
  (utility/phone bill, bank statement, lease, etc.). P.O. boxes don't
  count.
- Georgia birth certificate (if born in Georgia): $25 first certified
  copy, $5 each extra. Order online via ROVER / GO Certificates /
  VitalChek (+$8 processing, +$16 expedited shipping) or in person at
  a county vital records office (same-day in some counties) or by mail
  to the State Office of Vital Records, Atlanta. Processing: the state
  site says 2–4 weeks online (up to 5 business days expedited);
  third-party trackers report up to 10 weeks for online/mail. If he
  was born in another state, order from THAT state's vital records.
- The chain, in order: **birth certificate → Georgia state ID → SSN
  card (or SSA printout) → EIN / Stripe verification / anything else.**
  Mars is right that the birth certificate matters — but it's the
  starting document for the STATE ID, not for the EIN itself.
