import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────
   ease-out-cubic easing (matches Neoleaf)
   ───────────────────────────────────────── */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ─────────────────────────────────────────
   Preloader — full-screen "loading..." overlay
   Mimics neoleaf.bytetown.agency:
   - Dark background (#151312 site dark)
   - Lowercase "loading..." text
   - Percentage counter with ease-out-cubic (2.5s)
   - Gradient progress bar at top (orange → lime → red)
   - Dismisses after window.load + critical images AND progress reaches 100%
   - Content scales 0.85 → 1.0 as loader fades out
   ───────────────────────────────────────── */
export default function Preloader({ children }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const rafRef = useRef(null);
  const progressDoneRef = useRef(false);

  /* ── Progress animation: 0% → 100% over 2.5s with ease-out-cubic ── */
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
      // Small pause at 100% before fading out (premium feel)
      const t = setTimeout(() => {
        setShowContent(true);
      }, 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isPageLoaded, showContent]);

  /* ── Wait for window.load + critical images ── */
  useEffect(() => {
    const criticalImages = [
      '/images/photo3.jpeg', // Hero avatar
    ];

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

    // Preload critical images so they're cached by the time content reveals
    const preloadPromises = criticalImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      });
    });

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

  /* ── Safety timeout: never show loader longer than 8s ── */
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
              fixed
              inset-0
              z-[9999]
              bg-[#151312]
              flex
              flex-col
              items-center
              justify-center
              text-white
              transition-colors
              duration-700
            "
          >
            {/* ── Top progress bar ── */}
            <div className="
              absolute
              top-0
              left-0
              w-full
              h-[2px]
              bg-gradient-to-r
              from-[#F46C38]
              via-[#C5FF41]
              to-[#FF2600]
              z-[10000]
            ">
              <motion.div
                className="h-full bg-white"
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 2.5,
                  ease: 'easeOut',
                }}
              />
            </div>

            {/* ── Center content ── */}
            <div className="flex flex-col items-center justify-center gap-4 z-[10000]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <span className="
                  text-[16px]
                  sm:text-[18px]
                  font-normal
                  tracking-widest
                  text-white
                  opacity-80
                  select-none
                ">
                  loading...
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              >
                <span className="
                  text-[24px]
                  sm:text-[32px]
                  font-bold
                  tracking-tight
                  text-white
                  select-none
                ">
                  {progress}%
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
