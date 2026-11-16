import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────
   ease-out-cubic easing
   ───────────────────────────────────────── */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ─────────────────────────────────────────
   Build a smooth sinusoidal wave clip-path
   200% of viewBox width for seamless loop
   ───────────────────────────────────────── */
function buildWavePath(viewBoxWidth, amplitude) {
  const totalWidth = viewBoxWidth * 2;
  const halfPeriod = viewBoxWidth / 8; // 4 full visible waves

  let d = `M 0 ${amplitude}`;
  d += ` Q ${halfPeriod / 2} 0 ${halfPeriod} ${amplitude}`;

  for (let x = halfPeriod * 2; x <= totalWidth; x += halfPeriod) {
    d += ` T ${x} ${amplitude}`;
  }

  d += ` V ${amplitude + 700} H 0 Z`;
  return d;
}

/* ─── Constants ─── */
const DISPLAY_TEXT = 'Shreyas';
const VB_W = 800;
const VB_H = 260;
const FONT_SIZE = 200;
const WAVE_AMP = 18;
const WAVE_PATH = buildWavePath(VB_W, WAVE_AMP);

/* ─────────────────────────────────────────
   Preloader — Neoleaf-style liquid-fill letters
   • Dark bg (#151312)
   • Giant "Shreyas" in Poppins 900
   • Bottom-to-top wave clip revealing white fill
   • "loading...  XX %" bottom-right counter
   • Top gradient accent bar
   • Dismisses on window.load + progress 100%
   ───────────────────────────────────────── */
export default function Preloader({ children }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const rafRef = useRef(null);
  const progressDoneRef = useRef(false);

  /* ── Progress: 0 → 100 over 2.5s, ease-out-cubic ── */
  useEffect(() => {
    const duration = 2500;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setProgress(Math.round(eased * 100));

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
      const t = setTimeout(() => setShowContent(true), 350);
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

  /* ── Safety timeout: never show loader > 8s ── */
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsPageLoaded(true);
      setProgress(100);
      progressDoneRef.current = true;
      checkDismiss();
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, [checkDismiss]);

  /* ── Wave Y: progress 0→100 maps to 260→-10 ── */
  const waveY = 260 - (progress / 100) * 270;

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
              text-white
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

            {/* ── Liquid wave text container ── */}
            <div className="relative w-[94vw] max-w-[900px] flex flex-col items-end">
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="w-full select-none"
                style={{ overflow: 'visible' }}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Wave clip-path — rises from bottom to top */}
                  <clipPath
                    id="liquid-wave-clip"
                    clipPathUnits="userSpaceOnUse"
                  >
                    <g transform={`translate(0, ${waveY})`}>
                      <g>
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values={`0 0; -${VB_W} 0`}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <path d={WAVE_PATH} />
                      </g>
                    </g>
                  </clipPath>
                </defs>

                {/* Layer 1 — muted grey silhouette (always visible) */}
                <text
                  x={VB_W / 2}
                  y="195"
                  textAnchor="middle"
                  fontSize={FONT_SIZE}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="900"
                  fill="rgba(255,255,255,0.22)"
                  letterSpacing="-6"
                  style={{ userSelect: 'none' }}
                >
                  {DISPLAY_TEXT}
                </text>

                {/* Layer 2 — white fill, clipped by rising wave */}
                <text
                  x={VB_W / 2}
                  y="195"
                  textAnchor="middle"
                  fontSize={FONT_SIZE}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="900"
                  fill="#FFFFFF"
                  letterSpacing="-6"
                  clipPath="url(#liquid-wave-clip)"
                  style={{ userSelect: 'none' }}
                >
                  {DISPLAY_TEXT}
                </text>
              </svg>

              {/* ── Bottom-right counter: "loading...  XX %" ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3 mt-2 mr-1 select-none"
              >
                <span className="text-[13px] sm:text-[15px] text-white/70 tracking-widest font-normal lowercase">
                  loading...
                </span>
                <span className="text-[13px] sm:text-[15px] text-white/70 font-medium tabular-nums tracking-wide">
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
