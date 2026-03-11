import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ── Search platform configurations ──────────────────────────────────────────
const PLATFORMS = [
  {
    id: "google",
    name: "Google",
    icon: "🔍",
    color: "#4285F4",
    category: "Search",
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "bing",
    name: "Bing",
    icon: "🔎",
    color: "#00809D",
    category: "Search",
    buildUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    icon: "🦆",
    color: "#DE5833",
    category: "Search",
    buildUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "𝕏",
    color: "#E2E8F0",
    category: "Social",
    buildUrl: (q) =>
      `https://twitter.com/search?q=${encodeURIComponent(q)}&src=typed_query`,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "#E1306C",
    category: "Social",
    buildUrl: (q) =>
      `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "#1877F2",
    category: "Social",
    buildUrl: (q) =>
      `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "#0A66C2",
    category: "Social",
    buildUrl: (q) =>
      `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "🤖",
    color: "#FF4500",
    category: "Social",
    buildUrl: (q) =>
      `https://www.reddit.com/search/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    color: "#FF0000",
    category: "Social",
    buildUrl: (q) =>
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "#69C9D0",
    category: "Social",
    buildUrl: (q) =>
      `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "pacer",
    name: "PACER",
    icon: "⚖️",
    color: "#8B9EC7",
    category: "Records",
    buildUrl: () => `https://pcl.uscourts.gov/pcl/pages/search/findCase.jsf`,
  },
  {
    id: "intelius",
    name: "Intelius",
    icon: "🧾",
    color: "#9B59B6",
    category: "Records",
    buildUrl: (q) =>
      `https://www.intelius.com/search?searchTerm=${encodeURIComponent(q)}`,
  },
  {
    id: "pipl",
    name: "Pipl",
    icon: "🌐",
    color: "#2E7D32",
    category: "Records",
    buildUrl: (q) => `https://pipl.com/search/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "truepeoplesearch",
    name: "TruePeopleSearch",
    icon: "🔬",
    color: "#00ACC1",
    category: "Records",
    buildUrl: (q) =>
      `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(q)}`,
  },
  {
    id: "spokeo",
    name: "Spokeo",
    icon: "📋",
    color: "#E67E22",
    category: "Records",
    buildUrl: (q) =>
      `https://www.spokeo.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    color: "#6E7681",
    category: "Tech",
    buildUrl: (q) =>
      `https://github.com/search?q=${encodeURIComponent(q)}&type=users`,
  },
];

const CATEGORIES = ["Search", "Social", "Records", "Tech"];

// ── Boolean query builder ────────────────────────────────────────────────────
function buildBooleanQuery(identifiers, mode = "AND") {
  const clean = identifiers
    .map((v) => v.toString().trim())
    .filter(Boolean)
    .map((v) => (v.includes(" ") ? `"${v}"` : v));
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return clean.join(` ${mode} `);
}

// ── Identifier type detector ─────────────────────────────────────────────────
function detectType(value) {
  const v = value.toString().trim();
  if (/^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v)) return "Email";
  if (/^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v))
    return "Phone";
  if (/^(https?:\/\/|www\.)/i.test(v)) return "URL";
  if (/^\d{1,5}\s\w+/.test(v)) return "Address";
  if (/^@\w+$/.test(v)) return "Username";
  if (/^\d{9}$/.test(v.replace(/[-\s]/g, ""))) return "SSN-like";
  if (/^\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}$/.test(v)) return "Card-like";
  return "Text";
}

const TYPE_COLORS = {
  Email: "#3B82F6",
  Phone: "#10B981",
  URL: "#8B5CF6",
  Address: "#F59E0B",
  Username: "#EC4899",
  Text: "#6B7280",
  "SSN-like": "#EF4444",
  "Card-like": "#EF4444",
};

