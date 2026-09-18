import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero, { HeroCard } from '../components/Hero';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Community from '../components/Community';
import Education from '../components/Education';
import Footer from '../components/Footer';
import { usePortfolio } from '../context/PortfolioContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Home() {
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const { profile, projects, experience, community } = usePortfolio();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1280);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Refresh ScrollTrigger positions whenever dynamic data loads or layout shifts
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
        return () => clearTimeout(timer);
    }, [profile, projects, experience, community]);

    useLayoutEffect(() => {
        if (isMobile || !cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardRef.current,
                {
                    x: '0vw',
                    y: 40,
                    width: 700,
                    height: 650,
                    opacity: 1,
                    '--card-image-size': '280px',
                    immediateRender: true
                },
                {
                    x: '-36vw',
                    y: 0,
                    width: '23vw',
                    height: '80vh',
                    opacity: 1,
                    ease: 'power2.inOut',
                    '--card-image-size': '180px',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: '800px',
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
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
                        <Skills />
                        <Projects />
                        <Experience />
                        <Community />
                        <Education />
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
