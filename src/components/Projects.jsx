import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { resumeData } from '../data';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';

/* ─────────────────────────────────────────
   Project Row — hover to reveal preview
 ───────────────────────────────────────── */
const ProjectRow = ({ project, index }) => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setHovered(!hovered)}
            className="border-t border-white/5 group cursor-pointer"
        >
            {/* ── Main row ── */}
            <div className="flex items-center justify-between py-4 sm:py-6 gap-3 sm:gap-4">

                {/* Index number */}
                <span className={`text-[11px] sm:text-xs font-black tabular-nums transition-colors duration-300 shrink-0 ${hovered ? 'text-white/40' : 'text-white/10'}`}>
                    {String(index + 1).padStart(2, '0')}
                </span>

                {/* Project title */}
                <motion.h4
                    animate={{ x: hovered ? 8 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight flex-1 transition-colors duration-300 ${hovered ? 'text-white' : 'text-white/25'}`}
                >
                    {project.title}
                </motion.h4>


                {/* Arrow button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project.id || project._id}`);
                    }}
                    animate={{
                        rotate: hovered ? 0 : -45,
                        backgroundColor: hovered ? '#F46C38' : 'transparent',
                        borderColor: hovered ? '#F46C38' : 'rgba(255,255,255,0.1)',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl border text-white transition-colors duration-300 cursor-pointer"
                >
                    <ArrowUpRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </motion.button>
            </div>

            {/* ── Expanding content panel ── */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 sm:pb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

                            {/* Image */}
                            <div className="md:col-span-2 aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/5">
                                <motion.img
                                    initial={{ scale: 1.05 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover opacity-90"
                                />
                            </div>

                            {/* Description + all tags */}
                            <div className="flex flex-col gap-2 justify-between h-full">
                                <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed mt-2 sm:mt-6">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 my-2">
                                    {project.tech.map((tech, i) => (
                                        <span
                                            key={i}
                                            className="text-[10px] sm:text-[12px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-white/40"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/project/${project.id}`);
                                    }}
                                    className="mb-2 sm:mb-6 inline-flex items-center gap-1 text-accent-orange text-sm sm:text-base font-black uppercase tracking-widest hover:gap-2 transition-all duration-300 w-fit"
                                >
                                    View Project <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   Main Projects Section
 ───────────────────────────────────────── */
const Projects = () => {
    const [showAll, setShowAll] = useState(false);
    const { projects } = usePortfolio();
    const projectList = projects && projects.length > 0 ? projects : resumeData.projects;

    const displayedProjects = showAll ? projectList : projectList.slice(0, 3);
    const hasMore = projectList.length > 3;

    return (
        <section id="projects" className="py-16 sm:py-24 relative overflow-hidden">
            {/* Background floating text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden">
                <h2 className="text-[20vw] sm:text-[15vw] md:text-[20vw] font-black text-white/[0.02] leading-none uppercase tracking-tighter">
                    Work
                </h2>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 px-0 sm:px-4">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4 sm:gap-6">
                    <div>
                        <span className="text-accent-orange font-bold uppercase tracking-[0.3em] text-[10px] sm:text-[11px]">Main Work</span>
                        <h3 className="text-2xl sm:text-4xl md:text-6xl font-black mt-2 sm:mt-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4">
                            My <span className="text-white/20 italic font-serif lowercase px-1.5 sm:px-2">Projects</span>
                        </h3>
                    </div>
                    <p className="max-w-md text-white/40 text-xs sm:text-sm md:text-base leading-relaxed text-left md:text-right">
                        A collection of work spanning full stack apps, AI integrations, and product experiences.
                        <span className="block mt-1 text-white/20 text-[10px] sm:text-xs italic">Tap or hover a project to preview.</span>
                    </p>
                </div>

                {/* Project Rows */}
                <div className="flex flex-col">
                    <AnimatePresence>
                        {displayedProjects.map((project, index) => (
                            <ProjectRow key={project.id || index} project={project} index={index} />
                        ))}
                    </AnimatePresence>

                    {hasMore && !showAll && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="border-t border-white/5 group cursor-pointer"
                            onClick={() => setShowAll(true)}
                        >
                            <div className="flex items-center justify-center py-6 sm:py-8 gap-4">
                                <h4 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-widest transition-colors duration-300 text-white/25 group-hover:text-white text-center">
                                    Click here to view all projects
                                </h4>
                            </div>
                        </motion.div>
                    )}
                    <div className="border-t border-white/5 mt-2" />
                </div>
            </div>
        </section>
    );
};

export default Projects;