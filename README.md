# SummrHome

Hyperlocal student PG housing marketplace, guardian safety portal, and campus classifieds bazaar.

## Option 1: Plain HTML, CSS & JS in VS Code (Zero Build Tools)

Open the `vscode-html-css-js/` folder directly in VS Code:
- `vscode-html-css-js/index.html` — Main HTML file (right-click and choose **Open with Live Server**)
- `vscode-html-css-js/style.css` — Clean CSS stylesheet
- `vscode-html-css-js/data.js` — PG listings & 18 college items across Sreerampore, Rishra, Uttarpara, Chinsurah, Chandannagar, Kolkata, and Howrah
- `vscode-html-css-js/app.js` — Vanilla JavaScript application logic

## Option 2: Full React / Next.js App (Readable `.jsx` & `.js` files)

1. Open this folder in VS Code.
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000`

### Main Folders
- `app/` — `layout.jsx`, `page.jsx`, `globals.css`
- `components/` — Readable `.jsx` UI components (`LocationGate.jsx`, `LoginScreen.jsx`, `PGMarketplace.jsx`, `StudentBazaar.jsx`, `OwnerDashboard.jsx`, `GuardianDashboard.jsx`)
- `context/` — `AppStateContext.jsx`
- `data/` — `locations.js`, `mockData.js` (18 college items + PG listings)
