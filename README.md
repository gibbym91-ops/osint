# 🎯 Identifier Scout
**OSINT Search Automation Tool — Global Edition**

Upload an Excel/CSV sheet of subject identifiers and get one-click search links across **50+ global platforms** plus **country-specific packs** for 15 countries.

---

## 🚀 Deploy in 5 Minutes (No Node.js Required)

### Netlify (Recommended)
1. Push this repo to GitHub ([github.com/new](https://github.com/new))
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from GitHub → select repo → **Deploy**
3. Live in ~2 minutes at a `*.netlify.app` URL

### Vercel
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo → **Deploy**
3. Live in ~1 minute at a `*.vercel.app` URL

---

## 🌍 Global Platforms (50+)

### Search Engines
Google, Bing, DuckDuckGo, Yahoo, Brave Search, Startpage, Ask, Ecosia, Mojeek

### Social Media
X/Twitter, Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Bluesky, Mastodon, Pinterest, Snapchat, Twitch, Tumblr, Flickr, Threads, Telegram, Discord

### Blogs & Forums
WordPress, Medium, Substack, Blogger, Quora, Stack Exchange, Hacker News, LiveJournal, 4chan, XDA Forums, Typepad

### Records / People Search
PACER, Intelius, Spokeo, TruePeopleSearch, Whitepages, Pipl, FastPeopleSearch, BeenVerified

### Tech / Dev
GitHub, GitLab, Pastebin, HaveIBeenPwned, Shodan

---

## 🏴 Country Packs

Each country pack adds locally-dominant platforms. Select multiple countries simultaneously.

| Country | Key Platforms |
|---------|--------------|
| 🇷🇺 Russia | Yandex, VKontakte, Odnoklassniki, Mail.ru, Habr |
| 🇨🇳 China | Baidu, Weibo, Sogou, 360 Search, Zhihu, Bilibili, Douyin, Tieba |
| 🇩🇪 Germany | Google DE, Xing, Bing DE, Focus Online |
| 🇫🇷 France | Google FR, Qwant, Viadeo, LeBonCoin |
| 🇯🇵 Japan | Yahoo Japan, NicoNico, Ameba Blog, 5channel |
| 🇰🇷 South Korea | Naver, Daum, KakaoTalk, Band |
| 🇧🇷 Brazil | Google BR, UOL Busca |
| 🇮🇳 India | Google IN, ShareChat, Truecaller, JustDial |
| 🌍 Middle East | Yandex AR, Yahoo Maktoob, Dubizzle, Bayt.com |
| 🇺🇦 Ukraine | UKR.net, Meta.ua, VK (UA) |
| 🇮🇷 Iran | Aparat, Virgool, Google IR |
| 🇰🇵 North Korea | Google (DPRK terms), Naenara Archive |
| 🇬🇧 United Kingdom | Google UK, 192.com, Truecaller UK |
| 🇨🇦 Canada | Google CA, Canada411 |
| 🇦🇺 Australia | Google AU, Whitepages AU, Seek |

---

## 📊 How to Use

### Step 1 — Prepare your Excel file
| Subject | Full Name | Email | Phone | Username | Address |
|---------|-----------|-------|-------|----------|---------|
| JD-001 | John Doe | jdoe@email.com | 555-0101 | @johnd | 123 Main St |
| JD-001 | J. Doe | john.d@work.com | | | |
| JS-002 | Jane Smith | jsmith@email.com | 555-0202 | @janes | 456 Oak Ave |

### Step 2 — Upload & Map
- Drag & drop your `.xlsx` or `.csv` file
- Select which column is the **Subject** (group-by key)
- Select which columns hold **identifiers** to search

### Step 3 — Search
- Toggle individual identifiers on/off
- Switch **AND** (narrow) or **OR** (broad) boolean mode
- Override the query manually if needed
- Filter global platforms by category: Search, Social, Blogs, Records, Tech
- Add country packs via the "Add Countries" dropdown — multiple countries active at once
- Click individual links or **OPEN ALL** to launch all searches

---

## 📁 File Structure
```
identifier-scout/
├── public/index.html
├── src/
│   ├── index.js
│   └── App.jsx          ← All logic, platforms, country packs
├── .gitignore
├── netlify.toml
├── vercel.json
├── package.json
└── README.md
```

---

## ➕ Adding More Platforms

**Global platform** — add to the `GLOBAL_PLATFORMS` array in `src/App.jsx`:
```js
{
  id: "myplatform",
  name: "My Platform",
  icon: "🔍",
  color: "#FF6B6B",
  cat: "Search",   // Search | Social | Blogs | Records | Tech
  buildUrl: (q) => `https://myplatform.com/search?q=${encodeURIComponent(q)}`,
},
```

**Country platform** — find the relevant pack in `COUNTRY_PACKS` and add to its `platforms` array:
```js
{ id: "xx_newsite", name: "New Site", icon: "🌐", color: "#AABBCC", cat: "Search",
  buildUrl: q => `https://newsite.xx/search?q=${encodeURIComponent(q)}` },
```

**New country pack** — add a new object to `COUNTRY_PACKS`:
```js
{
  id: "newcountry", name: "Country Name", flag: "🏴", color: "#RRGGBB",
  platforms: [ /* platform objects */ ],
},
```

---

## 🔒 Privacy
All processing happens **entirely in your browser**. No data is sent to any server. Your Excel file never leaves your device.

---

## 🛠 Local Development (requires Node.js 16+)
```bash
npm install
npm start        # http://localhost:3000
npm run build    # production build
```
