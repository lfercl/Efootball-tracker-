import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";;
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
  Users,
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
      @keyframes mdGoalShot { 0% { transform: translateX(-180px) translateY(0px) scale(0.55); opacity:0; } 12% { opacity:1; } 45% { transform: translateX(60px) translateY(-80px) scale(1.25); } 80% { transform: translateX(170px) translateY(24px) scale(1.08); opacity:1; } 100% { transform: translateX(240px) translateY(10px) scale(1.02); opacity:0; } }
      @keyframes mdGoalBurst { 0% { transform: scale(0.45); opacity:0; } 30% { transform: scale(1.25); opacity:1; } 70% { transform: scale(1.7); opacity:1; } 100% { transform: scale(2.3); opacity:0; } }
      @keyframes mdGoalGlow { 0% { transform: scale(0.4); opacity:0; } 30% { transform: scale(1.1); opacity:1; } 70% { transform: scale(1.55); opacity:1; } 100% { transform: scale(2.1); opacity:0; } }
      @keyframes mdGoalText { 0% { transform: translateY(6px) scale(0.9); opacity:0; } 35% { opacity:1; } 100% { transform: translateY(-12px) scale(1.05); opacity:0; } }
      @keyframes mdResultRise { 0% { transform: translateY(20px) scale(0.9); opacity:0; } 100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes mdCardPop { 0% { transform: translateY(14px) scale(0.95); opacity:0; } 60% { transform: translateY(-2px) scale(1.02); opacity:1; } 100% { transform: translateY(0) scale(1); opacity:1; } }

      .md-anim-slideIn{ animation: mdSlideIn 0.35s ease-out; }
      .md-anim-slideInDrawer{ animation: mdSlideIn 0.25s ease-out; }
      .md-anim-popIn{ animation: mdPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .md-anim-shake{ animation: mdShake 0.4s ease; }
      .md-anim-bounce{ animation: mdBounce 0.6s ease; }
      .md-anim-marquee{ animation: mdMarquee 28s linear infinite; }
      .md-anim-pulse{ animation: mdPulse 1.4s ease-in-out infinite; }
      .md-anim-goal-shot{ animation: mdGoalShot 1.2s ease-in-out forwards; }
      .md-anim-goal-burst{ animation: mdGoalBurst 0.9s ease-out forwards; }
      .md-anim-goal-glow{ animation: mdGoalGlow 0.9s ease-out forwards; }
      .md-anim-goal-text{ animation: mdGoalText 0.95s ease-out forwards; }
      .md-anim-result-rise{ animation: mdResultRise 0.45s ease-out forwards; }
      .md-anim-card-pop{ animation: mdCardPop 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
      .md-result-stage{ min-height: 24rem; padding: 1.75rem 0; }

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

const env = ((import.meta as unknown) as { env: Record<string, string | undefined> }).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

console.log("API KEY LIDA:", firebaseConfig.apiKey);

const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

const firebaseApp = firebaseReady
  ? initializeApp(firebaseConfig)
  : null;

const db = firebaseApp
  ? getFirestore(firebaseApp)
  : null;

const auth = firebaseApp
  ? getAuth(firebaseApp)
  : null;

const ADMIN_UID = "jFgg40d4ZggGiDishehR9Kfj10K2";

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

function ResultPulse({ result, winner, loser }) {
  const map = {
    win: { cls: "md-text-amber", label: "VITÓRIA", icon: <TrendingUp size={26} />, anim: "md-anim-bounce" },
    draw: { cls: "md-text-muted", label: "EMPATE", icon: <Shield size={26} />, anim: "md-anim-bounce" },
    loss: { cls: "md-text-crimson", label: "DERROTA", icon: <TrendingDown size={26} />, anim: "md-anim-shake" },
  };
  const cfg = map[result];

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-3 md-anim-popIn ${cfg.cls}`}>
      <div className="md-result-stage relative flex items-center justify-center w-full overflow-visible">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-56 w-56 rounded-full border-[10px] border-amber-200/70 md-anim-goal-glow" />
          <div className="absolute h-44 w-44 rounded-full border-[8px] border-amber-300/80 md-anim-goal-glow" style={{ animationDelay: "0.08s" }} />
          <div className="md-anim-goal-burst rounded-full w-32 h-32 md-bg-amber" style={{ boxShadow: "0 0 64px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md-anim-goal-shot z-20">
          <div className="w-16 h-16 rounded-full md-bg-amber border-4 border-white" style={{ boxShadow: "0 0 42px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute top-8 md-anim-goal-text font-oswald text-[18px] md-tracking-lg md-text-amber drop-shadow-[0_0_12px_rgba(255,182,39,0.95)]">GOOOL!</div>
        <div className={`md-anim-result-rise flex flex-col items-center gap-2 z-30 ${cfg.cls}`}>
          <div className={`${cfg.anim} p-5 rounded-full md-bg-panel-dark-80 border border-white/15 shadow-[0_0_30px_rgba(0,0,0,0.4)]`}>{cfg.icon}</div>
          <span className="font-oswald text-lg md-tracking-sm">{cfg.label}</span>
        </div>
      </div>

      {result === "win" && winner && (
        <div className="md-anim-card-pop rounded-xl border border-amber-300/40 md-bg-amber-15 px-4 py-2 text-center">
          <p className="font-oswald text-sm md-text-amber">{winner}</p>
          <p className="text-xs md-text-muted">venceu a partida</p>
        </div>
      )}

      {result === "loss" && loser && (
        <div className="md-anim-card-pop rounded-xl border border-crimson-400/40 md-bg-crimson-20 px-4 py-2 text-center">
          <p className="font-oswald text-sm md-text-crimson">{loser}</p>
          <p className="text-xs md-text-muted">perdeu a partida</p>
        </div>
      )}
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

  const normalizeName = (value) => (value || "").trim().toLowerCase();

  const isDuplicatePlayerName = (players, candidate) =>
    players.some((p) => normalizeName(p.name) === normalizeName(candidate));

  const handleCreateGroup = async (name, groupName) => {
    const trimmedName = name.trim();
    const code = genCode();
    const data = {
      name: groupName || "Meu Grupo",
      players: [{ id: genId(), name: trimmedName }],
      matches: [],
    };
    setMyName(trimmedName);
    setGroupCode(code);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-group", code, false);
    await storageSet(`group:${code}`, JSON.stringify(data), true);
    setGroupData(data);
    lastSeenCount.current = 0;
    setPhase("app");
  };

  const handleJoinGroup = async (name, code) => {
    const trimmedName = name.trim();
    const upper = code.trim().toUpperCase();
    const raw = await storageGet(`group:${upper}`, true);
    if (!raw) return { error: "Código não encontrado. Confira e tente novamente." };
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return { error: "Não foi possível ler os dados do grupo." };
    }

    const existingPlayer = data.players.find(
      (p) => normalizeName(p.name) === normalizeName(trimmedName)
    );

    if (existingPlayer) {
      setMyName(existingPlayer.name);
      setGroupCode(upper);
      await storageSet("my-name", existingPlayer.name, false);
      await storageSet("my-group", upper, false);
      setGroupData(data);
      lastSeenCount.current = data.matches.length;
      setPhase("app");
      return { ok: true };
    }

    data.players.push({ id: genId(), name: trimmedName });
    await storageSet(`group:${upper}`, JSON.stringify(data), true);
    setMyName(trimmedName);
    setGroupCode(upper);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-group", upper, false);
    setGroupData(data);
    lastSeenCount.current = data.matches.length;
    setPhase("app");
    return { ok: true };
  };

  const handleAddPlayer = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Digite um nome para o jogador." };
    if (isDuplicatePlayerName(groupData?.players || [], trimmed)) {
      return { error: `O nome "${trimmed}" já existe no grupo.` };
    }

    const data = {
      ...groupData,
      players: [...(groupData?.players || []), { id: genId(), name: trimmed }],
    };
    await saveGroup(data);
    return { ok: true };
  };

  const handleDeletePlayer = async (playerName) => {
    const trimmed = playerName.trim();
    if (!trimmed) return;

    const confirmed = window.confirm(`Tem certeza que deseja apagar ${trimmed}?`);
    if (!confirmed) return;

    const nextPlayers = (groupData?.players || []).filter(
      (p) => normalizeName(p.name) !== normalizeName(trimmed)
    );
    const nextMatches = (groupData?.matches || []).filter(
      (m) => normalizeName(m.playerA) !== normalizeName(trimmed) && normalizeName(m.playerB) !== normalizeName(trimmed)
    );

    const data = {
      ...groupData,
      players: nextPlayers,
      matches: nextMatches,
    };

    await saveGroup(data);
  };

  const handleDeleteMatch = async (matchId) => {
    const confirmed = window.confirm("Tem certeza que deseja apagar esta partida?");
    if (!confirmed) return;

    const nextMatches = (groupData?.matches || []).filter((m) => m.id !== matchId);
    const data = {
      ...groupData,
      matches: nextMatches,
    };
    await saveGroup(data);
  };

  const handleEditMatch = async (matchId, updatedMatch) => {
    const nextMatches = (groupData?.matches || []).map((m) => (m.id === matchId ? { ...m, ...updatedMatch } : m));
    const data = {
      ...groupData,
      matches: nextMatches,
    };
    await saveGroup(data);
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
                onAddPlayer={handleAddPlayer}
                onDeletePlayer={handleDeletePlayer}
                onSubmit={async (match) => {
                  const entry = { id: genId(), ...match, recordedBy: myName, ts: Date.now() };
                  const data = { ...groupData, matches: [...groupData.matches, entry] };
                  lastSeenCount.current = data.matches.length;
                  await saveGroup(data);
                }}
              />
            )}
            {tab === "users" && (
              <UserManagement
                players={groupData?.players || []}
                onAddPlayer={handleAddPlayer}
                onDeletePlayer={handleDeletePlayer}
              />
            )}
            {tab === "results" && (
              <ResultsManagement
                players={groupData?.players || []}
                matches={groupData?.matches || []}
                onDeleteMatch={handleDeleteMatch}
                onEditMatch={handleEditMatch}
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
    { id: "results", label: "Resultados", icon: <Trophy size={15} /> },
    { id: "users", label: "Usuários", icon: <Users size={15} /> },
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

/* ---------------- User Management ---------------- */

function UserManagement({ players, onAddPlayer, onDeletePlayer }) {
  const [newPlayer, setNewPlayer] = useState("");
  const [error, setError] = useState("");

  const addPlayer = async () => {
    setError("");
    const res = await onAddPlayer(newPlayer);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setNewPlayer("");
  };

  return (
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">GERENCIAR USUÁRIOS</h3>
        <p className="text-sm md-text-muted mb-3">Adicione ou remova participantes do grupo a qualquer momento.</p>

        <div className="flex gap-2">
          <input
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Nome do usuário"
            className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={addPlayer} className="md-btn-amber px-3 rounded-lg font-oswald text-xs">
            ADICIONAR
          </button>
        </div>
        {error && <p className="md-text-crimson text-sm mt-2">{error}</p>}
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">USUÁRIOS DO GRUPO</h3>
        <div className="space-y-2">
          {players.length === 0 && <p className="md-text-muted text-sm">Nenhum usuário cadastrado ainda.</p>}
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-lg px-3 py-2 md-bg-panel-dark-40">
              <span>{player.name}</span>
              <button type="button" onClick={() => onDeletePlayer(player.name)} className="text-red-400 font-bold text-sm">
                APAGAR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Results Management ---------------- */

function ResultsManagement({ players, matches, onDeleteMatch, onEditMatch }) {
  const [editingId, setEditingId] = useState(null);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const startEdit = (match) => {
    setEditingId(match.id);
    setPlayerA(match.playerA);
    setPlayerB(match.playerB);
    setScoreA(match.scoreA);
    setScoreB(match.scoreB);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await onEditMatch(editingId, { playerA, playerB, scoreA, scoreB });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">RESULTADOS DO GRUPO</h3>
        <div className="space-y-2">
          {matches.length === 0 && <p className="md-text-muted text-sm">Nenhuma partida registrada ainda.</p>}
          {[...matches].reverse().map((match) => (
            <div key={match.id} className="rounded-lg px-3 py-3 md-bg-panel-dark-40 space-y-2">
              {editingId === match.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select value={playerA} onChange={(e) => setPlayerA(e.target.value)} className="md-input rounded-lg px-2 py-2 text-sm">
                      <option value="">Selecionar</option>
                      {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    <select value={playerB} onChange={(e) => setPlayerB(e.target.value)} className="md-input rounded-lg px-2 py-2 text-sm">
                      <option value="">Selecionar</option>
                      {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(Number(e.target.value))} className="md-input w-16 rounded-lg px-2 py-2 text-center" />
                    <span className="md-text-muted">×</span>
                    <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(Number(e.target.value))} className="md-input w-16 rounded-lg px-2 py-2 text-center" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="md-btn-amber flex-1 rounded-lg py-2 text-xs font-oswald">SALVAR</button>
                    <button onClick={() => setEditingId(null)} className="md-step-btn-danger flex-1 rounded-lg py-2 text-xs font-oswald">CANCELAR</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-oswald text-sm md-text-bone">
                      {match.playerA} <span className="md-text-amber">{match.scoreA}-{match.scoreB}</span> {match.playerB}
                    </span>
                    <span className="text-xs md-text-muted-dim">{new Date(match.ts).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(match)} className="md-btn-amber flex-1 rounded-lg py-2 text-xs font-oswald">EDITAR</button>
                    <button onClick={() => onDeleteMatch(match.id)} className="md-step-btn-danger flex-1 rounded-lg py-2 text-xs font-oswald">APAGAR</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Log Match ---------------- */

function LogMatch({ players, myName, onAddPlayer, onDeletePlayer, onSubmit }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [sa, setSa] = useState(0);
  const [sb, setSb] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [addError, setAddError] = useState("");
  const [result, setResult] = useState(null);
  const [winnerName, setWinnerName] = useState("");
  const [loserName, setLoserName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!a && players.length) {
      const mine = players.find((p) => p.name === myName);
      setA(mine ? mine.name : players[0]?.name || "");
    }
  }, [players, myName, a]);

  const options = players.map((p) => p.name);
  const canSubmit = a && b && a !== b;

  const submit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    await onSubmit({ playerA: a, playerB: b, scoreA: sa, scoreB: sb });
    const res = sa > sb ? "win" : sa < sb ? "loss" : "draw";
    setResult(res);
    setWinnerName(res === "win" ? a : res === "loss" ? b : "");
    setLoserName(res === "loss" ? a : res === "win" ? b : "");
    setTimeout(() => {
      setResult(null);
      setWinnerName("");
      setLoserName("");
      setSa(0);
      setSb(0);
      setSaving(false);
    }, 1800);
  };

  const addPlayer = async () => {
    setAddError("");
    const res = await onAddPlayer(newPlayer);
    if (res?.error) {
      setAddError(res.error);
      return;
    }
    setNewPlayer("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      {result && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 pointer-events-none">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/35 p-6 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <ResultPulse result={result} winner={winnerName} loser={loserName} />
          </div>
        </div>
      )}

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">JOGADORES</h3>

        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-lg px-3 py-2 md-bg-panel-dark-40">
              <span>{player.name}</span>
              <button type="button" onClick={() => onDeletePlayer(player.name)} className="text-red-400 font-bold text-sm">
                APAGAR
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-oswald text-sm tracking-wide md-text-muted">NOVA PARTIDA</h3>
          <button onClick={() => setShowAdd((v) => !v)} className="md-link-amber md-text-amber flex items-center gap-1 text-sm">
            <UserPlus size={13} /> Adicionar jogador
          </button>
        </div>

        {showAdd && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                placeholder="Nome do jogador"
                className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={addPlayer} className="md-btn-amber px-3 rounded-lg font-oswald text-xs">
                OK
              </button>
            </div>
            {addError && <p className="md-text-crimson text-sm mt-2">{addError}</p>}
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
  const stats: Record<string, {
    name: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
    points: number;
    biggestWinMargin: number;
    biggestWinLabel: string;
  }> = {};

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

/* ---------------- Standings ---------------- */

function Standings({ players, matches }) {
  const stats = computeStats(players, matches).sort(
    (a, b) => b.points - a.points || b.wins - a.wins || b.gf - a.gf
  );

  const trophyStyles = [
    { color: "text-amber-300", glow: "shadow-[0_0_18px_rgba(255,198,92,0.35)]", label: "OURO" },
    { color: "text-slate-300", glow: "shadow-[0_0_18px_rgba(203,213,225,0.25)]", label: "PRATA" },
    { color: "text-orange-300", glow: "shadow-[0_0_18px_rgba(253,186,116,0.25)]", label: "BRONZE" },
    { color: "text-fuchsia-300", glow: "shadow-[0_0_18px_rgba(216,180,254,0.25)]", label: "ROXO" },
  ];

  if (!players.length) {
    return <p className="md-text-muted text-sm text-center py-10">Adicione jogadores para ver a classificação.</p>;
  }

  return (
    <div className="space-y-3">
      {stats.map((entry, index) => {
        const trophy = trophyStyles[index] || trophyStyles[3];
        return (
          <div key={entry.name} className="md-bg-panel md-border md-border-line rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${trophy.color} ${trophy.glow}`}>
                <Trophy size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-oswald text-sm md-text-amber">#{index + 1}</span>
                  <span className="font-oswald text-base md-text-bone">{entry.name}</span>
                </div>
                <p className="text-xs md-text-muted mt-1">{entry.played} partidas • {entry.points} pts</p>
              </div>
            </div>
            <div className="text-right text-xs md-text-muted">
              <p>V {entry.wins} • E {entry.draws} • D {entry.losses}</p>
              <p>GF {entry.gf} • GA {entry.ga}</p>
              <p className={`mt-1 font-oswald tracking-wide ${trophy.color}`}>{trophy.label}</p>
            </div>
          </div>
        );
      })}
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
