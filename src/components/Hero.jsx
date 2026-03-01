import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import { resumeData } from '../data';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   Infinite horizontal marquee — behind the card
   Gentle 50s scroll speed
───────────────────────────────────────── */
const InfiniteMarquee = () => {
    const text = 'FULL STACK DEVELOPER';
    // Use enough slots to guarantee double the screen width
    const slots = Array(10).fill(text);
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
            <div className="sticky top-0 w-full h-[100vh] flex items-center">
                <motion.div
                    className="flex gap-20 whitespace-nowrap"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 60,
                        ease: 'linear',
                    }}
                >
                    {[...slots, ...slots].map((t, i) => (
                        <span
                            key={i}
                            className="text-[14vw] font-black tracking-tighter leading-none inline-flex items-center"
                            style={{
                                color: 'rgba(255,255,255,0.04)',
                                WebkitTextStroke: '1px rgba(255,255,255,0.01)'
                            }}
                        >
                            {t}
                            <span className="mx-10" style={{ color: 'rgba(244,108,56,0.08)' }}>&#9733;</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};



/* ─────────────────────────────────────────
   Count-up hook
───────────────────────────────────────── */
const useCountUp = (target, duration = 1400, started = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started || typeof target !== 'number') { setCount(target ?? 0); return; }
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, started]);
    return count;
};

/* ─────────────────────────────────────────
   Stat Item
───────────────────────────────────────── */
const StatItem = ({ numericValue, suffix, label, color, started }) => {
    const count = useCountUp(numericValue ?? 0, 1400, started);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1 group"
        >
            <div className="flex items-end gap-0.5 leading-none">
                {numericValue !== null ? (
                    <>
                        <span className="text-5xl md:text-7xl font-black tabular-nums leading-none" style={{ color }}>
                            {count}
                        </span>
                        <span className="text-4xl md:text-5xl font-black mb-1" style={{ color }}>
                            {suffix}
                        </span>
                    </>
                ) : (
                    <span className="text-6xl md:text-7xl font-black leading-none" style={{ color }}>
                        {suffix}
                    </span>
                )}
            </div>
            <span className="text-base md:text-lg font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                {label}
            </span>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   Orange dashed arc SVG — wraps over the image
───────────────────────────────────────── */
const DashedArc = ({ hovered }) => (
    <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
            className="w-[280px] h-[280px] transition-all duration-700"
            animate={{ rotate: hovered ? 180 : 0 }}
        >
            <svg
                className="w-full h-full pointer-events-none rotate-[-9.5deg]"
                viewBox="0 0 280 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 30 140 A 110 110 0 0 1 250 140"
                    stroke="#F46C38"
                    strokeWidth="4"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </motion.div>
    </div>
);




/* ─────────────────────────────────────────
   HeroCard — The core identity card
 ───────────────────────────────────────── */
export const HeroCard = ({ className = "" }) => {
    const [imageHovered, setImageHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`relative z-10 w-full h-full flex items-center justify-center ${className}`}
        >

            {/* The Card Background & Container */}
            <div className="bg-[#F0EFED] rounded-[2.5rem] w-full flex flex-col items-center text-[#151312] shadow-2xl relative overflow-hidden transition-all duration-300">

                {/* Inner Content — Fluid & Scalable-Ready */}
                <div
                    className="w-full h-full flex flex-col items-center justify-between py-8 px-5 sm:py-10 sm:px-8"
                >

                    {/* Image with dashed arc */}
                    <div
                        className="relative shrink-0 mb-1 flex items-center justify-center cursor-pointer group transition-all duration-500"
                        style={{
                            width: 'clamp(180px, var(--card-image-size, 280px), 65vw)',
                            height: 'clamp(180px, var(--card-image-size, 280px), 65vw)'
                        }}
                        onMouseEnter={() => setImageHovered(true)}
                        onMouseLeave={() => setImageHovered(false)}
                    >
                        {/* Dashed Arc - Correctly scaled via variables */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="transition-all duration-700 pointer-events-none origin-center"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='500' ry='500' stroke='%23F46C38' stroke-width='4' stroke-dasharray='12%2c 15' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`,
                                    borderRadius: '50%',
                                    maskImage: 'linear-gradient(to bottom, black 50%, transparent 50%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 50%)',
                                    rotate: imageHovered ? 180 : 0
                                }}
                            />
                        </div>


                        <div
                            className="relative z-10 w-[78%] h-[78%] rounded-full overflow-hidden border-[8px] border-white shadow-xl transition-all duration-500"
                        >
                            <img
                                src="/images/photo3.jpeg"
                                alt={resumeData.name}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>


                    {/* Available for work pill */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#F46C38] text-white text-[11px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                            Available for work
                        </span>

                        <div className="text-center w-full">
                            <h2 className="text-2xl md:text-5xl font-black mb-2 tracking-tight leading-tight">
                                {resumeData.name}
                            </h2>
                            <p className="text-[#151312]/60 font-medium text-[14px] md:text-[16px] leading-relaxed mx-auto max-w-[320px]">
                                Full Stack Developer building AI-integrated web applications.
                            </p>
                        </div>

                    </div>

                    {/* Footer part: Divider + Socials */}
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="w-full h-px bg-[#151312]/10" />

                        <div className="flex flex-wrap justify-center items-center gap-3">
                            <a href={resumeData.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"
                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Linkedin size={20} />
                            </a>
                            <a href={resumeData.github} target="_blank" rel="noreferrer" title="GitHub"
                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Github size={20} />
                            </a>
                            <a href={`mailto:${resumeData.email}`} title="Email"
                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Mail size={20} />
                            </a>
                            <a href={`mailto:${resumeData.email}`}
                                className="px-6 py-3 bg-[#151312] text-white rounded-2xl text-sm font-bold hover:bg-[#F46C38] transition-all duration-300">
                                Let's Talk
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom glow */}
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#F46C38]/10 rounded-tl-[4rem] blur-2xl -mr-8 -mb-8 pointer-events-none" />
            </div>

            {/* Left decorative dashed vertical line (conditionally hidden or animated externally) */}
            <div className="absolute -left-6 top-16 w-px h-52 hidden xl:block"
                style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #F46C38 0px, #F46C38 6px, transparent 6px, transparent 13px)' }}
            />
            {/* Left orange dot */}
            <div className="absolute -left-9 top-56 w-5 h-5 rounded-full bg-[#F46C38] shadow-[0_0_12px_rgba(244,108,56,0.7)] hidden xl:block" />
        </motion.div>
    );
};


const Hero = ({ cardVisible = true, showStats = true }) => {
    const statsRef = useRef(null);
    const isInView = useInView(statsRef, { once: true, margin: '-50px' });

    return (
        <section
            id="home"
            className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-24 pb-10"
        >
            {/* ── Infinite marquee BEHIND the card (z-0) ── */}
            <InfiniteMarquee />

            {/* ── Hero Card ── */}
            <div className={`w-full flex justify-center min-h-[550px] md:h-[650px] ${cardVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full px-4 xl:px-0 max-w-[700px]">
                    <HeroCard />
                </div>
            </div>

            {/* Stats section */}
            {showStats && (
                <motion.div
                    ref={statsRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-12 z-10 w-full max-w-4xl px-6"
                >
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                        <StatItem numericValue={2} suffix="+" label="Internships" color="#F46C38" started={isInView} />
                        <StatItem numericValue={5} suffix="+" label="Projects" color="#C5FF41" started={isInView} />
                        <StatItem numericValue={null} suffix="AI" label="Specialist" color="#FF2600" started={isInView} />
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12" />
                </motion.div>
            )}
        </section>
    );
};

export default Hero;

