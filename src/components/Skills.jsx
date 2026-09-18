import { motion, AnimatePresence, useInView } from 'framer-motion';
import { resumeData } from '../data';
import {
    Database, Globe, Terminal,
    Code, Cpu, Layout, Server,
    Box, Braces, Compass, Sparkles, Users
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

/* ─────────────────────────────────────────
   Skill Card — 3D Flip (unchanged logic)
 ───────────────────────────────────────── */
const SkillCard = ({ name, category, index }) => {
    const [flipped, setFlipped] = useState(false);

    const getSkillIcon = (skillName) => {
        const n = skillName.toLowerCase();
        if (n.includes('react')) return <Globe className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('node')) return <Server className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('python')) return <Terminal className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('java')) return <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('html') || n.includes('css')) return <Layout className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('sql') || n.includes('mongo') || n.includes('postgre')) return <Database className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('docker')) return <Box className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('git')) return <Compass className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('api') || n.includes('jwt') || n.includes('socket')) return <Braces className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('gemini') || n.includes('ai')) return <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />;
        if (n.includes('leadership') || n.includes('team') || n.includes('collaboration') || n.includes('speaking')) return <Users className="w-6 h-6 sm:w-8 sm:h-8" />;
        return <Code className="w-6 h-6 sm:w-8 sm:h-8" />;
    };

    const getBackColor = (cat) => {
        switch (cat) {
            case 'Languages': return 'bg-accent-orange';
            case 'Frontend': return 'bg-accent-lime text-[#151312]';
            case 'Backend': return 'bg-accent-red';
            case 'Databases': return 'bg-blue-500';
            case 'Tools': return 'bg-purple-500';
            case 'AI & APIs': return 'bg-cyan-500';
            case 'Soft Skills': return 'bg-pink-500';
            default: return 'bg-white text-[#151312]';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group [perspective:1000px] h-24 sm:h-28 md:h-32 w-full"
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(!flipped);
                }}
                className={`relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
            >
                {/* Front */}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl sm:rounded-[2rem] bg-[#1c1a19] border border-white/5 shadow-xl [backface-visibility:hidden]">
                    <span className="text-xs sm:text-sm md:text-base font-bold text-white/60 group-hover:text-white transition-colors tracking-tight px-2 sm:px-4 text-center">
                        {name}
                    </span>
                </div>
                {/* Back */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl sm:rounded-[2rem] shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${getBackColor(category)}`}>
                    <div className="mb-1 sm:mb-2 transition-transform duration-500 group-hover:scale-110">
                        {getSkillIcon(name)}
                    </div>
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-tighter text-center px-1.5">
                        {name}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   Category accent config
 ───────────────────────────────────────── */
const getCategoryAccent = (category) => {
    switch (category) {
        case 'Languages': return { color: 'text-accent-orange', dot: 'bg-accent-orange', bar: 'bg-accent-orange' };
        case 'Frontend': return { color: 'text-accent-lime', dot: 'bg-accent-lime', bar: 'bg-accent-lime' };
        case 'Backend': return { color: 'text-accent-red', dot: 'bg-accent-red', bar: 'bg-accent-red' };
        case 'Databases': return { color: 'text-blue-400', dot: 'bg-blue-500', bar: 'bg-blue-500' };
        case 'Tools': return { color: 'text-purple-400', dot: 'bg-purple-500', bar: 'bg-purple-500' };
        case 'AI & APIs': return { color: 'text-cyan-400', dot: 'bg-cyan-500', bar: 'bg-cyan-500' };
        case 'Soft Skills': return { color: 'text-pink-400', dot: 'bg-pink-500', bar: 'bg-pink-500' };
        default: return { color: 'text-white', dot: 'bg-white', bar: 'bg-white' };
    }
};

/* ─────────────────────────────────────────
   Category Row — hover to expand cards
 ───────────────────────────────────────── */
