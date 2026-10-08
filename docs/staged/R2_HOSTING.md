# Cloudflare R2 + Pages — $0-egress APK hosting (staged config doc)

**Goal:** host the CI-built `street-brawl.apk` (and future heavy assets) with **zero
egress fees**, so sideload distribution and itch.io downloads cost the owner $0/month.
**Status: staged.** Needs a free Cloudflare account — the owner creates it; workers
never create accounts in his name.

## Why R2 (not S3, not a VPS)
- Cloudflare R2: S3-compatible object storage, **$0 egress** (this is the killer
  feature — S3 charges ~$0.09/GB out).
- Free tier (2026-10 pricing, re-verify at signup): 10 GB storage, 10M Class A
  ops, 10M Class B ops / month. An APK (~30–80 MB) × thousands of downloads =
  still $0.
- Cloudflare Pages (free): already superseded by GitHub Pages for the web build,
  but useful as a second $0 host for landing pages / press kit.

## Setup (owner, ~25 min, one time)
1. Sign up at https://dash.cloudflare.com (free plan).
2. R2 → **Create bucket** → name `concrete-dragon` → region auto.
3. R2 → **Manage R2 API tokens** → create token with Object Read+Write on that bucket.
4. Settings → **Public access** → connect a custom domain or enable `r2.dev`
   public URL (e.g. `https://concrete-dragon.<acct>.r2.dev/street-brawl.apk`).
   For the real domain later: `dl.concretedragon.game` via a CNAME to the bucket.
5. **Custom domain for R2** (optional, recommended): R2 → bucket → Settings →
   Custom Domains → add `dl.<yourdomain>` → Cloudflare proxies it, still $0 egress.

## CI upload (when activated)
Add to the existing **Build Concrete Dragon** workflow a final step using
`ryand56/r2-upload-action` (or `aws s3 cp` against the R2 S3 endpoint):

```yaml
- name: Upload APK to R2
  env:
    R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
    R2_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
    R2_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
  run: |
    aws s3 cp street-brawl.apk \
      s3://concrete-dragon/builds/${{ github.run_number }}/street-brawl.apk \
      --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
    aws s3 cp street-brawl.apk \
      s3://concrete-dragon/builds/latest/street-brawl.apk \
      --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
```

Secrets live in GitHub repo settings (never in the repo). Then the itch page,
QR codes, and testers all point at the stable `latest` URL — new builds replace
the file, links never rot.

## Cost math (why this is the money move)
- 10,000 APK downloads × 50 MB = 500 GB egress.
- S3 egress: ~$45. Cloudflare R2 egress: **$0**.
- Distribution stops being a cost center before the first dollar arrives.
