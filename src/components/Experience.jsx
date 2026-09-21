import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { resumeData } from '../data';
import { usePortfolio } from '../context/PortfolioContext';
import OptimizedImage from './OptimizedImage';

// Helper: Group linear experience entries by company name
const groupExperiencesByCompany = (experiences) => {
    if (!experiences || experiences.length === 0) return [];

    const companyMap = new Map();

    experiences.forEach((exp) => {
        const companyKey = (exp.company || 'Other').trim();
        if (!companyMap.has(companyKey)) {
            companyMap.set(companyKey, {
                company: companyKey,
                image: exp.image || null,
                location: exp.location || '',
                type: exp.type || '',
                roles: [],
            });
        }

        const compData = companyMap.get(companyKey);
        if (!compData.image && exp.image) {
            compData.image = exp.image;
        }
        if (!compData.location && exp.location) {
            compData.location = exp.location;
        }
        if (!compData.type && exp.type) {
            compData.type = exp.type;
        }

        compData.roles.push(exp);
    });

    return Array.from(companyMap.values()).map((comp) => {
        let overallPeriod = '';
        if (comp.roles.length === 1) {
            overallPeriod = comp.roles[0].period || '';
        } else if (comp.roles.length > 1) {
            const firstPeriod = comp.roles[0].period || '';
            const lastPeriod = comp.roles[comp.roles.length - 1].period || '';
            const endPart = firstPeriod.includes('-') ? firstPeriod.split('-')[1].trim() : firstPeriod;
            const startPart = lastPeriod.includes('-') ? lastPeriod.split('-')[0].trim() : lastPeriod;
            overallPeriod = `${startPart} - ${endPart}`;
        }

        return {
            ...comp,
            overallPeriod
        };
    });
};

// Storytelling Card for Desktop View mapped to scroll progress
const StorytellingCard = ({ comp, index, total, scrollYProgress }) => {
    if (total <= 1) {
        return (
            <div className="col-start-1 row-start-1 w-full bg-[#1c1a19] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl">
                <CardContent comp={comp} />
            </div>
        );
    }

    const S = 1 / total;
    let inputRange, opacityOutput, yOutput, scaleOutput;

    if (index === 0) {
        inputRange = [0, S * 0.7, S, 1];
        opacityOutput = [1, 1, 0, 0];
        yOutput = [0, 0, -28, -28];
        scaleOutput = [1, 1, 0.97, 0.97];
    } else if (index === total - 1) {
        inputRange = [0, (index - 0.3) * S, index * S, 1];
        opacityOutput = [0, 0, 1, 1];
        yOutput = [28, 28, 0, 0];
        scaleOutput = [0.97, 0.97, 1, 1];
    } else {
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
            <CardContent comp={comp} />
        </motion.div>
    );
};

