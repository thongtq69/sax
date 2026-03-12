# Search Console Inspection

Use the URL Inspection API to check sitemap URLs in batches.

## 1. Choose an auth method

### Option A: Service account

1. Create a Google Cloud service account.
2. Enable the Search Console API.
3. Add the service account email in Search Console as a user for `https://www.jamessaxcorner.com/`.
4. Save the JSON key locally.

Run with:

```bash
GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json" npm run seo:inspect -- --limit 10
```

### Option B: OAuth refresh token

Provide these env vars:

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REFRESH_TOKEN="..."
```

Then run:

```bash
npm run seo:inspect -- --limit 10
```

## 2. Common commands

Inspect a small batch first:

```bash
npm run seo:inspect -- --limit 10
```

Inspect specific URLs:

```bash
npm run seo:inspect -- \
  --url https://www.jamessaxcorner.com/ \
  --url https://www.jamessaxcorner.com/shop
```

Save a JSON report:

```bash
npm run seo:inspect -- --limit 25 --output reports/gsc-inspection.json
```

## 3. Notes

- Use the exact Search Console property URL as `siteUrl`; URL-prefix properties must end with `/`.
- Start with a low limit to avoid wasting quota.
- The script reads URLs from `https://www.jamessaxcorner.com/sitemap.xml` by default.
