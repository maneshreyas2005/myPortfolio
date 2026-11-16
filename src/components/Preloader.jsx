import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

/* ─────────────────────────────────────────
   Smooth ease-in-out-cubic easing
   Starts gently, speeds through mid-fill, settles cleanly at 100%
   ───────────────────────────────────────── */
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ─────────────────────────────────────────
   Build wave polygon path covering the liquid
   area below the wave crest
   ───────────────────────────────────────── */
function buildWavePath(y, phase, width = 1000, height = 320, amplitude = 12, wavelength = 360) {
  const points = [];
  const step = 20;

  for (let x = 0; x <= width; x += step) {
    const wy = y + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
    points.push(`${x.toFixed(1)},${wy.toFixed(1)}`);
  }

  const startY = (y + Math.sin(phase) * amplitude).toFixed(1);

  return (
    `M 0,${height} ` +
    `L 0,${startY} ` +
    points.map((p) => `L ${p}`).join(' ') +
    ` L ${width},${height} Z`
  );
}

/* ─── Constants ─── */
const DISPLAY_TEXT = 'Shreyas';
const VB_W = 1000;
const VB_H = 300;
const FONT_SIZE = 175;

/* ─────────────────────────────────────────
   Preloader — Neoleaf-style liquid-fill letters
   • Dark bg (#151312)
   • Prominent "Shreyas" in Poppins 900
   • Liquid wave rising from bottom to top in 1:1 sync with percentage
   • Waits for backend API data & critical assets
   • Continuous horizontal wave ripple
   • "loading...  XX %" counter aligned bottom-right
   • Top gradient accent bar
   ───────────────────────────────────────── */
export default function Preloader({ children }) {
  const { loading: isBackendLoading, profile } = usePortfolio();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const rafRef = useRef(null);
  const progressDoneRef = useRef(false);
  const isDataReadyRef = useRef(false);

  // Ready when both DOM/images are loaded AND backend API calls have resolved
  isDataReadyRef.current = !isBackendLoading && isPageLoaded;

  /* ── Exact wave Y calibration:
     progress 0%   -> waveY = 260 (crest at 248px is strictly below lowest descender at 245px)
     progress 50%  -> waveY = 165 (exact midpoint of lowercase letters)
     progress 100% -> waveY = 70  (trough at 82px completely submerges peak of 'S' and 'h' at 84px)
  ── */
  const waveY = 260 - (progress / 100) * 190;
  const wavePath = useMemo(() => {
    return buildWavePath(waveY, phase, VB_W, VB_H, 12, 360);
  }, [waveY, phase]);

  const checkDismiss = useCallback(() => {
    if (!showContent) {
      // 350ms pause at 100% so the full white text shines before revealing content
      const t = setTimeout(() => setShowContent(true), 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [showContent]);

  /* ── Two-stage progress animation:
     Stage 1: 0% -> 95% over ~2.5s
     Stage 2: Holds at 95% until isDataReadyRef is true, then smooth 400ms sprint to 100%
  ── */
  useEffect(() => {
    const start = performance.now();
    let currentProgress = 0;
    let completing = false;
    let completeStartTime = null;
    let initialFromP = 95;

    const animate = (now) => {
      // Continuous liquid wave ripple
      setPhase((now / 1000) * 3.5);

      if (!completing) {
        const elapsed = now - start;
        const targetDuration = 2500;
        const t = Math.min(elapsed / targetDuration, 1);
        const p = Math.round(easeInOutCubic(t) * 95);
        currentProgress = p;
        setProgress(p);

        // If backend & assets are ready AND we have progressed to at least 90%, complete to 100%
        if (isDataReadyRef.current && (p >= 90 || elapsed >= targetDuration)) {
          completing = true;
          completeStartTime = now;
          initialFromP = p;
        }
      } else {
        const elapsed = now - completeStartTime;
        const completeDuration = 400;
        const t = Math.min(elapsed / completeDuration, 1);
        const p = Math.round(initialFromP + (100 - initialFromP) * easeInOutCubic(t));
        setProgress(p);

        if (t >= 1) {
          setProgress(100);
          progressDoneRef.current = true;
          checkDismiss();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [checkDismiss]);

  /* ── Preload critical avatar image & wait for window.load ── */
  useEffect(() => {
    const avatarImg = profile?.profileImage || '/images/photo3.jpeg';
    const criticalImages = [avatarImg];
    let loadTimer;

    const handleLoad = () => {
      loadTimer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 150);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    const preloadPromises = criticalImages.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        })
    );

    Promise.all(preloadPromises).then(() => {
      if (document.readyState === 'complete') {
        loadTimer = setTimeout(() => {
          setIsPageLoaded(true);
        }, 150);
      }
    });

    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      window.removeEventListener('load', handleLoad);
    };
  }, [profile?.profileImage]);

  /* ── Safety timeout: never block longer than 7s ── */
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsPageLoaded(true);
      isDataReadyRef.current = true;
    }, 7000);
    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <>
      {/* ─── Loader overlay ─── */}
      <AnimatePresence mode="wait">
        {!showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.7, ease: 'easeOut' },
            }}
            className="
              fixed inset-0 z-[9999] bg-[#151312]
              flex flex-col items-center justify-center
              text-white overflow-hidden
            "
          >
            {/* ── Top gradient accent bar ── */}
            <div
              className="absolute top-0 left-0 h-[2px] z-[10000]"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(to right, #F46C38, #C5FF41, #FF2600)',
                transition: 'width 0.05s linear',
              }}
            />

            {/* ── Liquid wave text block ── */}
            <div className="relative w-[92vw] max-w-[850px] flex flex-col items-end">
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="w-full select-none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Dynamic wave clip-path generated every frame */}
                  <clipPath id="liquid-wave-clip" clipPathUnits="userSpaceOnUse">
                    <path d={wavePath} />
                  </clipPath>
                </defs>

                {/* Layer 1 — muted grey silhouette (always visible) */}
                <text
                  x="500"
                  y="210"
                  textAnchor="middle"
                  fontSize={FONT_SIZE}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="900"
                  fill="rgba(255,255,255,0.22)"
                  letterSpacing="-4"
                  style={{ userSelect: 'none' }}
                >
                  {DISPLAY_TEXT}
                </text>

                {/* Layer 2 — white fill, clipped by rising liquid wave */}
                <text
                  x="500"
                  y="210"
                  textAnchor="middle"
                  fontSize={FONT_SIZE}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="900"
                  fill="#FFFFFF"
                  letterSpacing="-4"
                  clipPath="url(#liquid-wave-clip)"
                  style={{ userSelect: 'none' }}
                >
                  {DISPLAY_TEXT}
                </text>
              </svg>

              {/* ── Bottom-right counter: "loading...  XX %" ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3 mt-1 mr-2 select-none"
              >
                <span className="text-[13px] sm:text-[15px] text-white/70 tracking-widest font-normal lowercase">
                  loading...
                </span>
                <span className="text-[13px] sm:text-[15px] text-white/80 font-medium tabular-nums tracking-wide">
                  {progress} %
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main content: scales up as loader fades ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.85,
        }}
        transition={{
          duration: 0.7,
          ease: 'easeOut',
        }}
        style={{
          pointerEvents: showContent ? 'auto' : 'none',
          userSelect: showContent ? 'auto' : 'none',
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
