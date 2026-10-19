# 2911 Studio

Static company site for 2911 Studio. One page covers the work, the current projects, a look back, the team, and a contact form.

2911 Studio builds software, digital products, and media brands. The public tagline is Software, Technology, Innovation. The homepage keeps the current company facts, the current projects, and the team list.

The public site name is [2911studio.com](https://2911studio.com/). Titles, canonical URLs, and meta tags use that name. This repo does not attach the domain or change DNS. `wrangler.jsonc` has no custom domain and no route.

Current projects, linked exactly and set to open in a new tab:

- Eating on 30A: https://eatingon30a.com/
- Eating in Destin: https://eatingindestin.com/
- Walton Dune Lakes: https://waltondunelakes.com/
- Where is Your Beach: https://whereisyourbeach.com/
- Friends of Scenic 30A: https://friendsofscenic30a.org/
- South Walton Connect: https://southwaltonconnect.com/
- Walton Power Lines: https://waltonpowerlines.com/

Three more cards are early-stage work under NDA. They use the confidential project mark and do not link out.

## Team

The team lives in one file, `data/team.json`. Each person has `name`, `title`, `bio`, and `photo`. The home page reads that list and builds the cards. The names are not copied into the page HTML.

To add, remove, or replace someone, edit `data/team.json` and put the photo in `photos/`. List order is the order on the page.

## Preview locally

From the repository root:

```bash
npm install
npm test
npx wrangler dev
```

Wrangler prints a local URL. Open that URL.

## Deploy

The Cloudflare Worker name is `studio2911`. `wrangler.jsonc` serves these static files and runs `POST /api/contact`. Do not add a custom domain or route in that file. `2911studio.com` and `www.2911studio.com` are attached to `studio2911` in Cloudflare. `/dash` is a zone route to the separate `dashboard` Worker, not a page in this repo.

```bash
npx wrangler deploy
```

Cloudflare assigns the workers.dev hostname. That hostname is the preview. Leave the custom domain empty until the preview is approved.

`npm test` checks the page before you deploy: the project links, the team file, the contact route, and the copy rules.

## Contact

Contact buttons in the header and footer open the contact form. There is no contact section at the bottom of the page. The page does not show an email address. `POST /api/contact` sends the message through Resend. The Worker reads these secret names and no others:

- `RESEND_API_KEY`
- `CONTACT_EMAIL`

Set them with `npx wrangler secret put`. Do not commit the values. On the live `studio2911` Worker both secrets are set in Cloudflare. If either one is missing, the form says the message could not be sent.

The From address is Resend's shared onboarding sender. Do not add a new Resend sending domain. That sender can deliver only to the address on the Resend account, so `CONTACT_EMAIL` has to be that address until a domain is verified in Resend.

## Left for a decision

- The placeholder Worker named `2911` is still in the account. Its hostnames were detached. It was not deleted.
- The previous hero film is not on this site. It opens on the previous company name.
- The look-back section keeps its heading and paragraph. The collage of magazines, a truck, and mugs is not included.
- Team HQ is not in this repo. `2911studio.com/dash` and `2911studio.com/dash/*` are routes to the `dashboard` Worker. The same paths on `whatshappeningnetwork.com` stay in place. The Dashboard repo's `wrangler.jsonc` still lists only the whatshappeningnetwork.com routes, so the next deploy of that repo should add the 2911studio.com patterns or those routes will be removed.
