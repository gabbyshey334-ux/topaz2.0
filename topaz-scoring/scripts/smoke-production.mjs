#!/usr/bin/env node
/**
 * Lightweight production smoke check (no browser, no Supabase auth).
 * Default URL: https://topaz2-0.vercel.app/
 *
 * Usage:
 *   npm run smoke:prod
 *   TOPAZ_PROD_URL=https://staging.example.com npm run smoke:prod
 */

const url = (process.env.TOPAZ_PROD_URL || 'https://topaz2-0.vercel.app/').replace(/\/?$/, '/');

async function main() {
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: { Accept: 'text/html' },
  });

  if (!res.ok) {
    console.error(`smoke:prod FAIL — HTTP ${res.status} for ${url}`);
    process.exit(1);
  }

  const html = await res.text();
  const checks = [
    ['TOPAZ', /TOPAZ/i.test(html)],
    ['root mount', /id=["']root["']/i.test(html) || /<div[^>]+id=["']root["']/i.test(html)],
  ];

  const failed = checks.filter(([, ok]) => !ok);
  if (failed.length) {
    console.error('smoke:prod FAIL — body missing:', failed.map(([name]) => name).join(', '));
    process.exit(1);
  }

  console.log(`smoke:prod OK — ${res.status} ${url}`);
}

main().catch((e) => {
  console.error('smoke:prod FAIL —', e.message);
  process.exit(1);
});
