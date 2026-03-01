import { motion } from 'framer-motion';
import { resumeData } from '../data';

const Experience = () => {
    return (
        <section id="experience" className="py-20 px-4 relative overflow-hidden bg-[#1c1a19]/30">
            <h2 className="absolute top-20 left-1/2 -translate-x-1/2 text-[12vw] md:text-[15vw] font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap uppercase">
                Experience
            </h2>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <span className="text-accent-lime font-bold uppercase tracking-widest text-sm">Professional Journey</span>
                    <h3 className="text-4xl md:text-5xl font-black mt-2">Work History</h3>
                </div>

                <div className="space-y-12">
                    {resumeData.experience.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-12 border-l-2 border-dashed border-white/10 group"
                        >
                            {/* Dot on the line */}
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent-lime shadow-[0_0_15px_rgba(197,255,65,0.5)] group-hover:scale-150 transition-transform duration-300"></div>

                            <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-accent-lime transition-colors">
                                    {exp.role}
                                </h4>
                                <span className="text-sm font-bold text-accent-orange/80 bg-accent-orange/5 px-4 py-1 rounded-full border border-accent-orange/20 whitespace-nowrap self-start">
                                    {exp.period}
                                </span>
                            </div>

                            <h5 className="text-lg font-bold text-white/50 mb-4">{exp.company}</h5>

                            <ul className="space-y-4">
                                {exp.points.map((point, pIndex) => (
                                    <li key={pIndex} className="text-white/60 leading-relaxed flex gap-3">
                                        <span className="text-accent-lime mt-1.5">•</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>

                            {/* Decorative dashed line background for the card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lime/5 rounded-full -mr-16 -mt-8 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
