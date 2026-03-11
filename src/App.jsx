import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL PLATFORMS
// ══════════════════════════════════════════════════════════════════════════════
const GLOBAL_PLATFORMS = [
  // Search Engines
  { id: "google",      name: "Google",        icon: "🔍", color: "#4285F4", cat: "Search",  buildUrl: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  { id: "bing",        name: "Bing",           icon: "🔎", color: "#00809D", cat: "Search",  buildUrl: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  { id: "duckduckgo",  name: "DuckDuckGo",    icon: "🦆", color: "#DE5833", cat: "Search",  buildUrl: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  { id: "yahoo",       name: "Yahoo",          icon: "🟣", color: "#6001D2", cat: "Search",  buildUrl: q => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}` },
  { id: "brave",       name: "Brave Search",   icon: "🦁", color: "#FB542B", cat: "Search",  buildUrl: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  { id: "startpage",   name: "Startpage",      icon: "🛡", color: "#4BC0A3", cat: "Search",  buildUrl: q => `https://www.startpage.com/search?q=${encodeURIComponent(q)}` },
  { id: "ask",         name: "Ask",            icon: "❓", color: "#CC0000", cat: "Search",  buildUrl: q => `https://www.ask.com/web?q=${encodeURIComponent(q)}` },
  { id: "ecosia",      name: "Ecosia",         icon: "🌳", color: "#4CAF50", cat: "Search",  buildUrl: q => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}` },
  { id: "mojeek",      name: "Mojeek",         icon: "🔵", color: "#336699", cat: "Search",  buildUrl: q => `https://www.mojeek.com/search?q=${encodeURIComponent(q)}` },
  // Social Media
  { id: "twitter",     name: "X / Twitter",    icon: "𝕏",  color: "#CBD5E1", cat: "Social",  buildUrl: q => `https://twitter.com/search?q=${encodeURIComponent(q)}&src=typed_query` },
  { id: "facebook",    name: "Facebook",       icon: "👥", color: "#1877F2", cat: "Social",  buildUrl: q => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}` },
  { id: "instagram",   name: "Instagram",      icon: "📸", color: "#E1306C", cat: "Social",  buildUrl: q => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}` },
  { id: "linkedin",    name: "LinkedIn",       icon: "💼", color: "#0A66C2", cat: "Social",  buildUrl: q => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}` },
  { id: "tiktok",      name: "TikTok",         icon: "🎵", color: "#69C9D0", cat: "Social",  buildUrl: q => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}` },
  { id: "youtube",     name: "YouTube",        icon: "▶",  color: "#FF0000", cat: "Social",  buildUrl: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
  { id: "reddit",      name: "Reddit",         icon: "🤖", color: "#FF4500", cat: "Social",  buildUrl: q => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}` },
  { id: "bluesky",     name: "Bluesky",        icon: "🦋", color: "#0085FF", cat: "Social",  buildUrl: q => `https://bsky.app/search?q=${encodeURIComponent(q)}` },
  { id: "mastodon",    name: "Mastodon",       icon: "🐘", color: "#6364FF", cat: "Social",  buildUrl: q => `https://mastodon.social/search?q=${encodeURIComponent(q)}&type=accounts` },
  { id: "pinterest",   name: "Pinterest",      icon: "📌", color: "#E60023", cat: "Social",  buildUrl: q => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}` },
  { id: "snapchat",    name: "Snapchat",       icon: "👻", color: "#FFCC00", cat: "Social",  buildUrl: q => `https://www.snapchat.com/search?q=${encodeURIComponent(q)}` },
  { id: "twitch",      name: "Twitch",         icon: "🎮", color: "#9146FF", cat: "Social",  buildUrl: q => `https://www.twitch.tv/search?term=${encodeURIComponent(q)}` },
  { id: "tumblr",      name: "Tumblr",         icon: "📓", color: "#35465C", cat: "Social",  buildUrl: q => `https://www.tumblr.com/search/${encodeURIComponent(q)}` },
  { id: "flickr",      name: "Flickr",         icon: "📷", color: "#FF0084", cat: "Social",  buildUrl: q => `https://www.flickr.com/search/?text=${encodeURIComponent(q)}` },
  { id: "threads",     name: "Threads",        icon: "🧵", color: "#AAAAAA", cat: "Social",  buildUrl: q => `https://www.threads.net/search?q=${encodeURIComponent(q)}` },
  { id: "telegram",    name: "Telegram",       icon: "✈️",  color: "#2AABEE", cat: "Social",  buildUrl: q => `https://t.me/s/${encodeURIComponent(q)}` },
  { id: "discord",     name: "Discord Search", icon: "💬", color: "#5865F2", cat: "Social",  buildUrl: q => `https://www.google.com/search?q=site:discord.com+${encodeURIComponent(q)}` },
  // Blogs & Forums
  { id: "wordpress",   name: "WordPress",      icon: "📝", color: "#21759B", cat: "Blogs",   buildUrl: q => `https://en.search.wordpress.com/?q=${encodeURIComponent(q)}` },
  { id: "medium",      name: "Medium",         icon: "✍️",  color: "#00AB6C", cat: "Blogs",   buildUrl: q => `https://medium.com/search?q=${encodeURIComponent(q)}` },
  { id: "substack",    name: "Substack",       icon: "📨", color: "#FF6719", cat: "Blogs",   buildUrl: q => `https://substack.com/search?query=${encodeURIComponent(q)}` },
  { id: "blogger",     name: "Blogger",        icon: "📰", color: "#FF8000", cat: "Blogs",   buildUrl: q => `https://www.blogger.com/search?q=${encodeURIComponent(q)}` },
  { id: "quora",       name: "Quora",          icon: "💬", color: "#B92B27", cat: "Blogs",   buildUrl: q => `https://www.quora.com/search?q=${encodeURIComponent(q)}` },
  { id: "stackexchange",name: "Stack Exchange",icon: "📚", color: "#1E5297", cat: "Blogs",   buildUrl: q => `https://stackexchange.com/search?q=${encodeURIComponent(q)}` },
  { id: "hackernews",  name: "Hacker News",    icon: "🟠", color: "#FF6600", cat: "Blogs",   buildUrl: q => `https://hn.algolia.com/?q=${encodeURIComponent(q)}` },
  { id: "livejournal", name: "LiveJournal",    icon: "📖", color: "#00B0EA", cat: "Blogs",   buildUrl: q => `https://www.livejournal.com/gsearch/?q=${encodeURIComponent(q)}` },
  { id: "4chan",        name: "4chan Search",   icon: "🐸", color: "#6A9E1F", cat: "Blogs",   buildUrl: q => `https://boards.4chan.org/search#${encodeURIComponent(q)}` },
  { id: "xda",         name: "XDA Forums",     icon: "🛠", color: "#F59300", cat: "Blogs",   buildUrl: q => `https://forum.xda-developers.com/search/?query=${encodeURIComponent(q)}` },
  { id: "typepad",     name: "Typepad",        icon: "🖊", color: "#5C8AC6", cat: "Blogs",   buildUrl: q => `https://www.google.com/search?q=site:typepad.com+${encodeURIComponent(q)}` },
  // Records / People Search
  { id: "pacer",       name: "PACER",          icon: "⚖️", color: "#8B9EC7", cat: "Records", buildUrl: () => `https://pcl.uscourts.gov/pcl/pages/search/findCase.jsf` },
  { id: "intelius",    name: "Intelius",       icon: "🧾", color: "#9B59B6", cat: "Records", buildUrl: q => `https://www.intelius.com/search?searchTerm=${encodeURIComponent(q)}` },
  { id: "spokeo",      name: "Spokeo",         icon: "📋", color: "#E67E22", cat: "Records", buildUrl: q => `https://www.spokeo.com/search?q=${encodeURIComponent(q)}` },
  { id: "truepeoplesearch", name: "TruePeopleSearch", icon: "🔬", color: "#00ACC1", cat: "Records", buildUrl: q => `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(q)}` },
  { id: "whitepages",  name: "Whitepages",     icon: "📞", color: "#1FA0FF", cat: "Records", buildUrl: q => `https://www.whitepages.com/search/FindPerson?who=${encodeURIComponent(q)}` },
  { id: "pipl",        name: "Pipl",           icon: "🌐", color: "#2E7D32", cat: "Records", buildUrl: q => `https://pipl.com/search/?q=${encodeURIComponent(q)}` },
  { id: "fastpeoplesearch", name: "FastPeopleSearch", icon: "⚡", color: "#F4A22D", cat: "Records", buildUrl: q => `https://www.fastpeoplesearch.com/name/${encodeURIComponent(q)}` },
  { id: "beenverified", name: "BeenVerified",  icon: "✅", color: "#0E9F6E", cat: "Records", buildUrl: q => `https://www.beenverified.com/people/${encodeURIComponent(q)}` },
  // Tech / Dev
  { id: "github",      name: "GitHub",         icon: "🐙", color: "#6E7681", cat: "Tech",    buildUrl: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=users` },
  { id: "gitlab",      name: "GitLab",         icon: "🦊", color: "#FC6D26", cat: "Tech",    buildUrl: q => `https://gitlab.com/search?search=${encodeURIComponent(q)}` },
  { id: "pastebin",    name: "Pastebin",       icon: "📄", color: "#02A8F3", cat: "Tech",    buildUrl: q => `https://pastebin.com/search?q=${encodeURIComponent(q)}` },
  { id: "haveibeenpwned", name: "HaveIBeenPwned", icon: "🔓", color: "#EF4444", cat: "Tech", buildUrl: q => `https://haveibeenpwned.com/account/${encodeURIComponent(q.replace(/ /g, ""))}` },
  { id: "shodan",      name: "Shodan",         icon: "🛰", color: "#F04E23", cat: "Tech",    buildUrl: q => `https://www.shodan.io/search?query=${encodeURIComponent(q)}` },
];

const GLOBAL_CATS = ["Search", "Social", "Blogs", "Records", "Tech"];

// ══════════════════════════════════════════════════════════════════════════════
// COUNTRY PACKS
// ══════════════════════════════════════════════════════════════════════════════
const COUNTRY_PACKS = [
  {
    id: "russia", name: "Russia", flag: "🇷🇺", color: "#D52B1E",
    platforms: [
      { id: "ru_yandex",    name: "Yandex",          icon: "🔴", color: "#FF0000", cat: "Search", buildUrl: q => `https://yandex.ru/search/?text=${encodeURIComponent(q)}` },
      { id: "ru_vk",        name: "VKontakte",        icon: "💙", color: "#0077FF", cat: "Social", buildUrl: q => `https://vk.com/search?c%5Bq%5D=${encodeURIComponent(q)}&c%5Bsection%5D=people` },
      { id: "ru_ok",        name: "Odnoklassniki",    icon: "🟠", color: "#EE8208", cat: "Social", buildUrl: q => `https://ok.ru/search?query=${encodeURIComponent(q)}` },
      { id: "ru_mail",      name: "Mail.ru Search",   icon: "📧", color: "#005FF9", cat: "Search", buildUrl: q => `https://go.mail.ru/search?q=${encodeURIComponent(q)}` },
      { id: "ru_lj",        name: "LiveJournal RU",   icon: "📰", color: "#00B0EA", cat: "Blogs",  buildUrl: q => `https://www.livejournal.com/gsearch/?q=${encodeURIComponent(q)}` },
      { id: "ru_habr",      name: "Habr",             icon: "🖥", color: "#65A3BE", cat: "Blogs",  buildUrl: q => `https://habr.com/en/search/?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "china", name: "China", flag: "🇨🇳", color: "#DE2910",
    platforms: [
      { id: "cn_baidu",     name: "Baidu",            icon: "🔵", color: "#2932E1", cat: "Search", buildUrl: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
      { id: "cn_weibo",     name: "Weibo",            icon: "🌊", color: "#E6162D", cat: "Social", buildUrl: q => `https://s.weibo.com/weibo/${encodeURIComponent(q)}` },
      { id: "cn_sogou",     name: "Sogou",            icon: "🔶", color: "#FF6600", cat: "Search", buildUrl: q => `https://www.sogou.com/web?query=${encodeURIComponent(q)}` },
      { id: "cn_360",       name: "360 Search",       icon: "🟢", color: "#00A65A", cat: "Search", buildUrl: q => `https://www.so.com/s?q=${encodeURIComponent(q)}` },
      { id: "cn_zhihu",     name: "Zhihu",            icon: "💡", color: "#0084FF", cat: "Blogs",  buildUrl: q => `https://www.zhihu.com/search?q=${encodeURIComponent(q)}&type=people` },
      { id: "cn_bilibili",  name: "Bilibili",         icon: "📺", color: "#00A1D6", cat: "Social", buildUrl: q => `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}` },
      { id: "cn_douyin",    name: "Douyin",           icon: "🎵", color: "#161823", cat: "Social", buildUrl: q => `https://www.douyin.com/search/${encodeURIComponent(q)}` },
      { id: "cn_tieba",     name: "Baidu Tieba",      icon: "📋", color: "#2468CC", cat: "Blogs",  buildUrl: q => `https://tieba.baidu.com/f/search/res?qw=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "germany", name: "Germany", flag: "🇩🇪", color: "#FFCE00",
    platforms: [
      { id: "de_google",    name: "Google DE",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.de/search?q=${encodeURIComponent(q)}&hl=de` },
      { id: "de_xing",      name: "Xing",             icon: "💼", color: "#026466", cat: "Social", buildUrl: q => `https://www.xing.com/search/members?q=${encodeURIComponent(q)}` },
      { id: "de_bing",      name: "Bing DE",          icon: "🔎", color: "#00809D", cat: "Search", buildUrl: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=de` },
      { id: "de_focus",     name: "Focus Online",     icon: "📰", color: "#CC0000", cat: "Blogs",  buildUrl: q => `https://www.focus.de/suche/?search=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "france", name: "France", flag: "🇫🇷", color: "#0055A4",
    platforms: [
      { id: "fr_google",    name: "Google FR",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.fr/search?q=${encodeURIComponent(q)}&hl=fr` },
      { id: "fr_qwant",     name: "Qwant",            icon: "🌐", color: "#5C35CB", cat: "Search", buildUrl: q => `https://www.qwant.com/?q=${encodeURIComponent(q)}` },
      { id: "fr_viadeo",    name: "Viadeo",           icon: "💼", color: "#F07355", cat: "Social", buildUrl: q => `https://www.viadeo.com/en/search/?q=${encodeURIComponent(q)}` },
      { id: "fr_leboncoin", name: "LeBonCoin",        icon: "🟠", color: "#F56B2A", cat: "Records",buildUrl: q => `https://www.leboncoin.fr/recherche/?text=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "japan", name: "Japan", flag: "🇯🇵", color: "#BC002D",
    platforms: [
      { id: "jp_yahoo",     name: "Yahoo! Japan",     icon: "🟣", color: "#FF0033", cat: "Search", buildUrl: q => `https://search.yahoo.co.jp/search?p=${encodeURIComponent(q)}` },
      { id: "jp_nicovideo", name: "NicoNico",         icon: "🎬", color: "#777777", cat: "Social", buildUrl: q => `https://www.nicovideo.jp/search/${encodeURIComponent(q)}` },
      { id: "jp_ameba",     name: "Ameba Blog",       icon: "📝", color: "#80CC28", cat: "Blogs",  buildUrl: q => `https://blogsearch.ameba.jp/search/blog?query=${encodeURIComponent(q)}` },
      { id: "jp_2channel",  name: "5channel (2ch)",   icon: "📋", color: "#AA4400", cat: "Blogs",  buildUrl: q => `https://find.5ch.net/search?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "southkorea", name: "South Korea", flag: "🇰🇷", color: "#003478",
    platforms: [
      { id: "kr_naver",     name: "Naver",            icon: "🟢", color: "#03C75A", cat: "Search", buildUrl: q => `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}` },
      { id: "kr_daum",      name: "Daum",             icon: "🔵", color: "#136FCE", cat: "Search", buildUrl: q => `https://search.daum.net/search?q=${encodeURIComponent(q)}` },
      { id: "kr_kakao",     name: "KakaoTalk Story",  icon: "💛", color: "#FAE100", cat: "Social", buildUrl: q => `https://story.kakao.com/search/people?q=${encodeURIComponent(q)}` },
      { id: "kr_band",      name: "Band",             icon: "🎗️", color: "#5BCA3C", cat: "Social", buildUrl: q => `https://band.us/search?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "brazil", name: "Brazil", flag: "🇧🇷", color: "#009C3B",
    platforms: [
      { id: "br_google",    name: "Google BR",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.com.br/search?q=${encodeURIComponent(q)}&hl=pt-BR` },
      { id: "br_uol",       name: "UOL Busca",        icon: "🟡", color: "#FFCC00", cat: "Search", buildUrl: q => `https://busca.uol.com.br/search?q=${encodeURIComponent(q)}` },
      { id: "br_linkedin",  name: "LinkedIn BR",      icon: "💼", color: "#0A66C2", cat: "Social", buildUrl: q => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}&origin=GLOBAL_SEARCH_HEADER` },
    ],
  },
  {
    id: "india", name: "India", flag: "🇮🇳", color: "#FF9933",
    platforms: [
      { id: "in_google",    name: "Google IN",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.co.in/search?q=${encodeURIComponent(q)}&hl=en-IN` },
      { id: "in_sharechat", name: "ShareChat",        icon: "💬", color: "#FF4D00", cat: "Social", buildUrl: q => `https://sharechat.com/search/${encodeURIComponent(q)}` },
      { id: "in_truecaller",name: "Truecaller",       icon: "📞", color: "#0099FF", cat: "Records",buildUrl: q => `https://www.truecaller.com/search/in/${encodeURIComponent(q)}` },
      { id: "in_justdial",  name: "JustDial",         icon: "📋", color: "#FF6600", cat: "Records",buildUrl: q => `https://www.justdial.com/functions/ajaxsearch.php?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "middleeast", name: "Middle East", flag: "🌍", color: "#009A44",
    platforms: [
      { id: "me_yandex",    name: "Yandex (AR)",      icon: "🔴", color: "#FF0000", cat: "Search", buildUrl: q => `https://yandex.com/search/?text=${encodeURIComponent(q)}&lang=ar` },
      { id: "me_maktoob",   name: "Yahoo Maktoob",    icon: "🌐", color: "#6001D2", cat: "Search", buildUrl: q => `https://maktoob.search.yahoo.com/search?p=${encodeURIComponent(q)}` },
      { id: "me_dubizzle",  name: "Dubizzle",         icon: "🏠", color: "#FF6600", cat: "Records",buildUrl: q => `https://uae.dubizzle.com/search/?q=${encodeURIComponent(q)}` },
      { id: "me_bayt",      name: "Bayt.com",         icon: "💼", color: "#0070C0", cat: "Social", buildUrl: q => `https://www.bayt.com/en/search/?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "ukraine", name: "Ukraine", flag: "🇺🇦", color: "#005BBB",
    platforms: [
      { id: "ua_ukr",       name: "UKR.net",          icon: "🔍", color: "#0057B7", cat: "Search", buildUrl: q => `https://search.ukr.net/?q=${encodeURIComponent(q)}` },
      { id: "ua_meta",      name: "Meta.ua",          icon: "🌐", color: "#2B5CAB", cat: "Search", buildUrl: q => `https://meta.ua/ua/search/people/?q=${encodeURIComponent(q)}` },
      { id: "ua_vk",        name: "VK (UA users)",    icon: "💙", color: "#0077FF", cat: "Social", buildUrl: q => `https://vk.com/search?c%5Bq%5D=${encodeURIComponent(q)}&c%5Bcountry%5D=2` },
    ],
  },
  {
    id: "iran", name: "Iran", flag: "🇮🇷", color: "#239F40",
    platforms: [
      { id: "ir_aparat",    name: "Aparat",           icon: "📺", color: "#E9263A", cat: "Social", buildUrl: q => `https://www.aparat.com/search/${encodeURIComponent(q)}` },
      { id: "ir_virgool",   name: "Virgool",          icon: "📝", color: "#1C6EAD", cat: "Blogs",  buildUrl: q => `https://virgool.io/search?q=${encodeURIComponent(q)}` },
      { id: "ir_google",    name: "Google IR",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.com/search?q=${encodeURIComponent(q)}&gl=ir&hl=fa` },
    ],
  },
  {
    id: "northkorea", name: "North Korea", flag: "🇰🇵", color: "#024FA2",
    platforms: [
      { id: "kp_google",    name: "Google (DPRK terms)", icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.com/search?q=${encodeURIComponent(q + " North Korea DPRK")}` },
      { id: "kp_naenara",   name: "Naenara Archive",  icon: "🌐", color: "#CC0000", cat: "Search", buildUrl: q => `https://www.google.com/search?q=site:naenara.com.kp+${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "uk", name: "United Kingdom", flag: "🇬🇧", color: "#012169",
    platforms: [
      { id: "uk_google",    name: "Google UK",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.co.uk/search?q=${encodeURIComponent(q)}&hl=en-GB` },
      { id: "uk_192",       name: "192.com",          icon: "📋", color: "#2E86C1", cat: "Records",buildUrl: q => `https://www.192.com/people/${encodeURIComponent(q.replace(/ /g,"-"))}/` },
      { id: "uk_truecaller",name: "Truecaller UK",    icon: "📞", color: "#0099FF", cat: "Records",buildUrl: q => `https://www.truecaller.com/search/gb/${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "canada", name: "Canada", flag: "🇨🇦", color: "#FF0000",
    platforms: [
      { id: "ca_google",    name: "Google CA",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.ca/search?q=${encodeURIComponent(q)}&hl=en-CA` },
      { id: "ca_canada411", name: "Canada411",        icon: "📞", color: "#D40000", cat: "Records",buildUrl: q => `https://www.canada411.ca/search/?q=${encodeURIComponent(q)}` },
    ],
  },
  {
    id: "australia", name: "Australia", flag: "🇦🇺", color: "#00008B",
    platforms: [
      { id: "au_google",    name: "Google AU",        icon: "🔍", color: "#4285F4", cat: "Search", buildUrl: q => `https://www.google.com.au/search?q=${encodeURIComponent(q)}&hl=en-AU` },
      { id: "au_whitepages",name: "Whitepages AU",    icon: "📞", color: "#1FA0FF", cat: "Records",buildUrl: q => `https://www.whitepages.com.au/residential?name=${encodeURIComponent(q)}` },
      { id: "au_seek",      name: "Seek",             icon: "💼", color: "#00A94F", cat: "Records",buildUrl: q => `https://www.seek.com.au/jobs?keywords=${encodeURIComponent(q)}` },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function buildBooleanQuery(identifiers, mode = "AND") {
  const clean = identifiers
    .map(v => v.toString().trim()).filter(Boolean)
    .map(v => (v.includes(" ") ? `"${v}"` : v));
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return clean.join(` ${mode} `);
}

function detectType(value) {
  const v = value.toString().trim();
  if (/^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v)) return "Email";
  if (/^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v)) return "Phone";
  if (/^(https?:\/\/|www\.)/i.test(v)) return "URL";
  if (/^\d{1,5}\s\w+/.test(v)) return "Address";
  if (/^@\w+$/.test(v)) return "Username";
  return "Text";
}

const TYPE_COLORS = {
  Email: "#3B82F6", Phone: "#10B981", URL: "#8B5CF6",
  Address: "#F59E0B", Username: "#EC4899", Text: "#6B7280",
};

const SmallBtn = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #334155", color: "#94A3B8",
    padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11,
    letterSpacing: 1, fontFamily: "inherit", ...style,
  }}>{children}</button>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748B", fontWeight: 600, marginBottom: 10 }}>{children}</div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMap, setColumnMap] = useState({ subject: "", identifiers: [] });
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedIdentifiers, setSelectedIdentifiers] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState("");

  const [boolMode, setBoolMode] = useState("AND");
  const [customQuery, setCustomQuery] = useState("");

  const [selectedGlobal, setSelectedGlobal] = useState(GLOBAL_PLATFORMS.map(p => p.id));
  const [activeGlobalCat, setActiveGlobalCat] = useState("All");
  const [globalFilter, setGlobalFilter] = useState("");

  const [activeCountries, setActiveCountries] = useState([]);
  const [selectedCountryPlatforms, setSelectedCountryPlatforms] = useState({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [activeCountryTab, setActiveCountryTab] = useState(null);

  const parseFile = useCallback((file) => {
    setError("");
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (data.length < 2) { setError("Sheet appears empty or has only headers."); return; }
        const headers = data[0].map(h => h.toString().trim());
        const rows = data.slice(1).filter(r => r.some(c => c !== ""));
        setRawHeaders(headers); setRawRows(rows); setFileName(file.name);
        setColumnMap({ subject: "", identifiers: [] });
        setStep("map");
      } catch { setError("Could not parse the file. Please ensure it's a valid .xlsx or .csv file."); }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const buildSubjects = useCallback(() => {
    if (!columnMap.subject || columnMap.identifiers.length === 0) {
      setError("Please select a Subject column and at least one Identifier column."); return;
    }
    const subjectIdx = rawHeaders.indexOf(columnMap.subject);
    const idxMap = columnMap.identifiers.map(h => ({ col: h, idx: rawHeaders.indexOf(h) }));
    const grouped = {};
    rawRows.forEach(row => {
      const key = row[subjectIdx]?.toString().trim();
      if (!key) return;
      if (!grouped[key]) grouped[key] = {};
      idxMap.forEach(({ col, idx }) => {
        const val = row[idx]?.toString().trim();
        if (!val) return;
        if (!grouped[key][col]) grouped[key][col] = new Set();
        grouped[key][col].add(val);
      });
    });
    const built = Object.entries(grouped).map(([name, colData]) => {
      const identifiers = [];
      Object.entries(colData).forEach(([col, vals]) => {
        vals.forEach(v => identifiers.push({ value: v, column: col, type: detectType(v) }));
      });
      return { name, identifiers };
    });
    setSubjects(built);
    setSelectedSubject(built[0] || null);
    setSelectedIdentifiers(built[0]?.identifiers.map((_, i) => i) || []);
    setCustomQuery(""); setStep("results"); setError("");
  }, [columnMap, rawHeaders, rawRows]);

  const activeIdValues = selectedSubject
    ? selectedIdentifiers.map(i => selectedSubject.identifiers[i]?.value).filter(Boolean) : [];
  const query = customQuery || buildBooleanQuery(activeIdValues, boolMode);

  const toggleGlobal = id => setSelectedGlobal(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleIdentifier = i => setSelectedIdentifiers(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const selectSubject = s => { setSelectedSubject(s); setSelectedIdentifiers(s.identifiers.map((_, i) => i)); setCustomQuery(""); };

  const toggleCountry = (packId) => {
    setActiveCountries(prev => {
      if (prev.includes(packId)) {
        const next = prev.filter(x => x !== packId);
        if (activeCountryTab === packId) setActiveCountryTab(next[0] || null);
        return next;
      } else {
        const pack = COUNTRY_PACKS.find(p => p.id === packId);
        setSelectedCountryPlatforms(cp => ({ ...cp, [packId]: pack.platforms.map(p => p.id) }));
        if (!activeCountryTab) setActiveCountryTab(packId);
        return [...prev, packId];
      }
    });
  };

  const toggleCountryPlatform = (packId, platformId) => {
    setSelectedCountryPlatforms(prev => {
      const cur = prev[packId] || [];
      return { ...prev, [packId]: cur.includes(platformId) ? cur.filter(x => x !== platformId) : [...cur, platformId] };
    });
  };

  const filteredGlobal = GLOBAL_PLATFORMS.filter(p => {
    const catOk = activeGlobalCat === "All" || p.cat === activeGlobalCat;
    const nameOk = p.name.toLowerCase().includes(globalFilter.toLowerCase());
    return catOk && nameOk;
  });
  const selectedFilteredGlobal = filteredGlobal.filter(p => selectedGlobal.includes(p.id));

  const allActiveCountryPlatforms = activeCountries.flatMap(packId => {
    const pack = COUNTRY_PACKS.find(p => p.id === packId);
    const sel = selectedCountryPlatforms[packId] || [];
    return pack.platforms.filter(p => sel.includes(p.id));
  });

  const totalLinks = selectedFilteredGlobal.length + allActiveCountryPlatforms.length;

  const resetAll = () => {
    setStep("upload"); setSubjects([]); setFileName(""); setRawRows([]); setRawHeaders([]);
    setSelectedSubject(null); setError(""); setColumnMap({ subject: "", identifiers: [] }); setCustomQuery("");
  };

  const visibleSubjects = subjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0A0E1A", minHeight: "100vh", color: "#E2E8F0" }}>

      {/* HEADER */}
      <header style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
        borderBottom: "1px solid #1E3A5F", padding: "16px 28px",
        display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 200,
      }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🎯</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 3, color: "#E2E8F0" }}>IDENTIFIER SCOUT</div>
          <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 3 }}>OSINT SEARCH AUTOMATION TOOL</div>
        </div>
        {step !== "upload" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 28 }}>
            {["Upload", "Map", "Search"].map((label, i) => {
              const names = ["upload", "map", "results"];
              const cur = names.indexOf(step);
              const done = i < cur; const active = i === cur;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: done || active ? 1 : 0.3 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? "#10B981" : active ? "#3B82F6" : "#1E293B", border: `1px solid ${done ? "#10B981" : active ? "#3B82F6" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>{done ? "✓" : i + 1}</div>
                    <span style={{ fontSize: 10, color: active ? "#E2E8F0" : "#64748B", letterSpacing: 1 }}>{label.toUpperCase()}</span>
                  </div>
                  {i < 2 && <div style={{ width: 16, height: 1, background: "#1E293B", marginLeft: 2 }} />}
                </div>
              );
            })}
          </div>
        )}
        {step !== "upload" && (
          <button onClick={resetAll} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #334155", color: "#94A3B8", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "inherit" }}>↩ NEW FILE</button>
        )}
      </header>

      <div style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto" }}>

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div style={{ maxWidth: 660, margin: "56px auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 3, marginBottom: 8 }}>STEP 1 OF 3</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 10, letterSpacing: 1 }}>Upload Identifier Sheet</div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7 }}>
                Upload an Excel (.xlsx) or CSV file. Each row is a data source entry.<br />
                Rows sharing the same Subject value are merged into one profile.
              </div>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); parseFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${isDragging ? "#3B82F6" : "#1E3A5F"}`, borderRadius: 16, padding: "64px 40px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 14, background: isDragging ? "rgba(59,130,246,0.08)" : "rgba(15,23,42,0.6)" }}
            >
              <div style={{ fontSize: 50, marginBottom: 14 }}>📂</div>
              <div style={{ fontSize: 15, color: "#CBD5E1", marginBottom: 6 }}>Drag & drop your file here</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 18 }}>or click to browse</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {[".xlsx", ".xls", ".csv"].map(ext => (
                  <span key={ext} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 4, padding: "3px 10px", fontSize: 11, color: "#64748B", letterSpacing: 1 }}>{ext}</span>
                ))}
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => parseFile(e.target.files[0])} />
            {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#FCA5A5", fontSize: 13 }}>⚠ {error}</div>}
            <Card style={{ marginTop: 20 }}>
              <SectionLabel>EXPECTED FORMAT</SectionLabel>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#1E293B" }}>
                      {["Subject", "Full Name", "Email", "Phone", "Username", "Address"].map(h => (
                        <th key={h} style={{ padding: "7px 12px", color: "#94A3B8", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap", borderRight: "1px solid #0F172A" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["JD-001", "John Doe", "jdoe@email.com", "555-0101", "@johnd", "123 Main St"],
                      ["JD-001", "J. Doe", "john.d@work.com", "", "", ""],
                      ["JS-002", "Jane Smith", "jsmith@email.com", "555-0202", "@janes", "456 Oak Ave"],
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1E293B" }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: "6px 12px", color: cell ? "#CBD5E1" : "#2D3748", borderRight: "1px solid #1E293B" }}>{cell || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                💡 Multiple rows with the same Subject value are merged. Duplicate identifier values are removed automatically.
              </div>
            </Card>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === "map" && (
          <div style={{ maxWidth: 720, margin: "36px auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 3, marginBottom: 8 }}>STEP 2 OF 3</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>Map Your Columns</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}><span style={{ color: "#60A5FA" }}>{fileName}</span> — {rawRows.length} data rows, {rawHeaders.length} columns</div>
            </div>
            <Card style={{ marginBottom: 14 }}>
              <SectionLabel>SUBJECT / GROUP-BY COLUMN <span style={{ color: "#EF4444" }}>*</span></SectionLabel>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12, lineHeight: 1.5 }}>This column links rows to the same person or entity (e.g., case ID, name, or code).</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rawHeaders.map(h => (
                  <button key={h} onClick={() => setColumnMap(prev => ({ ...prev, subject: h }))} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: columnMap.subject === h ? "rgba(59,130,246,0.2)" : "#1E293B", border: `1px solid ${columnMap.subject === h ? "#3B82F6" : "#334155"}`, color: columnMap.subject === h ? "#60A5FA" : "#475569" }}>{h}</button>
                ))}
              </div>
            </Card>
            <Card style={{ marginBottom: 22 }}>
              <SectionLabel>IDENTIFIER COLUMNS <span style={{ color: "#EF4444" }}>*</span></SectionLabel>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12, lineHeight: 1.5 }}>Select all columns containing searchable data — names, emails, phones, usernames, addresses, aliases, etc.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rawHeaders.filter(h => h !== columnMap.subject).map(h => {
                  const sel = columnMap.identifiers.includes(h);
                  return (
                    <button key={h} onClick={() => setColumnMap(prev => ({ ...prev, identifiers: sel ? prev.identifiers.filter(x => x !== h) : [...prev.identifiers, h] }))} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: sel ? "rgba(139,92,246,0.2)" : "#1E293B", border: `1px solid ${sel ? "#8B5CF6" : "#334155"}`, color: sel ? "#A78BFA" : "#475569" }}>{sel ? "✓ " : ""}{h}</button>
                  );
                })}
              </div>
              {columnMap.identifiers.length > 0 && <div style={{ marginTop: 10, fontSize: 11, color: "#64748B" }}>{columnMap.identifiers.length} column{columnMap.identifiers.length !== 1 ? "s" : ""} selected</div>}
            </Card>
            {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#FCA5A5", fontSize: 13 }}>⚠ {error}</div>}
            <button onClick={buildSubjects} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: "inherit" }}>BUILD SUBJECT PROFILES →</button>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === "results" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, alignItems: "start" }}>

            {/* Subject sidebar */}
            <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden", position: "sticky", top: 72 }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, letterSpacing: 2, color: "#64748B" }}>SUBJECTS</span>
                <span style={{ fontSize: 11, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "2px 8px", color: "#64748B" }}>{subjects.length}</span>
              </div>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #1E293B" }}>
                <input value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} placeholder="Filter subjects..." style={{ width: "100%", padding: "5px 10px", background: "#0A0E1A", border: "1px solid #1E293B", borderRadius: 6, color: "#94A3B8", fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ maxHeight: "68vh", overflowY: "auto" }}>
                {visibleSubjects.map(s_ => (
                  <div key={s_.name} onClick={() => selectSubject(s_)} style={{ padding: "11px 14px", cursor: "pointer", borderBottom: "1px solid #0A0E1A", transition: "all 0.15s", background: selectedSubject?.name === s_.name ? "rgba(59,130,246,0.08)" : "transparent", borderLeft: `3px solid ${selectedSubject?.name === s_.name ? "#3B82F6" : "transparent"}` }}>
                    <div style={{ fontSize: 12, color: selectedSubject?.name === s_.name ? "#60A5FA" : "#CBD5E1", fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s_.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{s_.identifiers.length} identifier{s_.identifiers.length !== 1 ? "s" : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main panel */}
            {selectedSubject && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Subject header */}
                <div style={{ background: "linear-gradient(135deg, #0F172A, #1E1B4B)", border: "1px solid #1E3A5F", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{selectedSubject.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{selectedSubject.identifiers.length} unique identifiers · {selectedIdentifiers.length} selected · {totalLinks} search links ready</div>
                  </div>
                  <div style={{ fontSize: 28, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>🎯</div>
                </div>

                {/* Identifiers + Query */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <SectionLabel>IDENTIFIERS</SectionLabel>
                      <div style={{ display: "flex", gap: 6 }}>
                        <SmallBtn onClick={() => setSelectedIdentifiers(selectedSubject.identifiers.map((_, i) => i))}>All</SmallBtn>
                        <SmallBtn onClick={() => setSelectedIdentifiers([])}>None</SmallBtn>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 320, overflowY: "auto" }}>
                      {selectedSubject.identifiers.map((id, i) => {
                        const sel = selectedIdentifiers.includes(i);
                        return (
                          <div key={i} onClick={() => toggleIdentifier(i)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 11px", borderRadius: 7, cursor: "pointer", transition: "all 0.15s", background: sel ? "rgba(59,130,246,0.08)" : "#0A0E1A", border: `1px solid ${sel ? "rgba(59,130,246,0.3)" : "#1E293B"}` }}>
                            <div style={{ width: 13, height: 13, borderRadius: 3, flexShrink: 0, border: `2px solid ${sel ? "#3B82F6" : "#334155"}`, background: sel ? "#3B82F6" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{sel && <span style={{ color: "#fff", fontSize: 8 }}>✓</span>}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id.value}</div>
                              <div style={{ fontSize: 10, color: "#475569" }}>{id.column}</div>
                            </div>
                            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, flexShrink: 0, background: TYPE_COLORS[id.type] + "22", color: TYPE_COLORS[id.type], border: `1px solid ${TYPE_COLORS[id.type] + "44"}` }}>{id.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card>
                    <SectionLabel>QUERY BUILDER</SectionLabel>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 7, letterSpacing: 1 }}>BOOLEAN MODE</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["AND", "OR"].map(m => (
                          <button key={m} onClick={() => setBoolMode(m)} style={{ flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 2, border: `1px solid ${boolMode === m ? "#3B82F6" : "#334155"}`, background: boolMode === m ? "rgba(59,130,246,0.15)" : "#1E293B", color: boolMode === m ? "#60A5FA" : "#94A3B8" }}>{m}</button>
                        ))}
                      </div>
                      <div style={{ marginTop: 5, fontSize: 10, color: "#475569" }}>{boolMode === "AND" ? "All terms must appear — narrows results" : "Any term can appear — broadens results"}</div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 5, letterSpacing: 1 }}>GENERATED QUERY</div>
                      <div style={{ padding: "9px 11px", background: "#020617", border: "1px solid #1E293B", borderRadius: 7, fontSize: 11, color: "#34D399", fontFamily: "monospace", wordBreak: "break-all", minHeight: 54, lineHeight: 1.6 }}>
                        {query || <span style={{ color: "#334155" }}>Select identifiers above...</span>}
                      </div>
                      {query && <button onClick={() => navigator.clipboard.writeText(query)} style={{ marginTop: 5, fontSize: 10, color: "#64748B", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>📋 Copy query</button>}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 5, letterSpacing: 1 }}>MANUAL OVERRIDE</div>
                      <textarea value={customQuery} onChange={e => setCustomQuery(e.target.value)} placeholder={`e.g. "John Doe" AND (jdoe@email.com OR @johnd)`} style={{ width: "100%", padding: "9px 11px", background: "#020617", border: "1px solid #1E293B", borderRadius: 7, fontSize: 11, color: "#CBD5E1", fontFamily: "monospace", resize: "vertical", minHeight: 64, boxSizing: "border-box", outline: "none" }} />
                      {customQuery && <button onClick={() => setCustomQuery("")} style={{ marginTop: 4, fontSize: 10, color: "#EF4444", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>✕ Clear override</button>}
                    </div>
                  </Card>
                </div>

                {/* Global platforms */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <SectionLabel>GLOBAL PLATFORMS</SectionLabel>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Filter..." style={{ padding: "4px 9px", background: "#1E293B", border: "1px solid #334155", borderRadius: 6, color: "#94A3B8", fontSize: 11, fontFamily: "inherit", outline: "none", width: 110 }} />
                      <SmallBtn onClick={() => setSelectedGlobal(GLOBAL_PLATFORMS.map(p => p.id))}>All</SmallBtn>
                      <SmallBtn onClick={() => setSelectedGlobal([])}>None</SmallBtn>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {["All", ...GLOBAL_CATS].map(cat => (
                      <button key={cat} onClick={() => setActiveGlobalCat(cat)} style={{ padding: "4px 13px", borderRadius: 20, fontSize: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1, background: activeGlobalCat === cat ? "#3B82F6" : "#1E293B", border: `1px solid ${activeGlobalCat === cat ? "#3B82F6" : "#334155"}`, color: activeGlobalCat === cat ? "#fff" : "#64748B" }}>{cat.toUpperCase()}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {filteredGlobal.map(p => {
                      const sel = selectedGlobal.includes(p.id);
                      return (
                        <button key={p.id} onClick={() => toggleGlobal(p.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s", background: sel ? p.color + "22" : "#1E293B", border: `1px solid ${sel ? p.color + "88" : "#334155"}`, color: sel ? p.color : "#475569" }}>
                          <span>{p.icon}</span>{p.name}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Country packs */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <SectionLabel>COUNTRY-SPECIFIC PLATFORMS</SectionLabel>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: -6, marginBottom: 12 }}>Add country packs to search local search engines, social networks, and records sites. Multiple countries can be active at once.</div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setCountryDropdownOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#CBD5E1", cursor: "pointer", fontSize: 11, fontFamily: "inherit", letterSpacing: 1 }}>
                        🌍 ADD COUNTRIES {activeCountries.length > 0 && `(${activeCountries.length})`} {countryDropdownOpen ? "▲" : "▼"}
                      </button>
                      {countryDropdownOpen && (
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 300, background: "#0F172A", border: "1px solid #334155", borderRadius: 10, padding: 10, minWidth: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                          {COUNTRY_PACKS.map(pack => {
                            const active = activeCountries.includes(pack.id);
                            return (
                              <button key={pack.id} onClick={() => toggleCountry(pack.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "inherit", textAlign: "left", transition: "all 0.15s", background: active ? pack.color + "22" : "#1E293B", border: `1px solid ${active ? pack.color + "88" : "#334155"}`, color: active ? "#E2E8F0" : "#64748B" }}>
                                <span style={{ fontSize: 14 }}>{pack.flag}</span>
                                <span style={{ flex: 1 }}>{pack.name}</span>
                                {active && <span style={{ color: pack.color, fontSize: 10 }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {activeCountries.length === 0 ? (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#334155", fontSize: 12 }}>No country packs active. Click "Add Countries" above to select one or more.</div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                        {activeCountries.map(packId => {
                          const pack = COUNTRY_PACKS.find(p => p.id === packId);
                          const selCount = (selectedCountryPlatforms[packId] || []).length;
                          return (
                            <button key={packId} onClick={() => setActiveCountryTab(packId)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontFamily: "inherit", background: activeCountryTab === packId ? pack.color + "33" : "#1E293B", border: `1px solid ${activeCountryTab === packId ? pack.color : "#334155"}`, color: activeCountryTab === packId ? "#E2E8F0" : "#64748B" }}>
                              <span>{pack.flag}</span>
                              <span>{pack.name}</span>
                              <span style={{ background: "#0A0E1A", borderRadius: 10, padding: "1px 6px", fontSize: 10, color: "#64748B" }}>{selCount}/{pack.platforms.length}</span>
                              <span onClick={e => { e.stopPropagation(); toggleCountry(packId); }} style={{ marginLeft: 2, color: "#475569", fontSize: 11, cursor: "pointer" }} title="Remove">✕</span>
                            </button>
                          );
                        })}
                      </div>
                      {activeCountryTab && (() => {
                        const pack = COUNTRY_PACKS.find(p => p.id === activeCountryTab);
                        if (!pack) return null;
                        const sel = selectedCountryPlatforms[activeCountryTab] || [];
                        return (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 17 }}>{pack.flag}</span>
                              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{pack.name} Platforms</span>
                              <SmallBtn onClick={() => setSelectedCountryPlatforms(prev => ({ ...prev, [activeCountryTab]: pack.platforms.map(p => p.id) }))}>All</SmallBtn>
                              <SmallBtn onClick={() => setSelectedCountryPlatforms(prev => ({ ...prev, [activeCountryTab]: [] }))}>None</SmallBtn>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {pack.platforms.map(p => {
                                const on = sel.includes(p.id);
                                return (
                                  <button key={p.id} onClick={() => toggleCountryPlatform(activeCountryTab, p.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s", background: on ? p.color + "22" : "#1E293B", border: `1px solid ${on ? p.color + "88" : "#334155"}`, color: on ? p.color : "#475569" }}>
                                    <span>{p.icon}</span>{p.name}
                                    <span style={{ fontSize: 9, color: "#475569", marginLeft: 2 }}>{p.cat}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </Card>

                {/* Search links */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <SectionLabel>SEARCH LINKS</SectionLabel>
                      {query && <div style={{ fontSize: 10, color: "#475569", marginTop: -6 }}>{totalLinks} link{totalLinks !== 1 ? "s" : ""} ready across global + country platforms</div>}
                    </div>
                    <button
                      onClick={() => {
                        const all = [...selectedFilteredGlobal, ...allActiveCountryPlatforms];
                        all.forEach((p, i) => { if (query) setTimeout(() => window.open(p.buildUrl(query), "_blank"), i * 280); });
                      }}
                      disabled={!query || totalLinks === 0}
                      style={{ padding: "9px 22px", background: query && totalLinks > 0 ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "#1E293B", border: "none", borderRadius: 8, color: query && totalLinks > 0 ? "#fff" : "#475569", fontSize: 12, cursor: query && totalLinks > 0 ? "pointer" : "not-allowed", fontWeight: 700, letterSpacing: 1, fontFamily: "inherit" }}
                    >⚡ OPEN ALL ({totalLinks})</button>
                  </div>

                  {!query && <div style={{ padding: "28px 0", textAlign: "center", color: "#334155", fontSize: 12 }}>Select identifiers above to generate search links</div>}

                  {query && (
                    <div>
                      {selectedFilteredGlobal.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 8 }}>GLOBAL</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 7 }}>
                            {selectedFilteredGlobal.map(p => (
                              <a key={p.id} href={p.buildUrl(query)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0A0E1A", border: `1px solid ${p.color + "44"}`, borderRadius: 8, textDecoration: "none", transition: "all 0.15s" }}
                                onMouseOver={e => e.currentTarget.style.background = p.color + "15"}
                                onMouseOut={e => e.currentTarget.style.background = "#0A0E1A"}
                              >
                                <span style={{ fontSize: 17 }}>{p.icon}</span>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.name}</div>
                                  <div style={{ fontSize: 9, color: "#475569" }}>{p.cat} · ↗</div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeCountries.map(packId => {
                        const pack = COUNTRY_PACKS.find(p => p.id === packId);
                        const platforms = pack.platforms.filter(p => (selectedCountryPlatforms[packId] || []).includes(p.id));
                        if (platforms.length === 0) return null;
                        return (
                          <div key={packId} style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13 }}>{pack.flag}</span>
                              <span>{pack.name.toUpperCase()}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 7 }}>
                              {platforms.map(p => (
                                <a key={p.id} href={p.buildUrl(query)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0A0E1A", border: `1px solid ${p.color + "44"}`, borderRadius: 8, textDecoration: "none", transition: "all 0.15s" }}
                                  onMouseOver={e => e.currentTarget.style.background = p.color + "15"}
                                  onMouseOut={e => e.currentTarget.style.background = "#0A0E1A"}
                                >
                                  <span style={{ fontSize: 17 }}>{p.icon}</span>
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.name}</div>
                                    <div style={{ fontSize: 9, color: "#475569" }}>{p.cat} · ↗</div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {countryDropdownOpen && <div onClick={() => setCountryDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
    </div>
  );
}
