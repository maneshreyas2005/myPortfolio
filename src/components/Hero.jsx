import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import { resumeData } from '../data';
import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import OptimizedImage from './OptimizedImage';

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
                            className="text-[18vw] sm:text-[14vw] font-black tracking-tighter leading-none inline-flex items-center"
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
    const { profile } = usePortfolio();
    const data = profile || resumeData;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`relative z-10 w-full h-full flex items-center justify-center ${className}`}
        >

            {/* The Card Background & Container */}
            <div className="bg-[#F0EFED] rounded-3xl sm:rounded-[2.5rem] w-full flex flex-col items-center text-[#151312] shadow-2xl relative overflow-hidden transition-all duration-300">

                {/* Inner Content — Fluid & Scalable-Ready */}
                <div
                    className="w-full h-full flex flex-col items-center justify-between py-6 px-4 sm:py-8 sm:px-6"
                >

                    {/* Image with dashed arc */}
                    <div
                        className="relative shrink-0 mb-1 flex items-center justify-center cursor-pointer group transition-all duration-500"
                        style={{
                            width: 'clamp(140px, var(--card-image-size, 220px), 55vw)',
                            height: 'clamp(140px, var(--card-image-size, 220px), 55vw)'
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
                            className="relative z-10 w-[78%] h-[78%] rounded-full overflow-hidden border-[6px] sm:border-[8px] border-white shadow-xl transition-all duration-500"
                        >
                            <OptimizedImage
                                src={data.profileImage || "/images/photo3.jpeg"}
                                alt={data.name}
                                priority={true}
                                avatar={true}
                                width={440}
                                height={440}
                                crop="c_fill"
                                className="w-full h-full rounded-full"
                                imgClassName="object-cover object-top"
                            />
                        </div>
                    </div>


                    {/* Available for work pill */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full my-2 sm:my-0">
                        <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full bg-[#F46C38] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                            Available for work
                        </span>

                        <div className="text-center w-full">
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2 tracking-tight leading-tight">
                                {data.name}
                            </h2>
                            <p className="text-[#151312]/60 font-medium text-xs sm:text-[14px] md:text-[16px] leading-relaxed mx-auto max-w-[280px] sm:max-w-[320px]">
                                {data.title || "Full Stack Developer building AI-integrated web applications."}
                            </p>
                        </div>

                    </div>

                    {/* Footer part: Divider + Socials */}
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
                        <div className="w-full h-px bg-[#151312]/10" />

                        <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 w-full">
                            <a href={data.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </a>
                            <a href={data.github} target="_blank" rel="noreferrer" title="GitHub"
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                            </a>
                            <a href={`mailto:${data.email}`} title="Email"
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white shadow-sm hover:bg-[#F46C38] hover:text-white text-[#151312] transition-all duration-300">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </a>
                            <a href={`mailto:${data.email}`}
                                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#151312] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#F46C38] transition-all duration-300 whitespace-nowrap">
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


const Hero = ({ cardVisible = true }) => {
    return (
        <section
            id="home"
            className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-10"
        >
            {/* ── Infinite marquee BEHIND the card (z-0) ── */}
            <InfiniteMarquee />

            {/* ── Hero Card ── */}
            <div className={`w-full flex justify-center min-h-[480px] sm:min-h-[550px] md:h-[650px] ${cardVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full px-2 sm:px-4 xl:px-0 max-w-[700px]">
                    <HeroCard />
                </div>
            </div>
        </section>
    );
};

export default Hero;