// ── Reusable styled button ───────────────────────────────────────────────────
const Btn = ({ onClick, disabled, children, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: "transparent",
      border: "1px solid #334155",
      color: "#94A3B8",
      padding: "5px 14px",
      borderRadius: 6,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: "inherit",
      opacity: disabled ? 0.4 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    PLATFORMS.map((p) => p.id)
  );
  const [boolMode, setBoolMode] = useState("AND");
  const [customQuery, setCustomQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIdentifiers, setSelectedIdentifiers] = useState([]);
  const [columnMap, setColumnMap] = useState({ subject: "", identifiers: [] });
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [step, setStep] = useState("upload");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");
  const fileRef = useRef();

  // ── Parse uploaded file ──
  const parseFile = useCallback((file) => {
    setError("");
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (data.length < 2) {
          setError("Sheet appears empty or has only headers.");
          return;
        }
        const headers = data[0].map((h) => h.toString().trim());
        const rows = data.slice(1).filter((r) => r.some((c) => c !== ""));
        setRawHeaders(headers);
        setRawRows(rows);
        setFileName(file.name);
        setColumnMap({ subject: "", identifiers: [] });
        setStep("map");
      } catch {
        setError(
          "Could not parse the file. Please ensure it's a valid .xlsx or .csv file."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // ── Build subject profiles from column mapping ──
  const buildSubjects = useCallback(() => {
    if (!columnMap.subject || columnMap.identifiers.length === 0) {
      setError(
        "Please select a Subject column and at least one Identifier column."
      );
      return;
    }
    const subjectIdx = rawHeaders.indexOf(columnMap.subject);
    const idxMap = columnMap.identifiers.map((h) => ({
      col: h,
      idx: rawHeaders.indexOf(h),
    }));

    const grouped = {};
    rawRows.forEach((row) => {
      const subjectKey = row[subjectIdx]?.toString().trim();
      if (!subjectKey) return;
      if (!grouped[subjectKey]) grouped[subjectKey] = {};
      idxMap.forEach(({ col, idx }) => {
        const val = row[idx]?.toString().trim();
        if (!val) return;
        if (!grouped[subjectKey][col]) grouped[subjectKey][col] = new Set();
        grouped[subjectKey][col].add(val);
      });
    });

    const built = Object.entries(grouped).map(([name, colData]) => {
      const identifiers = [];
      Object.entries(colData).forEach(([col, vals]) => {
        vals.forEach((v) => {
          identifiers.push({ value: v, column: col, type: detectType(v) });
        });
      });
      return { name, identifiers };
    });

    setSubjects(built);
    setSelectedSubject(built[0] || null);
    setSelectedIdentifiers(built[0]?.identifiers.map((_, i) => i) || []);
    setCustomQuery("");
    setStep("results");
    setError("");
  }, [columnMap, rawHeaders, rawRows]);

  const activeIdentifiers = selectedSubject
    ? selectedIdentifiers
        .map((i) => selectedSubject.identifiers[i]?.value)
        .filter(Boolean)
    : [];

  const query = customQuery || buildBooleanQuery(activeIdentifiers, boolMode);

  const togglePlatform = (id) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleIdentifier = (i) =>
    setSelectedIdentifiers((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const selectSubject = (s) => {
    setSelectedSubject(s);
    setSelectedIdentifiers(s.identifiers.map((_, i) => i));
    setCustomQuery("");
  };

  const filteredPlatforms = PLATFORMS.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const nameMatch = p.name.toLowerCase().includes(searchFilter.toLowerCase());
    return catMatch && nameMatch;
  });

  const visibleSelected = filteredPlatforms.filter((p) =>
    selectedPlatforms.includes(p.id)
  );

  const resetAll = () => {
    setStep("upload");
    setSubjects([]);
    setFileName("");
    setRawRows([]);
    setRawHeaders([]);
    setSelectedSubject(null);
    setError("");
    setColumnMap({ subject: "", identifiers: [] });
    setCustomQuery("");
  };

  // ── Styles ──
  const s = {
    card: {
      background: "#0F172A",
      border: "1px solid #1E293B",
      borderRadius: 12,
      padding: 20,
    },
    label: {
      display: "block",
      fontSize: 11,
      letterSpacing: 2,
      color: "#64748B",
      marginBottom: 10,
      fontWeight: 600,
    },
    chipActive: (color) => ({
      padding: "6px 14px",
      borderRadius: 6,
      fontSize: 12,
      cursor: "pointer",
      background: color + "22",
      border: `1px solid ${color + "88"}`,
      color: color,
      fontFamily: "inherit",
      transition: "all 0.15s",
    }),
    chipInactive: {
      padding: "6px 14px",
      borderRadius: 6,
      fontSize: 12,
      cursor: "pointer",
      background: "#1E293B",
      border: "1px solid #334155",
      color: "#475569",
      fontFamily: "inherit",
      transition: "all 0.15s",
    },
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        background: "#0A0E1A",
        minHeight: "100vh",
        color: "#E2E8F0",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
          borderBottom: "1px solid #1E3A5F",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🎯
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#E2E8F0",
            }}
          >
            IDENTIFIER SCOUT
          </div>
          <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 3 }}>
            OSINT SEARCH AUTOMATION TOOL
          </div>
        </div>

        {/* Step indicator */}
        {step !== "upload" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 32,
            }}
          >
            {["Upload", "Map", "Search"].map((label, i) => {
              const stepNames = ["upload", "map", "results"];
              const current = stepNames.indexOf(step);
              const done = i < current;
              const active = i === current;
              return (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: done || active ? 1 : 0.3,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: done
                          ? "#10B981"
                          : active
                          ? "#3B82F6"
                          : "#1E293B",
                        border: `1px solid ${
                          done
                            ? "#10B981"
                            : active
                            ? "#3B82F6"
                            : "#334155"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: active ? "#E2E8F0" : "#64748B",
                        letterSpacing: 1,
                      }}
                    >
                      {label.toUpperCase()}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 20,
                        height: 1,
                        background: "#1E293B",
                        marginLeft: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step !== "upload" && (
          <button
            onClick={resetAll}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "1px solid #334155",
              color: "#94A3B8",
              padding: "6px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: "inherit",
            }}
          >
            ↩ NEW FILE
          </button>
        )}
      </header>

      <div style={{ padding: "28px 32px", maxWidth: 1500, margin: "0 auto" }}>
        {/* ════════════════════════════════════════════════════════════════════
            STEP 1 — UPLOAD
        ════════════════════════════════════════════════════════════════════ */}
        {step === "upload" && (
          <div style={{ maxWidth: 660, margin: "60px auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  letterSpacing: 3,
                  marginBottom: 10,
                }}
              >
                STEP 1 OF 3
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#E2E8F0",
                  marginBottom: 12,
                  letterSpacing: 1,
                }}
              >
                Upload Identifier Sheet
              </div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                Upload an Excel (.xlsx) or CSV file containing your subject
                identifiers. Each row represents one data source entry.
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                parseFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${isDragging ? "#3B82F6" : "#1E3A5F"}`,
                borderRadius: 16,
                padding: "70px 40px",
                textAlign: "center",
                cursor: "pointer",
                background: isDragging
                  ? "rgba(59,130,246,0.08)"
                  : "rgba(15,23,42,0.6)",
                transition: "all 0.2s",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>📂</div>
              <div
                style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 8 }}
              >
                Drag & drop your file here
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
                or click to browse
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {[".xlsx", ".xls", ".csv"].map((ext) => (
                  <span
                    key={ext}
                    style={{
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: 4,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#64748B",
                      letterSpacing: 1,
                    }}
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={(e) => parseFile(e.target.files[0])}
            />

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  color: "#FCA5A5",
                  fontSize: 13,
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Expected format preview */}
            <div style={{ ...s.card, marginTop: 24 }}>
              <div style={s.label}>EXPECTED FORMAT</div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#1E293B" }}>
                      {[
                        "Subject",
                        "Full Name",
                        "Email",
                        "Phone",
                        "Username",
                        "Address",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "7px 12px",
                            color: "#94A3B8",
                            fontWeight: 600,
                            textAlign: "left",
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #0F172A",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "JD-001",
                        "John Doe",
                        "jdoe@email.com",
                        "555-0101",
                        "@johnd",
                        "123 Main St",
                      ],
                      [
                        "JD-001",
                        "J. Doe",
                        "john.d@work.com",
                        "",
                        "",
                        "",
                      ],
                      [
                        "JS-002",
                        "Jane Smith",
                        "jsmith@email.com",
                        "555-0202",
                        "@janes",
                        "456 Oak Ave",
                      ],
                    ].map((row, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid #1E293B" }}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            style={{
                              padding: "6px 12px",
                              color: cell ? "#CBD5E1" : "#2D3748",
                              borderRight: "1px solid #1E293B",
                            }}
                          >
                            {cell || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                💡 Multiple rows with the same Subject value will be merged into
                one profile. Duplicate identifier values are automatically
                deduplicated.
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 2 — COLUMN MAPPING
        ════════════════════════════════════════════════════════════════════ */}
        {step === "map" && (
          <div style={{ maxWidth: 720, margin: "40px auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  letterSpacing: 3,
                  marginBottom: 10,
                }}
              >
                STEP 2 OF 3
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#E2E8F0",
                  marginBottom: 8,
                }}
              >
                Map Your Columns
              </div>
              <div style={{ fontSize: 14, color: "#94A3B8" }}>
                <span style={{ color: "#60A5FA" }}>{fileName}</span> —{" "}
                {rawRows.length} data rows, {rawHeaders.length} columns detected
              </div>
            </div>

            {/* Subject column */}
            <div style={{ ...s.card, marginBottom: 16 }}>
              <label style={s.label}>
                SUBJECT / GROUP-BY COLUMN{" "}
                <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                This column links rows to the same person or entity (e.g., a
                case ID, name, or subject code). Rows sharing the same value
                here will be merged into one profile.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rawHeaders.map((h) => (
                  <button
                    key={h}
                    onClick={() =>
                      setColumnMap((prev) => ({ ...prev, subject: h }))
                    }
                    style={
                      columnMap.subject === h
                        ? s.chipActive("#3B82F6")
                        : s.chipInactive
                    }
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Identifier columns */}
            <div style={{ ...s.card, marginBottom: 24 }}>
              <label style={s.label}>
                IDENTIFIER COLUMNS{" "}
                <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                Select all columns that contain searchable data — names, emails,
                phone numbers, usernames, addresses, aliases, etc. You can
                select multiple.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {rawHeaders
                  .filter((h) => h !== columnMap.subject)
                  .map((h) => {
                    const sel = columnMap.identifiers.includes(h);
                    return (
                      <button
                        key={h}
                        onClick={() =>
                          setColumnMap((prev) => ({
                            ...prev,
                            identifiers: sel
                              ? prev.identifiers.filter((x) => x !== h)
                              : [...prev.identifiers, h],
                          }))
                        }
                        style={
                          sel ? s.chipActive("#8B5CF6") : s.chipInactive
                        }
                      >
                        {sel ? "✓ " : ""}
                        {h}
                      </button>
                    );
                  })}
              </div>
              {columnMap.identifiers.length > 0 && (
                <div
                  style={{ marginTop: 12, fontSize: 11, color: "#64748B" }}
                >
                  {columnMap.identifiers.length} column
                  {columnMap.identifiers.length !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  color: "#FCA5A5",
                  fontSize: 13,
                }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              onClick={buildSubjects}
              style={{
                width: "100%",
                padding: "15px",
                background:
                  "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 2,
                fontFamily: "inherit",
              }}
            >
              BUILD SUBJECT PROFILES →
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 3 — RESULTS
        ════════════════════════════════════════════════════════════════════ */}
        {step === "results" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* ── Subject sidebar ── */}
            <div
              style={{
                ...s.card,
                padding: 0,
                overflow: "hidden",
                position: "sticky",
                top: 80,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #1E293B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    color: "#64748B",
                  }}
                >
                  SUBJECTS
                </span>
                <span
                  style={{
                    fontSize: 11,
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    padding: "2px 8px",
                    color: "#64748B",
                  }}
                >
                  {subjects.length}
                </span>
              </div>
              <div style={{ maxHeight: "72vh", overflowY: "auto" }}>
                {subjects.map((s_) => (
                  <div
                    key={s_.name}
                    onClick={() => selectSubject(s_)}
                    style={{
                      padding: "13px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #0A0E1A",
                      transition: "all 0.15s",
                      background:
                        selectedSubject?.name === s_.name
                          ? "rgba(59,130,246,0.08)"
                          : "transparent",
                      borderLeft: `3px solid ${
                        selectedSubject?.name === s_.name
                          ? "#3B82F6"
                          : "transparent"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color:
                          selectedSubject?.name === s_.name
                            ? "#60A5FA"
                            : "#CBD5E1",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      {s_.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>
                      {s_.identifiers.length} identifier
                      {s_.identifiers.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Main content ── */}
            {selectedSubject && (
              <div>
                {/* Subject header */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #0F172A, #1E1B4B)",
                    border: "1px solid #1E3A5F",
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#E2E8F0",
                        marginBottom: 4,
                      }}
                    >
                      {selectedSubject.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>
                      {selectedSubject.identifiers.length} unique identifiers
                      extracted · {selectedIdentifiers.length} selected for
                      search
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      background: "rgba(59,130,246,0.1)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 10,
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    🎯
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  {/* Identifiers panel */}
                  <div style={s.card}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <span style={s.label}>IDENTIFIERS</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn
                          onClick={() =>
                            setSelectedIdentifiers(
                              selectedSubject.identifiers.map((_, i) => i)
                            )
                          }
                        >
                          All
                        </Btn>
                        <Btn onClick={() => setSelectedIdentifiers([])}>
                          None
                        </Btn>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        maxHeight: 340,
                        overflowY: "auto",
                      }}
                    >
                      {selectedSubject.identifiers.map((id, i) => {
                        const sel = selectedIdentifiers.includes(i);
                        return (
                          <div
                            key={i}
                            onClick={() => toggleIdentifier(i)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 12px",
                              borderRadius: 8,
                              cursor: "pointer",
                              transition: "all 0.15s",
                              background: sel
                                ? "rgba(59,130,246,0.08)"
                                : "#0A0E1A",
                              border: `1px solid ${
                                sel
                                  ? "rgba(59,130,246,0.3)"
                                  : "#1E293B"
                              }`,
                            }}
                          >
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 3,
                                border: `2px solid ${
                                  sel ? "#3B82F6" : "#334155"
                                }`,
                                background: sel ? "#3B82F6" : "transparent",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {sel && (
                                <span
                                  style={{ color: "#fff", fontSize: 9 }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#CBD5E1",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {id.value}
                              </div>
                              <div
                                style={{ fontSize: 10, color: "#475569" }}
                              >
                                {id.column}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                padding: "2px 7px",
                                borderRadius: 3,
                                background:
                                  TYPE_COLORS[id.type] + "22",
                                color: TYPE_COLORS[id.type],
                                border: `1px solid ${
                                  TYPE_COLORS[id.type] + "44"
                                }`,
                                flexShrink: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {id.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Query builder panel */}
                  <div style={s.card}>
                    <label style={s.label}>QUERY BUILDER</label>

                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginBottom: 8,
                          letterSpacing: 1,
                        }}
                      >
                        BOOLEAN MODE
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["AND", "OR"].map((m) => (
                          <button
                            key={m}
                            onClick={() => setBoolMode(m)}
                            style={{
                              flex: 1,
                              padding: "9px",
                              borderRadius: 6,
                              border: `1px solid ${
                                boolMode === m ? "#3B82F6" : "#334155"
                              }`,
                              background:
                                boolMode === m
                                  ? "rgba(59,130,246,0.15)"
                                  : "#1E293B",
                              color:
                                boolMode === m ? "#60A5FA" : "#94A3B8",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              letterSpacing: 2,
                              fontFamily: "inherit",
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: "#475569",
                        }}
                      >
                        {boolMode === "AND"
                          ? "All terms must appear in results (narrower)"
                          : "Any term can appear in results (broader)"}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginBottom: 6,
                          letterSpacing: 1,
                        }}
                      >
                        GENERATED QUERY
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          background: "#020617",
                          border: "1px solid #1E293B",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#34D399",
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          minHeight: 60,
                          lineHeight: 1.6,
                        }}
                      >
                        {query || (
                          <span style={{ color: "#334155" }}>
                            Select identifiers above...
                          </span>
                        )}
                      </div>
                      {query && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(query)
                          }
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: "#64748B",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          📋 Copy query
                        </button>
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginBottom: 6,
                          letterSpacing: 1,
                        }}
                      >
                        MANUAL OVERRIDE
                      </div>
                      <textarea
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        placeholder={`e.g. "John Doe" AND (jdoe@email.com OR @johnd)`}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "#020617",
                          border: "1px solid #1E293B",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#CBD5E1",
                          fontFamily: "monospace",
                          resize: "vertical",
                          minHeight: 72,
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                      {customQuery && (
                        <button
                          onClick={() => setCustomQuery("")}
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "#EF4444",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          ✕ Clear override
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Platform selection */}
                <div style={{ ...s.card, marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <label style={{ ...s.label, margin: 0 }}>
                      SEARCH PLATFORMS
                    </label>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Filter platforms..."
                        style={{
                          padding: "5px 10px",
                          background: "#1E293B",
                          border: "1px solid #334155",
                          borderRadius: 6,
                          color: "#94A3B8",
                          fontSize: 11,
                          fontFamily: "inherit",
                          outline: "none",
                          width: 140,
                        }}
                      />
                      <Btn
                        onClick={() =>
                          setSelectedPlatforms(PLATFORMS.map((p) => p.id))
                        }
                      >
                        All
                      </Btn>
                      <Btn onClick={() => setSelectedPlatforms([])}>None</Btn>
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {["All", ...CATEGORIES].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 20,
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          letterSpacing: 1,
                          background:
                            activeCategory === cat
                              ? "#3B82F6"
                              : "#1E293B",
                          border: `1px solid ${
                            activeCategory === cat ? "#3B82F6" : "#334155"
                          }`,
                          color:
                            activeCategory === cat ? "#fff" : "#64748B",
                        }}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {filteredPlatforms.map((p) => {
                      const sel = selectedPlatforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "7px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                            background: sel ? p.color + "22" : "#1E293B",
                            border: `1px solid ${
                              sel ? p.color + "88" : "#334155"
                            }`,
                            color: sel ? p.color : "#475569",
                          }}
                        >
                          <span>{p.icon}</span> {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search links */}
                <div style={s.card}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={{ ...s.label, margin: 0 }}>
                        SEARCH LINKS
                      </label>
                      {query && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            marginTop: 4,
                          }}
                        >
                          {visibleSelected.length} platform
                          {visibleSelected.length !== 1 ? "s" : ""} ready
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        visibleSelected.forEach((p, i) => {
                          if (query)
                            setTimeout(
                              () => window.open(p.buildUrl(query), "_blank"),
                              i * 300
                            );
                        });
                      }}
                      disabled={!query || visibleSelected.length === 0}
                      style={{
                        padding: "10px 24px",
                        background:
                          query && visibleSelected.length > 0
                            ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                            : "#1E293B",
                        border: "none",
                        borderRadius: 8,
                        color:
                          query && visibleSelected.length > 0
                            ? "#fff"
                            : "#475569",
                        fontSize: 12,
                        cursor:
                          query && visibleSelected.length > 0
                            ? "pointer"
                            : "not-allowed",
                        fontWeight: 700,
                        letterSpacing: 1,
                        fontFamily: "inherit",
                      }}
                    >
                      ⚡ OPEN ALL ({visibleSelected.length})
                    </button>
                  </div>

                  {!query && (
                    <div
                      style={{
                        padding: "30px 20px",
                        textAlign: "center",
                        color: "#334155",
                        fontSize: 13,
                      }}
                    >
                      Select identifiers above to generate search links
                    </div>
                  )}

                  {query && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(210px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {visibleSelected.map((p) => (
                        <a
                          key={p.id}
                          href={p.buildUrl(query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            background: "#0A0E1A",
                            border: `1px solid ${p.color + "44"}`,
                            borderRadius: 8,
                            textDecoration: "none",
                            transition: "all 0.15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background =
                              p.color + "15")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "#0A0E1A")
                          }
                        >
                          <span style={{ fontSize: 20 }}>{p.icon}</span>
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: p.color,
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{ fontSize: 10, color: "#475569" }}
                            >
                              {p.category} · Click to open ↗
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
