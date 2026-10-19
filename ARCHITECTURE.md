# 2911 Studio: architecture

## What it does

The company site for 2911 Studio: one page with the work, current projects, a look back, the team, and a contact form. Contact buttons open the form. The page does not show an email address.

## Domains and Worker

- Worker: `studio2911`
- Intended public host, not attached: `2911studio.com`
- workers.dev stays on so the preview can be opened before DNS changes.
- `wrangler.jsonc` has no routes and no custom domain.
- There is no `/dash` path and no service binding to another Worker.

## Data and images

- Pages, fonts, project logos, and team photos are static files in this repo. The team list is `data/team.json` (photos in `photos/`), rendered by `team.js`.
- Bindings: `ASSETS` (static assets, directory `.`). No D1, R2, KV, or service bindings.
- External service: Resend, used only by `POST /api/contact`.

## Request path

- `assets.run_worker_first` lists `/api/contact` and `/api/contact/` only.
- Those paths run `handleContact` in `worker.js`.
- Every other path is a static asset. Missing pages use `404.html`.

## Secrets and env vars (names only)

Secrets are not set in this repo:

- `RESEND_API_KEY`
- `CONTACT_EMAIL`

Do not print the values. Do not add a new Resend sending domain. The From line in `worker.js` stays on Resend's shared onboarding sender.

## Cron and scheduled jobs

None. The Worker has only a fetch handler.

## Observability

Workers Logs and traces are enabled in `wrangler.jsonc`. Contact logs are structured JSON and do not include the message, the sender address, or secret values.

## Known limits

- Contact mail uses an in-memory per-IP limit (5 per minute) inside one isolate.
- Until `RESEND_API_KEY` and `CONTACT_EMAIL` are set on the Worker, the form answers that the message could not be sent.
- The onboarding sender only delivers to the Resend account address.
