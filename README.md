# एक धागा · Ek Dhaaga — Full-Stack Prototype

Homemade achar, murabba, ghee, and chutney — sold with the same care they were made with.

## What's inside

```
ek-dhaaga/
  backend/
    server.js        → Express API (categories, products, lead capture)
    package.json
    data/
      products.json   → all categories & products live here — EDIT THIS to add items
      leads.json      → auto-created when someone submits the contact form
  frontend/
    index.html
    style.css
    app.js            → fetches data from the backend, renders everything
```

## How to run it on your own computer

You need [Node.js](https://nodejs.org) installed (the free LTS version is fine).

1. Open a terminal inside the `backend` folder.
2. Run:
   ```
   npm install
   npm start
   ```
3. Open your browser to **http://localhost:3000**

That's it — frontend and backend are served from the same place.

## How to add a new product category or item later

Open `backend/data/products.json` and either:
- add a new object inside an existing category's `"products"` array, or
- add a whole new category object (copy the shape of an existing one — `id`, `name`, `nameEn`, `seal` color, `products`)

Save the file, restart the server (`npm start`), and it appears on the site automatically — no HTML editing needed. The "जल्द आ रहा है / Coming Soon" category is already there as a placeholder tab for whatever you add next.

## Where the lead form data goes

Every time someone submits the "notify me" form, it's appended to `backend/data/leads.json` with their name, phone, message, and timestamp. Open that file any time to see submissions. (For a real launch, you'd eventually want a proper database instead of a file — see below.)

## Deploying it for free (so it has a real URL)

Based on current (2026) research:

- **Render** (render.com) — genuine free tier, no credit card required. You can deploy this exact backend as a "Web Service" (auto-detects Node.js) and it'll serve the frontend too since Express serves it as static files. Free web services "spin down" after inactivity, so the first visit after a quiet period takes ~30–60 seconds to wake up — fine for a prototype, not ideal for a live store getting steady traffic.
- **Railway** — no longer has a real free tier as of 2026 (requires a card, $5 trial credit, then $5+/month). Skip it for now.
- If you outgrow Render's free tier later, its paid tier removes the spin-down delay, or you can move to a small VPS.

### Steps to deploy on Render (free)
1. Push this `ek-dhaaga` folder to a GitHub repository.
2. Go to render.com → sign up (no card needed) → **New Web Service**.
3. Connect your GitHub repo, set:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
4. Deploy. Render gives you a live `.onrender.com` URL.
5. Later, connect your own domain (e.g. from Namecheap) in Render's settings.

## What's still a placeholder (be honest with yourself before launch)

- Product photos are simple SVG jar shapes — replace with real photography.
- Farmer names/villages are examples — replace with your real makers.
- There's no real payment gateway yet (Razorpay/Cashfree would be the next step for India) — right now "add to cart" just tracks items locally; checkout isn't wired to actual payment.
- No database yet — `products.json` and `leads.json` are simple files, which is fine at small scale but should become a real database (e.g. Render's free-tier PostgreSQL, or Supabase) once you have real order volume.