// Internal Card Content: Company details + nested career progression timeline
const CardContent = ({ comp }) => (
    <div className="flex flex-col h-full">
        {/* Company Header */}
        <div className="border-b border-white/10 pb-5 mb-5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {comp.image ? (
                        <OptimizedImage
                            src={comp.image}
                            alt={comp.company}
                            width={128}
                            height={128}
                            crop="c_fit"
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-white/15 bg-white/5 shrink-0 shadow-lg p-0.5"
                            imgClassName="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-white/15 bg-white/5 shrink-0 flex items-center justify-center text-accent-lime font-black text-xl sm:text-2xl shadow-lg">
                            {comp.company.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                                {comp.company}
                            </h4>
                            {comp.roles.length > 1 && (
                                <span className="text-[11px] font-bold text-accent-lime bg-accent-lime/10 px-2.5 py-0.5 rounded-full border border-accent-lime/20">
                                    {comp.roles.length} Positions
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {comp.location && (
                                <span className="text-xs text-white/50 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-accent-lime/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {comp.location}
                                </span>
                            )}
                            {comp.type && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                    {comp.type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overall Duration Badge */}
                <div className="self-start sm:self-center">
                    <span className="text-xs sm:text-sm font-bold text-accent-orange/90 bg-accent-orange/10 px-3.5 py-1 rounded-full border border-accent-orange/20 whitespace-nowrap shadow-sm inline-block">
                        {comp.overallPeriod}
                    </span>
                </div>
            </div>
        </div>

        {/* Roles Career Progression Timeline */}
        <div className="space-y-6 max-h-[48vh] overflow-y-auto pr-2 custom-scrollbar flex-1">
            {comp.roles.map((roleItem, rIdx) => {
                const isLatest = rIdx === 0;
                const isOnlyOne = comp.roles.length === 1;

                return (
                    <div key={rIdx} className={`relative ${isOnlyOne ? '' : 'pl-6 sm:pl-7'} group`}>
                        {/* Connecting vertical line for multi-role companies */}
                        {!isOnlyOne && rIdx !== comp.roles.length - 1 && (
                            <div className="absolute left-[6px] sm:left-[7px] top-4 bottom-[-24px] w-px bg-white/15 group-hover:bg-accent-lime/40 transition-colors" />
                        )}

                        {/* Role Bullet Dot on Vertical Branch */}
                        {!isOnlyOne && (
                            <div
                                className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isLatest
                                        ? 'border-accent-lime bg-accent-lime shadow-[0_0_10px_rgba(197,255,65,0.7)]'
                                        : 'border-white/30 bg-[#1c1a19]'
                                }`}
                            >
                                {isLatest && <div className="w-1.5 h-1.5 rounded-full bg-[#151312]" />}
                            </div>
                        )}

                        {/* Role Header */}
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-accent-lime transition-colors">
                                    {roleItem.role}
                                </h5>
                                {isLatest && comp.roles.length > 1 && (
                                    <span className="text-[9px] uppercase font-black tracking-wider text-accent-lime bg-accent-lime/10 px-1.5 py-0.5 rounded border border-accent-lime/30">
                                        Current Role
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white/50">{roleItem.period}</span>
                                {roleItem.type && (
                                    <span className="text-[10px] text-accent-lime/70 bg-accent-lime/10 px-2 py-0.5 rounded-full border border-accent-lime/20">
                                        {roleItem.type}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bullet Points */}
                        {roleItem.points && roleItem.points.length > 0 && (
                            <ul className="space-y-2 mt-2">
                                {roleItem.points.map((point, pIndex) => (
                                    <li key={pIndex} className="text-white/70 leading-relaxed flex gap-2.5 text-xs sm:text-sm">
                                        <span className="text-accent-lime mt-1 select-none font-bold shrink-0">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

const Experience = () => {
    const { experience } = usePortfolio();
    const rawExpList = experience && experience.length > 0 ? experience : resumeData.experience;
    const companyList = groupExperiencesByCompany(rawExpList);

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
        const total = companyList.length;
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

    // Handle clicking a timeline dot to smoothly scroll directly to that company
    const handleDotClick = (idx) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const containerTop = rect.top + scrollTop;
            const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
            if (totalScrollable > 0) {
                const targetScroll = containerTop + (idx / companyList.length) * totalScrollable + 15;
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
        }
    };

    // ── MOBILE LAYOUT: Stacked company cards with career progression ──
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

                    <div className="space-y-8 sm:space-y-10">
                        {companyList.map((comp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-[#1c1a19] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden"
                            >
                                <CardContent comp={comp} />
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
            style={{ height: `${Math.max(companyList.length, 1) * 100}vh` }}
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
                            <span>{String(companyList.length).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Storytelling Row: Vertical Timeline Left + Active Story Card Stack Right */}
                    <div className="flex items-stretch gap-8 lg:gap-14">
                        {/* Left Vertical Timeline */}
                        <div className="relative w-48 lg:w-60 shrink-0 flex flex-col justify-between py-2">
                            {/* Static dashed line */}
                            <div className="absolute left-[7px] top-4 bottom-4 w-px border-l-2 border-dashed border-white/10" />

                            {/* Active lime progress line overlay */}
                            <motion.div
                                style={{ scaleY: scrollYProgress, originY: 0 }}
                                className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-accent-lime shadow-[0_0_8px_rgba(197,255,65,0.6)]"
                            />

                            {/* Timeline items with interactive click-to-scroll */}
                            {companyList.map((comp, idx) => {
                                const isActive = idx === activeIndex;
                                const isPassed = idx < activeIndex;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleDotClick(idx)}
                                        className="relative flex items-center gap-4 group cursor-pointer py-3 z-10 transition-transform duration-200 hover:translate-x-1"
                                        title={`Jump to ${comp.company}`}
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
                                        <div className="select-none flex-1 min-w-0">
                                            <p
                                                className={`text-xs sm:text-sm font-bold transition-colors duration-300 truncate ${
                                                    isActive ? 'text-white' : isPassed ? 'text-white/70' : 'text-white/25'
                                                }`}
                                            >
                                                {comp.company}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-white/40 font-mono">
                                                    {comp.overallPeriod.split('-')[0].trim()}
                                                </span>
                                                {comp.roles.length > 1 && (
                                                    <span className="text-[9px] font-bold text-accent-lime/80 bg-accent-lime/10 px-1.5 py-0.2 rounded border border-accent-lime/20">
                                                        {comp.roles.length} roles
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Stack: Smooth scroll-mapped Experience Cards */}
                        <div className="flex-1 relative min-h-[380px] flex items-center">
                            <div className="grid grid-cols-1 grid-rows-1 w-full">
                                {companyList.map((comp, idx) => (
                                    <StorytellingCard
                                        key={idx}
                                        comp={comp}
                                        index={idx}
                                        total={companyList.length}
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
