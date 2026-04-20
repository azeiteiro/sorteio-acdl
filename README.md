# Raffle Draw

Simple web-based raffle system with animated ticket selection.

## Features

- Visual grid showing all sold tickets
- Slot machine-style animation (9 seconds)
- 3 prizes with manual draw control
- Winners displayed in both grid and winners section
- Responsive design (mobile-friendly)

## Local Testing

```bash
npx serve
# Open http://localhost:3000
```

## GitHub Pages Deployment

1. Push all files to your repo
2. Go to Settings → Pages
3. Set source to main branch
4. Access at `https://<username>.github.io/<repo>/`

## Customization

Edit `tickets.js` to update:
- **soldTickets** - Array of ticket numbers that were sold
- **prizeDescriptions** - Array of 3 prize descriptions

## Usage

1. Open the page
2. Click "Draw Next Prize" to start animation
3. Winner announced in modal popup
4. Repeat for 2nd and 3rd prizes
5. Reload page to reset
