import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Trophy,
  Swords,
  Bell,
  Plus,
  X,
  ChevronRight,
  Shield,
  Flame,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  LogOut,
  UserPlus,
  BarChart3,
} from "lucide-react";

/* ============================================================
   MATCHDAY LEDGER — eFootball group stats tracker
   All colors/animations/custom sizes use plain CSS classes
   (prefixed "md-") defined in <GlobalStyle/>, because this
   artifact runtime has no Tailwind JIT compiler — arbitrary
   bracket classes like bg-[#071A14] are silently ignored.
   Only core Tailwind utilities (flex, gap-2, rounded-lg, etc.)
   are used alongside the custom classes.
   ============================================================ */

const FONT_LINK_ID = "matchday-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

function GlobalStyle() {
  return (
    <style>{`
      .font-oswald { font-family: 'Oswald', sans-serif; font-weight: 500; }
      .font-inter { font-family: 'Inter', sans-serif; }

      .md-bg-stadium{ background:#071A14; }
      .md-bg-panel{ background:#0F3D2A; }
      .md-bg-panel-dark{ background:#0B2A1E; }
      .md-bg-panel-dark-40{ background:rgba(11,42,30,0.55); }
      .md-bg-panel-dark-80{ background:rgba(11,42,30,0.88); }
      .md-bg-line{ background:#1C5C3D; }
      .md-bg-amber{ background:#FFB627; }
      .md-bg-amber-10{ background:rgba(255,182,39,0.12); }
      .md-bg-amber-15{ background:rgba(255,182,39,0.16); }
      .md-bg-crimson{ background:#E4572E; }
      .md-bg-crimson-20{ background:rgba(228,87,46,0.22); }

      .md-border{ border-width:1px; border-style:solid; }
      .md-border-line{ border-color:#2E7A52; }
      .md-border-amber-30{ border-color:rgba(255,182,39,0.45); }
      .md-border-crimson-40{ border-color:rgba(228,87,46,0.5); }

      .md-text-bone{ color:#FFFFFF; }
      .md-text-muted{ color:#CBD8D1; }
      .md-text-muted-dim{ color:#9FC2AE; }
      .md-text-amber{ color:#FFC85C; }
      .md-text-crimson{ color:#FF7A57; }
      .md-text-stadium{ color:#071A14; }

      .md-input{ background:#071A14; color:#FFFFFF; border:1px solid #2E7A52; }
      .md-input::placeholder{ color:#7FA08D; }
      .md-input:focus{ outline:none; border-color:#FFC85C; }

      .md-btn-amber{ background:#FFC85C; color:#071A14; transition:filter .15s ease, transform .1s ease; border:none; }
      .md-btn-amber:hover{ filter:brightness(1.08); }
      .md-btn-amber:active{ transform:scale(0.99); }
      .md-btn-amber:disabled{ opacity:.5; }

      .md-icon-btn{ transition:background .15s ease; }
      .md-icon-btn:hover{ background:rgba(46,122,82,0.5); }

      .md-link-amber{ transition:color .15s ease; }
      .md-link-amber:hover{ color:#FFC85C; }

      .md-step-btn{ background:#1C5C3D; color:#FFFFFF; transition:background .15s ease, color .15s ease; border:none; }
      .md-step-btn:hover{ background:#FFC85C; color:#071A14; }
      .md-step-btn-danger{ background:#1C5C3D; color:#FFFFFF; transition:background .15s ease, color .15s ease; border:none; }
      .md-step-btn-danger:hover{ background:#E4572E; color:#FFFFFF; }

      .md-tab{ color:#CBD8D1; background:transparent; transition:background .15s ease, color .15s ease; border:none; }
      .md-tab.active{ background:#FFC85C; color:#071A14; }

      .md-tracking-sm{ letter-spacing:0.2em; }
      .md-tracking-lg{ letter-spacing:0.3em; }

      .md-flip-wrap{ display:inline-block; width:0.62em; height:1.15em; overflow:hidden; position:relative; vertical-align:middle; }

      .md-max-88vw{ max-width:88vw; }
      .md-shadow-dark{ box-shadow:0 25px 50px -12px rgba(0,0,0,0.6); }

      @keyframes mdSlideIn { from { transform: translateX(24px); opacity:0 } to { transform: translateX(0); opacity:1 } }
      @keyframes mdPopIn { from { transform: scale(0.5); opacity:0 } to { transform: scale(1); opacity:1 } }
      @keyframes mdShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      @keyframes mdBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes mdMarquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      @keyframes mdPulse { 0%,100%{opacity:1} 50%{opacity:.5} }

      .md-anim-slideIn{ animation: mdSlideIn 0.35s ease-out; }
      .md-anim-slideInDrawer{ animation: mdSlideIn 0.25s ease-out; }
      .md-anim-popIn{ animation: mdPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .md-anim-shake{ animation: mdShake 0.4s ease; }
      .md-anim-bounce{ animation: mdBounce 0.6s ease; }
      .md-anim-marquee{ animation: mdMarquee 28s linear infinite; }
      .md-anim-pulse{ animation: mdPulse 1.4s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .md-anim-slideIn, .md-anim-slideInDrawer, .md-anim-popIn, .md-anim-shake,
        .md-anim-bounce, .md-anim-marquee, .md-anim-pulse {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `}</style>
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const db = firebaseReady ? getFirestore(initializeApp(firebaseConfig)) : null;

/* ---------------- storage helpers (defensive: shared storage on
   this platform has been flaky, so every call is wrapped and the
   app keeps working in-memory if storage is unavailable) --------- */

async function storageGet(key, shared) {
  try {
    if (!shared) return window.localStorage.getItem(key);
    if (!db) return null;
    const ref = doc(db, "sharedStorage", encodeURIComponent(key));
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().value ?? null : null;
  } catch (e) {
    console.error("storageGet", e);
    return null;
  }
}
async function storageSet(key, value, shared) {
  try {
    if (!shared) {
      window.localStorage.setItem(key, value);
      return true;
    }
    if (!db) return false;
    const ref = doc(db, "sharedStorage", encodeURIComponent(key));
    await setDoc(ref, { value, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.error("storageSet", e);
    return false;
  }
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------------- Flip-scoreboard digit (signature element) ---------------- */

function FlipDigit({ value }) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
        prev.current = value;
      }, 220);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className="md-flip-wrap">
      <span
        className="flex items-center justify-center transition-transform duration-200 ease-in"
        style={{
          position: "absolute",
          inset: 0,
          transform: flipping ? "translateY(-100%)" : "translateY(0)",
          opacity: flipping ? 0 : 1,
        }}
      >
        {display}
      </span>
    </span>
  );
}

function FlipScore({ n, className = "" }) {
  const digits = String(n).split("");
  return (
    <span className={`font-oswald tabular-nums inline-flex ${className}`}>
      {digits.map((d, i) => (
        <FlipDigit key={i} value={d} />
      ))}
    </span>
  );
}

/* ---------------- Toast / activity notification ---------------- */

function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="pointer-events-auto w-80 md-max-88vw md-bg-panel md-border md-border-line rounded-lg md-shadow-dark px-4 py-3 flex items-start gap-3 md-anim-slideIn">
      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full md-bg-amber-15 flex items-center justify-center">
        <Bell size={16} className="md-text-amber" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-sm font-semibold md-text-bone leading-snug">{toast.title}</p>
        <p className="font-inter text-sm md-text-muted leading-snug mt-0.5">{toast.body}</p>
      </div>
      <button onClick={onClose} className="md-text-muted md-link-amber shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

/* ---------------- Result badge (win/draw/loss pulse) ---------------- */

function ResultPulse({ result }) {
  const map = {
    win: { cls: "md-text-amber", label: "VITÓRIA", icon: <TrendingUp size={26} />, anim: "md-anim-bounce" },
    draw: { cls: "md-text-muted", label: "EMPATE", icon: <Shield size={26} />, anim: "md-anim-bounce" },
    loss: { cls: "md-text-crimson", label: "DERROTA", icon: <TrendingDown size={26} />, anim: "md-anim-shake" },
  };
  const cfg = map[result];
  return (
    <div className={`flex flex-col items-center justify-center gap-1 md-anim-popIn ${cfg.cls}`}>
      <div className={cfg.anim}>{cfg.icon}</div>
      <span className="font-oswald text-sm md-tracking-sm">{cfg.label}</span>
    </div>
  );
}

/* ---------------- Root App ---------------- */

export default function App() {
  useFonts();

  const [phase, setPhase] = useState("loading"); // loading | join | app
  const [storageOk, setStorageOk] = useState(true);
  const [myName, setMyName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groupData, setGroupData] = useState(null); // { name, players:[{id,name}], matches:[...] }
  const [tab, setTab] = useState("log");
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [feedOpen, setFeedOpen] = useState(false);

  const lastSeenCount = useRef(0);
  const pollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const name = await storageGet("my-name", false);
      const code = await storageGet("my-group", false);
      if (name) setMyName(name);
      if (code) {
        setGroupCode(code);
        const data = await storageGet(`group:${code}`, true);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            setGroupData(parsed);
            lastSeenCount.current = parsed.matches.length;
            setPhase("app");
            setStorageOk(true);
          } catch {
            setPhase("join");
          }
        } else {
          setStorageOk(true);
          setPhase("join");
        }
      } else {
        setPhase("join");
      }
    })();
  }, []);

  useEffect(() => {
    if (phase !== "app" || !groupCode) return;
    pollRef.current = setInterval(async () => {
      const raw = await storageGet(`group:${groupCode}`, true);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.matches.length > lastSeenCount.current) {
          const newOnes = parsed.matches.slice(lastSeenCount.current);
          newOnes.forEach((m) => {
            if (m.recordedBy !== myName) {
              pushToast({
                title: `${m.recordedBy} registrou uma partida`,
                body: `${m.playerA} ${m.scoreA} x ${m.scoreB} ${m.playerB}`,
              });
              setUnread((u) => u + 1);
            }
          });
        }
        lastSeenCount.current = parsed.matches.length;
        setGroupData(parsed);
      } catch {}
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, [phase, groupCode, myName]);

  const pushToast = (t) => {
    const id = genId();
    setToasts((cur) => [...cur, { ...t, id }]);
  };
  const closeToast = (id) => setToasts((cur) => cur.filter((t) => t.id !== id));

  const saveGroup = async (data) => {
    setGroupData(data);
    await storageSet(`group:${groupCode}`, JSON.stringify(data), true);
  };

  const handleCreateGroup = async (name, groupName) => {
    const code = genCode();
    const data = {
      name: groupName || "Meu Grupo",
      players: [{ id: genId(), name }],
      matches: [],
    };
    setMyName(name);
    setGroupCode(code);
    await storageSet("my-name", name, false);
    await storageSet("my-group", code, false);
    await storageSet(`group:${code}`, JSON.stringify(data), true);
    setGroupData(data);
    lastSeenCount.current = 0;
    setPhase("app");
  };

  const handleJoinGroup = async (name, code) => {
    const upper = code.trim().toUpperCase();
    const raw = await storageGet(`group:${upper}`, true);
    if (!raw) return { error: "Código não encontrado. Confira e tente novamente." };
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return { error: "Não foi possível ler os dados do grupo." };
    }
    if (!data.players.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
      data.players.push({ id: genId(), name });
      await storageSet(`group:${upper}`, JSON.stringify(data), true);
    }
    setMyName(name);
    setGroupCode(upper);
    await storageSet("my-name", name, false);
    await storageSet("my-group", upper, false);
    setGroupData(data);
    lastSeenCount.current = data.matches.length;
    setPhase("app");
    return { ok: true };
  };

  const handleLeaveGroup = async () => {
    await storageSet("my-group", "", false);
    setGroupData(null);
    setGroupCode("");
    setPhase("join");
  };

  return (
    <>
      <GlobalStyle />

      {phase === "loading" && (
        <div className="min-h-screen md-bg-stadium flex items-center justify-center">
          <div className="font-oswald md-text-amber md-tracking-lg text-sm md-anim-pulse">CARREGANDO…</div>
        </div>
      )}

      {phase === "join" && (
        <JoinScreen defaultName={myName} onCreate={handleCreateGroup} onJoin={handleJoinGroup} />
      )}

      {phase === "app" && (
        <div className="min-h-screen md-bg-stadium font-inter md-text-bone">
          {!storageOk && (
            <div className="md-bg-crimson-20 border-b md-border-crimson-40 md-text-bone text-xs font-inter px-4 py-2 text-center">
              Armazenamento indisponível no momento — trabalhando localmente nesta sessão.
            </div>
          )}

          <Header
            groupName={groupData?.name}
            groupCode={groupCode}
            unread={unread}
            onBell={() => {
              setFeedOpen((v) => !v);
              setUnread(0);
            }}
            onLeave={handleLeaveGroup}
          />

          <Ticker matches={groupData?.matches || []} />

          {feedOpen && (
            <ActivityFeed matches={groupData?.matches || []} onClose={() => setFeedOpen(false)} />
          )}

          <Tabs tab={tab} setTab={setTab} />

          <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
            {tab === "log" && (
              <LogMatch
                players={groupData?.players || []}
                myName={myName}
                onAddPlayer={async (name) => {
                  const data = { ...groupData, players: [...groupData.players, { id: genId(), name }] };
                  await saveGroup(data);
                }}
                onSubmit={async (match) => {
                  const entry = { id: genId(), ...match, recordedBy: myName, ts: Date.now() };
                  const data = { ...groupData, matches: [...groupData.matches, entry] };
                  lastSeenCount.current = data.matches.length;
                  await saveGroup(data);
                }}
              />
            )}
            {tab === "standings" && (
              <Standings players={groupData?.players || []} matches={groupData?.matches || []} />
            )}
            {tab === "h2h" && (
              <HeadToHead players={groupData?.players || []} matches={groupData?.matches || []} />
            )}
          </main>

          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
              <Toast key={t.id} toast={t} onClose={() => closeToast(t.id)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Join / Create screen ---------------- */

function JoinScreen({ defaultName, onCreate, onJoin }) {
  useFonts();
  const [mode, setMode] = useState("join");
  const [name, setName] = useState(defaultName || "");
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Digite seu nome.");
    setBusy(true);
    if (mode === "create") {
      await onCreate(name.trim(), groupName.trim());
    } else {
      if (!code.trim()) {
        setBusy(false);
        return setError("Digite o código do grupo.");
      }
      const res = await onJoin(name.trim(), code.trim());
      if (res?.error) {
        setError(res.error);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen md-bg-stadium font-inter md-text-bone flex items-center justify-center px-4">
      <GlobalStyle />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full md-bg-amber-10 md-border md-border-amber-30 mb-3">
            <Trophy size={26} className="md-text-amber" />
          </div>
          <h1 className="font-oswald text-3xl md-tracking-sm md-text-bone">MATCHDAY LEDGER</h1>
          <p className="md-text-muted text-sm mt-1">Placar do grupo de eFootball</p>
        </div>

        <div className="flex md-bg-panel rounded-lg p-1 mb-5 md-border md-border-line">
          <button
            onClick={() => setMode("join")}
            className={`md-tab flex-1 py-2 rounded-md font-oswald text-sm tracking-wide ${mode === "join" ? "active" : ""}`}
          >
            ENTRAR
          </button>
          <button
            onClick={() => setMode("create")}
            className={`md-tab flex-1 py-2 rounded-md font-oswald text-sm tracking-wide ${mode === "create" ? "active" : ""}`}
          >
            CRIAR GRUPO
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm md-text-muted font-inter">Seu nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Luís"
              className="md-input w-full mt-1 rounded-lg px-3 py-2.5"
            />
          </div>

          {mode === "create" ? (
            <div>
              <label className="text-sm md-text-muted font-inter">Nome do grupo (opcional)</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Liga da Firma"
                className="md-input w-full mt-1 rounded-lg px-3 py-2.5"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm md-text-muted font-inter">Código do grupo</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: 7XQ2M"
                maxLength={5}
                className="md-input w-full mt-1 rounded-lg px-3 py-2.5 md-tracking-lg font-oswald"
              />
            </div>
          )}

          {error && <p className="md-text-crimson text-sm">{error}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="md-btn-amber w-full font-oswald tracking-wide py-3 rounded-lg mt-2 flex items-center justify-center gap-2"
          >
            {mode === "create" ? "CRIAR GRUPO" : "ENTRAR NO GRUPO"}
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="md-text-muted-dim text-xs text-center mt-6 leading-relaxed">
          Qualquer pessoa com o código do grupo pode entrar e registrar partidas. Todos veem os
          mesmos dados em tempo real.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */

function Header({ groupName, groupCode, unread, onBell, onLeave }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <header className="border-b md-border-line md-bg-panel-dark-80 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy size={20} className="md-text-amber shrink-0" />
          <div className="min-w-0">
            <p className="font-oswald text-sm tracking-wide truncate md-text-bone">{groupName || "GRUPO"}</p>
            <button onClick={copy} className="md-link-amber flex items-center gap-1 text-xs md-text-muted">
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span className="font-oswald md-tracking-sm">{groupCode}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onBell} className="md-icon-btn relative p-2 rounded-full">
            <Bell size={18} className="md-text-bone" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 md-bg-crimson rounded-full" />
            )}
          </button>
          <button onClick={onLeave} className="md-icon-btn p-2 rounded-full">
            <LogOut size={16} className="md-text-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Ticker (scrolling recent results) ---------------- */

function Ticker({ matches }) {
  if (!matches.length) return null;
  const recent = matches.slice(-10).reverse();
  const items = [...recent, ...recent];
  return (
    <div className="md-bg-panel border-b md-border-line overflow-hidden py-1.5">
      <div className="flex gap-8 whitespace-nowrap md-anim-marquee" style={{ width: "max-content" }}>
        {items.map((m, i) => (
          <span key={i} className="font-oswald text-sm tracking-wide md-text-muted">
            {m.playerA} <span className="md-text-amber">{m.scoreA}-{m.scoreB}</span> {m.playerB}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Activity feed drawer ---------------- */

function ActivityFeed({ matches, onClose }) {
  const list = [...matches].reverse();
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-80 md-max-88vw md-bg-panel-dark h-full overflow-y-auto p-4 md-anim-slideInDrawer md-border-line" style={{ borderLeftWidth: 1, borderLeftStyle: "solid" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-oswald text-lg tracking-wide md-text-bone">ATIVIDADE</h3>
          <button onClick={onClose}><X size={18} className="md-text-muted" /></button>
        </div>
        {list.length === 0 && <p className="md-text-muted text-sm">Nenhuma partida registrada ainda.</p>}
        <div className="space-y-2">
          {list.map((m) => (
            <div key={m.id} className="md-bg-panel md-border md-border-line rounded-lg px-3 py-2">
              <p className="font-oswald text-sm md-text-bone">
                {m.playerA} <span className="md-text-amber">{m.scoreA}-{m.scoreB}</span> {m.playerB}
              </p>
              <p className="text-xs md-text-muted mt-0.5">
                registrado por {m.recordedBy} · {new Date(m.ts).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function Tabs({ tab, setTab }) {
  const items = [
    { id: "log", label: "Registrar", icon: <Plus size={15} /> },
    { id: "standings", label: "Classificação", icon: <BarChart3 size={15} /> },
    { id: "h2h", label: "Confronto", icon: <Swords size={15} /> },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="flex md-bg-panel md-border md-border-line rounded-lg p-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`md-tab flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-oswald text-xs tracking-wide ${tab === it.id ? "active" : ""}`}
          >
            {it.icon}
            {it.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Log Match ---------------- */

function LogMatch({ players, myName, onAddPlayer, onSubmit }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [sa, setSa] = useState(0);
  const [sb, setSb] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!a && players.length) {
      const mine = players.find((p) => p.name === myName);
      setA(mine ? mine.name : players[0]?.name || "");
    }
  }, [players, myName]);

  const options = players.map((p) => p.name);
  const canSubmit = a && b && a !== b;

  const submit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    await onSubmit({ playerA: a, playerB: b, scoreA: sa, scoreB: sb });
    const res = sa > sb ? "win" : sa < sb ? "loss" : "draw";
    setResult(res);
    setTimeout(() => {
      setResult(null);
      setSa(0);
      setSb(0);
      setSaving(false);
    }, 1600);
  };

  return (
    <div className="space-y-5">
      {result && (
        <div className="flex justify-center py-2">
          <ResultPulse result={result} />
        </div>
      )}

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-oswald text-sm tracking-wide md-text-muted">NOVA PARTIDA</h3>
          <button onClick={() => setShowAdd((v) => !v)} className="md-link-amber md-text-amber flex items-center gap-1 text-sm">
            <UserPlus size={13} /> Adicionar jogador
          </button>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-4">
            <input
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              placeholder="Nome do jogador"
              className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={async () => {
                if (!newPlayer.trim()) return;
                await onAddPlayer(newPlayer.trim());
                setNewPlayer("");
                setShowAdd(false);
              }}
              className="md-btn-amber px-3 rounded-lg font-oswald text-xs"
            >
              OK
            </button>
          </div>
        )}

        {players.length < 2 ? (
          <p className="md-text-muted text-sm">Adicione pelo menos 2 jogadores para registrar uma partida.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PlayerSelect label="Jogador A" value={a} onChange={setA} options={options} />
              <PlayerSelect label="Jogador B" value={b} onChange={setB} options={options} />
            </div>

            <div className="flex items-center justify-center gap-6 md-bg-stadium rounded-xl py-6 md-border md-border-line">
              <ScoreStepper value={sa} onChange={setSa} />
              <span className="font-oswald text-2xl md-text-muted-dim">×</span>
              <ScoreStepper value={sb} onChange={setSb} />
            </div>

            {a && b && a === b && (
              <p className="md-text-crimson text-sm mt-2 text-center">Escolha dois jogadores diferentes.</p>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit || saving}
              className="md-btn-amber w-full mt-4 font-oswald tracking-wide py-3 rounded-lg"
            >
              {saving ? "REGISTRANDO…" : "REGISTRAR RESULTADO"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PlayerSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm md-text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="md-input w-full mt-1 rounded-lg px-2 py-2 text-sm"
      >
        <option value="">Selecionar</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreStepper({ value, onChange }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onChange(value + 1)}
        className="md-step-btn w-9 h-9 rounded-full font-oswald text-lg leading-none"
      >
        +
      </button>
      <FlipScore n={value} className="text-4xl md-text-amber" />
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="md-step-btn-danger w-9 h-9 rounded-full font-oswald text-lg leading-none"
      >
        −
      </button>
    </div>
  );
}

/* ---------------- Stats computation ---------------- */

function computeStats(players, matches) {
  const stats = {};
  players.forEach((p) => {
    stats[p.name] = {
      name: p.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      points: 0,
      biggestWinMargin: 0,
      biggestWinLabel: "",
    };
  });
  matches.forEach((m) => {
    const A = stats[m.playerA];
    const B = stats[m.playerB];
    if (!A || !B) return;
    A.played++;
    B.played++;
    A.gf += m.scoreA;
    A.ga += m.scoreB;
    B.gf += m.scoreB;
    B.ga += m.scoreA;
    if (m.scoreA > m.scoreB) {
      A.wins++;
      A.points += 3;
      B.losses++;
      const margin = m.scoreA - m.scoreB;
      if (margin > A.biggestWinMargin) {
        A.biggestWinMargin = margin;
        A.biggestWinLabel = `${m.scoreA}-${m.scoreB} vs ${m.playerB}`;
      }
    } else if (m.scoreB > m.scoreA) {
      B.wins++;
      B.points += 3;
      A.losses++;
      const margin = m.scoreB - m.scoreA;
      if (margin > B.biggestWinMargin) {
        B.biggestWinMargin = margin;
        B.biggestWinLabel = `${m.scoreB}-${m.scoreA} vs ${m.playerA}`;
      }
    } else {
      A.draws++;
      B.draws++;
      A.points += 1;
      B.points += 1;
    }
  });
  return Object.values(stats);
}

/* ---------------- Standings ---------------- */

function Standings({ players, matches }) {
  const stats = computeStats(players, matches);
  const byPoints = [...stats].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
  const mostLosses = [...stats].sort((a, b) => b.losses - a.losses)[0];
  const mostWins = [...stats].sort((a, b) => b.wins - a.wins)[0];
  const biggestRout = [...stats].sort((a, b) => b.biggestWinMargin - a.biggestWinMargin)[0];

  if (!players.length) {
    return <p className="md-text-muted text-sm text-center py-10">Sem jogadores no grupo ainda.</p>;
  }
  if (!matches.length) {
    return <p className="md-text-muted text-sm text-center py-10">Nenhuma partida registrada ainda.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Trophy size={16} />} label="Mais vitórias" value={mostWins?.name} sub={`${mostWins?.wins} vitórias`} cls="md-text-amber" />
        <StatCard icon={<TrendingDown size={16} />} label="Mais derrotas" value={mostLosses?.name} sub={`${mostLosses?.losses} derrotas`} cls="md-text-crimson" />
        <StatCard icon={<Flame size={16} />} label="Maior goleada" value={biggestRout?.name} sub={biggestRout?.biggestWinLabel || "—"} cls="md-text-amber" />
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs md-text-muted font-oswald tracking-wide border-b md-border-line">
              <th className="text-left px-3 py-2">JOGADOR</th>
              <th className="px-1.5 py-2">J</th>
              <th className="px-1.5 py-2">V</th>
              <th className="px-1.5 py-2">E</th>
              <th className="px-1.5 py-2">D</th>
              <th className="px-1.5 py-2">SG</th>
              <th className="px-2 py-2">PTS</th>
            </tr>
          </thead>
          <tbody>
            {byPoints.map((p, i) => (
              <tr key={p.name} className={i % 2 === 0 ? "md-bg-panel-dark-40" : ""}>
                <td className="px-3 py-2 font-inter font-medium md-text-bone flex items-center gap-2">
                  <span className="md-text-muted-dim font-oswald w-4">{i + 1}</span>
                  {p.name}
                </td>
                <td className="text-center px-1.5 md-text-muted">{p.played}</td>
                <td className="text-center px-1.5 md-text-amber">{p.wins}</td>
                <td className="text-center px-1.5 md-text-muted">{p.draws}</td>
                <td className="text-center px-1.5 md-text-crimson">{p.losses}</td>
                <td className="text-center px-1.5 md-text-muted">{p.gf - p.ga > 0 ? `+${p.gf - p.ga}` : p.gf - p.ga}</td>
                <td className="text-center px-2 font-oswald md-text-bone">{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs md-text-muted-dim text-center">V = 3 pts · E = 1 pt · D = 0 pts</p>
    </div>
  );
}

function StatCard({ icon, label, value, sub, cls }) {
  return (
    <div className="md-bg-panel md-border md-border-line rounded-xl p-3 flex flex-col gap-1">
      <div className={`flex items-center gap-1.5 ${cls}`}>
        {icon}
        <span className="text-xs font-oswald tracking-wide md-text-muted">{label.toUpperCase()}</span>
      </div>
      <p className="font-oswald text-sm truncate md-text-bone">{value || "—"}</p>
      <p className="text-xs md-text-muted truncate">{sub}</p>
    </div>
  );
}

/* ---------------- Head to Head ---------------- */

function HeadToHead({ players, matches }) {
  const [pa, setPa] = useState("");
  const [pb, setPb] = useState("");
  const options = players.map((p) => p.name);

  useEffect(() => {
    if (!pa && options[0]) setPa(options[0]);
    if (!pb && options[1]) setPb(options[1]);
  }, [options.length]);

  const relevant = matches.filter(
    (m) => (m.playerA === pa && m.playerB === pb) || (m.playerA === pb && m.playerB === pa)
  );

  let aw = 0,
    bw = 0,
    dr = 0;
  relevant.forEach((m) => {
    const aScore = m.playerA === pa ? m.scoreA : m.scoreB;
    const bScore = m.playerA === pa ? m.scoreB : m.scoreA;
    if (aScore > bScore) aw++;
    else if (bScore > aScore) bw++;
    else dr++;
  });

  if (players.length < 2) {
    return <p className="md-text-muted text-sm text-center py-10">Adicione pelo menos 2 jogadores.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <PlayerSelect label="Jogador A" value={pa} onChange={setPa} options={options} />
        <PlayerSelect label="Jogador B" value={pb} onChange={setPb} options={options} />
      </div>

      {pa && pb && pa !== pb && (
        <>
          <div className="flex items-center justify-around md-bg-panel md-border md-border-line rounded-xl py-6">
            <div className="text-center">
              <p className="font-oswald text-3xl md-text-amber">{aw}</p>
              <p className="text-sm md-text-muted mt-1">{pa}</p>
            </div>
            <div className="text-center">
              <p className="font-oswald text-3xl md-text-muted">{dr}</p>
              <p className="text-sm md-text-muted mt-1">empates</p>
            </div>
            <div className="text-center">
              <p className="font-oswald text-3xl md-text-crimson">{bw}</p>
              <p className="text-sm md-text-muted mt-1">{pb}</p>
            </div>
          </div>

          <div className="space-y-2">
            {[...relevant].reverse().map((m) => (
              <div key={m.id} className="md-bg-panel md-border md-border-line rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="font-oswald text-sm md-text-bone">
                  {m.playerA} <span className="md-text-amber">{m.scoreA}-{m.scoreB}</span> {m.playerB}
                </span>
                <span className="text-xs md-text-muted-dim">{new Date(m.ts).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
            {relevant.length === 0 && (
              <p className="md-text-muted text-sm text-center py-6">Ainda não há partidas entre eles.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
