# Raffle Draw

Simple web-based raffle system with animated ticket selection. This repo hosts
multiple independent raffles, one per folder.

## Raffles

- `sorteio-primavera-2026/` — standalone raffle, 3 sequential prizes drawn
  from a single shared ticket pool (drawing a prize removes that ticket from
  the pool for the next draw).
- `festa-lentisqueira-2026/` — single page running 3 independent contests
  (`fio-de-prata`, `clifebres`, `pascoas`), each with its own ticket pool and
  exactly one winner. The 3 contests can be drawn in any order.

Each folder is a fully standalone static site (own `index.html`, `raffle.js`,
`style.css`, `tickets.js`, `logo.png`) — nothing is shared between them, so
editing one never affects the others.

## Features

- Visual grid showing all sold tickets
- Slot machine-style animation (9 seconds)
- 3 prizes with manual draw control
- Winners displayed in both grid and winners section
- Responsive design (mobile-friendly)

## Local Testing

```bash
npx serve
# Open http://localhost:3000/<raffle-folder>/
```

## GitHub Pages Deployment

1. Push all files to the repo's `main` branch
2. Go to Settings → Pages
3. Set source to `main` branch / root
4. Each raffle is accessible at:
   `https://<username>.github.io/<repo>/<raffle-folder>/`

## Adding a New Raffle

There are two raffle shapes in this repo — pick whichever matches your event
and copy that folder as a starting point:

**Single-pool, multi-prize** (like `sorteio-primavera-2026/`): one ticket
pool, several prizes drawn sequentially, each draw removes that ticket from
the pool.
1. Copy `sorteio-primavera-2026/` to a new folder named after the event
2. Reset `tickets.js` in the new folder — empty `soldTickets` and update
   `prizeDescriptions`
3. Update the title/heading/org name/logo in `index.html` if needed
4. Commit and push — the new raffle goes live at its own URL automatically

**Multi-contest, single page** (like `festa-lentisqueira-2026/`): several
independent contests on one page, each with its own ticket pool and exactly
one winner.
1. Copy `festa-lentisqueira-2026/` to a new folder named after the event
2. Edit `tickets.js` — update the `contests` array (`slug`, `name`,
   `soldTickets`) to match your event's contests; add/remove entries in the
   array to change how many contests render (no HTML/JS changes needed)
3. Update the title/heading/org name/logo in `index.html` if needed
4. Commit and push — the new raffle goes live at its own URL automatically

## Customization

**`sorteio-primavera-2026/tickets.js`**:
- **soldTickets** - Object mapping ticket number → buyer name
- **prizeDescriptions** - Array of 3 prize descriptions

**`festa-lentisqueira-2026/tickets.js`**:
- **contests** - Array of `{ slug, name, soldTickets }`, one entry per
  independent contest. Ticket numbers only need to be unique within a
  contest's own `soldTickets` (they can repeat across contests).

## Usage

**Single-pool, multi-prize** (`sorteio-primavera-2026/`):
1. Open the raffle's page
2. Click "Sortear próximo Prémio" to start animation
3. Winner announced in modal popup
4. Repeat for 2nd and 3rd prizes
5. Reload page to reset

**Multi-contest, single page** (`festa-lentisqueira-2026/`):
1. Open the raffle's page — all contests are listed on it
2. Click "Sortear {contest name}" on any contest's section to draw its
   winner (any order)
3. Winner announced in modal popup and in that contest's winners box
4. Each contest's button disables once its winner is drawn
5. Reload page to reset
