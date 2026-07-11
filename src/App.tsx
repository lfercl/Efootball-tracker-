import React, { useState, useEffect, useRef, useMemo } from "react";
import { initializeApp } from "firebase/app";

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

// Color settings panel (placed at module end so it can use helpers)
function ColorSettings({ open, onClose, myName = "", myEmblemId = "", onSaveMyEmblem }) {
  const [vals, setVals] = useState({
    "md-bg-stadium": "#071A14",
    "md-bg-panel": "#0F3D2A",
    "md-bg-panel-dark": "#0B2A1E",
    "md-bg-amber": "#FFB627",
    "md-bg-crimson": "#E4572E",
    "md-text-bone": "#FFFFFF",
    "md-text-amber": "#FFC85C",
    "md-text-crimson": "#FF7A57",
    "md-border-line": "#2E7A52",
  });
  const [selectedEmblem, setSelectedEmblem] = useState(myEmblemId || "");

  const PRESETS = {
    "Padrão": {
      "md-bg-stadium": "#071A14",
      "md-bg-panel": "#0F3D2A",
      "md-bg-panel-dark": "#0B2A1E",
      "md-bg-amber": "#FFB627",
      "md-bg-crimson": "#E4572E",
      "md-text-bone": "#FFFFFF",
      "md-text-amber": "#FFC85C",
      "md-text-crimson": "#FF7A57",
      "md-border-line": "#2E7A52",
    },
    "Escuro": {
      "md-bg-stadium": "#05060A",
      "md-bg-panel": "#0A1B2B",
      "md-bg-panel-dark": "#041018",
      "md-bg-amber": "#FFB627",
      "md-bg-crimson": "#D94A3A",
      "md-text-bone": "#E7EEF6",
      "md-text-amber": "#FFD98B",
      "md-text-crimson": "#FF8A72",
      "md-border-line": "#184E3A",
    },
    "Claro": {
      "md-bg-stadium": "#F7FAFC",
      "md-bg-panel": "#FFFFFF",
      "md-bg-panel-dark": "#F1F5F9",
      "md-bg-amber": "#FFB627",
      "md-bg-crimson": "#E4572E",
      "md-text-bone": "#071A14",
      "md-text-amber": "#B86A00",
      "md-text-crimson": "#9B2B1A",
      "md-border-line": "#CBD5C4",
    },
    "Azul": {
      "md-bg-stadium": "#001427",
      "md-bg-panel": "#022F44",
      "md-bg-panel-dark": "#01202A",
      "md-bg-amber": "#3FB0FF",
      "md-bg-crimson": "#FF6B6B",
      "md-text-bone": "#E6F7FF",
      "md-text-amber": "#9EE6FF",
      "md-text-crimson": "#FFDADA",
      "md-border-line": "#1E6F8F",
    },
    "Floresta": {
      "md-bg-stadium": "#071A14",
      "md-bg-panel": "#0A3220",
      "md-bg-panel-dark": "#062916",
      "md-bg-amber": "#9BD58B",
      "md-bg-crimson": "#E4572E",
      "md-text-bone": "#ECF7EE",
      "md-text-amber": "#BCE7A8",
      "md-text-crimson": "#FFBC9A",
      "md-border-line": "#325D44",
    },
    "Roxo": {
      "md-bg-stadium": "#120622",
      "md-bg-panel": "#2A1640",
      "md-bg-panel-dark": "#191025",
      "md-bg-amber": "#C084FC",
      "md-bg-crimson": "#FB7185",
      "md-text-bone": "#F8F6FF",
      "md-text-amber": "#E9D5FF",
      "md-text-crimson": "#FFCCD5",
      "md-border-line": "#5B2E6E",
    },
    "Alto Contraste": {
      "md-bg-stadium": "#000000",
      "md-bg-panel": "#111111",
      "md-bg-panel-dark": "#0B0B0B",
      "md-bg-amber": "#FFFFFF",
      "md-bg-crimson": "#FFFFFF",
      "md-text-bone": "#FFFFFF",
      "md-text-amber": "#FFFFFF",
      "md-text-crimson": "#FFFFFF",
      "md-border-line": "#FFFFFF",
    },
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = await storageGet("theme-colors", false);
        if (raw) {
          setVals(JSON.parse(raw));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setSelectedEmblem(myEmblemId || "");
  }, [myEmblemId, open]);

  const update = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const save = async () => {
    await storageSet("theme-colors", JSON.stringify(vals), false);
    applyTheme(vals);
    onClose();
  };

  const applyPreset = (p) => {
    setVals(p);
    applyTheme(p);
  };

  const reset = () => {
    const def = {
      "md-bg-stadium": "#071A14",
      "md-bg-panel": "#0F3D2A",
      "md-bg-panel-dark": "#0B2A1E",
      "md-bg-amber": "#FFB627",
      "md-bg-crimson": "#E4572E",
      "md-text-bone": "#FFFFFF",
      "md-text-amber": "#FFC85C",
      "md-text-crimson": "#FF7A57",
      "md-border-line": "#2E7A52",
    };
    setVals(def);
    applyTheme(def);
    storageSet("theme-colors", JSON.stringify(def), false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white/5 rounded-xl p-5 md-border md-border-line max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-oswald text-2xl md-text-bone">Configuracoes</h3>
          <div className="flex gap-2">
            <button onClick={reset} className="md-step-btn px-4 py-2 rounded-md text-sm">Reset</button>
            <button onClick={onClose} className="md-step-btn px-4 py-2 rounded-md text-sm">Fechar</button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-black/15 p-3">
          <p className="text-sm md-text-muted mb-2">Emblema do usuario logado</p>
          <p className="text-xs md-text-muted mb-2">Usuario: <span className="font-oswald md-text-bone">{myName || "nao identificado"}</span></p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <EmblemBadge emblemId={selectedEmblem} size={56} />
            <select
              value={selectedEmblem}
              onChange={(e) => setSelectedEmblem(e.target.value)}
              className="md-input flex-1 rounded-lg px-3 py-3 text-base"
              disabled={!myName}
            >
              <option value="">Sem emblema</option>
              {EMBLEM_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSaveMyEmblem?.(selectedEmblem)}
              className="md-btn-amber px-5 py-3 rounded-md text-sm font-oswald"
              disabled={!myName}
            >
              SALVAR
            </button>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm md-text-muted mb-2">Temas prontos</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(PRESETS).map(([name, p]) => (
              <button key={name} onClick={() => applyPreset(p)} className="md-step-btn px-4 py-2 rounded-md text-sm">
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(vals).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <label className="text-sm md-text-muted flex-1 leading-tight">{k}</label>
              <input type="color" value={vals[k]} onChange={(e) => update(k, e.target.value)} />
              <input className="md-input ml-2 px-2 py-2 text-sm" value={vals[k]} onChange={(e) => update(k, e.target.value)} style={{ width: 116 }} />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={save} className="md-btn-amber px-6 py-3 rounded-md text-sm">Salvar</button>
        </div>
      </div>
    </div>
  );
}


interface ImportMeta {
  readonly env: ImportMetaEnv;
}
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Trophy,
  Swords,
  Bell,
  Plus,
  MessageCircle,
  Send,
  X,
  ChevronRight,
  Shield,
  Flame,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  LogOut,
  BarChart3,
  Users,
  Settings,
  CalendarDays,
  MapPin,
  Clock3,
  Star,
  Share2,
  Camera,
  Video,
  Link2,
  ImagePlus,
  Crown,
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
      html { font-size: 18px; }
      .font-oswald { font-family: 'Oswald', sans-serif; font-weight: 500; }
      .font-inter { font-family: 'Inter', sans-serif; }
      .md-ui-boost .text-xs { font-size: 0.86rem !important; }
      .md-ui-boost .text-sm { font-size: 1rem !important; }
      .md-ui-boost .text-base { font-size: 1.12rem !important; }
      .md-ui-boost .text-lg { font-size: 1.3rem !important; }
      .md-ui-boost .text-xl { font-size: 1.5rem !important; }
      .md-ui-boost .text-2xl { font-size: 1.75rem !important; }
      .md-ui-boost .text-3xl { font-size: 2.1rem !important; }
      .md-ui-boost img { image-rendering: auto; }

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
      .md-tabs-row{ overflow-x:visible; }
      .md-tabs-inner{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.35rem; }
      .md-tab-swipe{ min-width:0; }

      @media (min-width: 640px) {
        .md-tabs-row{ overflow-x:auto; scrollbar-width:thin; -webkit-overflow-scrolling:touch; }
        .md-tabs-inner{ display:flex; min-width:max-content; }
        .md-tab-swipe{ min-width:8.2rem; flex:none; }
      }

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
      @keyframes mdFireworkRise { 0% { transform: translateY(90px) scale(0.55); opacity:0; } 20% { opacity:1; } 100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes mdFireworkPop { 0% { transform: scale(0.12); opacity:0; } 18% { opacity:1; } 62% { transform: scale(1.35); opacity:1; } 100% { transform: scale(1.95); opacity:0; } }
      @keyframes mdFireworkSpark { 0% { transform: translate(0, 0) scale(0.2); opacity:0; } 20% { opacity:1; } 100% { transform: var(--spark-transform) scale(1.1); opacity:0; } }
      @keyframes mdFireworkTwinkle { 0%,100% { opacity:0.15; transform: scale(0.9); } 50% { opacity:1; transform: scale(1.15); } }
      @keyframes mdUserBlink { 0%,100% { opacity:0.35; transform: scale(0.98); filter: saturate(0.92); } 50% { opacity:1; transform: scale(1.03); filter: saturate(1.15); } }

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
      .md-anim-firework-rise{ animation: mdFireworkRise 0.8s ease-out forwards; }
      .md-anim-firework-pop{ animation: mdFireworkPop 1s ease-out forwards; }
      .md-anim-firework-spark{ animation: mdFireworkSpark 0.9s ease-out forwards; }
      .md-anim-firework-twinkle{ animation: mdFireworkTwinkle 1.1s ease-in-out infinite; }
      .md-anim-user-blink{ animation: mdUserBlink 1.1s ease-in-out infinite; }
      .md-result-stage{ min-height: 32rem; padding: 2.25rem 0; }

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

// apply theme by injecting CSS variables and override rules (module scope)
function applyTheme(vars) {
  try {
    const root = document.documentElement;
    Object.entries(vars || {}).forEach(([k, v]) => {
      root.style.setProperty(`--${k}`, String(v ?? ""));
    });

    const id = "theme-overrides";
    let el = document.getElementById(id);
    const css = `
      .md-bg-stadium{ background: var(--md-bg-stadium, #071A14) !important; }
      .md-bg-panel{ background: var(--md-bg-panel, #0F3D2A) !important; }
      .md-bg-panel-dark{ background: var(--md-bg-panel-dark, #0B2A1E) !important; }
      .md-bg-amber{ background: var(--md-bg-amber, #FFB627) !important; }
      .md-bg-crimson{ background: var(--md-bg-crimson, #E4572E) !important; }
      .md-text-bone{ color: var(--md-text-bone, #FFFFFF) !important; }
      .md-text-amber{ color: var(--md-text-amber, #FFC85C) !important; }
      .md-text-crimson{ color: var(--md-text-crimson, #FF7A57) !important; }
      .md-border-line{ border-color: var(--md-border-line, #2E7A52) !important; }
    `;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.innerHTML = css;
  } catch (e) {
    console.error("applyTheme", e);
  }
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

const EMBLEM_OPTIONS = [
  { id: "barcelona", label: "Barcelona", url: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg" },
  { id: "real-madrid", label: "Real Madrid", url: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" },
  { id: "arsenal", label: "Arsenal", url: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg" },
  { id: "manchester-city", label: "Manchester City", url: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg" },
  { id: "manchester-united", label: "Manchester United", url: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" },
  { id: "psg", label: "PSG", url: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg" },
  { id: "santos", label: "Santos FC", url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png" },
  { id: "sao-paulo", label: "Sao Paulo FC", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Brasao_do_Sao_Paulo_Futebol_Clube.svg" },
  { id: "flamengo", label: "Flamengo", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Flamengo_braz_logo.svg" },
  { id: "inter-miami", label: "Inter Miami", url: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg" },
  { id: "brasil", label: "Brasil", url: "https://flagcdn.com/w80/br.png" },
  { id: "portugal", label: "Portugal", url: "https://flagcdn.com/w80/pt.png" },
  { id: "mocambique", label: "Mocambique", url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Mozambique.svg" },
  { id: "cabo-verde", label: "Cabo Verde", url: "https://flagcdn.com/w80/cv.png" },
];

const EMBLEM_MAP = EMBLEM_OPTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, { id: string; label: string; url: string }>);

function normalizePlayer(player) {
  return {
    ...player,
    emblemId: typeof player?.emblemId === "string" ? player.emblemId : "",
  };
}

function normalizeGroupData(data) {
  const normalizedMessages = (data?.messages || []).map((message) => {
    if (typeof message === "string") {
      return {
        id: genId(),
        from: "Sistema",
        text: message,
        ts: Date.now(),
        type: "text",
        mediaDataUrl: "",
      };
    }
    return {
      ...message,
      text: typeof message?.text === "string" ? message.text : "",
      type: message?.type === "image" ? "image" : "text",
      mediaDataUrl: typeof message?.mediaDataUrl === "string" ? message.mediaDataUrl : "",
      ts: Number(message?.ts || Date.now()),
    };
  });

  const normalizedMatches = (data?.matches || []).map((match) => ({
    ...match,
    media: Array.isArray(match?.media) ? match.media : [],
    votes: match?.votes && typeof match.votes === "object" ? match.votes : {},
  }));

  return {
    ...data,
    players: (data?.players || []).map(normalizePlayer),
    matches: normalizedMatches,
    messages: normalizedMessages,
    schedules: Array.isArray(data?.schedules) ? data.schedules : [],
    activeLeague:
      data?.activeLeague && typeof data.activeLeague === "object"
        ? {
            ...data.activeLeague,
            mode: data.activeLeague.mode === "time" ? "time" : "games",
            prize: typeof data.activeLeague.prize === "string" ? data.activeLeague.prize : "",
            targetMatches: Number(data.activeLeague.targetMatches || 0),
            targetDateTs: Number(data.activeLeague.targetDateTs || 0),
            startedAt: Number(data.activeLeague.startedAt || Date.now()),
            startMatchCount: Number(data.activeLeague.startMatchCount || 0),
          }
        : null,
    leagueHistory: Array.isArray(data?.leagueHistory) ? data.leagueHistory : [],
  };
}

function sortStandings(stats) {
  return [...stats].sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.wins - a.wins || b.gf - a.gf
  );
}

function getLeagueMatches(matches, league) {
  if (!league) return [];
  const startIndex = Math.max(0, Number(league.startMatchCount || 0));
  return (matches || []).slice(startIndex);
}

function getLeagueCompletionInfo(league, matches) {
  if (!league) return { done: false, reason: "" };
  const leagueMatches = getLeagueMatches(matches, league);
  if (league.mode === "games") {
    const target = Math.max(1, Number(league.targetMatches || 0));
    return {
      done: leagueMatches.length >= target,
      reason: `${leagueMatches.length}/${target} jogos`,
    };
  }

  const endTs = Number(league.targetDateTs || 0);
  return {
    done: endTs > 0 && Date.now() >= endTs,
    reason: endTs > 0 ? new Date(endTs).toLocaleString("pt-BR") : "",
  };
}

function formatSeasonName(ts = Date.now()) {
  const d = new Date(ts);
  const mm = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  return `Temporada ${mm}/${d.getFullYear()}`;
}

function estimateChampionProbabilities(players, matches, activeLeague) {
  if (!activeLeague || !players?.length) return [];

  const leagueMatches = getLeagueMatches(matches || [], activeLeague);
  const baseStats = computeStats(players, leagueMatches);
  const baseByName = Object.fromEntries(baseStats.map((s) => [s.name, s]));

  let remaining = 0;
  if (activeLeague.mode === "games") {
    remaining = Math.max(0, Number(activeLeague.targetMatches || 0) - leagueMatches.length);
  } else {
    const elapsed = Math.max(1, Date.now() - Number(activeLeague.startedAt || Date.now()));
    const total = Math.max(elapsed, Number(activeLeague.targetDateTs || 0) - Number(activeLeague.startedAt || Date.now()));
    const rate = leagueMatches.length / elapsed;
    remaining = Math.max(0, Math.round(rate * Math.max(0, total - elapsed)));
  }

  if (remaining === 0) {
    const finalTable = sortStandings(baseStats);
    return finalTable.map((entry, idx) => ({
      name: entry.name,
      prob: idx === 0 ? 100 : 0,
    }));
  }

  const strength = Object.fromEntries(
    baseStats.map((s) => {
      const ppg = s.played > 0 ? s.points / s.played : 1;
      const goalFactor = s.played > 0 ? (s.gf - s.ga) / s.played : 0;
      return [s.name, Math.max(0.35, ppg + goalFactor * 0.08)];
    })
  );

  const iterations = 240;
  const winners = Object.fromEntries(players.map((p) => [p.name, 0]));
  const names = players.map((p) => p.name);

  for (let run = 0; run < iterations; run++) {
    const simTable = Object.fromEntries(
      Object.entries(baseByName).map(([name, row]) => [
        name,
        {
          ...row,
          points: Number(row.points || 0),
          wins: Number(row.wins || 0),
          draws: Number(row.draws || 0),
          losses: Number(row.losses || 0),
          played: Number(row.played || 0),
          gf: Number(row.gf || 0),
          ga: Number(row.ga || 0),
          goalDiff: Number(row.goalDiff || 0),
          efficiency: Number(row.efficiency || 0),
        },
      ])
    );

    for (let m = 0; m < remaining; m++) {
      const aIdx = Math.floor(Math.random() * names.length);
      let bIdx = Math.floor(Math.random() * names.length);
      while (bIdx === aIdx) bIdx = Math.floor(Math.random() * names.length);
      const a = names[aIdx];
      const b = names[bIdx];

      const sa = strength[a] || 1;
      const sb = strength[b] || 1;
      const totalStrength = sa + sb;
      const drawChance = 0.18;
      const aWinChance = (1 - drawChance) * (sa / totalStrength);
      const roll = Math.random();

      simTable[a].played += 1;
      simTable[b].played += 1;

      if (roll < aWinChance) {
        simTable[a].wins += 1;
        simTable[a].points += 3;
      } else if (roll < aWinChance + drawChance) {
        simTable[a].draws += 1;
        simTable[b].draws += 1;
        simTable[a].points += 1;
        simTable[b].points += 1;
      } else {
        simTable[b].wins += 1;
        simTable[b].points += 3;
      }

      const randGoalsA = Math.floor(Math.random() * 4);
      const randGoalsB = Math.floor(Math.random() * 4);
      simTable[a].gf += randGoalsA;
      simTable[a].ga += randGoalsB;
      simTable[b].gf += randGoalsB;
      simTable[b].ga += randGoalsA;
      simTable[a].goalDiff = simTable[a].gf - simTable[a].ga;
      simTable[b].goalDiff = simTable[b].gf - simTable[b].ga;
      simTable[a].efficiency = simTable[a].played > 0 ? Math.round((simTable[a].points / (simTable[a].played * 3)) * 100) : 0;
      simTable[b].efficiency = simTable[b].played > 0 ? Math.round((simTable[b].points / (simTable[b].played * 3)) * 100) : 0;
    }

    const champion = sortStandings(Object.values(simTable))[0];
    if (champion?.name) winners[champion.name] += 1;
  }

  return names
    .map((name) => ({
      name,
      prob: Math.round((Number(winners[name] || 0) / iterations) * 100),
    }))
    .sort((a, b) => b.prob - a.prob);
}

function initials(name) {
  const txt = String(name || "").trim();
  if (!txt) return "C";
  return txt
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generateChampionPoster({ leagueName, championName, emblemUrl, achievements = [], points = 0, wins = 0, prize = "" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
  bg.addColorStop(0, "#0B2A1E");
  bg.addColorStop(0.55, "#0F3D2A");
  bg.addColorStop(1, "#071A14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "rgba(255, 182, 39, 0.16)";
  ctx.beginPath();
  ctx.arc(890, 180, 240, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(140, 900, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFC85C";
  ctx.font = "700 42px Oswald, sans-serif";
  ctx.fillText("CAMPEAO DA COMPETICAO", 90, 105);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 64px Oswald, sans-serif";
  ctx.fillText((leagueName || "Liga do Grupo").toUpperCase(), 90, 180);

  const emblemX = 160;
  const emblemY = 330;
  const emblemSize = 190;

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, emblemSize / 2 + 16, 0, Math.PI * 2);
  ctx.fill();

  let emblemDrawn = false;
  if (emblemUrl) {
    try {
      const emblemImg = await loadImage(emblemUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(emblemX, emblemY, emblemSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(emblemImg, emblemX - emblemSize / 2, emblemY - emblemSize / 2, emblemSize, emblemSize);
      ctx.restore();
      emblemDrawn = true;
    } catch {}
  }

  if (!emblemDrawn) {
    ctx.fillStyle = "#1C5C3D";
    ctx.beginPath();
    ctx.arc(emblemX, emblemY, emblemSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFC85C";
    ctx.font = "700 78px Oswald, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(championName), emblemX, emblemY);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 72px Oswald, sans-serif";
  ctx.fillText(championName || "Campeao", 300, 330);

  ctx.fillStyle = "#CBD8D1";
  ctx.font = "500 34px Inter, sans-serif";
  ctx.fillText(`${wins} vitorias • ${points} pontos`, 300, 380);

  if (prize) {
    ctx.fillStyle = "#FFC85C";
    ctx.font = "700 30px Oswald, sans-serif";
    ctx.fillText(`Premio: ${prize}`, 300, 430);
  }

  ctx.fillStyle = "#FFC85C";
  ctx.font = "700 34px Oswald, sans-serif";
  ctx.fillText("CONQUISTAS", 90, 520);

  const list = achievements.length
    ? achievements.slice(0, 5)
    : [{ icon: "🏅", title: "Campanha campea da competicao" }];

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "500 30px Inter, sans-serif";
  list.forEach((item, idx) => {
    const y = 575 + idx * 68;
    ctx.fillText(`${item.icon || "🏅"}  ${item.title}`, 90, y);
  });

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillText(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 90, 1010);
  ctx.fillText("Matchday Ledger", 860, 1010);

  return canvas.toDataURL("image/png");
}

function getEmblemIdByName(players, name) {
  return players.find((p) => p.name === name)?.emblemId || "";
}

function EmblemBadge({ emblemId, size = 32 }) {
  const emblem = EMBLEM_MAP[emblemId];
  if (!emblem) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/15 text-[10px]"
        style={{ width: size, height: size }}
      >
        C
      </span>
    );
  }

  return (
    <img
      src={emblem.url}
      alt={emblem.label}
      width={size}
      height={size}
      className="inline-block rounded-full border border-white/25 bg-white object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function NameWithEmblem({ name, emblemId, size = 32, textClassName = "", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <EmblemBadge emblemId={emblemId} size={size} />
      <span className={textClassName}>{name}</span>
    </span>
  );
}

function buildInviteLink(code) {
  if (!code || typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("group", code);
  return url.toString();
}

function getGroupCacheKey(code) {
  return `group-cache:${String(code || "").toUpperCase()}`;
}

function cacheGroupLocally(code, data) {
  try {
    if (!code || !data || typeof window === "undefined") return;
    window.localStorage.setItem(getGroupCacheKey(code), JSON.stringify(data));
  } catch {}
}

function readCachedGroup(code) {
  try {
    if (!code || typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(getGroupCacheKey(code));
    if (!raw) return null;
    return normalizeGroupData(JSON.parse(raw));
  } catch {
    return null;
  }
}

function hasMeaningfulGroupChange(prev, next) {
  if (!prev) return true;
  if (!next) return false;
  if ((prev.matches || []).length !== (next.matches || []).length) return true;
  if ((prev.messages || []).length !== (next.messages || []).length) return true;
  if ((prev.schedules || []).length !== (next.schedules || []).length) return true;
  if ((prev.players || []).length !== (next.players || []).length) return true;
  if ((prev.leagueHistory || []).length !== (next.leagueHistory || []).length) return true;
  if ((prev.activeLeague?.id || "") !== (next.activeLeague?.id || "")) return true;
  if ((prev.activeLeague?.targetDateTs || 0) !== (next.activeLeague?.targetDateTs || 0)) return true;

  const prevLastMatch = prev.matches?.[prev.matches.length - 1]?.id || "";
  const nextLastMatch = next.matches?.[next.matches.length - 1]?.id || "";
  if (prevLastMatch !== nextLastMatch) return true;

  const prevLastMsg = prev.messages?.[prev.messages.length - 1]?.id || "";
  const nextLastMsg = next.messages?.[next.messages.length - 1]?.id || "";
  if (prevLastMsg !== nextLastMsg) return true;

  return false;
}

function getMatchWinnerName(match) {
  if (!match) return "";
  if (Number(match.scoreA) > Number(match.scoreB)) return match.playerA;
  if (Number(match.scoreB) > Number(match.scoreA)) return match.playerB;
  return "";
}

function getEffectiveMvpVotes(match) {
  const votes = { ...(match?.votes || {}) };
  const winner = getMatchWinnerName(match);
  if (winner) {
    votes[winner] = Number(votes[winner] || 0) + 1;
  }
  return votes;
}

function computeExtraRankings(players, matches) {
  const scorers = Object.fromEntries(players.map((p) => [p.name, 0]));
  const mvp = Object.fromEntries(players.map((p) => [p.name, 0]));

  matches.forEach((m) => {
    if (scorers[m.playerA] != null) scorers[m.playerA] += Number(m.scoreA || 0);
    if (scorers[m.playerB] != null) scorers[m.playerB] += Number(m.scoreB || 0);
    const effectiveVotes = getEffectiveMvpVotes(m);
    Object.entries(effectiveVotes).forEach(([name, votes]) => {
      if (mvp[name] != null) mvp[name] += Number(votes || 0);
    });
  });

  const topScorers = Object.entries(scorers).sort((a, b) => b[1] - a[1]);
  const topMvp = Object.entries(mvp).sort((a, b) => b[1] - a[1]);

  return { topScorers, topMvp, scorers, mvp };
}

function computeAchievements(players, matches) {
  const out = [];
  const stats = computeStats(players, matches);
  const extras = computeExtraRankings(players, matches);

  // Maior goleada com dono único (se surgir goleada maior, conquista passa automaticamente)
  let topWinMargin = 0;
  let topWinOwner = "";
  let topWinTs = 0;
  matches.forEach((m) => {
    const diff = Math.abs(Number(m.scoreA || 0) - Number(m.scoreB || 0));
    if (diff <= 0) return;
    const winner = getMatchWinnerName(m);
    if (!winner) return;
    if (diff > topWinMargin || (diff === topWinMargin && Number(m.ts || 0) > topWinTs)) {
      topWinMargin = diff;
      topWinOwner = winner;
      topWinTs = Number(m.ts || 0);
    }
  });
  if (topWinMargin > 0 && topWinOwner) {
    out.push({ player: topWinOwner, title: `Maior goleada (${topWinMargin} gols)`, icon: "🏆" });
  }

  // Melhor defesa (menor gols sofridos entre quem já jogou)
  const played = stats.filter((s) => Number(s.played || 0) > 0);
  if (played.length > 0) {
    const bestGa = Math.min(...played.map((s) => Number(s.ga || 0)));
    played
      .filter((s) => Number(s.ga || 0) === bestGa)
      .forEach((s) => {
        out.push({ player: s.name, title: `Melhor defesa (${bestGa} gols sofridos)`, icon: "🛡️" });
      });
  }

  // Artilheiro nato para quem lidera a Bola de Ouro (ranking de gols)
  const bestGoals = Number(extras.topScorers?.[0]?.[1] || 0);
  if (bestGoals > 0) {
    extras.topScorers
      .filter(([, goals]) => Number(goals || 0) === bestGoals)
      .forEach(([name]) => {
        out.push({ player: name, title: "Artilheiro Nato (Bola de Ouro)", icon: "⚽" });
      });
  }

  // Metas de gols: 10 a 100
  const goalMilestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  stats.forEach((s) => {
    goalMilestones.forEach((mark) => {
      if (Number(s.gf || 0) >= mark) {
        out.push({ player: s.name, title: `Atingiu ${mark} gols`, icon: "🏅" });
      }
    });
  });

  return out;
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

const TAB_ORDER = ["log", "agenda", "chat", "results", "competition", "standings", "h2h"];

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

function ResultPulse({ result, winner, loser, fireworks }) {
  const map = {
    win: { cls: "md-text-amber", label: "VITÓRIA", icon: <TrendingUp size={34} />, anim: "md-anim-bounce" },
    draw: { cls: "md-text-muted", label: "EMPATE", icon: <Shield size={34} />, anim: "md-anim-bounce" },
    loss: { cls: "md-text-crimson", label: "DERROTA", icon: <TrendingDown size={34} />, anim: "md-anim-shake" },
  };
  const cfg = map[result];
  const bursts = [
    { left: "10%", top: "20%", color: "#FFB627", delay: "0ms", size: 1.05 },
    { left: "22%", top: "15%", color: "#FFD98B", delay: "130ms", size: 0.9 },
    { left: "36%", top: "30%", color: "#FF7A57", delay: "260ms", size: 1.15 },
    { left: "52%", top: "18%", color: "#9EE6FF", delay: "390ms", size: 0.95 },
    { left: "66%", top: "26%", color: "#FFFFFF", delay: "520ms", size: 1.2 },
    { left: "80%", top: "16%", color: "#BCE7A8", delay: "650ms", size: 1.0 },
    { left: "72%", top: "38%", color: "#FFB627", delay: "780ms", size: 0.85 },
    { left: "44%", top: "42%", color: "#FF8A72", delay: "910ms", size: 1.1 },
  ];
  const sparkOffsets = [
    [0, -78],
    [28, -70],
    [56, -56],
    [70, -22],
    [78, 0],
    [70, 22],
    [56, 56],
    [28, 70],
    [0, 78],
    [-28, 70],
    [-56, 56],
    [-70, 22],
    [-78, 0],
    [-70, -22],
    [-56, -56],
    [-28, -70],
  ];

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-4 md-anim-popIn ${cfg.cls}`}>
      <div className="md-result-stage relative flex items-center justify-center w-full overflow-visible">
        {fireworks && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-70 md-anim-firework-twinkle">
              <div className="absolute left-[12%] top-[14%] h-1.5 w-1.5 rounded-full bg-white" />
              <div className="absolute left-[24%] top-[10%] h-1 w-1 rounded-full bg-amber-200" />
              <div className="absolute left-[38%] top-[18%] h-1.5 w-1.5 rounded-full bg-[#9EE6FF]" />
              <div className="absolute left-[58%] top-[12%] h-1 w-1 rounded-full bg-[#FFD98B]" />
              <div className="absolute left-[74%] top-[18%] h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            {bursts.map((burst, index) => (
              <div
                key={`${burst.left}-${burst.top}-${index}`}
                className="absolute md-anim-firework-rise"
                style={{ left: burst.left, top: burst.top, animationDelay: burst.delay, transform: `scale(${burst.size})` }}
              >
                <div className="relative">
                  <div
                    className="absolute left-1/2 top-1/2 h-28 w-1 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-70"
                    style={{
                      background: `linear-gradient(to top, transparent 10%, ${burst.color} 60%, transparent 100%)`,
                      boxShadow: `0 0 14px ${burst.color}`,
                      transform: "translate(-50%, 8px)",
                    }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full md-anim-firework-pop"
                    style={{ backgroundColor: burst.color, boxShadow: `0 0 20px ${burst.color}` }}
                  />
                  {sparkOffsets.map(([x, y], sparkIndex) => (
                    <span
                      key={sparkIndex}
                      className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full md-anim-firework-spark"
                      style={{
                        ["--spark-transform" as string]: `translate(${x}px, ${y}px)`,
                        backgroundColor: burst.color,
                        boxShadow: `0 0 10px ${burst.color}`,
                        animationDelay: `${index * 110 + sparkIndex * 35}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full border-[12px] border-amber-200/70 md-anim-goal-glow" />
          <div className="absolute h-56 w-56 rounded-full border-[10px] border-amber-300/80 md-anim-goal-glow" style={{ animationDelay: "0.08s" }} />
          <div className="md-anim-goal-burst rounded-full w-40 h-40 md-bg-amber" style={{ boxShadow: "0 0 80px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md-anim-goal-shot z-20">
          <div className="w-20 h-20 rounded-full md-bg-amber border-4 border-white" style={{ boxShadow: "0 0 54px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute top-8 md-anim-goal-text font-oswald text-[22px] md-tracking-lg md-text-amber drop-shadow-[0_0_12px_rgba(255,182,39,0.95)]">GOOOL!</div>
        <div className={`md-anim-result-rise flex flex-col items-center gap-2 z-30 ${cfg.cls}`}>
          <div className={`${cfg.anim} p-7 rounded-full md-bg-panel-dark-80 border border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.45)]`}>{cfg.icon}</div>
          <span className="font-oswald text-2xl md-tracking-sm">{cfg.label}</span>
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
  const [unreadChat, setUnreadChat] = useState(0);
  const [feedOpen, setFeedOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const reminderSentRef = useRef<Record<string, boolean>>({});
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchLockRef = useRef<"none" | "horizontal" | "vertical">("none");

  const lastSeenCount = useRef(0);
  const lastSeenMessages = useRef(0);
  const pollRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const finalizingLeagueRef = useRef(false);

  useEffect(() => {
    (async () => {
      const name = await storageGet("my-name", false);
      const code = await storageGet("my-group", false);
      if (name) setMyName(name);
      if (code) {
        setGroupCode(code);
        const cached = readCachedGroup(code);
        if (cached) {
          setGroupData(cached);
          lastSeenCount.current = cached.matches.length;
          lastSeenMessages.current = cached.messages.length;
          setUnreadChat(0);
          setPhase("app");
          setStorageOk(true);
        }
        const data = await storageGet(`group:${code}`, true);
        if (data) {
          try {
            const parsed = normalizeGroupData(JSON.parse(data));
            setGroupData(parsed);
            cacheGroupLocally(code, parsed);
            lastSeenCount.current = parsed.matches.length;
            lastSeenMessages.current = parsed.messages.length;
            setUnreadChat(0);
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

    // load theme from localStorage
    (async () => {
      try {
        const raw = await storageGet("theme-colors", false);
        if (raw) {
          const parsed = JSON.parse(raw);
          applyTheme(parsed);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.uid === ADMIN_UID);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const last = lastScrollYRef.current;
      if (y > last && y > 90) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      lastScrollYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  

  useEffect(() => {
    if (phase !== "app" || !groupCode) return;
    pollRef.current = setInterval(async () => {
      const raw = await storageGet(`group:${groupCode}`, true);
      if (!raw) return;
      try {
        const parsed = normalizeGroupData(JSON.parse(raw));
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
        if (parsed.messages.length > lastSeenMessages.current) {
          const incoming = parsed.messages.slice(lastSeenMessages.current);
          const fromOthers = incoming.filter((msg) => msg.from !== myName).length;
          if (fromOthers > 0 && tab !== "chat") {
            setUnreadChat((v) => v + fromOthers);
          }
        }
        lastSeenCount.current = parsed.matches.length;
        lastSeenMessages.current = parsed.messages.length;
        setGroupData((prev) => {
          if (!hasMeaningfulGroupChange(prev, parsed)) return prev;
          cacheGroupLocally(groupCode, parsed);
          return parsed;
        });
      } catch {}
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, [phase, groupCode, myName, tab]);

  useEffect(() => {
    if (tab !== "chat") return;
    setUnreadChat(0);
    lastSeenMessages.current = (groupData?.messages || []).length;
  }, [tab, groupData?.messages]);

  useEffect(() => {
    if (phase !== "app") return;
    const upcoming = (groupData?.schedules || []).filter((s) => s?.whenTs && s.whenTs > Date.now());
    if (!upcoming.length) return;
    const next = upcoming.sort((a, b) => a.whenTs - b.whenTs)[0];
    const mins = Math.round((next.whenTs - Date.now()) / 60000);

    if (mins <= 60 && mins >= 0 && !reminderSentRef.current[next.id]) {
      reminderSentRef.current[next.id] = true;
      pushToast({
        title: "Lembrete de partida",
        body: `${next.title || "Próximo jogo"} em ${mins} min • ${next.location || "local não definido"}`,
      });
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Matchday Ledger", {
            body: `${next.title || "Próximo jogo"} em ${mins} min`,
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    }
  }, [groupData?.schedules, phase]);

  const pushToast = (t) => {
    const id = genId();
    setToasts((cur) => [...cur, { ...t, id }]);
  };
  const closeToast = (id) => setToasts((cur) => cur.filter((t) => t.id !== id));

  const saveGroup = async (data) => {
    setGroupData(data);
    cacheGroupLocally(groupCode, data);
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
      players: [{ id: genId(), name: trimmedName, emblemId: "" }],
      matches: [],
      messages: [],
      schedules: [],
      activeLeague: null,
      leagueHistory: [],
    };
    setMyName(trimmedName);
    setGroupCode(code);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-group", code, false);
    await storageSet(`group:${code}`, JSON.stringify(data), true);
    cacheGroupLocally(code, data);
    setGroupData(data);
    lastSeenCount.current = 0;
    lastSeenMessages.current = 0;
    setUnreadChat(0);
    setPhase("app");
  };

  const handleJoinGroup = async (name, code) => {
    const trimmedName = name.trim();
    const upper = code.trim().toUpperCase();
    const raw = await storageGet(`group:${upper}`, true);
    if (!raw) return { error: "Código não encontrado. Confira e tente novamente." };
    let data;
    try {
      data = normalizeGroupData(JSON.parse(raw));
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
      cacheGroupLocally(upper, data);
      setGroupData(data);
      lastSeenCount.current = data.matches.length;
      lastSeenMessages.current = data.messages.length;
      setUnreadChat(0);
      setPhase("app");
      return { ok: true };
    }

    data.players.push({ id: genId(), name: trimmedName, emblemId: "" });
    await storageSet(`group:${upper}`, JSON.stringify(data), true);
    setMyName(trimmedName);
    setGroupCode(upper);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-group", upper, false);
    cacheGroupLocally(upper, data);
    setGroupData(data);
    lastSeenCount.current = data.matches.length;
    lastSeenMessages.current = data.messages.length;
    setUnreadChat(0);
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
      players: [...(groupData?.players || []), { id: genId(), name: trimmed, emblemId: "" }],
    };
    await saveGroup(data);
    return { ok: true };
  };

  const handleSaveMyEmblem = async (emblemId) => {
    if (!myName || !groupData?.players?.length) return;
    const nextPlayers = (groupData.players || []).map((player) => {
      if (normalizeName(player.name) !== normalizeName(myName)) return player;
      return { ...player, emblemId };
    });
    await saveGroup({ ...groupData, players: nextPlayers });
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

  const handleSendMessage = async ({ text = "", mediaDataUrl = "", type = "text" }) => {
    const trimmed = (text || "").trim();
    const hasMedia = Boolean((mediaDataUrl || "").trim());
    if (!trimmed && !hasMedia) return { error: "Digite uma mensagem ou anexe uma imagem/GIF." };
    if (!myName) return { error: "Nome do jogador não encontrado." };

    const entry = {
      id: genId(),
      from: myName,
      text: trimmed,
      ts: Date.now(),
      type: type === "image" ? "image" : "text",
      mediaDataUrl: hasMedia ? mediaDataUrl : "",
    };

    const data = {
      ...groupData,
      messages: [...(groupData?.messages || []), entry],
    };

    await saveGroup(data);
    return { ok: true };
  };

  const handleCreateLeague = async (payload) => {
    if (!groupData || groupData.activeLeague) {
      return { error: "Finalize a competicao atual antes de criar outra." };
    }

    const mode = payload?.mode === "time" ? "time" : "games";
    const targetMatches = Math.max(1, Number(payload?.targetMatches || 0));
    const targetDateTs = Number(payload?.targetDateTs || 0);
    if (mode === "time" && !targetDateTs) {
      return { error: "Defina uma data final valida para a competicao." };
    }

    const league = {
      id: genId(),
      name: (payload?.name || "Nova Liga").trim() || "Nova Liga",
      mode,
      prize: (payload?.prize || "").trim(),
      targetMatches,
      targetDateTs,
      startedAt: Date.now(),
      startMatchCount: (groupData?.matches || []).length,
      createdBy: myName,
    };

    await saveGroup({ ...groupData, activeLeague: league });
    return { ok: true };
  };

  const finalizeLeague = async () => {
    if (finalizingLeagueRef.current) return;
    finalizingLeagueRef.current = true;
    try {
      const league = groupData?.activeLeague;
      if (!league) return;

      const leagueMatches = getLeagueMatches(groupData?.matches || [], league);
      if (!leagueMatches.length) {
        await saveGroup({ ...groupData, activeLeague: null });
        return;
      }

      const standings = sortStandings(computeStats(groupData?.players || [], leagueMatches));
      const champion = standings[0];
      if (!champion) {
        await saveGroup({ ...groupData, activeLeague: null });
        return;
      }

      const championEmblemId = getEmblemIdByName(groupData?.players || [], champion.name);
      const championEmblem = EMBLEM_MAP[championEmblemId];
      const allAchievements = computeAchievements(groupData?.players || [], leagueMatches);
      const championAchievements = allAchievements.filter((item) => item.player === champion.name);
      const posterDataUrl = await generateChampionPoster({
        leagueName: league.name,
        championName: champion.name,
        emblemUrl: championEmblem?.url || "",
        achievements: championAchievements,
        points: champion.points,
        wins: champion.wins,
        prize: league.prize || "",
      });

      const archiveEntry = {
        id: league.id,
        name: league.name,
        mode: league.mode,
        prize: league.prize || "",
        targetMatches: league.targetMatches,
        targetDateTs: league.targetDateTs,
        startedAt: league.startedAt,
        finishedAt: Date.now(),
        matchesCount: leagueMatches.length,
        champion: {
          name: champion.name,
          emblemId: championEmblemId,
          points: champion.points,
          wins: champion.wins,
        },
        achievements: championAchievements,
        posterDataUrl,
        standings,
      };

      await saveGroup({
        ...groupData,
        activeLeague: null,
        leagueHistory: [...(groupData?.leagueHistory || []), archiveEntry],
      });

      pushToast({
        title: "Competicao encerrada",
        body: `${champion.name} e o campeao da ${league.name}`,
      });
    } finally {
      finalizingLeagueRef.current = false;
    }
  };

  useEffect(() => {
    const league = groupData?.activeLeague;
    if (!league) return;
    const completion = getLeagueCompletionInfo(league, groupData?.matches || []);
    if (!completion.done) return;
    finalizeLeague();
  }, [groupData?.activeLeague, groupData?.matches]);

  useEffect(() => {
    const league = groupData?.activeLeague;
    if (!league || league.mode !== "time") return;
    const timer = setInterval(() => {
      const completion = getLeagueCompletionInfo(league, groupData?.matches || []);
      if (completion.done) {
        finalizeLeague();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [groupData?.activeLeague, groupData?.matches]);

  useEffect(() => {
    const hasGroup = Boolean(groupData);
    if (!hasGroup) return;
    const hasActiveLeague = Boolean(groupData?.activeLeague);
    const hasHistory = (groupData?.leagueHistory || []).length > 0;
    if (hasActiveLeague || hasHistory) return;

    const startedAt = Date.now();
    const league = {
      id: genId(),
      name: formatSeasonName(startedAt),
      mode: "time",
      prize: "",
      targetMatches: 0,
      targetDateTs: startedAt + 30 * 24 * 60 * 60 * 1000,
      startedAt,
      startMatchCount: 0,
      createdBy: myName || "Sistema",
    };

    saveGroup({ ...groupData, activeLeague: league });
  }, [groupData, myName]);

  const handleCallPlayer = async (playerName) => {
    const target = (playerName || "").trim();
    if (!target) return;

    const message = encodeURIComponent(`vamos jogar`);
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const handleEditMatch = async (matchId, updatedMatch) => {
    // ensure updated match stores the winner on the left (playerA)
    let { playerA, playerB, scoreA, scoreB } = updatedMatch;
    if (typeof scoreA === 'number' && typeof scoreB === 'number' && scoreB > scoreA) {
      [playerA, playerB] = [playerB, playerA];
      [scoreA, scoreB] = [scoreB, scoreA];
    }
    const norm = {
      ...updatedMatch,
      playerA,
      playerB,
      scoreA,
      scoreB,
      media: Array.isArray(updatedMatch.media) ? updatedMatch.media : [],
      votes: updatedMatch.votes && typeof updatedMatch.votes === "object" ? updatedMatch.votes : {},
    };
    const nextMatches = (groupData?.matches || []).map((m) => (m.id === matchId ? { ...m, ...norm } : m));
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

  const myEmblemId = getEmblemIdByName(groupData?.players || [], myName);
  const inviteLink = buildInviteLink(groupCode);

  const handleTouchStart = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const target = e.target as HTMLElement;
    if (target?.closest?.("input, textarea, select, button, a")) {
      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
      return;
    }
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    touchStartTimeRef.current = Date.now();
    touchLockRef.current = "none";
  };

  const handleTouchMove = (e) => {
    if (!touchStartXRef.current && !touchStartYRef.current) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - touchStartXRef.current);
    const dy = Math.abs(t.clientY - touchStartYRef.current);
    if (touchLockRef.current === "none") {
      if (dx > 10 || dy > 10) {
        touchLockRef.current = dx > dy ? "horizontal" : "vertical";
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current && !touchStartYRef.current) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    const dt = Math.max(1, Date.now() - touchStartTimeRef.current);
    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
    touchStartTimeRef.current = 0;
    const lock = touchLockRef.current;
    touchLockRef.current = "none";

    if (lock === "vertical") return;

    const velocity = Math.abs(dx) / dt;
    const minDx = velocity > 0.45 ? 34 : 56;
    if (Math.abs(dy) > 72 || Math.abs(dx) < minDx) return;
    const currentIndex = TAB_ORDER.indexOf(tab);
    if (currentIndex < 0) return;

    if (dx < 0 && currentIndex < TAB_ORDER.length - 1) {
      setTab(TAB_ORDER[currentIndex + 1]);
      return;
    }
    if (dx > 0 && currentIndex > 0) {
      setTab(TAB_ORDER[currentIndex - 1]);
    }
  };

  const handleAddSchedule = async (payload) => {
    const entry = { id: genId(), ...payload };
    await saveGroup({ ...groupData, schedules: [...(groupData?.schedules || []), entry] });
  };

  const handleDeleteSchedule = async (id) => {
    const next = (groupData?.schedules || []).filter((s) => s.id !== id);
    await saveGroup({ ...groupData, schedules: next });
  };

  const handleVoteMvp = async (matchId, playerName) => {
    const nextMatches = (groupData?.matches || []).map((m) => {
      if (m.id !== matchId) return m;
      if (Number(m.scoreA) === Number(m.scoreB)) return m;
      const votes = { ...(m.votes || {}) };
      votes[playerName] = Number(votes[playerName] || 0) + 1;
      return { ...m, votes };
    });
    await saveGroup({ ...groupData, matches: nextMatches });
  };

  const handleAddMediaToMatch = async (matchId, mediaUrl) => {
    const url = (mediaUrl || "").trim();
    if (!url) return;
    const nextMatches = (groupData?.matches || []).map((m) => {
      if (m.id !== matchId) return m;
      return { ...m, media: [...(m.media || []), url] };
    });
    await saveGroup({ ...groupData, matches: nextMatches });
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
        <JoinScreen defaultName={myName} onCreate={handleCreateGroup} onJoin={handleJoinGroup} isAdmin={isAdmin} />
      )}

      {phase === "app" && (
        <div className="min-h-screen md-bg-stadium font-inter md-text-bone md-ui-boost" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {!storageOk && (
            <div className="md-bg-crimson-20 border-b md-border-crimson-40 md-text-bone text-xs font-inter px-4 py-2 text-center">
              Armazenamento indisponível no momento — trabalhando localmente nesta sessão.
            </div>
          )}

          <Header
            groupName={groupData?.name}
            groupCode={groupCode}
            inviteLink={inviteLink}
            myName={myName}
            myEmblemId={myEmblemId}
            hidden={headerHidden}
            unread={unread}
            onBell={() => {
              setFeedOpen((v) => !v);
              setUnread(0);
            }}
            onThemeToggle={() => setThemeOpen((v) => !v)}
            onLeave={handleLeaveGroup}
          />

          <Ticker matches={groupData?.matches || []} players={groupData?.players || []} />

          {feedOpen && (
            <ActivityFeed matches={groupData?.matches || []} players={groupData?.players || []} onClose={() => setFeedOpen(false)} />
          )}

          <Tabs tab={tab} setTab={setTab} unreadChat={unreadChat} />

          <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
            {tab === "log" && (
              <div className="space-y-6">
                <LogMatch
                  players={groupData?.players || []}
                  matches={groupData?.matches || []}
                  myName={myName}
                  onSubmit={async (match) => {
                    let { playerA, playerB, scoreA, scoreB, photoDataUrl } = match;
                    // normalize so the winner (higher score) is always playerA (left side)
                    if (scoreB > scoreA) {
                      [playerA, playerB] = [playerB, playerA];
                      [scoreA, scoreB] = [scoreB, scoreA];
                    }
                    const entry = {
                      id: genId(),
                      playerA,
                      playerB,
                      scoreA,
                      scoreB,
                      media: photoDataUrl ? [photoDataUrl] : [],
                      votes: {},
                      recordedBy: myName,
                      ts: Date.now(),
                    };
                    const data = { ...groupData, matches: [...groupData.matches, entry] };
                    lastSeenCount.current = data.matches.length;
                    await saveGroup(data);
                  }}
                />
                <UserManagement
                  players={groupData?.players || []}
                  onAddPlayer={handleAddPlayer}
                  onDeletePlayer={handleDeletePlayer}
                  onCallPlayer={handleCallPlayer}
                  isAdmin={isAdmin}
                />
              </div>
            )}
            {tab === "chat" && (
              <ChatRoom
                messages={groupData?.messages || []}
                myName={myName}
                players={groupData?.players || []}
                onSendMessage={handleSendMessage}
              />
            )}
            {tab === "results" && (
              <ResultsManagement
                players={groupData?.players || []}
                matches={groupData?.matches || []}
                onDeleteMatch={handleDeleteMatch}
                onEditMatch={handleEditMatch}
                onVoteMvp={handleVoteMvp}
                onAddMedia={handleAddMediaToMatch}
              />
            )}
            {tab === "competition" && (
              <LeagueManager
                players={groupData?.players || []}
                activeLeague={groupData?.activeLeague || null}
                leagueHistory={groupData?.leagueHistory || []}
                matches={groupData?.matches || []}
                onCreateLeague={handleCreateLeague}
                onFinalizeLeague={finalizeLeague}
              />
            )}
            {tab === "standings" && (
              <Standings
                players={groupData?.players || []}
                matches={groupData?.matches || []}
              />
            )}
            {tab === "h2h" && (
              <HeadToHead players={groupData?.players || []} matches={groupData?.matches || []} />
            )}
            {tab === "agenda" && (
              <ScheduleBoard
                schedules={groupData?.schedules || []}
                onAddSchedule={handleAddSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
            )}
          </main>

          <ColorSettings
            open={themeOpen}
            onClose={() => setThemeOpen(false)}
            myName={myName}
            myEmblemId={myEmblemId}
            onSaveMyEmblem={handleSaveMyEmblem}
          />
          <button
            onClick={() => setThemeOpen(true)}
            className="fixed bottom-5 right-5 z-40 md-btn-amber rounded-full px-4 py-3 font-oswald text-sm shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          >
            <span className="inline-flex items-center gap-2"><Settings size={16} /> Temas</span>
          </button>
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

function JoinScreen({ defaultName, onCreate, onJoin, isAdmin = false }) {
  useFonts();
  const [mode, setMode] = useState("join");
  const [name, setName] = useState(defaultName || "");
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const inviteCode = (params.get("group") || "").trim().toUpperCase();
    if (inviteCode) {
      setCode(inviteCode);
      setMode("join");
    }
  }, []);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Digite seu nome.");
    setBusy(true);
    if (mode === "create") {
      if (!isAdmin) {
        setBusy(false);
        return setError("Apenas o administrador pode criar grupos.");
      }
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
    <div className="min-h-screen md-bg-stadium font-inter md-text-bone md-ui-boost flex items-center justify-center px-4">
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
            disabled={!isAdmin}
            className={`md-tab flex-1 py-2 rounded-md font-oswald text-sm tracking-wide ${mode === "create" ? "active" : ""}`}
          >
            CRIAR GRUPO
          </button>
        </div>

        {!isAdmin && (
          <p className="md-text-muted text-xs mb-4">Somente administrador pode criar grupo neste app.</p>
        )}

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

function Header({ groupName, groupCode, inviteLink = "", myName = "", myEmblemId = "", hidden = false, unread, onBell, onLeave, onThemeToggle }) {
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 1500);
    } catch {}
  };
  return (
    <header className={`border-b md-border-line md-bg-panel-dark-80 sticky top-0 z-40 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 rounded-full border border-amber-200/55 bg-gradient-to-b from-amber-200/20 to-amber-500/10 p-3 shadow-[0_0_24px_rgba(255,182,39,0.45)]">
            <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12 md-text-amber">
              <path
                d="M30 6h4c1 0 2 1 2 2v3h4c1 0 2 1 2 2 0 3-1 6-2 8h3c4 0 7-3 8-7h4c0 7-4 13-11 15-1 3-3 5-5 7v6h6c1 0 2 1 2 2v4H24v-4c0-1 1-2 2-2h6v-6c-2-2-4-4-5-7-7-2-11-8-11-15h4c1 4 4 7 8 7h3c-1-2-2-5-2-8 0-1 1-2 2-2h4V8c0-1 1-2 2-2Zm0 6v2h4v-2h-4Zm-5 8c1 6 3 11 7 15 4-4 6-9 7-15h-14Zm-8 0c-3 0-6-2-7-5 1 4 3 7 7 8v-3Zm26 0v3c4-1 6-4 7-8-1 3-4 5-7 5Z"
                fill="currentColor"
              />
              <path d="M20 48h24v4H20z" fill="currentColor" opacity="0.98" />
              <path d="M23 52h18v4H23z" fill="currentColor" opacity="0.88" />
              <path d="M27 18h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-oswald text-sm tracking-wide truncate md-text-bone">{groupName || "GRUPO"}</p>
            {myName && (
              <div className="mt-1 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/60 bg-amber-400/18 px-4 py-1.5 shadow-[0_0_24px_rgba(255,182,39,0.45)] md-anim-user-blink">
                <span className="text-xs font-oswald tracking-[0.34em] md-text-amber shrink-0">LOGADO</span>
                <NameWithEmblem
                  name={myName}
                  emblemId={myEmblemId}
                  size={40}
                  textClassName="font-oswald text-sm md-text-bone truncate"
                  className="min-w-0"
                />
              </div>
            )}
            <button onClick={copy} className="md-link-amber flex items-center gap-1 text-xs md-text-muted">
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span className="font-oswald md-tracking-sm">{groupCode}</span>
            </button>
            <button onClick={copyInvite} className="md-link-amber flex items-center gap-1 text-xs md-text-muted mt-1">
              {copiedInvite ? <Check size={11} /> : <Link2 size={11} />}
              <span className="font-oswald md-tracking-sm">LINK DE CONVITE</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onThemeToggle} className="md-icon-btn p-2 rounded-full mr-1">
            <Settings size={16} className="md-text-muted" />
          </button>
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

function Ticker({ matches, players }) {
  if (!matches.length) return null;
  const recent = matches.slice(-10).reverse();
  const items = [...recent, ...recent];
  return (
    <div className="md-bg-panel border-b md-border-line overflow-hidden py-1.5">
      <div className="flex gap-8 whitespace-nowrap md-anim-marquee" style={{ width: "max-content" }}>
        {items.map((m, i) => {
          const isDraw = m.scoreA === m.scoreB;
          const winner = isDraw ? m.playerA : (m.scoreA > m.scoreB ? m.playerA : m.playerB);
          const loser = isDraw ? m.playerB : (m.scoreA > m.scoreB ? m.playerB : m.playerA);
          const winnerScore = Math.max(m.scoreA, m.scoreB);
          const loserScore = Math.min(m.scoreA, m.scoreB);
          return (
            <span key={i} className="font-oswald text-sm tracking-wide md-text-muted">
              <NameWithEmblem name={winner} emblemId={getEmblemIdByName(players, winner)} size={34} />
              <span className="md-text-amber ml-1">{winnerScore}-{loserScore}</span>
              <span className="ml-1"><NameWithEmblem name={loser} emblemId={getEmblemIdByName(players, loser)} size={34} /></span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Activity feed drawer ---------------- */

function ActivityFeed({ matches, players, onClose }) {
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
          {list.map((m) => {
            const isDraw = m.scoreA === m.scoreB;
            const winner = isDraw ? m.playerA : (m.scoreA > m.scoreB ? m.playerA : m.playerB);
            const loser = isDraw ? m.playerB : (m.scoreA > m.scoreB ? m.playerB : m.playerA);
            const winnerScore = Math.max(m.scoreA, m.scoreB);
            const loserScore = Math.min(m.scoreA, m.scoreB);
            return (
              <div key={m.id} className="md-bg-panel md-border md-border-line rounded-lg px-3 py-2">
                <p className="font-oswald text-sm md-text-bone">
                  <NameWithEmblem name={winner} emblemId={getEmblemIdByName(players, winner)} size={36} />
                  <span className="md-text-amber mx-1">{winnerScore}-{loserScore}</span>
                  <NameWithEmblem name={loser} emblemId={getEmblemIdByName(players, loser)} size={36} />
                </p>
                <p className="text-xs md-text-muted mt-0.5">
                  registrado por <NameWithEmblem name={m.recordedBy} emblemId={getEmblemIdByName(players, m.recordedBy)} size={28} /> · {new Date(m.ts).toLocaleString("pt-BR")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function Tabs({ tab, setTab, unreadChat = 0 }) {
  const items = [
    { id: "log", label: "Registrar", icon: <Plus size={15} /> },
    { id: "agenda", label: "Agenda", icon: <CalendarDays size={15} /> },
    { id: "chat", label: "Chat", icon: <MessageCircle size={15} /> },
    { id: "results", label: "Resultados", icon: <Trophy size={15} /> },
    { id: "competition", label: "Competicao", icon: <Crown size={15} /> },
    { id: "standings", label: "Classificação", icon: <BarChart3 size={15} /> },
    { id: "h2h", label: "Confronto", icon: <Swords size={15} /> },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="md-tabs-row md-bg-panel md-border md-border-line rounded-lg p-1">
        <div className="md-tabs-inner">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`md-tab md-tab-swipe relative flex items-center justify-center gap-1.5 py-2.5 rounded-md font-oswald text-xs tracking-wide ${tab === it.id ? "active" : ""}`}
          >
            {it.icon}
            {it.label.toUpperCase()}
            {it.id === "chat" && unreadChat > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] leading-5 font-bold">
                {unreadChat > 99 ? "99+" : unreadChat}
              </span>
            )}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- User Management ---------------- */

function UserManagement({ players, onAddPlayer, onDeletePlayer, onCallPlayer, isAdmin }) {
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
              <NameWithEmblem name={player.name} emblemId={player.emblemId} size={38} />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCallPlayer?.(player.name)}
                  className="md-btn-amber px-3 py-1 rounded-lg font-oswald text-xs"
                >
                  CHAMAR
                </button>
                {isAdmin && (
                  <button type="button" onClick={() => onDeletePlayer(player.name)} className="text-red-400 font-bold text-sm">
                    APAGAR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Chat ---------------- */

function ChatRoom({ messages, myName, players, onSendMessage }) {
  const [text, setText] = useState("");
  const [mediaDataUrl, setMediaDataUrl] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pickMedia = () => {
    fileInputRef.current?.click();
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens ou GIFs são permitidos.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setMediaDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError("");
    const trimmed = text.trim();
    const res = await onSendMessage({
      text: trimmed,
      mediaDataUrl,
      type: mediaDataUrl ? "image" : "text",
    });
    if (res?.error) {
      setError(res.error);
      return;
    }
    setText("");
    setMediaDataUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-oswald text-sm tracking-wide md-text-muted">CHAT DO GRUPO</h3>
          <span className="text-xs md-text-muted">Mensagens em tempo real</span>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {messages.length === 0 && <p className="md-text-muted text-sm">Nenhuma mensagem ainda. Comece a conversa.</p>}
          {messages.map((message) => {
            const mine = message.from === myName;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 border ${mine ? "md-bg-amber-15 md-border-line" : "md-bg-panel-dark md-border-line"}`}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <NameWithEmblem
                      name={mine ? "Voce" : message.from}
                      emblemId={mine ? getEmblemIdByName(players, myName) : getEmblemIdByName(players, message.from)}
                      size={32}
                      textClassName="font-oswald text-xs md-text-amber truncate"
                    />
                    <span className="text-[11px] md-text-muted shrink-0">
                      {new Date(message.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm leading-snug whitespace-pre-wrap break-words">{message.text}</p>
                  {message.mediaDataUrl && (
                    <img
                      src={message.mediaDataUrl}
                      alt="Midia enviada no chat"
                      className="mt-2 w-full max-h-72 object-cover rounded-lg border border-white/10"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.gif"
          onChange={handleMediaChange}
          className="hidden"
        />
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit();
            }}
            placeholder="Escreva uma mensagem para o grupo"
            className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={pickMedia} className="md-step-btn px-3 rounded-lg font-oswald text-xs flex items-center gap-1">
            <ImagePlus size={13} /> FOTO/GIF
          </button>
          <button onClick={submit} className="md-btn-amber px-4 rounded-lg font-oswald text-xs flex items-center gap-2">
            <Send size={13} />
            ENVIAR
          </button>
        </div>
        {mediaDataUrl && (
          <div className="mt-2 rounded-lg border border-white/10 bg-black/10 p-2">
            <p className="text-xs md-text-muted mb-2">Prévia da mídia</p>
            <img src={mediaDataUrl} alt="Prévia" className="w-full max-h-56 object-cover rounded-lg" />
          </div>
        )}
        {error && <p className="md-text-crimson text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}

/* ---------------- Results Management ---------------- */

function ResultsManagement({ players, matches, onDeleteMatch, onEditMatch, onVoteMvp, onAddMedia }) {
  const [editingId, setEditingId] = useState(null);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [mediaInputByMatch, setMediaInputByMatch] = useState({});

  const shareMatch = async (match) => {
    const text = `${match.playerA} ${match.scoreA} x ${match.scoreB} ${match.playerB} | Matchday Ledger`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Resultado da partida", text });
        return;
      } catch {}
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

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
                    {(() => {
                      const isDraw = match.scoreA === match.scoreB;
                      const winner = isDraw ? match.playerA : (match.scoreA > match.scoreB ? match.playerA : match.playerB);
                      const loser = isDraw ? match.playerB : (match.scoreA > match.scoreB ? match.playerB : match.playerA);
                      const winnerScore = Math.max(match.scoreA, match.scoreB);
                      const loserScore = Math.min(match.scoreA, match.scoreB);
                      return (
                        <span className="font-oswald text-sm md-text-bone">
                          <NameWithEmblem name={winner} emblemId={getEmblemIdByName(players, winner)} size={36} />
                          <span className="md-text-amber mx-1">{winnerScore}-{loserScore}</span>
                          <NameWithEmblem name={loser} emblemId={getEmblemIdByName(players, loser)} size={36} />
                        </span>
                      );
                    })()}
                    <span className="text-xs md-text-muted-dim">{new Date(match.ts).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 space-y-2">
                    <p className="text-xs md-text-muted font-oswald">MVP DA PARTIDA</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onVoteMvp(match.id, match.playerA)}
                        disabled={match.scoreA === match.scoreB}
                        className="md-step-btn flex-1 rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Star size={12} /> {match.playerA}
                      </button>
                      <button
                        onClick={() => onVoteMvp(match.id, match.playerB)}
                        disabled={match.scoreA === match.scoreB}
                        className="md-step-btn flex-1 rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Star size={12} /> {match.playerB}
                      </button>
                    </div>
                    <p className="text-[11px] md-text-muted">
                      {(() => {
                        const effectiveVotes = getEffectiveMvpVotes(match);
                        return `Votos: ${match.playerA} ${Number(effectiveVotes?.[match.playerA] || 0)} · ${match.playerB} ${Number(effectiveVotes?.[match.playerB] || 0)}`;
                      })()}
                    </p>
                    {match.scoreA === match.scoreB && <p className="text-[11px] md-text-muted">Empate: nenhum voto automático de MVP.</p>}
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 space-y-2">
                    <p className="text-xs md-text-muted font-oswald">MÍDIA PÓS-JOGO</p>
                    <div className="flex gap-2">
                      <input
                        value={mediaInputByMatch[match.id] || ""}
                        onChange={(e) => setMediaInputByMatch((s) => ({ ...s, [match.id]: e.target.value }))}
                        placeholder="Cole o link da foto ou vídeo"
                        className="md-input flex-1 rounded-lg px-2 py-2 text-xs"
                      />
                      <button
                        onClick={() => {
                          onAddMedia(match.id, mediaInputByMatch[match.id] || "");
                          setMediaInputByMatch((s) => ({ ...s, [match.id]: "" }));
                        }}
                        className="md-btn-amber px-3 rounded-lg text-xs"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    {(match.media || []).length > 0 && (
                      <div className="space-y-1">
                        {(match.media || []).map((url, idx) => (
                          <a key={`${match.id}-m-${idx}`} href={url} target="_blank" rel="noreferrer" className="text-xs md-link-amber flex items-center gap-1 break-all">
                            <Video size={12} /> {url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => startEdit(match)} className="md-btn-amber flex-1 rounded-lg py-2 text-xs font-oswald">EDITAR</button>
                    <button onClick={() => shareMatch(match)} className="md-step-btn flex-1 rounded-lg py-2 text-xs font-oswald flex items-center justify-center gap-1">
                      <Share2 size={12} /> PARTILHAR
                    </button>
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

function ScheduleBoard({ schedules, onAddSchedule, onDeleteSchedule }) {
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const addSchedule = async () => {
    setError("");
    if (!when) {
      setError("Defina data e hora da partida.");
      return;
    }
    await onAddSchedule({
      title: title.trim() || "Partida do grupo",
      when,
      whenTs: new Date(when).getTime(),
      location: location.trim() || "Local não definido",
    });
    setTitle("");
    setWhen("");
    setLocation("");
  };

  const ordered = [...(schedules || [])].sort((a, b) => a.whenTs - b.whenTs);

  return (
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">CALENDÁRIO DE JOGOS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ex.: Rodada 5)"
            className="md-input rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="md-input rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Local da partida"
            className="md-input rounded-lg px-3 py-2 text-sm sm:col-span-2"
          />
        </div>
        {error && <p className="md-text-crimson text-sm mt-2">{error}</p>}
        <button onClick={addSchedule} className="md-btn-amber mt-3 px-4 py-2 rounded-lg text-xs font-oswald">
          MARCAR PRÓXIMO JOGO
        </button>
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">PRÓXIMAS PARTIDAS</h3>
        <div className="space-y-2">
          {ordered.length === 0 && <p className="md-text-muted text-sm">Nenhum jogo agendado ainda.</p>}
          {ordered.map((item) => (
            <div key={item.id} className="rounded-lg px-3 py-3 md-bg-panel-dark-40">
              <p className="font-oswald text-sm md-text-bone">{item.title}</p>
              <p className="text-xs md-text-muted mt-1 flex items-center gap-2">
                <Clock3 size={12} /> {new Date(item.whenTs).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs md-text-muted mt-1 flex items-center gap-2">
                <MapPin size={12} /> {item.location}
              </p>
              <button onClick={() => onDeleteSchedule(item.id)} className="md-step-btn-danger mt-2 px-3 py-1 rounded-lg text-xs font-oswald">
                APAGAR AGENDAMENTO
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Log Match ---------------- */

function LogMatch({ players, matches, myName, onSubmit }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [sa, setSa] = useState(0);
  const [sb, setSb] = useState(0);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [result, setResult] = useState(null);
  const [winnerName, setWinnerName] = useState("");
  const [loserName, setLoserName] = useState("");
  const [saving, setSaving] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickPhoto = () => {
    cameraInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!a && players.length) {
      const mine = players.find((p) => p.name === myName);
      setA(mine ? mine.name : players[0]?.name || "");
    }
  }, [players, myName, a]);

  const options = players.map((p) => p.name);
  const rankedPlayers = computeStats(players, matches).sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.wins - a.wins || b.gf - a.gf
  );
  const canSubmit = a && b && a !== b;

  const submit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setFireworks(false);
    await onSubmit({ playerA: a, playerB: b, scoreA: sa, scoreB: sb, photoDataUrl });
    const res = sa > sb ? "win" : sa < sb ? "loss" : "draw";
    setResult(res);
    setWinnerName(res === "win" ? a : res === "loss" ? b : "");
    setLoserName(res === "loss" ? a : res === "win" ? b : "");
    const fireworksTimer = setTimeout(() => setFireworks(true), 650);
    setTimeout(() => {
      setResult(null);
      setWinnerName("");
      setLoserName("");
      setSa(0);
      setSb(0);
      setPhotoDataUrl("");
      setSaving(false);
      setFireworks(false);
      clearTimeout(fireworksTimer);
    }, 3000);
  };

  return (
    <div className="space-y-5">
      {result && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 pointer-events-none">
          <div className="w-full max-w-4xl rounded-[2.25rem] border border-white/10 bg-black/40 p-10 shadow-[0_0_100px_rgba(0,0,0,0.58)] backdrop-blur-sm">
            <ResultPulse result={result} winner={winnerName} loser={loserName} fireworks={fireworks} />
          </div>
        </div>
      )}

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">JOGADORES</h3>

        <div className="space-y-2">
          {rankedPlayers.map((entry, idx) => (
            <div key={entry.name} className="flex items-center justify-between rounded-lg px-3 py-2 md-bg-panel-dark-40">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-oswald text-xs md-text-amber shrink-0">#{idx + 1}</span>
                <NameWithEmblem
                  name={entry.name}
                  emblemId={getEmblemIdByName(players, entry.name)}
                  size={38}
                  className="min-w-0"
                  textClassName="truncate"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-oswald md-text-muted shrink-0">
                <span className="rounded-full border border-white/15 px-2 py-0.5">SG {entry.goalDiff >= 0 ? "+" : ""}{entry.goalDiff}</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5">GP {entry.gf}</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5">AP {entry.efficiency}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-oswald text-sm tracking-wide md-text-muted">NOVA PARTIDA</h3>
        </div>

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

            <div className="mt-3 rounded-lg border border-white/10 bg-black/10 p-3">
              <p className="text-xs md-text-muted mb-2">Foto do placar (opcional)</p>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button type="button" onClick={handlePickPhoto} className="md-btn-amber px-3 py-2 rounded-lg text-xs font-oswald">
                  ANEXAR FOTO
                </button>
                {photoDataUrl && <span className="text-xs md-text-amber">Foto anexada</span>}
              </div>
              {photoDataUrl && (
                <img src={photoDataUrl} alt="Prévia do placar" className="mt-2 w-full max-h-52 object-cover rounded-lg border border-white/10" />
              )}
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

type StandingsEntry = {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  goalDiff: number;
  points: number;
  efficiency: number;
  biggestWinMargin: number;
  biggestWinLabel: string;
};

function computeStats(players, matches) {
  const stats: Record<string, StandingsEntry> = {};

  players.forEach((p) => {
    stats[p.name] = {
      name: p.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      goalDiff: 0,
      points: 0,
      efficiency: 0,
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

  Object.values(stats).forEach((entry) => {
    entry.goalDiff = entry.gf - entry.ga;
    entry.efficiency = entry.played > 0 ? Math.round((entry.points / (entry.played * 3)) * 100) : 0;
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

function LeagueManager({ players, activeLeague, leagueHistory, matches, onCreateLeague, onFinalizeLeague }) {
  const [name, setName] = useState("");
  const [prize, setPrize] = useState("");
  const [mode, setMode] = useState("games");
  const [targetMatches, setTargetMatches] = useState(10);
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  const submitLeague = async () => {
    setError("");
    if (!name.trim()) {
      setError("Defina um nome para a competicao.");
      return;
    }

    const payload = {
      name: name.trim(),
      prize: prize.trim(),
      mode,
      targetMatches: Number(targetMatches || 1),
      targetDateTs: mode === "time" && targetDate ? new Date(targetDate).getTime() : 0,
    };

    if (mode === "time" && !payload.targetDateTs) {
      setError("Selecione data e hora finais.");
      return;
    }

    const res = await onCreateLeague(payload);
    if (res?.error) {
      setError(res.error);
      return;
    }

    setName("");
    setPrize("");
    setTargetDate("");
    setTargetMatches(10);
  };

  const activeMatches = activeLeague ? getLeagueMatches(matches, activeLeague) : [];
  const completion = activeLeague ? getLeagueCompletionInfo(activeLeague, matches) : { done: false, reason: "" };
  const titleOdds = useMemo(() => {
    if (!activeLeague) return [];
    return estimateChampionProbabilities(players || [], matches, activeLeague);
  }, [players, matches, activeLeague]);

  const sharePoster = async (item) => {
    if (!item?.posterDataUrl) return;
    try {
      const response = await fetch(item.posterDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `campeao-${item.id}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Campeao da ${item.name}`,
          text: `${item.champion?.name || "Campeao"} venceu a competicao ${item.name}`,
          files: [file],
        });
        return;
      }
    } catch {}

    try {
      const win = window.open("", "_blank", "noopener,noreferrer");
      if (win) {
        win.document.write(`<img src="${item.posterDataUrl}" alt="Campeao" style="max-width:100%;height:auto;display:block;margin:auto;"/>`);
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">COMPETICAO</h3>

        {!activeLeague ? (
          <div className="space-y-3">
            <p className="text-xs md-text-muted">A primeira competicao e criada automaticamente com os resultados ja cadastrados e dura 30 dias.</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da competicao"
              className="md-input w-full rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="Premio do campeao (ex.: R$ 500 / trofeu)"
              className="md-input w-full rounded-lg px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("games")}
                className={`md-tab rounded-lg py-2 font-oswald text-xs ${mode === "games" ? "active" : ""}`}
              >
                POR JOGOS
              </button>
              <button
                type="button"
                onClick={() => setMode("time")}
                className={`md-tab rounded-lg py-2 font-oswald text-xs ${mode === "time" ? "active" : ""}`}
              >
                POR TEMPO
              </button>
            </div>

            {mode === "games" ? (
              <input
                type="number"
                min="1"
                value={targetMatches}
                onChange={(e) => setTargetMatches(Math.max(1, Number(e.target.value || 1)))}
                className="md-input w-full rounded-lg px-3 py-2 text-sm"
                placeholder="Numero de jogos"
              />
            ) : (
              <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="md-input w-full rounded-lg px-3 py-2 text-sm"
              />
            )}

            {error && <p className="md-text-crimson text-sm">{error}</p>}
            <button onClick={submitLeague} className="md-btn-amber w-full py-2 rounded-lg text-xs font-oswald">
              CRIAR COMPETICAO
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/10 p-3 space-y-2">
            <p className="font-oswald text-sm md-text-amber">{activeLeague.name}</p>
            <p className="text-xs md-text-muted">
              {activeLeague.mode === "games"
                ? `Meta: ${activeMatches.length}/${activeLeague.targetMatches} jogos`
                : `Termina em: ${new Date(activeLeague.targetDateTs).toLocaleString("pt-BR")}`}
            </p>
            <p className="text-xs md-text-muted">Premio: {activeLeague.prize || "A definir"}</p>
            <p className="text-xs md-text-muted">Iniciada em {new Date(activeLeague.startedAt).toLocaleString("pt-BR")}</p>
            {completion.done && <p className="text-xs md-text-amber">Condição de fim atingida: {completion.reason}</p>}
            <button onClick={onFinalizeLeague} className="md-btn-amber w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2">
              <Crown size={13} /> FINALIZAR E GERAR CAMPEAO
            </button>

            <div className="rounded-lg border border-white/10 bg-black/20 p-3 mt-2">
              <p className="text-xs md-text-muted font-oswald mb-2">PROBABILIDADE DE TITULO</p>
              {titleOdds.length === 0 && <p className="text-xs md-text-muted">Registre partidas para calcular as chances.</p>}
              <div className="space-y-2">
                {titleOdds.map((item) => (
                  <div key={`odds-${item.name}`}>
                    <div className="flex items-center justify-between text-xs md-text-muted mb-1">
                      <span>{item.name}</span>
                      <span className="md-text-amber font-oswald">{item.prob}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full md-bg-amber" style={{ width: `${Math.max(2, item.prob)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">HISTORICO DE COMPETICOES</h3>
        {(leagueHistory || []).length === 0 && <p className="text-sm md-text-muted">Nenhuma competicao finalizada ainda.</p>}
        <div className="space-y-3">
          {[...(leagueHistory || [])].reverse().map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-black/10 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-oswald text-sm md-text-bone">{item.name}</p>
                  <p className="text-xs md-text-muted">Encerrada em {new Date(item.finishedAt).toLocaleString("pt-BR")}</p>
                </div>
                <span className="text-[11px] rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-1 md-text-amber">SOMENTE LEITURA</span>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs md-text-muted">Campeao</p>
                <div className="mt-1">
                  <NameWithEmblem
                    name={item.champion?.name || "Campeao"}
                    emblemId={item.champion?.emblemId || ""}
                    size={42}
                    textClassName="font-oswald text-sm md-text-amber"
                  />
                </div>
                <p className="text-xs md-text-muted mt-1">{item.champion?.points || 0} pts • {item.matchesCount || 0} jogos</p>
                <p className="text-xs md-text-muted mt-1">Premio: {item.prize || "Nao informado"}</p>
              </div>

              {item.posterDataUrl && (
                <img src={item.posterDataUrl} alt={`Poster ${item.name}`} className="w-full rounded-lg border border-white/10" />
              )}

              <button onClick={() => sharePoster(item)} className="md-step-btn w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2">
                <Share2 size={12} /> PARTILHAR IMAGEM DO CAMPEAO
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Standings ---------------- */

function Standings({ players, matches }) {
  const stats = sortStandings(computeStats(players, matches));
  const extras = computeExtraRankings(players, matches);
  const achievements = computeAchievements(players, matches);
  const achievementsByPlayer = achievements.reduce((acc, item) => {
    if (!acc[item.player]) acc[item.player] = [];
    acc[item.player].push(item);
    return acc;
  }, {} as Record<string, Array<{ player: string; title: string; icon: string }>>);
  const playersWithAchievements = players
    .map((p) => p.name)
    .filter((name) => Array.isArray(achievementsByPlayer[name]) && achievementsByPlayer[name].length > 0);

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
    <div className="space-y-4">
      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">RANKINGS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
            <p className="text-xs md-text-muted flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]"
              >
                <circle cx="12" cy="12" r="10" fill="#FBBF24" stroke="#FDE68A" strokeWidth="1.2" />
                <polygon points="12,7.5 9.8,9.1 10.6,11.8 13.4,11.8 14.2,9.1" fill="#B45309" />
                <path d="M12 7.5 L12 5.2 M9.8 9.1 L8.1 8 M14.2 9.1 L15.9 8 M10.6 11.8 L9.1 13.8 M13.4 11.8 L14.9 13.8 M9.1 13.8 L7.2 14.2 M14.9 13.8 L16.8 14.2" stroke="#B45309" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M8.5 6.7 C10 5.4 14 5.4 15.5 6.7 M6.8 12 C7.3 10.6 8 9.7 9.1 8.9 M17.2 12 C16.7 10.6 16 9.7 14.9 8.9 M8.8 16.9 C10.4 18.2 13.6 18.2 15.2 16.9" stroke="#D97706" strokeWidth="0.95" fill="none" strokeLinecap="round" />
              </svg>
              Bola de Ouro
            </p>
            {extras.topScorers.slice(0, 3).map(([name, val]) => (
              <p key={`g-${name}`} className="text-sm font-oswald md-text-bone">{name}: <span className="md-text-amber">{val}</span></p>
            ))}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
            <p className="text-xs md-text-muted flex items-center gap-1"><Star size={18} /> MVP (votos)</p>
            {extras.topMvp.slice(0, 3).map(([name, val]) => (
              <p key={`m-${name}`} className="text-sm font-oswald md-text-bone">{name}: <span className="md-text-amber">{val}</span></p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Líder", value: stats[0]?.name || "—", sub: stats[0] ? `${stats[0].points} pts • ${stats[0].goalDiff >= 0 ? "+" : ""}${stats[0].goalDiff} SG` : "Sem dados", icon: <Trophy size={20} />, cls: "md-text-amber" },
          { label: "Melhor ataque", value: [...stats].sort((a, b) => b.gf - a.gf || b.points - a.points)[0]?.name || "—", sub: [...stats].sort((a, b) => b.gf - a.gf || b.points - a.points)[0] ? `${[...stats].sort((a, b) => b.gf - a.gf || b.points - a.points)[0].gf} gols marcados` : "Sem dados", icon: <Flame size={20} />, cls: "md-text-crimson" },
          { label: "Melhor defesa", value: [...stats].filter((entry) => entry.played > 0).sort((a, b) => a.ga - b.ga || b.points - a.points)[0]?.name || "—", sub: [...stats].filter((entry) => entry.played > 0).sort((a, b) => a.ga - b.ga || b.points - a.points)[0] ? `${[...stats].filter((entry) => entry.played > 0).sort((a, b) => a.ga - b.ga || b.points - a.points)[0].ga} gols sofridos` : "Sem jogos", icon: <Shield size={20} />, cls: "md-text-bone" },
          { label: "Mais eficiente", value: [...stats].sort((a, b) => b.efficiency - a.efficiency || b.points - a.points)[0]?.name || "—", sub: [...stats].sort((a, b) => b.efficiency - a.efficiency || b.points - a.points)[0] ? `${[...stats].sort((a, b) => b.efficiency - a.efficiency || b.points - a.points)[0].efficiency}% de aproveitamento` : "Sem dados", icon: <TrendingUp size={20} />, cls: "md-text-amber" },
        ].map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} sub={card.sub} cls={card.cls} />
        ))}
      </div>

      <div className="space-y-3">
        {stats.map((entry, index) => {
          const trophy = trophyStyles[index] || trophyStyles[3];
          const diffPositive = entry.goalDiff >= 0;

          return (
            <div key={entry.name} className="md-bg-panel md-border md-border-line rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`rounded-full p-2 shrink-0 ${trophy.color} ${trophy.glow}`}>
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-oswald text-sm md-text-amber">#{index + 1}</span>
                      <NameWithEmblem
                        name={entry.name}
                        emblemId={getEmblemIdByName(players, entry.name)}
                        size={38}
                        textClassName="font-oswald text-base md-text-bone truncate"
                      />
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-oswald tracking-wide ${index === 0 ? "border-amber-300/30 bg-amber-400/10 md-text-amber" : "border-white/10 md-text-muted"}`}>
                        {index === 0 ? "LÍDER" : trophy.label}
                      </span>
                    </div>
                    <p className="text-xs md-text-muted mt-1">
                      {entry.played} partidas • {entry.points} pts • {entry.efficiency}% de aproveitamento
                    </p>
                    <p className="text-[11px] md-text-muted mt-1">
                      Gols: {extras.scorers[entry.name] || 0} • MVP: {extras.mvp[entry.name] || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs md-text-muted shrink-0">
                  <p className="font-oswald md-text-bone text-sm">{entry.points} pts</p>
                  <p className={`mt-1 font-oswald tracking-wide ${diffPositive ? "md-text-amber" : "md-text-crimson"}`}>
                    {diffPositive ? "+" : ""}{entry.goalDiff}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p className="md-text-muted">Vitórias</p>
                  <p className="font-oswald md-text-amber mt-0.5">{entry.wins}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p className="md-text-muted">Empates</p>
                  <p className="font-oswald md-text-bone mt-0.5">{entry.draws}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p className="md-text-muted">Gols pró/contra</p>
                  <p className="font-oswald md-text-bone mt-0.5">{entry.gf}/{entry.ga}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p className="md-text-muted">Saldo</p>
                  <p className={`font-oswald mt-0.5 ${diffPositive ? "md-text-amber" : "md-text-crimson"}`}>
                    {diffPositive ? "+" : ""}{entry.goalDiff}
                  </p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full md-bg-amber"
                  style={{ width: `${Math.max(8, Math.min(100, entry.efficiency))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="md-bg-panel md-border md-border-line rounded-xl p-4">
        <h3 className="font-oswald text-sm tracking-wide md-text-muted mb-3">CONQUISTAS</h3>
        {achievements.length === 0 && <p className="text-sm md-text-muted">Ainda sem conquistas desbloqueadas.</p>}
        <div className="space-y-3">
          {playersWithAchievements.map((playerName) => (
            <div key={`ach-user-${playerName}`} className="rounded-lg border border-white/10 bg-black/10 px-3 py-3">
              <p className="font-oswald text-sm md-text-amber mb-2">{playerName}</p>
              <div className="space-y-1.5">
                {achievementsByPlayer[playerName].map((item, idx) => (
                  <p key={`ach-${playerName}-${idx}`} className="text-sm md-text-muted">
                    {item.icon} {item.title}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Head to Head ---------------- */

function HeadToHead({ players, matches }) {
  const [expanded, setExpanded] = useState(null);

  if (players.length < 2) {
    return <p className="md-text-muted text-sm text-center py-10">Adicione pelo menos 2 jogadores.</p>;
  }

  return (
    <div className="space-y-3">
      {players.map((player) => {
        const opponents = players.filter((p) => p.name !== player.name);
        return (
          <div key={player.name} className="overflow-hidden rounded-xl md-bg-panel md-border md-border-line">
            <button
              type="button"
              onClick={() => setExpanded(expanded === player.name ? null : player.name)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <NameWithEmblem
                  name={player.name}
                  emblemId={player.emblemId}
                  size={38}
                  textClassName="font-oswald text-sm md-text-bone"
                />
                <p className="text-xs md-text-muted mt-1">Ver todos os confrontos</p>
              </div>
              <span className="text-xs md-text-amber">{expanded === player.name ? "FECHAR" : "ABRIR"}</span>
            </button>

            {expanded === player.name && (
              <div className="border-t border-white/10 p-3 space-y-2">
                <div className="overflow-hidden rounded-lg border border-white/10 md-bg-panel-dark-40">
                  <table className="min-w-full text-sm">
                    <thead className="md-bg-panel-dark-40">
                      <tr>
                        <th className="px-3 py-2 text-left font-oswald tracking-wide md-text-muted">OPONENTE</th>
                        <th className="px-3 py-2 text-center font-oswald tracking-wide md-text-amber">V</th>
                        <th className="px-3 py-2 text-center font-oswald tracking-wide md-text-muted">E</th>
                        <th className="px-3 py-2 text-center font-oswald tracking-wide md-text-crimson">D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opponents.map((opponent) => {
                        const list = matches.filter(
                          (m) =>
                            (m.playerA === player.name && m.playerB === opponent.name) ||
                            (m.playerA === opponent.name && m.playerB === player.name)
                        );
                        const stats = { wins: 0, draws: 0, losses: 0 };
                        list.forEach((m) => {
                          const isPlayerA = m.playerA === player.name;
                          const scoreForPlayer = isPlayerA ? m.scoreA : m.scoreB;
                          const scoreAgainst = isPlayerA ? m.scoreB : m.scoreA;
                          if (scoreForPlayer > scoreAgainst) stats.wins++;
                          else if (scoreForPlayer < scoreAgainst) stats.losses++;
                          else stats.draws++;
                        });

                        return (
                          <tr key={opponent.name} className="border-t border-white/10">
                            <td className="px-3 py-2 font-oswald md-text-bone">
                              <NameWithEmblem name={opponent.name} emblemId={opponent.emblemId} size={34} />
                            </td>
                            <td className="px-3 py-2 text-center font-oswald md-text-amber">{stats.wins}</td>
                            <td className="px-3 py-2 text-center font-oswald md-text-muted">{stats.draws}</td>
                            <td className="px-3 py-2 text-center font-oswald md-text-crimson">{stats.losses}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {opponents.map((opponent) => {
                  const list = matches.filter(
                    (m) =>
                      (m.playerA === player.name && m.playerB === opponent.name) ||
                      (m.playerA === opponent.name && m.playerB === player.name)
                  );
                  const stats = { wins: 0, draws: 0, losses: 0 };
                  list.forEach((m) => {
                    const isPlayerA = m.playerA === player.name;
                    const scoreForPlayer = isPlayerA ? m.scoreA : m.scoreB;
                    const scoreAgainst = isPlayerA ? m.scoreB : m.scoreA;
                    if (scoreForPlayer > scoreAgainst) stats.wins++;
                    else if (scoreForPlayer < scoreAgainst) stats.losses++;
                    else stats.draws++;
                  });

                  return (
                    <div key={opponent.name} className="rounded-lg border border-white/10 md-bg-panel-dark-40">
                      <div className="flex items-center justify-between px-3 py-2.5 text-left">
                        <div className="flex-1">
                          <p className="font-oswald text-sm md-text-bone">{player.name} vs {opponent.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-oswald tracking-wide md-text-amber">V {stats.wins}</span>
                            <span className="rounded-full border border-slate-300/25 bg-slate-300/10 px-2 py-0.5 text-[10px] font-oswald tracking-wide md-text-muted">E {stats.draws}</span>
                            <span className="rounded-full border border-crimson-400/30 bg-crimson-500/10 px-2 py-0.5 text-[10px] font-oswald tracking-wide md-text-crimson">D {stats.losses}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10">
                        {list.length > 0 ? (
                          <table className="min-w-full text-sm">
                            <thead className="md-bg-panel-dark-40">
                              <tr>
                                  <th className="px-3 py-2 text-left font-oswald tracking-wide md-text-muted">DATA</th>
                                  <th className="px-3 py-2 text-left font-oswald tracking-wide md-text-muted">VENCEDOR</th>
                                  <th className="px-3 py-2 text-center font-oswald tracking-wide md-text-muted">PLACAR</th>
                                  <th className="px-3 py-2 text-left font-oswald tracking-wide md-text-muted">DERROTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                              {[...list].reverse().map((m) => {
                                const isDraw = m.scoreA === m.scoreB;
                                const winner = isDraw ? m.playerA : (m.scoreA > m.scoreB ? m.playerA : m.playerB);
                                const loser = isDraw ? m.playerB : (m.scoreA > m.scoreB ? m.playerB : m.playerA);
                                const winnerScore = Math.max(m.scoreA, m.scoreB);
                                const loserScore = Math.min(m.scoreA, m.scoreB);
                                return (
                                  <tr key={m.id} className="border-t border-white/10">
                                    <td className="px-3 py-2 text-xs md-text-muted-dim">{new Date(m.ts).toLocaleDateString("pt-BR")}</td>
                                    <td className="px-3 py-2 font-oswald md-text-bone">{winner}</td>
                                    <td className="px-3 py-2 text-center font-oswald md-text-amber">{winnerScore}-{loserScore}</td>
                                    <td className="px-3 py-2 font-oswald md-text-bone">{loser}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <p className="px-3 py-3 text-xs md-text-muted">Nenhum resultado registrado ainda para este confronto.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
