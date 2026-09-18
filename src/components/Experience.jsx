import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { resumeData } from '../data';
import { usePortfolio } from '../context/PortfolioContext';

// Individual experience card mapped to scroll progress
const StorytellingCard = ({ exp, index, total, scrollYProgress }) => {
    // If only 1 experience, show statically without scroll fade
    if (total <= 1) {
        return (
            <div className="col-start-1 row-start-1 w-full bg-[#1c1a19] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl">
                <CardContent exp={exp} />
            </div>
        );
    }

    const S = 1 / total;
    let inputRange, opacityOutput, yOutput, scaleOutput;

    if (index === 0) {
        // First card: starts active, fades out towards step S
        inputRange = [0, S * 0.7, S, 1];
        opacityOutput = [1, 1, 0, 0];
        yOutput = [0, 0, -28, -28];
        scaleOutput = [1, 1, 0.97, 0.97];
    } else if (index === total - 1) {
        // Last card: fades in from previous step, stays active to end
        inputRange = [0, (index - 0.3) * S, index * S, 1];
        opacityOutput = [0, 0, 1, 1];
        yOutput = [28, 28, 0, 0];
        scaleOutput = [0.97, 0.97, 1, 1];
    } else {
        // Intermediate cards: fade in, stay active, then fade out
        inputRange = [0, (index - 0.3) * S, index * S, (index + 0.7) * S, (index + 1) * S, 1];
        opacityOutput = [0, 0, 1, 1, 0, 0];
        yOutput = [28, 28, 0, 0, -28, -28];
        scaleOutput = [0.97, 0.97, 1, 1, 0.97, 0.97];
    }

    const opacity = useTransform(scrollYProgress, inputRange, opacityOutput);
    const y = useTransform(scrollYProgress, inputRange, yOutput);
    const scale = useTransform(scrollYProgress, inputRange, scaleOutput);
    const pointerEvents = useTransform(opacity, (v) => (v > 0.4 ? 'auto' : 'none'));

    return (
        <motion.div
            style={{ opacity, y, scale, pointerEvents }}
            className="col-start-1 row-start-1 w-full bg-[#1c1a19] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl will-change-transform"
        >
            {/* Subtle decorative lime ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-lime/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-8" />
            <CardContent exp={exp} />
        </motion.div>
    );
};

// Internal card content details
const CardContent = ({ exp }) => (
    <>
        {/* Role and Period */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {exp.role}
            </h4>
            <span className="text-xs sm:text-sm font-bold text-accent-orange/80 bg-accent-orange/5 px-3.5 py-1 rounded-full border border-accent-orange/20 whitespace-nowrap self-start">
                {exp.period}
            </span>
        </div>

        {/* Company and Location/Type */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            <h5 className="text-base sm:text-lg font-bold text-accent-lime">
                {exp.company}
            </h5>
            {exp.location && (
                <span className="text-xs text-white/40 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {exp.location}
                </span>
            )}
            {exp.type && (
                <span className="text-[11px] font-semibold text-accent-lime/70 bg-accent-lime/10 px-2.5 py-0.5 rounded-full border border-accent-lime/20">
                    {exp.type}
                </span>
            )}
        </div>

        {/* Bullet Points */}
        <ul className="space-y-3 sm:space-y-4 max-h-[48vh] overflow-y-auto pr-2 custom-scrollbar">
            {exp.points && exp.points.map((point, pIndex) => (
                <li key={pIndex} className="text-white/70 leading-relaxed flex gap-3 text-xs sm:text-sm lg:text-base">
                    <span className="text-accent-lime mt-1 select-none font-bold shrink-0">•</span>
                    <span>{point}</span>
                </li>
            ))}
        </ul>
    </>
);

const Experience = () => {
    const { experience } = usePortfolio();
    const expList = experience && experience.length > 0 ? experience : resumeData.experience;

    const [isMobile, setIsMobile] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    // Fallback check for mobile screens (< 768px)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Framer Motion useScroll hook tracking progress of outer container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Map scroll progress to the active index for the vertical timeline dot & step counter
    useMotionValueEvent(scrollYProgress, 'change', (latest) => {
        if (isMobile) return;
        const total = expList.length;
        if (total <= 1) {
            setActiveIndex(0);
            return;
        }
        const step = 1 / total;
        const rawIndex = Math.floor(latest / step);
        const nextIndex = Math.min(Math.max(rawIndex, 0), total - 1);
        if (nextIndex !== activeIndex) {
            setActiveIndex(nextIndex);
        }
    });

    // Handle clicking a timeline dot to smoothly scroll directly to that experience
    const handleDotClick = (idx) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const containerTop = rect.top + scrollTop;
            const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
            if (totalScrollable > 0) {
                const targetScroll = containerTop + (idx / expList.length) * totalScrollable + 15;
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
        }
    };

    // ── MOBILE LAYOUT: Graceful fallback to normal vertically stacked layout ──
    if (isMobile) {
        return (
            <section id="experience" className="py-14 sm:py-20 px-3 sm:px-6 relative overflow-hidden bg-[#1c1a19]/30 rounded-3xl my-8 sm:my-10">
                <h2 className="absolute top-20 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap uppercase">
                    Experience
                </h2>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-10 sm:mb-16">
                        <span className="text-accent-lime font-bold uppercase tracking-widest text-[10px]">Professional Journey</span>
                        <h3 className="text-2xl sm:text-3xl font-black mt-2 text-white">Work History</h3>
                    </div>

                    <div className="space-y-8 sm:space-y-12">
                        {expList.map((exp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative pl-7 sm:pl-12 border-l-2 border-dashed border-white/10 group"
                            >
                                {/* Active dot */}
                                <div className="absolute left-[-7px] sm:left-[-9px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-accent-lime shadow-[0_0_15px_rgba(197,255,65,0.5)]"></div>

                                <div className="mb-2 flex flex-col justify-between gap-1.5 sm:gap-2">
                                    <h4 className="text-lg sm:text-xl font-bold text-white">
                                        {exp.role}
                                    </h4>
                                    <span className="text-[10px] sm:text-xs font-bold text-accent-orange/80 bg-accent-orange/5 px-2.5 sm:px-3 py-0.5 rounded-full border border-accent-orange/20 whitespace-nowrap self-start">
                                        {exp.period}
                                    </span>
                                </div>

                                <h5 className="text-sm sm:text-base font-bold text-white/50 mb-1">{exp.company}</h5>
                                {(exp.location || exp.type) && (
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                                        {exp.location && (
                                            <span className="text-[11px] sm:text-xs text-white/40 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {exp.location}
                                            </span>
                                        )}
                                        {exp.type && (
                                            <span className="text-[10px] sm:text-xs font-medium text-accent-lime/70 bg-accent-lime/10 px-2 py-0.5 rounded-full border border-accent-lime/20">
                                                {exp.type}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <ul className="space-y-2.5 sm:space-y-3">
                                    {exp.points && exp.points.map((point, pIndex) => (
                                        <li key={pIndex} className="text-white/60 text-xs sm:text-sm leading-relaxed flex gap-2.5 sm:gap-3">
                                            <span className="text-accent-lime mt-1 select-none font-bold shrink-0">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ── DESKTOP/TABLET LAYOUT: Pinned Scroll Storytelling Experience ──
    return (
        <section
            id="experience"
            ref={containerRef}
            className="relative bg-[#1c1a19]/30 rounded-3xl my-12"
            style={{ height: `${Math.max(expList.length, 1) * 100}vh` }}
        >
            {/* Pinned Sticky 100vh Viewport */}
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden pt-20 pb-10 px-6 lg:px-12">
                {/* Subtle background watermark */}
                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-white/[0.02] select-none pointer-events-none whitespace-nowrap uppercase">
                    Experience
                </h2>

                <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col justify-center">
                    {/* Header with Title and Step Counter */}
                    <div className="mb-6 lg:mb-8 flex items-end justify-between border-b border-white/5 pb-5">
                        <div>
                            <span className="text-accent-lime font-bold uppercase tracking-widest text-xs sm:text-sm">
                                Professional Journey
                            </span>
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 text-white tracking-tight">
                                Work History
                            </h3>
                        </div>

                        {/* Interactive Step Counter */}
                        <div className="flex items-baseline gap-1.5 font-mono text-sm font-bold text-white/40 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                            <span className="text-accent-lime text-base font-black">
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                            <span>/</span>
                            <span>{String(expList.length).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Storytelling Row: Vertical Timeline Left + Active Story Card Stack Right */}
                    <div className="flex items-stretch gap-8 lg:gap-14">
                        {/* Left Vertical Timeline */}
                        <div className="relative w-40 lg:w-56 shrink-0 flex flex-col justify-between py-2">
                            {/* Static dashed line */}
                            <div className="absolute left-[7px] top-4 bottom-4 w-px border-l-2 border-dashed border-white/10" />

                            {/* Active lime progress line overlay */}
                            <motion.div
                                style={{ scaleY: scrollYProgress, originY: 0 }}
                                className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-accent-lime shadow-[0_0_8px_rgba(197,255,65,0.6)]"
                            />

                            {/* Timeline dots with interactive click-to-scroll */}
                            {expList.map((exp, idx) => {
                                const isActive = idx === activeIndex;
                                const isPassed = idx < activeIndex;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleDotClick(idx)}
                                        className="relative flex items-center gap-4 group cursor-pointer py-2 z-10 transition-transform duration-200 hover:translate-x-1"
                                        title={`Jump to ${exp.company}`}
                                    >
                                        {/* Timeline Dot */}
                                        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                            <motion.div
                                                animate={{
                                                    scale: isActive ? 1.4 : isPassed ? 1.05 : 0.85,
                                                    backgroundColor: isActive ? '#C5FF41' : isPassed ? '#C5FF41' : 'rgba(255,255,255,0.2)',
                                                    boxShadow: isActive ? '0 0 16px rgba(197,255,65,0.8), 0 0 6px #C5FF41' : 'none'
                                                }}
                                                transition={{ duration: 0.25 }}
                                                className="w-3.5 h-3.5 rounded-full"
                                            />
                                        </div>

                                        {/* Company preview label */}
                                        <div className="select-none">
                                            <p
                                                className={`text-xs font-bold transition-colors duration-300 line-clamp-1 ${
                                                    isActive ? 'text-white' : isPassed ? 'text-white/60' : 'text-white/25'
                                                }`}
                                            >
                                                {exp.company}
                                            </p>
                                            <span className="text-[10px] text-white/30 font-medium">
                                                {exp.period.split('-')[0].trim()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Stack: Smooth scroll-mapped Experience Cards */}
                        <div className="flex-1 relative min-h-[360px] flex items-center">
                            <div className="grid grid-cols-1 grid-rows-1 w-full">
                                {expList.map((exp, idx) => (
                                    <StorytellingCard
                                        key={idx}
                                        exp={exp}
                                        index={idx}
                                        total={expList.length}
                                        scrollYProgress={scrollYProgress}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;

