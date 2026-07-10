import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { Search, MapPin, Phone, Star, ExternalLink, X, Check } from "lucide-react";

const NAVY = "#12283D";
const ORANGE = "#F4A15D";
const CREAM = "#F7F5EF";
const BORDER = "#E7E4DC";
const INK = "#161B22";
const MUTED = "#6B7280";

const selectStyle = { border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "10px 8px", fontSize: "14px", color: INK, background: "#fff", outline: "none" };
const inputStyle = { border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "11px 12px", fontSize: "14px", color: INK, outline: "none", width: "100%", boxSizing: "border-box" };

const CATEGORY_OPTIONS = [
  "Restaurant", "Barbershop", "Salon", "Plumber", "Electrician",
  "Auto Repair", "Landscaping", "Bakery", "Florist", "Accountant",
  "Pet Groomer", "Locksmith", "Dry Cleaner", "Contractor",
];

async function searchGooglePlaces(category, area) {
  const { data, error } = await supabase.functions.invoke('places-search', {
    body: { category, area },
  });
  if (error) {
    console.error('Places search error:', error);
    return [];
  }
  return data.businesses || [];
}

async function getAreaSuggestions(input) {
  const { data, error } = await supabase.functions.invoke('places-autocomplete', {
    body: { input },
  });
  if (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
  return data.suggestions || [];
}

function TopNav({ view, setView }) {
  const tabs = [
    { id: "search", label: "Find businesses" },
    { id: "designer", label: "Designer signup" },
  ];
  return (
    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setView(t.id)}
          style={{
            border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            padding: "8px 14px", borderRadius: "7px",
            background: view === t.id ? "#fff" : "transparent",
            color: view === t.id ? NAVY : "#D8E0E7",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function AreaInput({ area, setArea, suggestions, show, setShow }) {
  return (
    <div style={{ position: "relative", flex: "1 1 220px" }}>
      <input
        value={area}
        onChange={e => { setArea(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder="City or area (e.g. Silver Spring, MD)"
        style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}
      />
      {show && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "8px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)", zIndex: 20, overflow: "hidden",
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => { setArea(s); setShow(false); }}
              style={{ padding: "10px 12px", fontSize: "13px", cursor: "pointer", color: INK }}
              onMouseEnter={e => e.currentTarget.style.background = CREAM}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessCard({ biz, onClaim, claimedIds }) {
  const initials = biz.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const isClaimed = claimedIds.has(biz.id);
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: NAVY, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>{initials}</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: INK }}>{biz.name}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: MUTED }}>{biz.category}</p>
          </div>
        </div>
        {!biz.has_website && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#B8460E", background: "#FCEADB", padding: "4px 8px", borderRadius: "999px", whiteSpace: "nowrap" }}>NO WEBSITE</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} color="#9CA3AF" /> {biz.area}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone size={14} color="#9CA3AF" /> {biz.phone}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Star size={14} color={ORANGE} fill={ORANGE} /> {biz.rating} ({biz.reviews} reviews)</div>
      </div>
      {!biz.has_website ? (
        isClaimed ? (
          <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#0F6E56", fontWeight: 600 }}>
            <Check size={14} /> You claimed this lead
          </div>
        ) : (
          <button onClick={() => onClaim(biz)} style={{ marginTop: "4px", background: NAVY, color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            I can build them a site
          </button>
        )
      ) : (
        <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: MUTED }}>
          <ExternalLink size={14} /> Already has a website
        </div>
      )}
    </div>
  );
}

function ClaimedLeadCard({ biz, onReportOutcome }) {
  const initials = biz.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: NAVY, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>{initials}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: INK }}>{biz.name}</h3>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: MUTED }}>{biz.category}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4B5563" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} color="#9CA3AF" /> {biz.area}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone size={14} color="#9CA3AF" /> {biz.phone}</div>
      </div>
      <p style={{ margin: 0, fontSize: "12px", color: MUTED }}>Did you land this client?</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onReportOutcome(biz.id, "won")}
          style={{ flex: 1, background: "#0F6E56", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          Won it
        </button>
        <button
          onClick={() => onReportOutcome(biz.id, "lost")}
          style={{ flex: 1, background: "#fff", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "9px 10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          Didn't work out
        </button>
      </div>
    </div>
  );
}

function ClaimModal({ biz, onClose, onConfirm, isDesigner }) {
  if (!biz) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,40,61,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "420px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 600, color: INK }}>Claim {biz.name}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X size={20} color={MUTED} /></button>
        </div>
        {!isDesigner ? (
          <>
            <p style={{ color: "#4B5563", fontSize: "14px", lineHeight: 1.6, marginTop: "12px" }}>
              You'll need a designer profile to claim leads, so other designers can see it's taken. It only takes a minute.
            </p>
            <button
              onClick={() => onConfirm("signup")}
              style={{ marginTop: "18px", width: "100%", background: NAVY, color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Sign up as a designer
            </button>
          </>
        ) : (
          <>
            <p style={{ color: "#4B5563", fontSize: "14px", lineHeight: 1.6, marginTop: "12px" }}>
              Claiming this lead marks it as taken so no one else pitches {biz.name} at the same time.
            </p>
            <div style={{ background: CREAM, borderRadius: "10px", padding: "14px", marginTop: "16px", fontSize: "13px", color: "#4B5563" }}>
              <strong style={{ color: INK }}>Suggested opener:</strong><br />
              "Hi, I noticed {biz.name} doesn't have a website yet. I help local businesses like yours get found online — would you be open to a quick chat?"
            </div>
            <button
              onClick={() => onConfirm("claim")}
              style={{ marginTop: "18px", width: "100%", background: NAVY, color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Confirm claim
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DesignerAuthForm({ onAuthed }) {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      const userId = data.user?.id;
      if (userId) {
        const { error: profileError } = await supabase.from("designers").insert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          portfolio: portfolio.trim(),
        });
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      onAuthed({ id: userId, name: name.trim(), email: email.trim(), portfolio: portfolio.trim() });
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      const userId = data.user?.id;
      const { data: profile, error: profileError } = await supabase
        .from("designers")
        .select("*")
        .eq("id", userId)
        .single();
      setLoading(false);
      if (profileError) {
        setError("Signed in, but couldn't load your profile.");
        return;
      }
      onAuthed(profile);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "0 auto", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "28px" }}>
      <div style={{ display: "flex", gap: "4px", background: CREAM, padding: "4px", borderRadius: "8px", marginBottom: "20px", width: "fit-content" }}>
        <button
          onClick={() => setMode("signup")}
          style={{ border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: "6px 12px", borderRadius: "6px", background: mode === "signup" ? "#fff" : "transparent", color: INK }}
        >
          Sign up
        </button>
        <button
          onClick={() => setMode("login")}
          style={{ border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: "6px 12px", borderRadius: "6px", background: mode === "login" ? "#fff" : "transparent", color: INK }}
        >
          Log in
        </button>
      </div>
      <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: INK }}>
        {mode === "signup" ? "Sign up as a designer" : "Welcome back"}
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: "13px", color: MUTED }}>
        {mode === "signup" ? "Create a free account to start claiming leads." : "Log in to see your claimed leads."}
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {mode === "signup" && (
          <label style={{ fontSize: "13px", fontWeight: 600, color: INK, display: "flex", flexDirection: "column", gap: "6px" }}>
            Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Lee" style={inputStyle} />
          </label>
        )}
        <label style={{ fontSize: "13px", fontWeight: 600, color: INK, display: "flex", flexDirection: "column", gap: "6px" }}>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan@example.com" style={inputStyle} />
        </label>
        <label style={{ fontSize: "13px", fontWeight: 600, color: INK, display: "flex", flexDirection: "column", gap: "6px" }}>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} />
        </label>
        {mode === "signup" && (
          <label style={{ fontSize: "13px", fontWeight: 600, color: INK, display: "flex", flexDirection: "column", gap: "6px" }}>
            Portfolio link <span style={{ fontWeight: 400, color: MUTED }}>(optional)</span>
            <input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="yourportfolio.com" style={inputStyle} />
          </label>
        )}
        {error && <p style={{ color: "#A32D2D", fontSize: "13px", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: "6px", background: NAVY, color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Please wait..." : mode === "signup" ? "Create profile" : "Log in"}
        </button>
      </form>
    </div>
  );
}

function DesignerDashboard({ designer, results, filters, onClaim, claimedIds, allBusinesses, areaSuggestions, showAreaSuggestions, setShowAreaSuggestions, onReportOutcome }) {
  const { category, setCategory, area, setArea, query, setQuery } = filters;
  const claimedBusinesses = allBusinesses.filter(b => claimedIds.has(b.id));
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        marginBottom: "24px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "14px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: NAVY, color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>
            {designer.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: INK }}>{designer.name}</p>
            <p style={{ margin: 0, fontSize: "13px", color: MUTED }}>{designer.email}</p>
          </div>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
          style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "8px 12px", fontSize: "13px", cursor: "pointer", color: MUTED, whiteSpace: "nowrap" }}
        >
          Log out
        </button>
      </div>
      {claimedBusinesses.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: INK, marginBottom: "10px" }}>Your claimed leads ({claimedBusinesses.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {claimedBusinesses.map(biz => (
              <ClaimedLeadCard key={`claimed-${biz.id}`} biz={biz} onReportOutcome={onReportOutcome} />
            ))}
          </div>
        </div>
      )}
      <h3 style={{ fontSize: "14px", fontWeight: 600, color: INK, marginBottom: "10px" }}>Available leads</h3>
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0 10px" }}>
          <Search size={16} color="#9CA3AF" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search business name or type" style={{ border: "none", outline: "none", padding: "10px 0", fontSize: "14px", flex: 1, background: "transparent" }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          <option value="">Choose a category</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <AreaInput area={area} setArea={setArea} suggestions={areaSuggestions} show={showAreaSuggestions} setShow={setShowAreaSuggestions} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {results.filter(b => !b.has_website && !claimedIds.has(b.id)).map(biz => (
          <BusinessCard key={`available-${biz.id ?? biz.google_place_id}`} biz={biz} onClaim={onClaim} claimedIds={claimedIds} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [view, setView] = useState("search");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [query, setQuery] = useState("");
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(true);
  const [modalBiz, setModalBiz] = useState(null);
  const [designer, setDesigner] = useState(null);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("designers")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (!error && profile) {
          setDesigner(profile);
        }
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if (!designer) return;
    async function fetchClaims() {
      const { data, error } = await supabase
        .from("claims")
        .select("business_id")
        .eq("designer_id", designer.id)
        .eq("status", "pending");
      if (!error && data) {
        setClaimedIds(new Set(data.map(c => c.business_id)));
      }
    }
    fetchClaims();
  }, [designer]);

  useEffect(() => {
    async function fetchBusinesses() {
      const { data, error } = await supabase.from("businesses").select("*");
      if (error) {
        console.error("Error fetching businesses:", error);
      } else {
        setBusinesses(data);
      }
    }
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (category || area) return;
    setGoogleLoading(true);
    searchGooglePlaces("restaurants", "Silver Spring, MD").then(results => {
      const shuffled = [...results].sort(() => Math.random() - 0.5);
      setGoogleResults(shuffled.slice(0, 6));
      setGoogleLoading(false);
    });
  }, [category, area]);

  useEffect(() => {
    if (!category || !area) {
      setGoogleResults([]);
      return;
    }
    setGoogleLoading(true);
    searchGooglePlaces(category, area).then(results => {
      setGoogleResults(results);
      setGoogleLoading(false);
    });
  }, [category, area]);

  useEffect(() => {
    if (!area || area.trim().length < 2) {
      setAreaSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      getAreaSuggestions(area).then(setAreaSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [area]);

  const results = useMemo(() => {
    const source = googleResults.length > 0 ? googleResults : businesses;
    return source.filter(b => {
      if (query && !b.name.toLowerCase().includes(query.toLowerCase()) && !(b.category || "").toLowerCase().includes(query.toLowerCase())) return false;
      if (view === "search" && onlyNoWebsite && b.has_website) return false;
      return true;
    });
  }, [businesses, googleResults, query, onlyNoWebsite, view]);

  const noWebsiteCount = businesses.filter(b => !b.has_website).length;
  const handleClaimClick = (biz) => setModalBiz(biz);

  const handleModalConfirm = async (action) => {
    if (action === "signup") {
      setView("designer");
      setModalBiz(null);
    } else if (action === "claim") {
      let businessId = modalBiz.id;
      if (!businessId && modalBiz.google_place_id) {
        const { data: inserted, error: insertError } = await supabase
          .from("businesses")
          .insert({
            name: modalBiz.name,
            category: modalBiz.category,
            area: modalBiz.area,
            phone: modalBiz.phone || "",
            rating: modalBiz.rating,
            reviews: modalBiz.reviews,
            has_website: modalBiz.has_website,
            google_place_id: modalBiz.google_place_id,
          })
          .select()
          .single();
        if (insertError) {
          alert("Couldn't save this business: " + insertError.message);
          return;
        }
        businessId = inserted.id;
        setBusinesses(prev => [...prev, inserted]);
        setGoogleResults(prev => prev.map(b =>
          b.google_place_id === modalBiz.google_place_id ? { ...b, id: inserted.id } : b
        ));
      }
      const { error } = await supabase.from("claims").insert({
        business_id: businessId,
        designer_id: designer.id,
        status: "pending",
      });
      if (error) {
        alert("Couldn't claim this lead: " + error.message);
        return;
      }
      setClaimedIds(prev => new Set(prev).add(businessId));
      setModalBiz(null);
    }
  };

  const handleReportOutcome = async (businessId, outcome) => {
    const { error: claimError } = await supabase
      .from("claims")
      .update({ status: outcome })
      .eq("business_id", businessId)
      .eq("designer_id", designer.id);

    if (claimError) {
      alert("Couldn't update this lead: " + claimError.message);
      return;
    }

    if (outcome === "won") {
      const { error: bizError } = await supabase
        .from("businesses")
        .update({ has_website: true })
        .eq("id", businessId);

      if (bizError) {
        alert("Claim updated, but couldn't update the business: " + bizError.message);
        return;
      }

      setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, has_website: true } : b));
      setGoogleResults(prev => prev.map(b => b.id === businessId ? { ...b, has_website: true } : b));
    }

    setClaimedIds(prev => {
      const next = new Set(prev);
      next.delete(businessId);
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ background: NAVY, padding: "40px 24px 40px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ marginBottom: "20px" }}>
            <TopNav view={view} setView={setView} />
          </div>
          <p style={{ color: ORANGE, fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
            {noWebsiteCount} businesses nearby are invisible online
          </p>
          <h1 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, margin: "10px 0 12px", lineHeight: 1.15 }}>
            {view === "search" ? <>Find the businesses<br />the internet forgot.</> : <>Turn invisible businesses<br />into your next client.</>}
          </h1>
          <p style={{ color: "#B9C4CE", fontSize: "16px", maxWidth: "540px", lineHeight: 1.6, margin: 0 }}>
            {view === "search"
              ? (category || area
                  ? "Search real businesses with no website. Great local shops that could use a customer boost, and a first client for a designer ready to build one."
                  : "Here are a few nearby businesses that could use a website — search above to narrow it down.")
              : "Sign up, then claim leads before someone else does."}
          </p>
        </div>
      </header>
      <div style={{ maxWidth: "960px", margin: "-24px auto 0", padding: "0 24px 64px" }}>
        {view === "search" ? (
          <>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 8px 24px rgba(18,40,61,0.12)", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "0 10px" }}>
                <Search size={16} color="#9CA3AF" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search business name or type" style={{ border: "none", outline: "none", padding: "10px 0", fontSize: "14px", flex: 1, background: "transparent" }} />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
                <option value="">Choose a category</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <AreaInput area={area} setArea={setArea} suggestions={areaSuggestions} show={showAreaSuggestions} setShow={setShowAreaSuggestions} />
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#4B5563", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={onlyNoWebsite} onChange={e => setOnlyNoWebsite(e.target.checked)} />
                No website only
              </label>
            </div>
            <p style={{ fontSize: "13px", color: MUTED, marginBottom: "16px" }}>
              {googleLoading ? "Searching..." : `${results.length} ${results.length === 1 ? "business" : "businesses"} found`}
            </p>
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
                <p style={{ fontSize: "15px", margin: 0 }}>No matches. Try a different category or area.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {results.map((biz, i) => (
                  <BusinessCard key={biz.id ?? biz.google_place_id ?? i} biz={biz} onClaim={handleClaimClick} claimedIds={claimedIds} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ paddingTop: "8px" }}>
            {!designer ? (
              <DesignerAuthForm onAuthed={(d) => setDesigner(d)} />
            ) : (
              <DesignerDashboard
                designer={designer}
                results={results}
                allBusinesses={businesses}
                filters={{ category, setCategory, area, setArea, query, setQuery }}
                onClaim={handleClaimClick}
                claimedIds={claimedIds}
                areaSuggestions={areaSuggestions}
                showAreaSuggestions={showAreaSuggestions}
                setShowAreaSuggestions={setShowAreaSuggestions}
                onReportOutcome={handleReportOutcome}
              />
            )}
          </div>
        )}
      </div>
      <ClaimModal
        biz={modalBiz}
        onClose={() => setModalBiz(null)}
        onConfirm={handleModalConfirm}
        isDesigner={!!designer}
      />
    </div>
  );
}