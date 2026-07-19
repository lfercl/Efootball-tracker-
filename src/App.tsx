import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

// Color settings panel (placed at module end so it can use helpers)
function ColorSettings({ open, onClose, initialSection = "visual", myName = "", myEmblemId = "", onSaveMyEmblem, onNotify }) {
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
  const [activeSection, setActiveSection] = useState("visual");

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
    if (open) {
      setActiveSection("visual");
    }
  }, [myEmblemId, open, initialSection]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const update = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const persistAndClose = async (nextVals) => {
    await storageSet("theme-colors", JSON.stringify(nextVals), false);
    applyTheme(nextVals);
    onClose();
    onNotify?.({
      title: "Tema atualizado",
      body: "As novas cores foram aplicadas à interface.",
    });
  };

  const saveEmblemAndClose = async (emblemId) => {
    if (!myName) return;
    setSelectedEmblem(emblemId);
    await onSaveMyEmblem?.(emblemId);
    onClose();
  };

  const save = async () => {
    await persistAndClose(vals);
  };

  const applyPreset = async (p) => {
    setVals(p);
    await persistAndClose(p);
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
    onNotify?.({
      title: "Tema reposto",
      body: "As cores padrão foram restauradas.",
    });
  };

  if (!open) return null;
  return (
    <div
      className="md-settings-layer fixed inset-0 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="md-settings-backdrop absolute inset-0"
        onClick={onClose}
        aria-label="Fechar configurações"
      />
      <div className="md-settings-modal relative w-full max-w-2xl bg-white/5 rounded-xl p-5 md-border md-border-line max-h-[90vh] overflow-y-auto">
        <div className="md-settings-header flex items-center justify-between mb-3">
          <h3 id="settings-title" className="font-oswald text-2xl md-text-bone">Configurações</h3>
          <div className="md-settings-actions flex gap-2">
            <button type="button" onClick={reset} className="md-step-btn px-4 py-2 rounded-md text-sm">Reset</button>
            <button type="button" onClick={onClose} className="md-step-btn px-4 py-2 rounded-md text-sm">Fechar</button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("visual")}
            className={`md-step-btn px-4 py-2 rounded-md text-sm ${activeSection === "visual" ? "md-bg-amber md-text-bone" : ""}`}
          >
            VISUAL
          </button>
        </div>

        {activeSection === "visual" && (
        <div className="mb-4 rounded-lg border border-white/10 bg-black/15 p-3">
          <p className="text-sm md-text-muted mb-2">Emblema do usuario logado</p>
          <p className="text-xs md-text-muted mb-2">Ao tocar no emblema, ele ja salva e fecha este ajuste.</p>
          <p className="text-xs md-text-muted mb-2">Usuario: <span className="font-oswald md-text-bone">{myName || "nao identificado"}</span></p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <EmblemBadge emblemId={selectedEmblem} size={56} />
            <select
              value={selectedEmblem}
              onChange={(e) => saveEmblemAndClose(e.target.value)}
              className="md-input flex-1 rounded-lg px-3 py-3 text-base"
              disabled={!myName}
            >
              <option value="">Sem emblema</option>
              {EMBLEM_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        )}

        {activeSection === "visual" && (
        <div className="mb-3">
          <p className="text-sm md-text-muted mb-2">Temas prontos</p>
          <p className="text-xs md-text-muted mb-2">Ao tocar em um tema, ele ja salva e fecha este ajuste.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(PRESETS).map(([name, p]) => (
              <button key={name} onClick={() => applyPreset(p)} className="md-step-btn px-4 py-2 rounded-md text-sm">
                {name}
              </button>
            ))}
          </div>
        </div>
        )}

        {activeSection === "visual" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(vals).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <label className="text-sm md-text-muted flex-1 leading-tight">{k}</label>
              <input type="color" value={vals[k]} onChange={(e) => update(k, e.target.value)} />
              <input className="md-input ml-2 px-2 py-2 text-sm" value={vals[k]} onChange={(e) => update(k, e.target.value)} style={{ width: 116 }} />
            </div>
          ))}
        </div>
        )}

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
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
  Download,
  FileText,
  Crown,
  ArrowUp,
  MoreHorizontal,
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
      html, body, #root { min-height: 100%; }
      body { overscroll-behavior-y: none; }
      button, a, input, select, textarea { -webkit-tap-highlight-color: transparent; }
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
      .md-tabs-inner{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0.4rem; }
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
      .md-mobile-pad-bottom{ padding-bottom: calc(6.25rem + env(safe-area-inset-bottom)); }
      .md-safe-float{ bottom: calc(1.25rem + env(safe-area-inset-bottom)); }
      .md-touch-target{ min-height:44px; }
      .md-scroll-y{ -webkit-overflow-scrolling:touch; overscroll-behavior:contain; }

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
      @keyframes mdGoodArrowRise { 0% { transform: translateY(30px) scale(0.7); opacity: 0; } 20% { opacity: 0.95; } 100% { transform: translateY(-120px) scale(1.2); opacity: 0; } }
      @keyframes mdLightningStrikeReal {
        0% { opacity: 0; transform: translateY(-20px) scale(0.6) rotate(var(--bolt-rot)); filter: blur(2px); }
        8% { opacity: 1; filter: blur(0); }
        12% { opacity: 0.15; }
        18% { opacity: 1; }
        24% { opacity: 0.3; }
        32% { opacity: 1; }
        46% { opacity: 0.12; }
        100% { opacity: 0; transform: translateY(8px) scale(1.02) rotate(var(--bolt-rot)); filter: blur(1px); }
      }
      @keyframes mdLightningGlowReal {
        0%, 100% { opacity: 0; transform: scale(0.7); }
        10%, 19%, 33% { opacity: 0.95; transform: scale(1); }
        14%, 25%, 45% { opacity: 0.28; transform: scale(1.18); }
      }
      @keyframes mdFireworkRise { 0% { transform: translateY(90px) scale(0.55); opacity:0; } 20% { opacity:1; } 100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes mdFireworkPop { 0% { transform: scale(0.12); opacity:0; } 18% { opacity:1; } 62% { transform: scale(1.35); opacity:1; } 100% { transform: scale(1.95); opacity:0; } }
      @keyframes mdFireworkSpark { 0% { transform: translate(0, 0) scale(0.2); opacity:0; } 20% { opacity:1; } 100% { transform: var(--spark-transform) scale(1.1); opacity:0; } }
      @keyframes mdFireworkTwinkle { 0%,100% { opacity:0.15; transform: scale(0.9); } 50% { opacity:1; transform: scale(1.15); } }
      @keyframes mdUserBlink { 0%,100% { opacity:0.35; transform: scale(0.98); filter: saturate(0.92); } 50% { opacity:1; transform: scale(1.03); filter: saturate(1.15); } }
      @keyframes mdLogoBlink { 0%,100% { opacity:1; } 50% { opacity:0.28; } }
      @keyframes mdTrophyRiseDrop {
        0% { transform: translateY(0) scale(1); opacity:1; }
        34% { transform: translateY(-78px) scale(0.9); opacity:0; }
        35% { transform: translateY(64px) scale(1.12); opacity:0; }
        58% { transform: translateY(10px) scale(1.02); opacity:1; }
        76% { transform: translateY(-4px) scale(1); opacity:1; }
        100% { transform: translateY(0) scale(1); opacity:1; }
      }

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
      .md-anim-good-arrow{ animation: mdGoodArrowRise 1.3s ease-out infinite; }
      .md-anim-lightning-real{ animation: mdLightningStrikeReal 1.25s steps(2, end) infinite; }
      .md-anim-lightning-glow-real{ animation: mdLightningGlowReal 1.25s ease-in-out infinite; }
      .md-anim-firework-rise{ animation: mdFireworkRise 0.8s ease-out forwards; }
      .md-anim-firework-pop{ animation: mdFireworkPop 1s ease-out forwards; }
      .md-anim-firework-spark{ animation: mdFireworkSpark 0.9s ease-out forwards; }
      .md-anim-firework-twinkle{ animation: mdFireworkTwinkle 1.1s ease-in-out infinite; }
      .md-anim-user-blink{ animation: mdUserBlink 1.1s ease-in-out infinite; }
      .md-anim-logo-blink{ animation: mdLogoBlink 1.8s ease-in-out infinite; }
      .md-anim-trophy-rise-drop{ animation: mdTrophyRiseDrop 2.2s ease-in-out infinite; }
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
      .md-bg-panel-dark-40{ background: color-mix(in srgb, var(--md-bg-panel-dark, #0B2A1E) 62%, transparent) !important; }
      .md-bg-panel-dark-80{ background: color-mix(in srgb, var(--md-bg-panel-dark, #0B2A1E) 88%, transparent) !important; }
      .md-bg-line, .md-step-btn, .md-step-btn-danger{ background: var(--md-bg-line, #1C5C3D) !important; }
      .md-bg-amber{ background: var(--md-bg-amber, #FFB627) !important; }
      .md-bg-crimson{ background: var(--md-bg-crimson, #E4572E) !important; }
      .md-text-bone{ color: var(--md-text-bone, #FFFFFF) !important; }
      .md-text-muted{ color: var(--md-text-muted, #CBD8D1) !important; }
      .md-text-muted-dim{ color: var(--md-text-muted-dim, #9FC2AE) !important; }
      .md-text-amber{ color: var(--md-text-amber, #FFC85C) !important; }
      .md-text-crimson{ color: var(--md-text-crimson, #FF7A57) !important; }
      .md-border-line{ border-color: var(--md-border-line, #2E7A52) !important; }
      .md-input{ background: var(--md-bg-stadium, #071A14) !important; color: var(--md-text-bone, #FFFFFF) !important; border-color: var(--md-border-line, #2E7A52) !important; }
      .md-input:focus{ border-color: var(--md-text-amber, #FFC85C) !important; box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-bg-amber, #FFB627) 22%, transparent); }
      .md-btn-amber, .md-tab.active{ background: var(--md-bg-amber, #FFB627) !important; color: var(--md-bg-stadium, #071A14) !important; }
      .md-step-btn:hover{ background: var(--md-bg-amber, #FFB627) !important; color: var(--md-bg-stadium, #071A14) !important; }
      body{ background: var(--md-bg-stadium, #071A14); }
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
  { id: "vitoria-guimaraes", label: "Vitória de Guimarães", url: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Vit%C3%B3ria_Guimar%C3%A3es.svg/250px-Vit%C3%B3ria_Guimar%C3%A3es.svg.png" },
  { id: "sporting-cp", label: "Sporting CP", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Sporting_Clube_de_Portugal_2026.svg/250px-Sporting_Clube_de_Portugal_2026.svg.png" },
  { id: "benfica", label: "SL Benfica", url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/SL_Benfica_logo.svg/250px-SL_Benfica_logo.svg.png" },
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

const CLUB_THEMES: Record<string, Record<string, string>> = {
  default: { "md-bg-stadium": "#071A14", "md-bg-panel": "#0F3D2A", "md-bg-panel-dark": "#0B2A1E", "md-bg-line": "#1C5C3D", "md-bg-amber": "#FFB627", "md-bg-crimson": "#E4572E", "md-text-bone": "#FFFFFF", "md-text-muted": "#CBD8D1", "md-text-muted-dim": "#9FC2AE", "md-text-amber": "#FFC85C", "md-text-crimson": "#FF7A57", "md-border-line": "#2E7A52" },
  "vitoria-guimaraes": { "md-bg-stadium": "#08090B", "md-bg-panel": "#17191D", "md-bg-panel-dark": "#101216", "md-bg-line": "#30343A", "md-bg-amber": "#D8B34B", "md-bg-crimson": "#B62F35", "md-text-bone": "#FFFFFF", "md-text-muted": "#D4D6D9", "md-text-muted-dim": "#9CA1A8", "md-text-amber": "#F1D477", "md-text-crimson": "#FF7A82", "md-border-line": "#4A4F57" },
  "sporting-cp": { "md-bg-stadium": "#031D14", "md-bg-panel": "#063D29", "md-bg-panel-dark": "#052A1E", "md-bg-line": "#0D6A45", "md-bg-amber": "#8FD400", "md-bg-crimson": "#E53B3B", "md-text-bone": "#FFFFFF", "md-text-muted": "#CAE5D8", "md-text-muted-dim": "#8EBEAA", "md-text-amber": "#B8F34C", "md-text-crimson": "#FF8585", "md-border-line": "#148A5A" },
  benfica: { "md-bg-stadium": "#200307", "md-bg-panel": "#4A0810", "md-bg-panel-dark": "#31060B", "md-bg-line": "#7F101C", "md-bg-amber": "#D9AD3C", "md-bg-crimson": "#E0002A", "md-text-bone": "#FFFFFF", "md-text-muted": "#F0CED2", "md-text-muted-dim": "#CC9299", "md-text-amber": "#F4D36F", "md-text-crimson": "#FF7891", "md-border-line": "#9E2430" },
  barcelona: { "md-bg-stadium": "#071437", "md-bg-panel": "#17285A", "md-bg-panel-dark": "#0C1B44", "md-bg-line": "#6A1839", "md-bg-amber": "#EDBB00", "md-bg-crimson": "#A50044", "md-text-bone": "#FFFFFF", "md-text-muted": "#D2DBF2", "md-text-muted-dim": "#93A4D0", "md-text-amber": "#FFD447", "md-text-crimson": "#F65C91", "md-border-line": "#344C8A" },
  "real-madrid": { "md-bg-stadium": "#07122C", "md-bg-panel": "#14254A", "md-bg-panel-dark": "#0C1936", "md-bg-line": "#294C8F", "md-bg-amber": "#D6B85C", "md-bg-crimson": "#7047EB", "md-text-bone": "#FFFFFF", "md-text-muted": "#DCE5F7", "md-text-muted-dim": "#9BAED3", "md-text-amber": "#F4D77D", "md-text-crimson": "#B59AFF", "md-border-line": "#4264A2" },
  arsenal: { "md-bg-stadium": "#190307", "md-bg-panel": "#470B15", "md-bg-panel-dark": "#2C0710", "md-bg-line": "#82142A", "md-bg-amber": "#D9B75E", "md-bg-crimson": "#EF2447", "md-text-bone": "#FFFFFF", "md-text-muted": "#F0D4D9", "md-text-muted-dim": "#C3939C", "md-text-amber": "#F5D98A", "md-text-crimson": "#FF8096", "md-border-line": "#9E2940" },
  "manchester-city": { "md-bg-stadium": "#061A2A", "md-bg-panel": "#123B56", "md-bg-panel-dark": "#0A283C", "md-bg-line": "#397EA5", "md-bg-amber": "#79C9EC", "md-bg-crimson": "#E63950", "md-text-bone": "#FFFFFF", "md-text-muted": "#D2EBF5", "md-text-muted-dim": "#8DBDD2", "md-text-amber": "#A6E2FA", "md-text-crimson": "#FF8292", "md-border-line": "#4F94B9" },
  "manchester-united": { "md-bg-stadium": "#180305", "md-bg-panel": "#43090C", "md-bg-panel-dark": "#2A0508", "md-bg-line": "#7B1118", "md-bg-amber": "#F5C542", "md-bg-crimson": "#DA101A", "md-text-bone": "#FFFFFF", "md-text-muted": "#EED1D3", "md-text-muted-dim": "#C28D91", "md-text-amber": "#FFE078", "md-text-crimson": "#FF737A", "md-border-line": "#9A242B" },
  psg: { "md-bg-stadium": "#020D2C", "md-bg-panel": "#102552", "md-bg-panel-dark": "#08183A", "md-bg-line": "#1C3F78", "md-bg-amber": "#D7B54A", "md-bg-crimson": "#E31B36", "md-text-bone": "#FFFFFF", "md-text-muted": "#D4DDF0", "md-text-muted-dim": "#91A3C7", "md-text-amber": "#F3D573", "md-text-crimson": "#FF778A", "md-border-line": "#31538B" },
  santos: { "md-bg-stadium": "#070809", "md-bg-panel": "#1A1D20", "md-bg-panel-dark": "#111315", "md-bg-line": "#373C42", "md-bg-amber": "#E0C267", "md-bg-crimson": "#C83D46", "md-text-bone": "#FFFFFF", "md-text-muted": "#D9DADD", "md-text-muted-dim": "#A1A5AA", "md-text-amber": "#F7DD8D", "md-text-crimson": "#FF838B", "md-border-line": "#50565D" },
  "sao-paulo": { "md-bg-stadium": "#120609", "md-bg-panel": "#2E1117", "md-bg-panel-dark": "#1D0B0F", "md-bg-line": "#5E1E29", "md-bg-amber": "#F0F0F0", "md-bg-crimson": "#E32636", "md-text-bone": "#FFFFFF", "md-text-muted": "#E8D7DA", "md-text-muted-dim": "#B7979D", "md-text-amber": "#FFFFFF", "md-text-crimson": "#FF7180", "md-border-line": "#78303B" },
  flamengo: { "md-bg-stadium": "#100305", "md-bg-panel": "#2F080D", "md-bg-panel-dark": "#1D0508", "md-bg-line": "#66101B", "md-bg-amber": "#F0444E", "md-bg-crimson": "#D41427", "md-text-bone": "#FFFFFF", "md-text-muted": "#EBCFD3", "md-text-muted-dim": "#BE8A92", "md-text-amber": "#FF747C", "md-text-crimson": "#FF6A79", "md-border-line": "#831D2A" },
  "inter-miami": { "md-bg-stadium": "#100A0F", "md-bg-panel": "#2A1925", "md-bg-panel-dark": "#1C1119", "md-bg-line": "#744258", "md-bg-amber": "#F7B5CD", "md-bg-crimson": "#EF6F9F", "md-text-bone": "#FFFFFF", "md-text-muted": "#EEDCE5", "md-text-muted-dim": "#C19BAB", "md-text-amber": "#FFD3E2", "md-text-crimson": "#FF9EC1", "md-border-line": "#92566F" },
  brasil: { "md-bg-stadium": "#031B13", "md-bg-panel": "#06452F", "md-bg-panel-dark": "#052F22", "md-bg-line": "#0C704C", "md-bg-amber": "#F5D328", "md-bg-crimson": "#2674D9", "md-text-bone": "#FFFFFF", "md-text-muted": "#D5E9DF", "md-text-muted-dim": "#94BFA9", "md-text-amber": "#FFE75F", "md-text-crimson": "#79ADFF", "md-border-line": "#168A60" },
  portugal: { "md-bg-stadium": "#23060C", "md-bg-panel": "#4B0E19", "md-bg-panel-dark": "#310A12", "md-bg-line": "#7E1D2B", "md-bg-amber": "#D7B747", "md-bg-crimson": "#D61732", "md-text-bone": "#FFFFFF", "md-text-muted": "#EFD5D9", "md-text-muted-dim": "#C398A0", "md-text-amber": "#F4D775", "md-text-crimson": "#FF778A", "md-border-line": "#9A3040" },
  mocambique: { "md-bg-stadium": "#061B13", "md-bg-panel": "#123E2D", "md-bg-panel-dark": "#0A2A1F", "md-bg-line": "#276A4E", "md-bg-amber": "#E3C647", "md-bg-crimson": "#D72D37", "md-text-bone": "#FFFFFF", "md-text-muted": "#D7E7DF", "md-text-muted-dim": "#99BCAA", "md-text-amber": "#F6DD73", "md-text-crimson": "#FF7C85", "md-border-line": "#3B8063" },
  "cabo-verde": { "md-bg-stadium": "#061329", "md-bg-panel": "#122E55", "md-bg-panel-dark": "#0A203E", "md-bg-line": "#28568D", "md-bg-amber": "#F1CE39", "md-bg-crimson": "#E73B4D", "md-text-bone": "#FFFFFF", "md-text-muted": "#D8E2F1", "md-text-muted-dim": "#9BAFCE", "md-text-amber": "#FFE16A", "md-text-crimson": "#FF8090", "md-border-line": "#3B6DA5" },
};

function getClubTheme(emblemId: string) {
  return CLUB_THEMES[emblemId] || CLUB_THEMES.default;
}

const EMBLEM_MAP = EMBLEM_OPTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, { id: string; label: string; url: string }>);

const FMA_PLAYLISTS = [
  {
    id: "radio-mocambique-24h",
    name: "Mocambique 24h",
    tracks: [
      { title: "LM Radio Mozambique", artist: "Musica 24h", url: "https://edge.iono.fm/xice/392_medium.mp3" },
    ],
  },
  {
    id: "radio-cabo-verde-24h",
    name: "Cabo Verde 24h",
    tracks: [
      { title: "Kriola", artist: "Musica 24h", url: "https://stream.laut.fm/kriola" },
    ],
  },
  {
    id: "radio-pop-internacional-24h",
    name: "Pop Internacional 24h",
    tracks: [
      { title: "SomaFM PopTron", artist: "Musica 24h", url: "https://ice2.somafm.com/poptron-128-mp3" },
    ],
  },
  {
    id: "radio-pagode-24h",
    name: "Pagode 24h",
    tracks: [
      { title: "Hunter FM Pagode", artist: "Musica 24h", url: "https://live.hunter.fm/pagode_normal" },
    ],
  },
  {
    id: "radio-rock-internacional",
    name: "Rock Internacional",
    tracks: [
      { title: "Rock Antenne Hard Rock", artist: "Musica 24h", url: "https://stream.rockantenne.de/rock-antenne-hard-rock/stream/mp3" },
    ],
  },
  {
    id: "radio-rock-brasileiro",
    name: "Rock Brasileiro",
    tracks: [
      { title: "98 Rock Brasil", artist: "Musica 24h", url: "https://stm41.stmsrv.com:16614/stream?type=http&nocache=1897905694" },
    ],
  },
  {
    id: "radio-mpb",
    name: "MPB",
    tracks: [
      { title: "Hunter FM MPB", artist: "Musica 24h", url: "https://live.hunter.fm/mpb_normal" },
    ],
  },
];

function getFmaPlaylistById(playlistId) {
  const id = String(playlistId || "").trim();
  if (!id) return FMA_PLAYLISTS[0] || null;
  return FMA_PLAYLISTS.find((playlist) => playlist.id === id) || FMA_PLAYLISTS[0] || null;
}

function normalizeFmaPlayback(playback, playlistId) {
  const playlist = getFmaPlaylistById(playlistId);
  const tracksLength = Math.max(1, Number(playlist?.tracks?.length || 0));
  const rawIndex = Number(playback?.trackIndex || 0);
  const safeIndex = Number.isFinite(rawIndex)
    ? Math.min(Math.max(Math.floor(rawIndex), 0), tracksLength - 1)
    : 0;

  return {
    trackIndex: safeIndex,
    startedAt: Math.max(0, Number(playback?.startedAt || 0)),
    paused: Boolean(playback?.paused),
    pausePositionSec: Math.max(0, Number(playback?.pausePositionSec || 0)),
    updatedAt: Math.max(0, Number(playback?.updatedAt || 0)),
  };
}

function normalizePlayer(player) {
  return {
    ...player,
    emblemId: typeof player?.emblemId === "string" ? player.emblemId : "",
  };
}

function normalizeGroupData(data) {
  const normalizedPlaylistId = typeof data?.fmaPlaylistId === "string" ? data.fmaPlaylistId : "";
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
    fmaPlaylistId: normalizedPlaylistId,
    fmaPlayback: normalizeFmaPlayback(data?.fmaPlayback, normalizedPlaylistId),
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

function cleanPdfText(value) {
  return String(value ?? "")
    .replace(/[^\x20-\x7EÀ-ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function competitionReportFilename(item) {
  const slug = cleanPdfText(item?.name || "torneio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `relatorio-${slug || "torneio"}-${item?.id || "final"}.pdf`;
}

function createCompetitionPdfBlob(item) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const standings = Array.isArray(item?.standings) ? item.standings : [];
  const matches = Array.isArray(item?.matches) ? item.matches : [];
  const achievements = Array.isArray(item?.achievements) ? item.achievements : [];
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const navy = [5, 9, 47];
  const blue = [25, 52, 170];
  const yellow = [231, 255, 0];
  const ink = [15, 23, 42];
  const muted = [91, 105, 128];
  const line = [219, 226, 239];
  const white = [255, 255, 255];
  const finishedAt = Number(item?.finishedAt || Date.now());
  const champion = item?.champion || standings[0] || {};
  const totalGoals = matches.length
    ? matches.reduce((sum, match) => sum + Number(match.scoreA || 0) + Number(match.scoreB || 0), 0)
    : standings.reduce((sum, entry) => sum + Number(entry.gf || 0), 0);
  const draws = matches.length
    ? matches.filter((match) => Number(match.scoreA) === Number(match.scoreB)).length
    : Math.round(standings.reduce((sum, entry) => sum + Number(entry.draws || 0), 0) / 2);
  const bestAttack = [...standings].sort((a, b) => Number(b.gf || 0) - Number(a.gf || 0))[0];
  const played = standings.filter((entry) => Number(entry.played || 0) > 0);
  const bestDefense = [...played].sort((a, b) => Number(a.ga || 0) - Number(b.ga || 0))[0];

  doc.setProperties({
    title: `Relatorio oficial - ${cleanPdfText(item?.name || "Competicao")}`,
    subject: "Classificacao, resultados e estatisticas da competicao",
    author: "eFootball Rivals",
    creator: "Matchday Ledger",
  });

  const drawPageBase = (section = "RELATORIO OFICIAL") => {
    doc.setFillColor(...white);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 23, "F");
    doc.setFillColor(...yellow);
    doc.rect(0, 23, pageWidth, 2.2, "F");
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("EFOOTBALL RIVALS", margin, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(cleanPdfText(section), pageWidth - margin, 10, { align: "right" });
  };

  const addPage = (section) => {
    doc.addPage();
    drawPageBase(section);
    return 34;
  };

  const sectionTitle = (title, y) => {
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(cleanPdfText(title).toUpperCase(), margin, y);
    doc.setDrawColor(...yellow);
    doc.setLineWidth(1.1);
    doc.line(margin, y + 2.5, margin + 34, y + 2.5);
    return y + 9;
  };

  drawPageBase();
  doc.setFillColor(...navy);
  doc.rect(0, 25.2, pageWidth, 57, "F");
  doc.setTextColor(...yellow);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TORNEIO CONCLUIDO", margin, 38);
  doc.setTextColor(...white);
  doc.setFontSize(25);
  const titleLines = doc.splitTextToSize(cleanPdfText(item?.name || "Competicao"), 178).slice(0, 2);
  doc.text(titleLines, margin, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(202, 212, 255);
  doc.text(`Encerrado em ${new Date(finishedAt).toLocaleString("pt-PT")}`, margin, 75);

  doc.setFillColor(246, 248, 255);
  doc.setDrawColor(111, 132, 230);
  doc.roundedRect(margin, 91, 182, 35, 3, 3, "FD");
  doc.setTextColor(...blue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CAMPEAO", margin + 7, 102);
  doc.setTextColor(...navy);
  doc.setFontSize(19);
  doc.text(cleanPdfText(champion?.name || "Campeao"), margin + 7, 114);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text(
    `${Number(champion?.points || 0)} pontos | ${Number(champion?.wins || 0)} vitorias | Premio: ${cleanPdfText(item?.prize || "Nao informado")}`,
    margin + 7,
    121,
  );

  const tiles = [
    ["JOGOS", String(Number(item?.matchesCount || matches.length || 0))],
    ["GOLS", String(totalGoals)],
    ["MEDIA / JOGO", matches.length ? (totalGoals / matches.length).toFixed(2) : "0.00"],
    ["EMPATES", String(draws)],
  ];
  tiles.forEach(([label, value], index) => {
    const x = margin + index * 46;
    doc.setFillColor(index % 2 === 0 ? 5 : 25, index % 2 === 0 ? 9 : 52, index % 2 === 0 ? 47 : 170);
    doc.roundedRect(x, 134, 42, 24, 2.5, 2.5, "F");
    doc.setTextColor(...yellow);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(value, x + 21, 145, { align: "center" });
    doc.setTextColor(...white);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label, x + 21, 152, { align: "center" });
  });

  let y = sectionTitle("Classificacao final", 171);
  const columns = [
    ["#", 9],
    ["JOGADOR", 53],
    ["J", 13],
    ["V", 13],
    ["E", 13],
    ["D", 13],
    ["GP", 14],
    ["GC", 14],
    ["SG", 15],
    ["PTS", 19],
  ];
  const drawStandingsHeader = () => {
    let x = margin;
    doc.setFillColor(...navy);
    doc.rect(margin, y, 182, 8, "F");
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    columns.forEach(([label, width]) => {
      doc.text(label, label === "JOGADOR" ? x + 2 : x + width / 2, y + 5.3, {
        align: label === "JOGADOR" ? "left" : "center",
      });
      x += width;
    });
    y += 8;
  };
  drawStandingsHeader();

  standings.forEach((entry, index) => {
    if (y > 270) {
      y = addPage("CLASSIFICACAO FINAL");
      drawStandingsHeader();
    }
    let x = margin;
    doc.setFillColor(index % 2 === 0 ? 247 : 255, index % 2 === 0 ? 249 : 255, 253);
    doc.rect(margin, y, 182, 8, "F");
    doc.setTextColor(...ink);
    doc.setFont("helvetica", index === 0 ? "bold" : "normal");
    doc.setFontSize(7.3);
    const values = [
      index + 1,
      cleanPdfText(entry.name).slice(0, 25),
      Number(entry.played || 0),
      Number(entry.wins || 0),
      Number(entry.draws || 0),
      Number(entry.losses || 0),
      Number(entry.gf || 0),
      Number(entry.ga || 0),
      Number(entry.gd || 0),
      Number(entry.points || 0),
    ];
    values.forEach((value, valueIndex) => {
      const width = columns[valueIndex][1];
      doc.text(String(value), valueIndex === 1 ? x + 2 : x + width / 2, y + 5.3, {
        align: valueIndex === 1 ? "left" : "center",
      });
      x += width;
    });
    doc.setDrawColor(...line);
    doc.line(margin, y + 8, 196, y + 8);
    y += 8;
  });

  y += 7;
  if (y > 250) y = addPage("DESTAQUES");
  y = sectionTitle("Destaques do torneio", y);
  const highlights = [
    ["Melhor ataque", bestAttack ? `${cleanPdfText(bestAttack.name)} - ${Number(bestAttack.gf || 0)} gols` : "Sem dados"],
    ["Melhor defesa", bestDefense ? `${cleanPdfText(bestDefense.name)} - ${Number(bestDefense.ga || 0)} sofridos` : "Sem dados"],
    ["Maior pontuacao", champion?.name ? `${cleanPdfText(champion.name)} - ${Number(champion.points || 0)} pontos` : "Sem dados"],
    ["Premio", cleanPdfText(item?.prize || "Nao informado")],
  ];
  highlights.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * 92;
    const boxY = y + row * 19;
    doc.setFillColor(247, 249, 253);
    doc.roundedRect(x, boxY, 88, 15, 2, 2, "F");
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(cleanPdfText(label).toUpperCase(), x + 4, boxY + 5);
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.text(cleanPdfText(value).slice(0, 42), x + 4, boxY + 11);
  });
  y += 44;

  if (achievements.length) {
    if (y > 245) y = addPage("PREMIOS E CONQUISTAS");
    y = sectionTitle("Premios e conquistas", y);
    achievements.forEach((award) => {
      if (y > 272) y = addPage("PREMIOS E CONQUISTAS");
      doc.setFillColor(248, 250, 255);
      doc.roundedRect(margin, y, 182, 9, 1.5, 1.5, "F");
      doc.setTextColor(...blue);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(cleanPdfText(award.player || "Jogador").slice(0, 28), margin + 4, y + 5.8);
      doc.setTextColor(...ink);
      doc.setFont("helvetica", "normal");
      doc.text(cleanPdfText(award.title || "Conquista").slice(0, 62), margin + 61, y + 5.8);
      y += 11;
    });
  }

  if (matches.length) {
    y = addPage("RESULTADOS");
    y = sectionTitle("Resultados completos", y);
    const matchHeader = () => {
      doc.setFillColor(...navy);
      doc.rect(margin, y, 182, 8, "F");
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("DATA", margin + 2, y + 5.3);
      doc.text("JOGADOR A", margin + 32, y + 5.3);
      doc.text("RESULTADO", margin + 93, y + 5.3, { align: "center" });
      doc.text("JOGADOR B", margin + 111, y + 5.3);
      doc.text("MVP", margin + 154, y + 5.3);
      y += 8;
    };
    matchHeader();
    matches.forEach((match, index) => {
      if (y > 272) {
        y = addPage("RESULTADOS");
        matchHeader();
      }
      doc.setFillColor(index % 2 === 0 ? 247 : 255, index % 2 === 0 ? 249 : 255, 253);
      doc.rect(margin, y, 182, 8, "F");
      doc.setTextColor(...ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.1);
      const date = Number(match.ts || 0) ? new Date(Number(match.ts)).toLocaleDateString("pt-PT") : "-";
      doc.text(date, margin + 2, y + 5.3);
      doc.text(cleanPdfText(match.playerA || "-").slice(0, 21), margin + 32, y + 5.3);
      doc.setFont("helvetica", "bold");
      doc.text(`${Number(match.scoreA || 0)} - ${Number(match.scoreB || 0)}`, margin + 93, y + 5.3, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(cleanPdfText(match.playerB || "-").slice(0, 21), margin + 111, y + 5.3);
      doc.text(cleanPdfText(match.mvp || "-").slice(0, 16), margin + 154, y + 5.3);
      y += 8;
    });
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...line);
    doc.line(margin, 286, pageWidth - margin, 286);
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Matchday Ledger - Relatorio oficial da competicao", margin, 291);
    doc.text(`Pagina ${page} de ${pages}`, pageWidth - margin, 291, { align: "right" });
  }

  return doc.output("blob");
}

function downloadCompetitionPdf(item) {
  const blob = createCompetitionPdfBlob(item);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = competitionReportFilename(item);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return blob;
}

async function shareCompetitionPdf(item) {
  const blob = createCompetitionPdfBlob(item);
  const file = new File([blob], competitionReportFilename(item), { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `Relatorio da competicao ${item?.name || ""}`,
      text: `Classificacao, resultados e estatisticas da competicao ${item?.name || ""}`,
      files: [file],
    });
    return "shared";
  }
  downloadCompetitionPdf(item);
  return "downloaded";
}


function getEmblemIdByName(players, name) {
  return players.find((p) => p.name === name)?.emblemId || "";
}

function EmblemBadge({ emblemId, size = 32 }) {
  const emblem = EMBLEM_MAP[emblemId];
  const requestedSize = Math.max(1, Number(size) || 32);
  const displaySize = Math.round(requestedSize * 1.2);

  if (!emblem) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/15 text-[10px]"
        style={{ width: displaySize, height: displaySize }}
      >
        C
      </span>
    );
  }

  return (
    <span
      className="md-emblem-3d"
      data-emblem-scale="large"
      style={{ "--emblem-size": displaySize + "px" } as React.CSSProperties}
      title={emblem.label}
    >
      <span className="md-emblem-3d__shine" aria-hidden="true" />
      <img src={emblem.url} alt={emblem.label} className="md-emblem-3d__image" loading="lazy" referrerPolicy="no-referrer" />
    </span>
  );
}

function NameWithEmblem({ name, emblemId, size = 32, textClassName = "", className = "" }) {
  return (
    <span className={`md-name-group inline-flex min-w-0 items-center gap-2 ${className}`}>
      <EmblemBadge emblemId={emblemId} size={size} />
      <span className={`md-name-animated ${textClassName}`} data-name-animation="enabled">
        {name}
      </span>
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
  if (String(prev.fmaPlaylistId || "") !== String(next.fmaPlaylistId || "")) return true;

  const prevPlayers = prev.players || [];
  const nextPlayers = next.players || [];
  for (let i = 0; i < prevPlayers.length; i++) {
    const prevPlayer = prevPlayers[i] || {};
    const nextPlayer = nextPlayers[i] || {};
    if (String(prevPlayer.id || "") !== String(nextPlayer.id || "")) return true;
    if (String(prevPlayer.name || "") !== String(nextPlayer.name || "")) return true;
    if (String(prevPlayer.emblemId || "") !== String(nextPlayer.emblemId || "")) return true;
  }

  if ((prev.fmaPlayback?.trackIndex || 0) !== (next.fmaPlayback?.trackIndex || 0)) return true;
  if (Boolean(prev.fmaPlayback?.paused) !== Boolean(next.fmaPlayback?.paused)) return true;
  if (Number(prev.fmaPlayback?.pausePositionSec || 0) !== Number(next.fmaPlayback?.pausePositionSec || 0)) return true;
  if (Number(prev.fmaPlayback?.startedAt || 0) !== Number(next.fmaPlayback?.startedAt || 0)) return true;
  if (Number(prev.fmaPlayback?.updatedAt || 0) !== Number(next.fmaPlayback?.updatedAt || 0)) return true;

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
  const headline = result === "win" ? "VENCEDOR" : result === "draw" ? "EMPATOU" : "DERROTA";
  const goodArrows = [
    { left: "12%", delay: "0ms", size: 22 },
    { left: "24%", delay: "220ms", size: 20 },
    { left: "76%", delay: "140ms", size: 22 },
    { left: "88%", delay: "360ms", size: 20 },
  ];
  const lightningBolts = [
    { left: "7%", top: "8%", scale: 0.9, rot: "-14deg", delay: "0ms" },
    { left: "16%", top: "18%", scale: 1.1, rot: "8deg", delay: "180ms" },
    { left: "24%", top: "6%", scale: 0.85, rot: "-6deg", delay: "320ms" },
    { left: "35%", top: "14%", scale: 1.25, rot: "5deg", delay: "120ms" },
    { left: "46%", top: "7%", scale: 1.0, rot: "-10deg", delay: "420ms" },
    { left: "56%", top: "16%", scale: 1.15, rot: "12deg", delay: "260ms" },
    { left: "66%", top: "9%", scale: 0.95, rot: "-7deg", delay: "500ms" },
    { left: "76%", top: "20%", scale: 1.2, rot: "10deg", delay: "80ms" },
    { left: "84%", top: "8%", scale: 0.88, rot: "-5deg", delay: "360ms" },
    { left: "92%", top: "16%", scale: 1.1, rot: "6deg", delay: "220ms" },
  ];
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
            {result === "win" && (
              <>
                {lightningBolts.map((bolt, idx) => (
                  <div
                    key={`lightning-${idx}`}
                    className="absolute pointer-events-none"
                    style={{ left: bolt.left, top: bolt.top, transform: `scale(${bolt.scale})` }}
                  >
                    <div
                      className="relative md-anim-lightning-real"
                      style={{ ["--bolt-rot" as string]: bolt.rot, animationDelay: bolt.delay }}
                    >
                      <svg width="54" height="132" viewBox="0 0 54 132" fill="none" className="drop-shadow-[0_0_18px_rgba(56,189,248,0.95)]">
                        <path
                          d="M30 2 L8 56 H24 L14 96 L44 48 H30 L42 2 Z"
                          fill="#9FE9FF"
                          stroke="#E0F7FF"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="absolute left-1/2 top-[58px] h-[86px] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-200/85 via-sky-300/50 to-transparent blur-[1px] md-anim-lightning-glow-real" style={{ animationDelay: bolt.delay }} />
                    </div>
                  </div>
                ))}
                {goodArrows.map((arrow, idx) => (
                  <div
                    key={`good-arrow-${idx}`}
                    className="absolute bottom-[6%] md-anim-good-arrow"
                    style={{ left: arrow.left, animationDelay: arrow.delay }}
                  >
                    <ArrowUp
                      size={arrow.size}
                      className="text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
                    />
                  </div>
                ))}
              </>
            )}
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
          <div className="absolute h-96 w-96 rounded-full border-[12px] border-amber-200/70 md-anim-goal-glow" />
          <div className="absolute h-72 w-72 rounded-full border-[10px] border-amber-300/80 md-anim-goal-glow" style={{ animationDelay: "0.08s" }} />
          <div className="md-anim-goal-burst rounded-full w-52 h-52 md-bg-amber" style={{ boxShadow: "0 0 100px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md-anim-goal-shot z-20">
          <div className="w-24 h-24 rounded-full md-bg-amber border-4 border-white" style={{ boxShadow: "0 0 64px rgba(255,182,39,1)" }} />
        </div>
        <div className="absolute top-8 md-anim-goal-text font-oswald text-[34px] md-tracking-lg md-text-amber drop-shadow-[0_0_14px_rgba(255,182,39,0.95)]">{headline}</div>
        <div className={`md-anim-result-rise flex flex-col items-center gap-2 z-30 ${cfg.cls}`}>
          <div className={`${cfg.anim} p-10 rounded-full md-bg-panel-dark-80 border border-white/15 shadow-[0_0_54px_rgba(0,0,0,0.45)]`}>{cfg.icon}</div>
          <span className="font-oswald text-3xl md-tracking-sm">{cfg.label}</span>
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

/* ---------------- Group overview ---------------- */

function OverviewDashboard({ players, matches, schedules, myName }) {
  const stats = sortStandings(computeStats(players || [], matches || []));
  const leader = stats[0] || null;
  const bestAttack = [...stats].sort((a, b) => b.gf - a.gf || b.points - a.points)[0] || null;
  const lastMatch = (matches || []).length ? matches[matches.length - 1] : null;
  const nextSchedule = [...(schedules || [])]
    .filter((item) => Number(item?.whenTs || 0) > Date.now())
    .sort((a, b) => Number(a.whenTs) - Number(b.whenTs))[0] || null;
  const recentMatches = [...(matches || [])]
    .filter((match) => match.playerA === myName || match.playerB === myName)
    .slice(-5)
    .reverse();
  const form = recentMatches.map((match) => {
    if (Number(match.scoreA) === Number(match.scoreB)) return "E";
    const won =
      (match.playerA === myName && Number(match.scoreA) > Number(match.scoreB)) ||
      (match.playerB === myName && Number(match.scoreB) > Number(match.scoreA));
    return won ? "V" : "D";
  });

  return (
    <section className="md-overview md-bg-panel md-border md-border-line rounded-xl p-4" aria-label="Resumo do grupo">
      <div className="md-overview-heading">
        <div>
          <p className="md-overview-kicker">VISÃO GERAL</p>
          <h3 className="font-oswald text-sm tracking-wide md-text-bone">RESUMO DO GRUPO</h3>
        </div>
        <span className="md-overview-live"><span /> AO VIVO</span>
      </div>

      <div className="md-overview-grid">
        <article className="md-overview-tile">
          <span className="md-overview-icon md-text-amber"><Trophy size={18} /></span>
          <p className="md-overview-label">Líder</p>
          {leader ? (
            <NameWithEmblem
              name={leader.name}
              emblemId={getEmblemIdByName(players || [], leader.name)}
              size={36}
              textClassName="md-overview-value md-text-bone"
            />
          ) : <p className="md-overview-value md-text-bone">Sem dados</p>}
          <p className="md-overview-sub">{leader ? `${leader.points} pontos` : "Registe uma partida"}</p>
        </article>

        <article className="md-overview-tile">
          <span className="md-overview-icon md-text-crimson"><Flame size={18} /></span>
          <p className="md-overview-label">Melhor ataque</p>
          {bestAttack ? (
            <NameWithEmblem
              name={bestAttack.name}
              emblemId={getEmblemIdByName(players || [], bestAttack.name)}
              size={36}
              textClassName="md-overview-value md-text-bone"
            />
          ) : <p className="md-overview-value md-text-bone">Sem dados</p>}
          <p className="md-overview-sub">{bestAttack ? `${bestAttack.gf} golos marcados` : "Ainda sem golos"}</p>
        </article>

        <article className="md-overview-tile">
          <span className="md-overview-icon md-text-amber"><Clock3 size={18} /></span>
          <p className="md-overview-label">Último resultado</p>
          <p className="md-overview-value md-text-bone">
            {lastMatch ? `${lastMatch.playerA} ${lastMatch.scoreA}–${lastMatch.scoreB} ${lastMatch.playerB}` : "Sem resultados"}
          </p>
          <p className="md-overview-sub">
            {lastMatch ? new Date(lastMatch.ts).toLocaleDateString("pt-PT") : "A competição começa aqui"}
          </p>
        </article>

        <article className="md-overview-tile">
          <span className="md-overview-icon md-text-amber"><CalendarDays size={18} /></span>
          <p className="md-overview-label">Próximo jogo</p>
          <p className="md-overview-value md-text-bone">{nextSchedule?.title || "Nada agendado"}</p>
          <p className="md-overview-sub">
            {nextSchedule ? new Date(nextSchedule.whenTs).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "Use a Agenda para marcar"}
          </p>
        </article>
      </div>

      <div className="md-form-strip">
        <div className="md-form-copy">
          <TrendingUp size={18} className="md-text-amber" />
          <span><strong>Forma recente</strong><small>{myName || "Jogador atual"}</small></span>
        </div>
        <div className="md-form-results" aria-label="Últimos cinco resultados">
          {form.length ? form.map((result, index) => (
            <span key={`${result}-${index}`} className={`md-form-result md-form-${result.toLowerCase()}`}>{result}</span>
          )) : <span className="md-overview-sub">Sem partidas</span>}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Root App ---------------- */

export default function App() {
  useFonts();

  const [phase, setPhase] = useState("loading"); // loading | join | app
  const [storageOk, setStorageOk] = useState(true);
  const [myName, setMyName] = useState("");
  const [myPlayerId, setMyPlayerId] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groupData, setGroupData] = useState(null); // { name, players:[{id,name}], matches:[...] }
  const [tab, setTab] = useState("log");
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);
  const [feedOpen, setFeedOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState("visual");
  const [authIsAdmin, setAuthIsAdmin] = useState(false);
  const [codeIsAdmin, setCodeIsAdmin] = useState(false);
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
  const isAdmin = authIsAdmin || codeIsAdmin;

  useEffect(() => {
    (async () => {
      const name = await storageGet("my-name", false);
      const playerId = await storageGet("my-player-id", false);
      const code = await storageGet("my-group", false);
      const adminUnlock = await storageGet("admin-code-unlocked", false);
      if (name) setMyName(name);
      if (playerId) setMyPlayerId(playerId);
      if (adminUnlock === "1") setCodeIsAdmin(true);
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
    if (!groupData?.players?.length) return;
    const players = groupData.players || [];
    const hasCurrentPlayerId = myPlayerId && players.some((player) => player.id === myPlayerId);
    if (hasCurrentPlayerId) return;

    const byName = players.find((player) => normalizeName(player.name) === normalizeName(myName));
    if (!byName?.id) return;

    setMyPlayerId(byName.id);
    storageSet("my-player-id", byName.id, false);
  }, [groupData?.players, myName, myPlayerId]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthIsAdmin(user?.uid === ADMIN_UID);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      if (window.matchMedia("(max-width: 639px)").matches) {
        setHeaderHidden(false);
        lastScrollYRef.current = y;
        return;
      }

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
    const persisted = await storageSet(`group:${groupCode}`, JSON.stringify(data), true);
    setStorageOk(Boolean(persisted));
    return Boolean(persisted);
  };

  const normalizeName = (value) => (value || "").trim().toLowerCase();

  const isDuplicatePlayerName = (players, candidate) =>
    players.some((p) => normalizeName(p.name) === normalizeName(candidate));

  const handleCreateGroup = async (name, groupName) => {
    const trimmedName = name.trim();
    const code = genCode();
    const firstPlayer = { id: genId(), name: trimmedName, emblemId: "" };
    const data = {
      name: groupName || "Meu Grupo",
      fmaPlaylistId: String(FMA_PLAYLISTS[0]?.id || "").trim(),
      fmaPlayback: {
        trackIndex: 0,
        startedAt: Date.now(),
        paused: false,
        pausePositionSec: 0,
        updatedAt: Date.now(),
      },
      players: [firstPlayer],
      matches: [],
      messages: [],
      schedules: [],
      activeLeague: null,
      leagueHistory: [],
    };
    setMyName(trimmedName);
    setMyPlayerId(firstPlayer.id);
    setGroupCode(code);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-player-id", firstPlayer.id, false);
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
      setMyPlayerId(existingPlayer.id || "");
      setGroupCode(upper);
      await storageSet("my-name", existingPlayer.name, false);
      await storageSet("my-player-id", existingPlayer.id || "", false);
      await storageSet("my-group", upper, false);
      cacheGroupLocally(upper, data);
      setGroupData(data);
      lastSeenCount.current = data.matches.length;
      lastSeenMessages.current = data.messages.length;
      setUnreadChat(0);
      setPhase("app");
      return { ok: true };
    }

    const newPlayer = { id: genId(), name: trimmedName, emblemId: "" };
    data.players.push(newPlayer);
    await storageSet(`group:${upper}`, JSON.stringify(data), true);
    setMyName(trimmedName);
    setMyPlayerId(newPlayer.id);
    setGroupCode(upper);
    await storageSet("my-name", trimmedName, false);
    await storageSet("my-player-id", newPlayer.id, false);
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
    const ok = await saveGroup(data);
    if (!ok) return { error: "Não foi possível adicionar o jogador agora." };
    pushToast({
      title: "Jogador adicionado",
      body: `${trimmed} já faz parte do grupo.`,
    });
    return { ok: true };
  };

  const handleSaveMyEmblem = async (emblemId) => {
    if (!groupData?.players?.length) return;
    const nextPlayers = (groupData.players || []).map((player) => {
      const isCurrentById = Boolean(myPlayerId) && String(player.id || "") === String(myPlayerId || "");
      const isCurrentByName = normalizeName(player.name) === normalizeName(myName);
      if (!isCurrentById && !isCurrentByName) return player;
      return { ...player, emblemId };
    });
    const ok = await saveGroup({ ...groupData, players: nextPlayers });
    if (ok) {
      pushToast({
        title: "Emblema atualizado",
        body: emblemId ? "O novo emblema já está visível." : "O emblema foi removido.",
      });
    }
  };

  const handleSaveMusicSettings = async ({ playlistId }) => {
    if (!isAdmin) return { error: "Somente o administrador pode alterar a playlist." };
    const cleanPlaylistId = String(playlistId || "").trim() || String(FMA_PLAYLISTS[0]?.id || "").trim();
    const now = Date.now();
    const ok = await saveGroup({
      ...groupData,
      fmaPlaylistId: cleanPlaylistId,
      fmaPlayback: normalizeFmaPlayback(
        {
          trackIndex: 0,
          startedAt: now,
          paused: false,
          pausePositionSec: 0,
          updatedAt: now,
        },
        cleanPlaylistId
      ),
    });
    if (!ok) return { error: "Nao foi possivel salvar a playlist agora." };
    return { ok: true };
  };

  const handleSyncMusicPlayback = async (patch: any = {}) => {
    if (!isAdmin || !groupData) return { error: "Somente o administrador pode controlar a reproducao." };

    const nextPlayback = normalizeFmaPlayback(
      {
        ...(groupData?.fmaPlayback || {}),
        ...patch,
        updatedAt: Number(patch?.updatedAt || Date.now()),
      },
      groupData?.fmaPlaylistId
    );

    const currentPlayback = normalizeFmaPlayback(groupData?.fmaPlayback || {}, groupData?.fmaPlaylistId);
    const unchanged =
      currentPlayback.trackIndex === nextPlayback.trackIndex &&
      currentPlayback.startedAt === nextPlayback.startedAt &&
      currentPlayback.paused === nextPlayback.paused &&
      currentPlayback.pausePositionSec === nextPlayback.pausePositionSec;

    if (unchanged) return { ok: true };

    const ok = await saveGroup({
      ...groupData,
      fmaPlayback: nextPlayback,
    });
    if (!ok) return { error: "Nao foi possivel sincronizar a musica agora." };
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

    const ok = await saveGroup(data);
    if (ok) pushToast({
      title: "Jogador removido",
      body: `${trimmed} foi removido do grupo.`,
    });
  };

  const handleDeleteMatch = async (matchId) => {
    const confirmed = window.confirm("Tem certeza que deseja apagar esta partida?");
    if (!confirmed) return;

    const nextMatches = (groupData?.matches || []).filter((m) => m.id !== matchId);
    const data = {
      ...groupData,
      matches: nextMatches,
    };
    const ok = await saveGroup(data);
    if (ok) pushToast({
      title: "Resultado apagado",
      body: "A classificação foi atualizada.",
    });
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

    const ok = await saveGroup({ ...groupData, activeLeague: league });
    if (!ok) return { error: "Não foi possível criar a competição agora." };
    pushToast({
      title: "Competição criada",
      body: `${league.name} já está ativa.`,
    });
    return { ok: true };
  };

  const finalizeLeague = async () => {
    if (finalizingLeagueRef.current) return { error: "A finalizacao ja esta em andamento." };
    finalizingLeagueRef.current = true;
    try {
      const league = groupData?.activeLeague;
      if (!league) return { error: "Nao existe uma competicao ativa." };

      const leagueMatches = getLeagueMatches(groupData?.matches || [], league);
      if (!leagueMatches.length) {
        const error = "Registe pelo menos uma partida antes de terminar o torneio.";
        pushToast({ title: "Torneio nao terminado", body: error });
        return { error };
      }

      const standings = sortStandings(computeStats(groupData?.players || [], leagueMatches));
      const champion = standings[0];
      if (!champion) {
        const error = "Nao foi possivel calcular o campeao desta competicao.";
        pushToast({ title: "Torneio nao terminado", body: error });
        return { error };
      }

      const championEmblemId = getEmblemIdByName(groupData?.players || [], champion.name);
      const allAchievements = computeAchievements(groupData?.players || [], leagueMatches);
      const totalGoals = leagueMatches.reduce(
        (sum, match) => sum + Number(match.scoreA || 0) + Number(match.scoreB || 0),
        0,
      );
      const matchSummaries = leagueMatches.map((match) => {
        const votes = getEffectiveMvpVotes(match);
        const topVote = Object.entries(votes).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0];
        return {
          id: match.id,
          playerA: match.playerA,
          playerB: match.playerB,
          scoreA: Number(match.scoreA || 0),
          scoreB: Number(match.scoreB || 0),
          ts: Number(match.ts || 0),
          mvp: Number(topVote?.[1] || 0) > 0 ? topVote[0] : "",
        };
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
        achievements: allAchievements,
        standings,
        matches: matchSummaries,
        summary: {
          totalGoals,
          draws: leagueMatches.filter((match) => Number(match.scoreA) === Number(match.scoreB)).length,
        },
      };

      await saveGroup({
        ...groupData,
        activeLeague: null,
        leagueHistory: [...(groupData?.leagueHistory || []), archiveEntry],
      });

      pushToast({
        title: "Competicao encerrada",
        body: `${champion.name} e o campeao da ${league.name}. O PDF esta pronto.`,
      });
      return { ok: true, archiveEntry };
    } catch (error) {
      console.error("Falha ao finalizar competicao", error);
      const message = "Nao foi possivel terminar o torneio. Tente novamente.";
      pushToast({ title: "Erro ao terminar torneio", body: message });
      return { error: message };
    } finally {
      finalizingLeagueRef.current = false;
    }
  };

  const restoreLeague = async (archiveId) => {
    const history = Array.isArray(groupData?.leagueHistory) ? groupData.leagueHistory : [];
    if (groupData?.activeLeague) {
      return { error: "Termine a competicao ativa antes de restaurar outra." };
    }

    const archivedLeague = history.find((item) => item?.id === archiveId);
    if (!archivedLeague) {
      return { error: "Nao foi possivel encontrar esta competicao no historico." };
    }

    const allMatches = Array.isArray(groupData?.matches) ? groupData.matches : [];
    const archivedMatchIds = new Set(
      (Array.isArray(archivedLeague.matches) ? archivedLeague.matches : [])
        .map((match) => match?.id)
        .filter(Boolean),
    );
    const archivedMatchIndexes = allMatches
      .map((match, index) => (archivedMatchIds.has(match?.id) ? index : -1))
      .filter((index) => index >= 0);
    const fallbackStartIndex = Math.max(
      0,
      allMatches.length - Math.max(0, Number(archivedLeague.matchesCount || 0)),
    );
    const startMatchCount = archivedMatchIndexes.length
      ? Math.min(...archivedMatchIndexes)
      : fallbackStartIndex;

    const restoredLeague = {
      id: archivedLeague.id,
      name: archivedLeague.name || "Competicao restaurada",
      mode: archivedLeague.mode === "time" ? "time" : "games",
      prize: archivedLeague.prize || "",
      targetMatches: Math.max(
        1,
        Number(archivedLeague.targetMatches || archivedLeague.matchesCount || 1),
      ),
      targetDateTs: Number(archivedLeague.targetDateTs || 0),
      startedAt: Number(archivedLeague.startedAt || Date.now()),
      startMatchCount,
      createdBy: archivedLeague.createdBy || myName || "Sistema",
    };

    try {
      const ok = await saveGroup({
        ...groupData,
        activeLeague: restoredLeague,
        leagueHistory: history.filter((item) => item?.id !== archiveId),
      });
      if (!ok) {
        return { error: "Nao foi possivel restaurar a competicao agora." };
      }
      pushToast({
        title: "Competicao restaurada",
        body: `${restoredLeague.name} voltou a ficar ativa com os resultados preservados.`,
      });
      return { ok: true, restoredLeague };
    } catch (error) {
      console.error("Falha ao restaurar competicao", error);
      return { error: "Nao foi possivel restaurar a competicao agora." };
    }
  };

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
    const ok = await saveGroup(data);
    if (ok) pushToast({
      title: "Resultado atualizado",
      body: "As estatísticas já foram recalculadas.",
    });
  };

  const handleLeaveGroup = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {}

    await storageSet("my-group", "", false);
    await storageSet("my-player-id", "", false);
    await storageSet("admin-code-unlocked", "", false);
    setCodeIsAdmin(false);
    setAuthIsAdmin(false);
    setGroupData(null);
    setGroupCode("");
    setMyPlayerId("");
    setPhase("join");
  };

  const handleUnlockAdmin = async (adminCode) => {
    const normalized = String(adminCode || "").trim();
    if (!normalized) return { error: "Digite o codigo de administrador." };
    if (normalized !== ADMIN_UID) return { error: "Codigo de administrador invalido." };
    setCodeIsAdmin(true);
    await storageSet("admin-code-unlocked", "1", false);
    return { ok: true };
  };

  const myEmblemId =
    (groupData?.players || []).find((player) => String(player?.id || "") === String(myPlayerId || ""))?.emblemId ||
    getEmblemIdByName(groupData?.players || [], myName);

  useEffect(() => {
    const clubTheme = getClubTheme(myEmblemId || "default");
    applyTheme(clubTheme);
    document.documentElement.dataset.clubTheme = myEmblemId || "default";
  }, [myEmblemId]);
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
    const ok = await saveGroup({ ...groupData, schedules: [...(groupData?.schedules || []), entry] });
    if (ok) pushToast({
      title: "Partida agendada",
      body: entry.title || "O novo compromisso foi guardado.",
    });
  };

  const handleDeleteSchedule = async (id) => {
    const next = (groupData?.schedules || []).filter((s) => s.id !== id);
    const ok = await saveGroup({ ...groupData, schedules: next });
    if (ok) pushToast({
      title: "Agendamento removido",
      body: "A agenda do grupo foi atualizada.",
    });
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
        <div className="min-h-screen md-bg-stadium md-efootball-ui flex items-center justify-center">
          <div className="font-oswald md-text-amber md-tracking-lg text-sm md-anim-pulse">CARREGANDO…</div>
        </div>
      )}

      {phase === "join" && (
        <JoinScreen
          defaultName={myName}
          onCreate={handleCreateGroup}
          onJoin={handleJoinGroup}
          isAdmin={isAdmin}
          onUnlockAdmin={handleUnlockAdmin}
        />
      )}

      {phase === "app" && (
        <div
          className="min-h-screen md-bg-stadium font-inter md-text-bone md-ui-boost md-app-shell md-efootball-ui"
          data-visual-system="efootball-inspired"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
            onThemeToggle={() => {
              setSettingsSection("visual");
              setThemeOpen((v) => !v);
            }}
            onLeave={handleLeaveGroup}
          />

          <Ticker matches={groupData?.matches || []} players={groupData?.players || []} />

          {feedOpen && (
            <ActivityFeed matches={groupData?.matches || []} players={groupData?.players || []} onClose={() => setFeedOpen(false)} />
          )}

          <Tabs tab={tab} setTab={setTab} unreadChat={unreadChat} />

          <main className="max-w-2xl mx-auto px-4 pb-24 pt-5 md-mobile-pad-bottom md-main-content">
            {tab === "log" && (
              <div className="space-y-6">
                <OverviewDashboard
                  players={groupData?.players || []}
                  matches={groupData?.matches || []}
                  schedules={groupData?.schedules || []}
                  myName={myName}
                />
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
                    const ok = await saveGroup(data);
                    if (!ok) {
                      return { error: "Nao foi possivel salvar a partida com foto. Tente novamente com uma imagem menor." };
                    }
                    pushToast({
                      title: "Resultado registado",
                      body: `${playerA} ${scoreA}–${scoreB} ${playerB}`,
                    });
                    return { ok: true };
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
                onRestoreLeague={restoreLeague}
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
            initialSection={settingsSection}
            myName={myName}
            myEmblemId={myEmblemId}
            onSaveMyEmblem={handleSaveMyEmblem}
            onNotify={pushToast}
          />
          <button
            onClick={() => {
              setSettingsSection("visual");
              setThemeOpen(true);
            }}
            className="md-theme-fab fixed right-5 md-safe-float z-40 md-btn-amber rounded-full px-4 py-3 font-oswald text-sm shadow-[0_12px_24px_rgba(0,0,0,0.35)] md-touch-target"
            aria-label="Abrir temas"
          >
            <span className="md-theme-fab-content inline-flex items-center gap-2"><Settings size={18} /> <span className="md-theme-fab-label">Temas</span></span>
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

function JoinScreen({ defaultName, onCreate, onJoin, isAdmin = false, onUnlockAdmin }) {
  useFonts();
  const [mode, setMode] = useState("join");
  const [name, setName] = useState(defaultName || "");
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [adminCode, setAdminCode] = useState("");
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

  const submitAdminUnlock = async () => {
    setError("");
    const res = await onUnlockAdmin?.(adminCode);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setAdminCode("");
  };

  return (
    <div className="md-join-shell md-efootball-ui min-h-screen md-bg-stadium font-inter md-text-bone md-ui-boost flex items-center justify-center px-4"
      data-visual-system="efootball-inspired">
      <GlobalStyle />
      <div className="md-join-card w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full md-bg-amber-10 md-border md-border-amber-30 mb-3 md-anim-trophy-rise-drop">
            <Trophy size={26} className="md-text-amber" />
          </div>
          <h1 className="font-oswald text-3xl md-tracking-sm md-text-bone md-anim-logo-blink">EFOOTBALL RIVALS</h1>
          <p className="md-text-muted text-sm mt-1 md-anim-logo-blink">A tua central competitiva de eFootball</p>
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

        {!isAdmin && (
          <div className="md-bg-panel md-border md-border-line rounded-xl p-3 mb-4 space-y-2">
            <p className="text-xs md-text-muted font-oswald">ENTRAR COMO ADMINISTRADOR</p>
            <input
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value.trim())}
              placeholder="Codigo UID"
              className="md-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={submitAdminUnlock}
              className="md-step-btn w-full py-2 rounded-lg text-xs font-oswald"
            >
              ENTRAR COMO ADMIN
            </button>
          </div>
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

function Ticker({ matches, players }) {
  if (!matches.length) return null;
  const recent = matches.slice(-10).reverse();
  const items = [...recent, ...recent];
  return (
    <div className="md-score-ticker md-bg-panel border-b md-border-line overflow-hidden py-1.5">
      <div className="flex gap-8 whitespace-nowrap md-anim-marquee" style={{ width: "max-content" }}>
        {items.map((m, i) => {
          const isDraw = m.scoreA === m.scoreB;
          const winner = isDraw ? m.playerA : (m.scoreA > m.scoreB ? m.playerA : m.playerB);
          const loser = isDraw ? m.playerB : (m.scoreA > m.scoreB ? m.playerB : m.playerA);
          const winnerScore = Math.max(m.scoreA, m.scoreB);
          const loserScore = Math.min(m.scoreA, m.scoreB);
          return (
            <span key={i} className="md-ticker-item font-oswald text-sm tracking-wide md-text-muted">
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

function Header({
  groupName,
  groupCode,
  inviteLink = "",
  myName = "",
  myEmblemId = "",
  hidden = false,
  unread,
  onBell,
  onLeave,
  onThemeToggle,
}) {
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <header
      className={`md-app-header border-b md-border-line md-bg-panel-dark-80 sticky top-0 z-40 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      data-mobile-safe-header="enabled"
    >
      <div className="md-header-inner max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
              className="md-brand-mark md-world-cup-mark shrink-0"
              data-header-trophy="world-cup"
              title="Troféu da Copa do Mundo"
            >
              <svg
                viewBox="0 0 64 64"
                className="md-brand-icon md-world-cup-icon"
                role="img"
                aria-label="Troféu da Copa do Mundo"
              >
                <defs>
                  <linearGradient id="world-cup-gold" x1="18" y1="5" x2="46" y2="58" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#FFF9B0" />
                    <stop offset="0.36" stopColor="#FFD84A" />
                    <stop offset="0.72" stopColor="#E39A00" />
                    <stop offset="1" stopColor="#8B5200" />
                  </linearGradient>
                  <linearGradient id="world-cup-base" x1="24" y1="47" x2="40" y2="59" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#FFF2A0" />
                    <stop offset="0.52" stopColor="#D99000" />
                    <stop offset="1" stopColor="#704000" />
                  </linearGradient>
                </defs>

                <circle cx="32" cy="14.5" r="9.5" fill="url(#world-cup-gold)" />
                <path d="M23 14.5h18M32 5c-3 2.8-4.5 5.9-4.5 9.5S29 21.2 32 24m0-19c3 2.8 4.5 5.9 4.5 9.5S35 21.2 32 24" fill="none" stroke="#FFF8C7" strokeWidth="1.35" strokeLinecap="round" opacity="0.9" />
                <path
                  d="M25.7 20.7c-1.2 5.3-5.3 8.3-4.7 14.1.5 5.2 4.1 8.6 7.8 10.9l-1.5 5.5h9.4l-1.5-5.5c3.7-2.3 7.3-5.7 7.8-10.9.6-5.8-3.5-8.8-4.7-14.1-2 3.1-3.8 5.2-6.3 6.8-2.5-1.6-4.3-3.7-6.3-6.8Z"
                  fill="url(#world-cup-gold)"
                />
                <path d="M27.3 24.5c-1.6 3.6-4 6.4-3.5 10.2.4 3.2 2.6 5.7 5.5 7.6M36.7 24.5c1.6 3.6 4 6.4 3.5 10.2-.4 3.2-2.6 5.7-5.5 7.6" fill="none" stroke="#8B5700" strokeWidth="1.7" strokeLinecap="round" opacity="0.78" />
                <path d="M27.2 47.7h9.6l2.2 6.2H25l2.2-6.2Z" fill="url(#world-cup-base)" />
                <rect x="22" y="53" width="20" height="6.5" rx="2.8" fill="url(#world-cup-base)" />
                <path d="M25.5 55.3h13" stroke="#FFF2A0" strokeWidth="1.1" strokeLinecap="round" opacity="0.82" />
              </svg>
              <span className="md-world-cup-shine" aria-hidden="true" />
            </div>
            <div className="md-header-copy min-w-0">
            <p className="md-group-title font-oswald text-sm tracking-wide truncate md-text-bone">{groupName || "GRUPO"}</p>
            {myName && (
              <div className="md-user-pill mt-1 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/60 bg-amber-400/18 px-4 py-1.5 shadow-[0_0_24px_rgba(255,182,39,0.45)] md-anim-user-blink">
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
        <div className="md-header-actions flex items-center gap-1 shrink-0">
          <button
            onClick={() => setDetailsOpen((value) => !value)}
            className="md-header-action md-mobile-group-toggle md-icon-btn p-2 rounded-full"
            aria-label="Abrir dados do grupo"
          >
            <Share2 size={16} className="md-text-muted" />
          </button>
          <button onClick={onThemeToggle} className="md-header-action md-icon-btn p-2 rounded-full mr-1" aria-label="Abrir temas">
            <Settings size={16} className="md-text-muted" />
          </button>
          <button onClick={onBell} className="md-header-action md-icon-btn relative p-2 rounded-full" aria-label="Abrir notificações">
            <Bell size={18} className="md-text-bone" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 md-bg-crimson rounded-full" />
            )}
          </button>
          <button onClick={onLeave} className="md-header-action md-leave-action md-icon-btn p-2 rounded-full" aria-label="Sair do grupo">
            <LogOut size={16} className="md-text-muted" />
          </button>
        </div>
      </div>
      {detailsOpen && (
        <div className="md-mobile-group-panel">
          <div>
            <span>GRUPO</span>
            <strong>{groupName || "GRUPO"}</strong>
          </div>
          <button type="button" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>Código</span>
            <strong>{groupCode}</strong>
          </button>
          <button type="button" onClick={copyInvite}>
            {copiedInvite ? <Check size={15} /> : <Link2 size={15} />}
            <span>{copiedInvite ? "Link copiado" : "Copiar convite"}</span>
          </button>
          <button type="button" onClick={onLeave} className="md-mobile-group-exit">
            <LogOut size={15} />
            <span>Sair do grupo</span>
          </button>
        </div>
      )}
    </header>
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
  const [moreOpen, setMoreOpen] = useState(false);
  const items = [
    { id: "log", label: "Registrar", mobileLabel: "Novo", icon: <Plus size={17} /> },
    { id: "agenda", label: "Agenda", icon: <CalendarDays size={15} /> },
    { id: "chat", label: "Chat", icon: <MessageCircle size={15} /> },
    { id: "results", label: "Resultados", mobileLabel: "Jogos", icon: <Trophy size={15} /> },
    { id: "competition", label: "Competição", icon: <Crown size={15} /> },
    { id: "standings", label: "Classificação", mobileLabel: "Tabela", icon: <BarChart3 size={15} /> },
    { id: "h2h", label: "Confronto", icon: <Swords size={15} /> },
  ];
  const primaryIds = ["log", "agenda", "chat", "results"];
  const primaryItems = items.filter((item) => primaryIds.includes(item.id));
  const moreItems = items.filter((item) => !primaryIds.includes(item.id));
  const selectTab = (id) => {
    setTab(id);
    setMoreOpen(false);
  };

  return (
    <>
      <div className="md-nav-shell md-desktop-nav max-w-2xl mx-auto px-4 pt-4">
        <div className="md-tabs-row md-bg-panel md-border md-border-line rounded-lg p-1">
          <div className="md-tabs-inner">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => selectTab(it.id)}
                className={`md-tab md-tab-swipe md-touch-target relative flex items-center justify-center gap-1.5 py-2.5 rounded-md font-oswald text-xs tracking-wide ${tab === it.id ? "active" : ""}`}
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

      <nav className="md-mobile-bottom-nav" aria-label="Navegação principal">
        {moreOpen && (
          <div className="md-mobile-more-menu">
            <p>MAIS OPÇÕES</p>
            <div>
              {moreItems.map((item) => (
                <button key={`more-${item.id}`} type="button" onClick={() => selectTab(item.id)} className={tab === item.id ? "active" : ""}>
                  {item.icon}<span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="md-mobile-bottom-nav-inner">
          {primaryItems.map((item) => (
            <button key={`mobile-${item.id}`} type="button" onClick={() => selectTab(item.id)} className={tab === item.id ? "active" : ""}>
              {item.icon}
              <span>{item.mobileLabel || item.label}</span>
              {item.id === "chat" && unreadChat > 0 && <b>{unreadChat > 99 ? "99+" : unreadChat}</b>}
            </button>
          ))}
          <button type="button" onClick={() => setMoreOpen((value) => !value)} className={moreItems.some((item) => item.id === tab) || moreOpen ? "active" : ""}>
            <MoreHorizontal size={18} />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
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

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Nome do usuário"
            className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={addPlayer} className="md-btn-amber px-3 rounded-lg font-oswald text-xs md-touch-target">
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

        <div className="space-y-2 max-h-[45dvh] sm:max-h-[420px] overflow-y-auto pr-1 md-scroll-y">
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
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit();
            }}
            placeholder="Escreva uma mensagem para o grupo"
            className="md-input flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={pickMedia} className="md-step-btn px-3 rounded-lg font-oswald text-xs flex items-center justify-center gap-1 md-touch-target">
            <ImagePlus size={13} /> FOTO/GIF
          </button>
          <button onClick={submit} className="md-btn-amber px-4 rounded-lg font-oswald text-xs flex items-center justify-center gap-2 md-touch-target">
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

function ResultPhotoLightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;

  return createPortal(
    <div
      className="md-result-photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Fotografia do resultado"
      onClick={onClose}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="md-result-photo-close md-touch-target"
        onClick={onClose}
        aria-label="Fechar fotografia"
      >
        <X size={24} />
        <span>Fechar</span>
      </button>

      <div className="md-result-photo-stage" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt="Fotografia do resultado em tamanho completo" />
        <p>Fotografia do resultado</p>
      </div>
    </div>,
    document.body,
  );
}

function ResultsManagement({ players, matches, onDeleteMatch, onEditMatch, onVoteMvp, onAddMedia }) {
  const [editingId, setEditingId] = useState(null);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [mediaInputByMatch, setMediaInputByMatch] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const shareMatch = async (match) => {
    const baseText = `${match.playerA} ${match.scoreA} x ${match.scoreB} ${match.playerB} | Matchday Ledger`;
    const firstMedia = Array.isArray(match.media) && match.media.length > 0 ? String(match.media[0]) : "";

    const makeFileFromMedia = async (mediaUrl) => {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const mime = blob.type || "image/png";
      const ext = mime.includes("gif") ? "gif" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
      return new File([blob], `partida-${match.id || Date.now()}.${ext}`, { type: mime });
    };

    if (navigator.share) {
      try {
        if (firstMedia) {
          try {
            const imageFile = await makeFileFromMedia(firstMedia);
            if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
              await navigator.share({
                title: "Resultado da partida",
                text: baseText,
                files: [imageFile],
              });
              return;
            }
          } catch {}
        }

        const textWithLink = firstMedia && !firstMedia.startsWith("data:")
          ? `${baseText}\n${firstMedia}`
          : baseText;
        await navigator.share({ title: "Resultado da partida", text: textWithLink });
        return;
      } catch {}
    }

    const textWithLink = firstMedia && !firstMedia.startsWith("data:")
      ? `${baseText}\n${firstMedia}`
      : baseText;
    const wa = `https://wa.me/?text=${encodeURIComponent(textWithLink)}`;
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

  const classifyMediaUrl = (url) => {
    const value = String(url || "").trim();
    if (!value) return { kind: "unknown", value };
    if (value.startsWith("data:image/")) return { kind: "image", value };
    if (value.startsWith("data:video/")) return { kind: "video", value };
    if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(value)) return { kind: "image", value };
    if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value)) return { kind: "video", value };
    return { kind: "link", value };
  };

  return (
    <div className="space-y-4">
      <ResultPhotoLightbox src={previewPhoto} onClose={() => setPreviewPhoto(null)} />
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
                    <button onClick={() => { setScoreA(0); setScoreB(0); }} className="md-step-btn flex-1 rounded-lg py-2 text-xs font-oswald">ZERAR</button>
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
                          (() => {
                            const media = classifyMediaUrl(url);
                            if (media.kind === "image") {
                              return (
                                <button
                          key={`${match.id}-m-${idx}`}
                          type="button"
                          onClick={() => setPreviewPhoto(media.value)}
                          className="md-result-photo-button block w-full"
                          aria-label={`Abrir fotografia da partida ${idx + 1}`}
                        >
                          <img
                            src={media.value}
                            alt={`Fotografia da partida ${idx + 1}`}
                            className="w-full max-h-56 object-cover rounded-lg border border-white/10"
                          />
                          <span className="md-result-photo-hint">Abrir foto</span>
                        </button>
                              );
                            }
                            if (media.kind === "video") {
                              return (
                                <video
                                  key={`${match.id}-m-${idx}`}
                                  controls
                                  preload="metadata"
                                  className="w-full max-h-56 rounded-lg border border-white/10 bg-black/20"
                                >
                                  <source src={media.value} />
                                </video>
                              );
                            }
                            return (
                              <a key={`${match.id}-m-${idx}`} href={media.value} target="_blank" rel="noreferrer" className="text-xs md-link-amber flex items-center gap-1 break-all">
                                <Video size={12} /> Abrir midia anexada
                              </a>
                            );
                          })()
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => startEdit(match)} className="md-btn-amber rounded-lg py-2 text-xs font-oswald md-touch-target">EDITAR</button>
                    <button onClick={() => shareMatch(match)} className="md-step-btn rounded-lg py-2 text-xs font-oswald flex items-center justify-center gap-1 md-touch-target">
                      <Share2 size={12} /> PARTILHAR
                    </button>
                    <button onClick={() => onDeleteMatch(match.id)} className="md-step-btn-danger rounded-lg py-2 text-xs font-oswald md-touch-target">APAGAR</button>
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
  const [error, setError] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioUnlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/sounds/you-wim.mp3");
    audio.preload = "auto";
    audio.volume = 1;
    winAudioRef.current = audio;
    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    };
  }, []);

  const fileToDataUrl = (file) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });

  const optimizePhotoDataUrl = async (file) => {
    if (!file?.type?.startsWith("image/")) return "";
    if (file.type === "image/gif") {
      return await fileToDataUrl(file);
    }

    const original = await fileToDataUrl(file);
    const targetBytes = 260 * 1024;
    if (original.length <= targetBytes) return original;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Falha ao processar imagem"));
      image.src = original;
    });

    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, width, height);

    const qualities = [0.82, 0.72, 0.62, 0.52, 0.45];
    let best = canvas.toDataURL("image/jpeg", qualities[0]);
    for (const quality of qualities) {
      const candidate = canvas.toDataURL("image/jpeg", quality);
      best = candidate;
      if (candidate.length <= targetBytes) break;
    }

    return best;
  };

  const playWinVoice = () => {
    const phrase = "YOU WIM";

    const speakOnWeb = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.lang = "en-US";
        utter.rate = 1;
        utter.pitch = 1.03;
        utter.volume = 1;
        window.speechSynthesis.speak(utter);
      } catch {}
    };

    const playLocalFile = () => {
      const audio = winAudioRef.current;
      if (!audio) return Promise.reject(new Error("audio indisponivel"));
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      } catch {}
      return audio.play();
    };

    playLocalFile().catch(() => {});

    if (!Capacitor.isNativePlatform()) {
      setTimeout(() => {
        playLocalFile().catch(() => {
          speakOnWeb();
        });
      }, 220);
      return;
    }

    TextToSpeech.stop()
      .catch(() => {})
      .then(() => TextToSpeech.speak({
        text: phrase,
        lang: "en-US",
        rate: 1,
        pitch: 1.03,
        volume: 1,
        category: "playback",
      }))
      .catch(() => {
        speakOnWeb();
      });

    setTimeout(() => {
      playLocalFile().catch(() => {
        speakOnWeb();
      });
    }, 650);
  };

  const primeWinAudio = () => {
    const audio = winAudioRef.current;
    if (!audio || winAudioUnlockedRef.current) return;
    try {
      audio.muted = true;
      const maybePromise = audio.play();
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            winAudioUnlockedRef.current = true;
          })
          .catch(() => {
            audio.muted = false;
          });
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        winAudioUnlockedRef.current = true;
      }
    } catch {
      audio.muted = false;
    }
  };

  const handlePickPhoto = () => {
    cameraInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    optimizePhotoDataUrl(file)
      .then((dataUrl) => {
        if (!dataUrl) {
          setError("Nao foi possivel preparar a foto.");
          return;
        }
        setPhotoDataUrl(dataUrl);
      })
      .catch(() => {
        setError("Erro ao processar a foto. Tente outra imagem.");
      });
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
    setError("");
    setSaving(true);
    setFireworks(false);
    // Pre-unlock local audio inside the click gesture so playback is immediate when the result animation appears.
    const shouldPlayWinVoice = sa > sb;
    if (shouldPlayWinVoice) primeWinAudio();
    const response = await onSubmit({ playerA: a, playerB: b, scoreA: sa, scoreB: sb, photoDataUrl });
    if (response?.error) {
      if (shouldPlayWinVoice && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (shouldPlayWinVoice) {
        TextToSpeech.stop().catch(() => {});
        try {
          winAudioRef.current?.pause();
          if (winAudioRef.current) winAudioRef.current.currentTime = 0;
        } catch {}
      }
      setSaving(false);
      setError(response.error);
      return;
    }
    const res = sa > sb ? "win" : sa < sb ? "loss" : "draw";
    setResult(res);
    if (res === "win") {
      playWinVoice();
    }
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
    }, 5000);
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
            <div key={entry.name} className="md-player-rank-row rounded-lg px-3 py-3 md-bg-panel-dark-40">
              <div className="md-player-rank-identity flex items-center gap-2 min-w-0">
                <span className="md-player-rank-position font-oswald text-xs md-text-amber shrink-0">#{idx + 1}</span>
                <NameWithEmblem
                  name={entry.name}
                  emblemId={getEmblemIdByName(players, entry.name)}
                  size={38}
                  className="md-player-rank-name-wrap min-w-0 flex-1"
                  textClassName="md-player-rank-name font-oswald md-text-bone"
                />
              </div>
              <div className="md-player-rank-stats grid grid-cols-4 gap-1.5 text-[11px] font-oswald md-text-muted">
                <span className="rounded-full border border-white/15 px-2 py-1 text-center">PTS {entry.points}</span>
                <span className="rounded-full border border-white/15 px-2 py-1 text-center">SG {entry.goalDiff >= 0 ? "+" : ""}{entry.goalDiff}</span>
                <span className="rounded-full border border-white/15 px-2 py-1 text-center">GP {entry.gf}</span>
                <span className="rounded-full border border-white/15 px-2 py-1 text-center">AP {entry.efficiency}%</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <PlayerSelect label="Jogador A" value={a} onChange={setA} options={options} />
              <PlayerSelect label="Jogador B" value={b} onChange={setB} options={options} />
            </div>

            <div className="flex items-center justify-center gap-6 md-bg-stadium rounded-xl py-6 md-border md-border-line">
              <ScoreStepper value={sa} onChange={setSa} />
              <span className="font-oswald text-2xl md-text-muted-dim">×</span>
              <ScoreStepper value={sb} onChange={setSb} />
            </div>

            <button
              type="button"
              onClick={() => {
                setSa(0);
                setSb(0);
                setError("");
              }}
              className="md-step-btn w-full mt-3 rounded-lg py-2.5 text-xs font-oswald"
            >
              ZERAR PLACAR
            </button>

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

            {error && <p className="md-text-crimson text-sm mt-2 text-center">{error}</p>}

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
    <div className="md-player-select min-w-0">
      <label className="block text-sm font-oswald md-text-bone mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="md-input md-player-name-select w-full rounded-lg px-4 py-3 font-oswald"
        aria-label={label}
      >
        <option value="">Selecionar jogador</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {value && (
        <p className="md-player-selection mt-2" title={value}>
          Selecionado: <span>{value}</span>
        </p>
      )}
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

function LeagueManager({
  players,
  activeLeague,
  leagueHistory,
  matches,
  onCreateLeague,
  onFinalizeLeague,
  onRestoreLeague,
}) {
  const [name, setName] = useState("");
  const [prize, setPrize] = useState("");
  const [mode, setMode] = useState("games");
  const [targetMatches, setTargetMatches] = useState(10);
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [restoringId, setRestoringId] = useState("");
  const [reportStatus, setReportStatus] = useState("");

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

  const finishLeague = async () => {
    if (finalizing) return;
    setError("");
    setReportStatus("");
    setFinalizing(true);
    try {
      const result = await onFinalizeLeague();
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.archiveEntry) {
        downloadCompetitionPdf(result.archiveEntry);
        setReportStatus("Torneio terminado. O PDF foi gerado e tambem fica disponivel no historico.");
      }
    } catch {
      setError("Nao foi possivel terminar o torneio. Tente novamente.");
    } finally {
      setFinalizing(false);
    }
  };

  const handleSharePdf = async (item) => {
    setError("");
    setReportStatus("");
    try {
      const result = await shareCompetitionPdf(item);
      setReportStatus(result === "shared" ? "PDF partilhado." : "PDF descarregado.");
    } catch (shareError) {
      if (shareError?.name !== "AbortError") {
        setError("Nao foi possivel partilhar o PDF. Use o botao Descarregar PDF.");
      }
    }
  };

  const handleDownloadPdf = (item) => {
    setError("");
    setReportStatus("");
    try {
      downloadCompetitionPdf(item);
      setReportStatus("PDF descarregado.");
    } catch {
      setError("Nao foi possivel gerar o PDF desta competicao.");
    }
  };

  const handleRestoreLeague = async (item) => {
    if (restoringId || activeLeague) return;
    setError("");
    setReportStatus("");
    setRestoringId(item.id);
    try {
      const result = await onRestoreLeague(item.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setReportStatus("Torneio restaurado com todos os resultados preservados.");
    } catch {
      setError("Nao foi possivel restaurar esta competicao.");
    } finally {
      setRestoringId("");
    }
  };

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
            <button
              type="button"
              onClick={finishLeague}
              disabled={finalizing}
              className="md-btn-amber w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FileText size={14} /> {finalizing ? "A GERAR RELATORIO..." : "TERMINAR TORNEIO E GERAR PDF"}
            </button>
            {reportStatus && <p className="text-xs md-text-amber">{reportStatus}</p>}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSharePdf(item)}
                  className="md-btn-amber w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2"
                >
                  <Share2 size={13} /> PARTILHAR PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(item)}
                  className="md-step-btn w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2"
                >
                  <Download size={13} /> DESCARREGAR PDF
                </button>
              </div>

              {!activeLeague && (
                <button
                  type="button"
                  onClick={() => handleRestoreLeague(item)}
                  disabled={Boolean(restoringId)}
                  className="md-step-btn w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {restoringId === item.id ? "A RESTAURAR..." : "RESTAURAR TORNEIO"}
                </button>
              )}

              {item.posterDataUrl && (
                <>
                  <img src={item.posterDataUrl} alt={`Poster ${item.name}`} className="w-full rounded-lg border border-white/10" />
                  <button onClick={() => sharePoster(item)} className="md-step-btn w-full py-2 rounded-lg text-xs font-oswald flex items-center justify-center gap-2">
                    <Share2 size={12} /> PARTILHAR IMAGEM DO CAMPEAO
                  </button>
                </>
              )}
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
