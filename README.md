# Budget — personal budget tracker (Google Drive-backed PWA)

A mobile-first budget tracker that stores all its data as a single
`budget_data.json` file in your own Google Drive. No backend server, no
third-party database — you own the file.

**Accounts tracked:** Maybank MAE, Maybank Savings, RHB Bank, TNG eWallet, UOB
Savings, plus UOB / HSBC / Maybank AMEX / Maybank Shopee credit cards, and
Tabung Haji / Emergency / Gold / Public Mutual investments.

**Categories:** Food, House, Parents, Phone, Fuel & Toll, Dating, Toiletries,
Shopping, Gym — editable budget caps at any time.

**Core mechanics:**
- Payday engine resets category spend to zero and applies a fixed-amount
  salary distribution on the 27th of each month (pure date-check on app open —
  no server/cron involved).
- Net card liquidity widget: `UOB Savings balance − sum of 4 credit card
  unpaid balances`.
- History tab lets you flip back through prior payday periods.
- Balances update via a fast manual quick-entry sheet (there is no live bank
  API integration — see "Why no auto-import" below).

---

## 1. Google Cloud Console setup (OAuth)

You need a Google Cloud project so the app can request permission to read/write
one file in your Drive.

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a new project (any name, e.g. "budget-pwa").
2. **APIs & Services → Library** — search for **Google Drive API** and enable it.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: anything (e.g. "Budget")
   - Support email / developer contact: your email
   - Scopes: add `https://www.googleapis.com/auth/drive.file`
   - **Test users**: add your own Google account email here
   - Leave publishing status as **Testing** — you do not need to submit this
     for verification since it's just you. (Google's verification review is
     built for public-facing apps; a personal tool with you as a test user
     works indefinitely without it.)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** — add all of these you'll use:
     - `http://localhost:5173` (local dev)
     - `https://your-project.vercel.app` (add this after your first deploy in
       Step 2 — you can come back and edit this later)
   - You do **not** need to set an Authorized redirect URI — this app uses
     Google Identity Services' token client, which doesn't redirect.
   - Copy the generated **Client ID** (looks like
     `xxxxx.apps.googleusercontent.com`).

---

## 2. Local setup & deploy

```bash
npm install
cp .env.example .env
# paste your Client ID into .env as VITE_GOOGLE_CLIENT_ID
npm run dev        # test locally at http://localhost:5173
```

### Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com/) → **Add New → Project** → import
   the repo. Vercel auto-detects Vite; no config changes needed.
3. In the Vercel project's **Settings → Environment Variables**, add
   `VITE_GOOGLE_CLIENT_ID` with your Client ID value.
4. Deploy. Copy the resulting URL (e.g. `https://budget-pwa-xyz.vercel.app`).
5. Go back to Google Cloud Console → your OAuth client → add that exact URL
   to **Authorized JavaScript origins** (no trailing slash, must be https).

*(Netlify works identically: same build command `npm run build`, publish
directory `dist`, same environment variable, same origin step in Google Cloud
Console.)*

---

## 3. Add to iPhone Home Screen

1. Open the deployed URL in **Safari** (must be Safari — Chrome/iOS can't
   install PWAs to the Home Screen).
2. Tap the **Share** icon (square with an arrow) in the bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm the name, tap **Add**.
5. Launch it from the Home Screen icon — it opens full-screen, no Safari
   chrome, like a native app.

The first time you sign in, Google may show an "unverified app" warning
screen — that's expected for a Testing-status app. Tap **Advanced → Go to
budget-pwa (unsafe)** to proceed; this just means Google hasn't reviewed it,
not that anything is actually wrong, since you're the only user.

---

## 4. Known iOS limitations (please read before relying on this daily)

- **No true background sync.** iOS Safari doesn't support background service
  workers or background sync the way Android does. Sync happens instantly
  while the app is open, not while it sits in your pocket. This is a hard iOS
  platform limit, not a bug in this app.
- **Silent token renewal can occasionally fail.** iOS's tracking prevention
  sometimes blocks the invisible token-refresh request. When that happens the
  app will show a normal "Sign in with Google" tap — that's the fallback
  working as intended, not a broken session.
- **Why no auto-import from bank apps:** Malaysia doesn't have an open-banking
  API framework that gives individual developers OAuth-style read access to
  personal bank accounts. The only way around that is screen-scraping your
  banking app, which means storing your real banking login in a script,
  breaks whenever the bank updates its UI or 2FA, and violates every bank's
  terms of service — so this app doesn't do it. Balances update through the
  quick-entry sheet instead.

---

## 5. Project structure

```
src/
  lib/
    googleAuth.js       Google Identity Services token client wrapper
    driveApi.js          Drive v3 REST: find/create/read/update budget_data.json
    defaultData.js       Initial schema seeded with your accounts/categories
    paydayEngine.js       Period rollover, salary distribution, CC liquidity calc
    useBudgetStore.js     React hook tying auth + Drive + payday engine together,
                          with debounced autosave
  components/
    LoginScreen.jsx
    BottomNav.jsx
    LiquidityHero.jsx
    CategoryRow.jsx / QuickEntrySheet.jsx
    HomeView.jsx / BudgetsView.jsx / AccountsView.jsx / HistoryView.jsx
public/
  manifest.json          PWA manifest (icons are placeholders — swap in
                          public/icons/ with your own 192px/512px PNGs anytime)
  sw.js                   Basic offline app-shell caching (static assets only;
                          Google API calls always bypass the cache)
```

All data lives in one JSON document with this shape:

```json
{
  "accounts": { "banks": [...], "creditCards": [...], "investments": [...] },
  "categories": [{ "id", "name", "budget", "spent" }],
  "payday": { "dayOfMonth": 27, "distribution": [{ "targetType", "targetId", "amount" }] },
  "currentPeriod": { "start", "end" },
  "history": [{ "period", "categories", "ccLiquidity", "totalSpent" }]
}
```
