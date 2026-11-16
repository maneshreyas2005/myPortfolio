import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
function buildWavePath(y, phase, width = 1000, height = 320, amplitude = 14, wavelength = 360) {
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
   • Liquid wave rising from bottom to top
   • Continuous horizontal wave ripple
   • "loading...  XX %" counter aligned bottom-right
   • Top gradient accent bar
   ───────────────────────────────────────── */
export default function Preloader({ children }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const rafRef = useRef(null);
  const progressDoneRef = useRef(false);

  /* ── Wave path calculation ──
     y ranges from 255 (below letters) to 65 (above letters)
  ── */
  const waveY = 255 - (progress / 100) * 190;
  const wavePath = useMemo(() => {
    return buildWavePath(waveY, phase, VB_W, VB_H, 14, 360);
  }, [waveY, phase]);

  /* ── 3.8s Progress animation with fluid wave phase ── */
  useEffect(() => {
    const duration = 3800; // 3.8s: balanced, clearly visible pacing
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);

      setProgress(Math.round(eased * 100));
      // Phase rotates smoothly ~1.8 rad/sec
      setPhase((now / 1000) * 3.5);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        progressDoneRef.current = true;
        checkDismiss();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const checkDismiss = useCallback(() => {
    if (isPageLoaded && progressDoneRef.current && !showContent) {
      // 400ms pause at 100% so the full white text shines before revealing content
      const t = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isPageLoaded, showContent]);

  /* ── Wait for window.load + critical images ── */
  useEffect(() => {
    const criticalImages = ['/images/photo3.jpeg'];
    let loadTimer;

    const handleLoad = () => {
      loadTimer = setTimeout(() => {
        setIsPageLoaded(true);
        checkDismiss();
      }, 200);
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
          checkDismiss();
        }, 200);
      }
    });

    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      window.removeEventListener('load', handleLoad);
    };
  }, [checkDismiss]);

  /* ── Safety timeout: never block longer than 8s ── */
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsPageLoaded(true);
      setProgress(100);
      progressDoneRef.current = true;
      checkDismiss();
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, [checkDismiss]);

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
