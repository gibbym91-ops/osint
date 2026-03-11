# 🎯 Identifier Scout
**OSINT Search Automation Tool**

Upload an Excel/CSV sheet of subject identifiers, and this tool automatically groups them by subject, builds boolean search queries, and gives you one-click search links across 16+ platforms — Google, Bing, DuckDuckGo, X/Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube, TikTok, PACER, Intelius, Pipl, TruePeopleSearch, Spokeo, and GitHub.

---

## 🚀 Deploy in 5 Minutes (No Node.js Required)

### Option A — Netlify (Recommended)

1. **Fork or push this repo to GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Create a new repo (name it anything, e.g. `identifier-scout`)
   - Upload all these files, or push via Git

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
   - Connect your GitHub account
   - Select this repo
   - Netlify auto-detects the `netlify.toml` — click **Deploy site**
   - Your app is live in ~2 minutes at a `*.netlify.app` URL

---

### Option B — Vercel

1. **Push this repo to GitHub** (same as Step 1 above)

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Vercel auto-detects the React app — click **Deploy**
   - Live in ~1 minute at a `*.vercel.app` URL

---

## 📁 File Structure

```
identifier-scout/
├── public/
│   └── index.html          # HTML shell
├── src/
│   ├── index.js            # React entry point
│   └── App.jsx             # Main application (all logic + UI)
├── .gitignore
├── netlify.toml            # Netlify build config
├── vercel.json             # Vercel build config
├── package.json            # Dependencies
└── README.md
```

---

## 📊 How to Use

### Step 1 — Prepare your Excel file
Your sheet should have:
- A **Subject column** — a consistent identifier that groups rows to the same person/entity (e.g., a case ID, name, or code)
- One or more **Identifier columns** — any data you want to search (names, emails, phones, usernames, addresses, aliases)

**Example:**

| Subject | Full Name  | Email             | Phone    | Username | Address      |
|---------|------------|-------------------|----------|----------|--------------|
| JD-001  | John Doe   | jdoe@email.com    | 555-0101 | @johnd   | 123 Main St  |
| JD-001  | J. Doe     | john.d@work.com   |          |          |              |
| JS-002  | Jane Smith | jsmith@email.com  | 555-0202 | @janes   | 456 Oak Ave  |

Rows `JD-001` will be merged into one profile. Duplicate values are automatically removed.

### Step 2 — Upload & Map
- Drag & drop your `.xlsx` or `.csv` file
- Select which column is your **Subject** (group-by key)
- Select which columns hold **identifiers** to search

### Step 3 — Search
- Check/uncheck individual identifiers to include in the query
- Toggle **AND** (narrow) or **OR** (broad) boolean mode
- Override the query manually if needed
- Filter platforms by category: Search, Social, Records, Tech
- Click individual links or **OPEN ALL** to launch searches

---

## 🛠 Local Development (Optional, requires Node.js 16+)

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

To build for production:
```bash
npm run build
```

---

## 🔒 Privacy
All processing happens **entirely in your browser**. No data is sent to any server. Your Excel file never leaves your device.

---

## ➕ Adding More Platforms
Edit the `PLATFORMS` array in `src/App.jsx`:

```js
{
  id: "myplatform",
  name: "My Platform",
  icon: "🔍",
  color: "#FF6B6B",
  category: "Search",          // Search | Social | Records | Tech
  buildUrl: (q) => `https://myplatform.com/search?q=${encodeURIComponent(q)}`,
},
```
