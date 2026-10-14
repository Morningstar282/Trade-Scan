# TradeScan — demo portal

Static, single-page sales demo of the TradeScan vendor-recovery portal. No backend,
no build step, no dependencies. Three files do the whole thing:

```
index.html          shell: left rail, sticky page header, dialog, toast
assets/styles.css   design tokens + layout (light and dark)
assets/app.js       demo data, renderers, hash router
netlify.toml        publish settings and headers
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8080      # then visit http://localhost:8080
```

## Deploy to Netlify

Either connect this repo in the Netlify UI (no build command, publish directory `.`),
or from the folder:

```bash
npx netlify-cli deploy --dir . --prod
```

## What's in it

Eleven modules, same names and ordering as the production portal:

Dashboard · On Going Shortage · Bulk Period Shortage · Price Claim · Ops Chargeback ·
Missed Invoicing · Excess Coop Billing · P&L Analysis · Internal Links (Manage Disputes,
Onboard Tracker, Customer Dashboard) · Download Manager · Manage Access

Table names, column headers, tab labels, status wordings, button captions and dialog
copy are kept identical to production so a client sees the system they'd be buying.
The **layout** is deliberately not the production one:

| Production | TradeScan |
| --- | --- |
| Dark navy sidebar | Light rail, left accent bar marks the active item |
| Navy page banner | Sticky header with breadcrumb, title and vendor pill inline |
| Four separate stat cards | One segmented summary strip |
| Underlined tabs | Pill segmented controls |
| Permanent filter bar | Filters behind a toggle |
| Dark table headers, zebra rows | Light sticky headers, hover only |
| Single stacked column | Two columns with a sticky context panel |

Interactions that work without a backend: module and sub-module navigation, tab
switching, filter panels, row delete (session-only — reload restores the row),
toggles, the YOY Split dialog, the New Request dialog, Findings Upload Logs,
Access Signals, Jobs Not Submitted, Progress Tracker's download toast, Agreements
Scanned → Result Summary, Disputed Amount → Dispute Table, and a dark-mode switch.

## Data

**Every figure, dispute ID, invoice number, payment number, agreement ID, batch ID,
email address and client name in `assets/app.js` is invented.** The client names are
fictional (Vantio, PureStride, NordFlask, Brightmoor, CoreGuard, ZenithPet, Lumora,
TrailKit, Verasol, Kestrel). Nothing here is extracted from a production database.
Shapes, counts and column sets mirror what a real account looks like so the demo
reads as plausible.

Demo-only quirks kept on purpose, because they match production and a client may ask:
the Denied tab carries no `Payment Number` column; the New Request dialog is titled
"Shortage Reconciliation Request" for both options; the Excess Coop breadcrumb reads
"Excess Coop Biiling".

## Changing the demo data

All of it is at the top of `assets/app.js` under the `DEMO DATA` banner, as plain
arrays. Edit a number, reload the page. Column headers live in the `cols` arrays
and in the `th([...])` calls inside each page function.
