import { motion, AnimatePresence } from 'framer-motion';
import { resumeData } from '../data';
import {
    Database, Globe, Terminal,
    Code, Cpu, Layout, Server,
    Box, Braces, Compass,
} from 'lucide-react';
import { useState } from 'react';

/* ─────────────────────────────────────────
   Skill Card — 3D Flip (unchanged logic)
 ───────────────────────────────────────── */
const SkillCard = ({ name, category, index }) => {
    const getSkillIcon = (skillName) => {
        const n = skillName.toLowerCase();
        if (n.includes('react')) return <Globe className="w-8 h-8" />;
        if (n.includes('node')) return <Server className="w-8 h-8" />;
        if (n.includes('python')) return <Terminal className="w-8 h-8" />;
        if (n.includes('java')) return <Cpu className="w-8 h-8" />;
        if (n.includes('html') || n.includes('css')) return <Layout className="w-8 h-8" />;
        if (n.includes('sql') || n.includes('mongo')) return <Database className="w-8 h-8" />;
        if (n.includes('docker')) return <Box className="w-8 h-8" />;
        if (n.includes('git')) return <Compass className="w-8 h-8" />;
        if (n.includes('api') || n.includes('jwt')) return <Braces className="w-8 h-8" />;
        return <Code className="w-8 h-8" />;
    };

    const getBackColor = (cat) => {
        switch (cat) {
            case 'Languages': return 'bg-accent-orange';
            case 'Frontend': return 'bg-accent-lime text-[#151312]';
            case 'Backend': return 'bg-accent-red';
            case 'Databases': return 'bg-blue-500';
            case 'Tools': return 'bg-purple-500';
            default: return 'bg-white text-[#151312]';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group [perspective:1000px] h-32 w-full"
        >
            <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
                {/* Front */}
                <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-[#1c1a19] border border-white/5 shadow-xl [backface-visibility:hidden]">
                    <span className="text-sm md:text-base font-bold text-white/60 group-hover:text-white transition-colors tracking-tight px-4 text-center">
                        {name}
                    </span>
                </div>
                {/* Back */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${getBackColor(category)}`}>
                    <div className="mb-2 transition-transform duration-500 group-hover:scale-110">
                        {getSkillIcon(name)}
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-center px-2">
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
                <div className="flex items-center gap-4">
                    {/* Animated accent dot */}
                    <motion.span
                        animate={{ scale: hovered ? 1.4 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`w-2.5 h-2.5 rounded-full ${accent.dot}`}
                    />

                    {/* Category name */}
                    <motion.span
                        animate={{ x: hovered ? 6 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`text-2xl md:text-3xl font-black uppercase tracking-tight transition-colors duration-300 ${hovered ? accent.color : 'text-white/25'}`}
                    >
                        {group.category}
                    </motion.span>
                </div>

                {/* Item count + chevron */}
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold transition-colors duration-300 ${hovered ? 'text-white/50' : 'text-white/15'}`}>
                        {group.items.length} skills
                    </span>
                    <motion.span
                        animate={{ rotate: hovered ? 90 : 0, opacity: hovered ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                        className="text-white/30 text-lg font-thin select-none"
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
                className={`h-px mt-4 mb-6 ${accent.bar}`}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-6">
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
   Main Skills Section
 ───────────────────────────────────────── */
const Skills = () => {
    return (
        <section id="skills" className="py-24 relative overflow-hidden bg-[#151312]">
            {/* Background floating text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden h-fit">
                <h2 className="text-[15vw] md:text-[20vw] font-black text-white/[0.02] leading-none uppercase tracking-tighter">
                    Toolkit
                </h2>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-accent-lime font-bold uppercase tracking-[0.3em] text-[11px]">Tech Stack</span>
                        <h3 className="text-4xl md:text-6xl font-black mt-3 flex flex-wrap items-center gap-x-4">
                            Premium <span className="text-white/20 italic font-serif lowercase px-2">Tools</span>
                        </h3>
                    </div>
                    <p className="max-w-md text-white/40 text-sm md:text-base leading-relaxed text-right md:text-left">
                        Deep technical expertise across the full stack, with a focus on modern frameworks and AI-driven solutions.
                        <span className="block mt-1 text-white/20 text-xs italic">Hover a category to explore.</span>
                    </p>
                </div>

                {/* Category Rows */}
                <div className="flex flex-col">
                    {resumeData.skills.map((group, rowIndex) => (
                        <CategoryRow key={group.category} group={group} rowIndex={rowIndex} />
                    ))}
                    {/* Bottom border */}
                    <div className="border-t border-white/5 mt-2" />
                </div>
            </div>
        </section>
    );
};

export default Skills;