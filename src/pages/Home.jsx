import { lazy, Suspense, useLayoutEffect, useRef, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero, { HeroCard } from '../components/Hero';
import Footer from '../components/Footer';
import { usePortfolio } from '../context/PortfolioContext';
import { SECTION_ORDER } from '../config/sections';

// Heavy sections loaded lazily (below the fold)
const Projects = lazy(() => import('../components/Projects'));
const Experience = lazy(() => import('../components/Experience'));
const Skills = lazy(() => import('../components/Skills'));
const Certificates = lazy(() => import('../components/Certificates'));
const Community = lazy(() => import('../components/Community'));
const Education = lazy(() => import('../components/Education'));

const SectionFallback = ({ label }) => (
  <div className="h-64 flex items-center justify-center text-white/30 animate-pulse">
    Loading {label}…
  </div>
);

const SECTION_COMPONENTS = {
  skills: Skills,
  projects: Projects,
  experience: Experience,
  certificates: Certificates,
  community: Community,
  education: Education
};

function Home() {
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const { profile } = usePortfolio();
    const visibleSections = profile?.visibleSections || SECTION_ORDER;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1280);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Defer GSAP animation initialization until after first paint
    useEffect(() => {
        let timer;
        const initAnimations = async () => {
            const [gsapModule, ScrollTriggerModule] = await Promise.all([
                import('gsap'),
                import('gsap/ScrollTrigger'),
            ]);
            const gsap = gsapModule.default;
            const ScrollTrigger = ScrollTriggerModule.default;
            gsap.registerPlugin(ScrollTrigger);

            const refreshTimer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 200);
            timer = refreshTimer;
        };

        timer = setTimeout(initAnimations, 0);
        return () => {
            clearTimeout(timer);
        };
    }, []);

    useLayoutEffect(() => {
        if (isMobile || !cardRef.current) return;

        let ctx;
        Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger')
        ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                const calculateLayout = () => {
                    const w = window.innerWidth;
                    const targetWidth = Math.min(360, Math.max(300, w * 0.22));
                    // Ensure left edge is at least 32px or 2.5vw from viewport left
                    const targetLeft = Math.max(32, w * 0.025);
                    const targetCenter = targetLeft + targetWidth / 2;
                    const initialCenter = w / 2;
                    const targetX = targetCenter - initialCenter;
                    return { targetWidth, targetX };
                };

                gsap.fromTo(
                    cardRef.current,
                    {
                        x: 0,
                        y: 40,
                        width: Math.min(700, window.innerWidth * 0.9),
                        height: 650,
                        opacity: 1,
                        '--card-image-size': '280px',
                        immediateRender: true
                    },
                    {
                        x: () => calculateLayout().targetX,
                        y: 0,
                        width: () => calculateLayout().targetWidth,
                        height: '80vh',
                        opacity: 1,
                        ease: 'power2.inOut',
                        '--card-image-size': '180px',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top top',
                            end: '+=700',
                            scrub: 1.2,
                            invalidateOnRefresh: true,
                        }
                    }
                );

                ScrollTrigger.refresh();
            }, containerRef);
        });

        return () => {
            if (ctx) ctx.revert();
        };
    }, [isMobile]);

    return (
        <div ref={containerRef} className="bg-bg-dark text-white font-inter selection:bg-accent-orange selection:text-white">
            <Navbar />

            {/* ── Fixed/Sticky Hero Card Sidebar Overlay (Desktop Only) ── */}
            {!isMobile && (
                <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
                    <div
                        ref={cardRef}
                        className="pointer-events-auto flex items-center justify-center w-[700px] h-[650px]"
                        style={{
                            transformOrigin: 'center center',
                            '--card-image-size': '280px'
                        }}
                    >
                        <HeroCard />
                    </div>
                </div>
            )}

            <main className="w-full relative">
                <Hero cardVisible={isMobile} />

                <div className="flex flex-col xl:flex-row w-full max-w-full overflow-x-clip">
                    {!isMobile && <div className="hidden xl:block xl:w-1/4 shrink-0" />}

                    <div className="w-full xl:w-3/4 pb-20 px-4 sm:px-6 md:px-12 xl:px-20">
                        {SECTION_ORDER.map((sectionId) => {
                            if (!visibleSections.includes(sectionId)) return null;
                            const SectionComp = SECTION_COMPONENTS[sectionId];
                            return (
                                <Suspense key={sectionId} fallback={<SectionFallback label={sectionId} />}>
                                    <SectionComp />
                                </Suspense>
                            );
                        })}
                        <Footer />
                    </div>
                </div>
            </main>

            {/* Custom decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-accent-orange/5 blur-[120px] rounded-full"></div>
                <div className="absolute top-[60%] right-[-10%] w-[40%] h-[40%] bg-accent-lime/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-accent-red/5 blur-[120px] rounded-full"></div>
            </div>
        </div>
    );
}

export default Home;