const CategoryRow = ({ group, rowIndex }) => {
    const [hovered, setHovered] = useState(false);
    const accent = getCategoryAccent(group.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: rowIndex * 0.08 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setHovered(!hovered)}
            className="border-t border-white/5 pt-6 pb-2 cursor-pointer"
        >
            {/* Category label row */}
            <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-2.5 sm:gap-4">
                    {/* Animated accent dot */}
                    <motion.span
                        animate={{ scale: hovered ? 1.4 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${accent.dot}`}
                    />

                    {/* Category name */}
                    <motion.span
                        animate={{ x: hovered ? 6 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight transition-colors duration-300 ${hovered ? accent.color : 'text-white/25'}`}
                    >
                        {group.category}
                    </motion.span>
                </div>

                {/* Item count + chevron */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-[11px] sm:text-xs font-bold transition-colors duration-300 ${hovered ? 'text-white/50' : 'text-white/15'}`}>
                        {group.items.length} skills
                    </span>
                    <motion.span
                        animate={{ rotate: hovered ? 90 : 0, opacity: hovered ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                        className="text-white/30 text-base sm:text-lg font-thin select-none"
                    >
                        ›
                    </motion.span>
                </div>
            </div>

            {/* Expanding accent bar */}
            <motion.div
                animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 0.4 : 0 }}
                initial={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ originX: 0 }}
                className={`h-px mt-3 sm:mt-4 mb-4 sm:mb-6 ${accent.bar}`}
            />

            {/* Cards grid — slides open on hover */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6 pb-6">
                            {group.items.map((item, index) => (
                                <SkillCard
                                    key={index}
                                    name={item}
                                    category={group.category}
                                    index={index}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
            className="flex flex-col items-center gap-1 group text-center"
        >
            <div className="flex items-end justify-center gap-0.5 leading-none">
                {numericValue !== null ? (
                    <>
                        <span className="text-3xl sm:text-5xl md:text-7xl font-black tabular-nums leading-none" style={{ color }}>
                            {count}
                        </span>
                        <span className="text-xl sm:text-3xl md:text-5xl font-black mb-0.5 sm:mb-1" style={{ color }}>
                            {suffix}
                        </span>
                    </>
                ) : (
                    <span className="text-3xl sm:text-5xl md:text-7xl font-black leading-none" style={{ color }}>
                        {suffix}
                    </span>
                )}
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider sm:tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                {label}
            </span>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   Main Skills Section
 ───────────────────────────────────────── */
const Skills = () => {
    const statsRef = useRef(null);
    const isInView = useInView(statsRef, { once: true, margin: '-50px' });

    const { skills } = usePortfolio();
    const skillList = skills && skills.length > 0 ? skills : resumeData.skills;

    return (
        <section id="skills" className="py-16 sm:py-24 relative overflow-hidden bg-[#151312]">
            {/* Background floating text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden h-fit">
                <h2 className="text-[20vw] sm:text-[15vw] md:text-[20vw] font-black text-white/[0.02] leading-none uppercase tracking-tighter">
                    Toolkit
                </h2>
            </div>

            <div className="max-w-6xl mx-auto px-0 sm:px-4 relative z-10">
                {/* Stats section at top */}
                <motion.div
                    ref={statsRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-12 sm:mb-16 z-10 w-full"
                >
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8 sm:mb-12" />
                    <div className="grid grid-cols-3 gap-2 sm:gap-6 md:flex md:justify-center md:gap-24 w-full">
                        <StatItem numericValue={2} suffix="+" label="Internships" color="#F46C38" started={isInView} />
                        <StatItem numericValue={5} suffix="+" label="Projects" color="#C5FF41" started={isInView} />
                        <StatItem numericValue={null} suffix="AI" label="Specialist" color="#FF2600" started={isInView} />
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-8 sm:mt-12" />
                </motion.div>

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4 sm:gap-6">
                    <div>
                        <span className="text-accent-lime font-bold uppercase tracking-[0.3em] text-[10px] sm:text-[11px]">Tech Stack</span>
                        <h3 className="text-2xl sm:text-4xl md:text-6xl font-black mt-2 sm:mt-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4">
                            Premium <span className="text-white/20 italic font-serif lowercase px-1.5 sm:px-2">Tools</span>
                        </h3>
                    </div>
                    <p className="max-w-md text-white/40 text-xs sm:text-sm md:text-base leading-relaxed text-left md:text-right">
                        Deep technical expertise across the full stack, with a focus on modern frameworks and AI-driven solutions.
                        <span className="block mt-1 text-white/20 text-[10px] sm:text-xs italic">Tap or hover a category to explore.</span>
                    </p>
                </div>

                {/* Category Rows */}
                <div className="flex flex-col">
                    {skillList.map((group, rowIndex) => (
                        <CategoryRow key={group.category || rowIndex} group={group} rowIndex={rowIndex} />
                    ))}
                    {/* Bottom border */}
                    <div className="border-t border-white/5 mt-2" />
                </div>
            </div>
        </section>
    );
};

export default Skills;