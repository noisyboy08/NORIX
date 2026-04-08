# Security notes for Norix

## Environment variables

- `VITE_*` variables are embedded in the frontend bundle. Treat them as **public**.
- Use the **Supabase anon key** only with Row Level Security (RLS) policies that match your threat model.
- Prefer **Edge Functions** or a small backend for Gemini or other API keys that must stay private.

## Chrome extension

- The manifest requests broad host permissions (`<all_urls>`) for scanning. Minimize collected data and document what is sent off-device.
- Review `declarativeNetRequest` rules before publishing.

## Dependency hygiene

- Run `npm audit` regularly and upgrade transitive dependencies when fixes are available.
- This repo pins an `overrides` entry for `d3-color` (via `react-simple-maps`) to address a known advisory without downgrading maps; re-check after major upgrades.
- CI runs `npm run build`, typecheck, lint, unit tests, and Playwright smoke tests.

## Reporting

- Report security issues privately to the repository maintainers instead of opening public issues when disclosure could increase risk.
