import { motion } from 'framer-motion';
import { resumeData } from '../data';
import { Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const Education = () => {
    const { education } = usePortfolio();
    const eduList = education && education.length > 0 ? education : resumeData.education;

    return (
        <section id="education" className="py-16 sm:py-20 px-0 sm:px-4 relative overflow-hidden">
            <h2 className="absolute top-20 left-1/2 -translate-x-1/2 text-[15vw] sm:text-[12vw] md:text-[15vw] font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap uppercase">
                Education
            </h2>

            <div className="max-w-4xl mx-auto relative z-10 px-0 sm:px-4">
                <div className="text-center mb-10 sm:mb-16">
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] sm:text-sm">Learning Base</span>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black mt-2">Education</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {eduList.map((edu, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-[#1c1a19] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-white/5 flex flex-col md:flex-row gap-4 sm:gap-6 md:items-center group hover:bg-[#252221] transition-all duration-300"
                        >
                            <div className="p-3.5 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl w-fit group-hover:bg-blue-400/10 transition-colors">
                                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1.5 sm:mb-2 gap-1 sm:gap-2">
                                    <h4 className="text-lg sm:text-xl md:text-2xl font-black">{edu.degree}</h4>
                                    <span className="text-accent-orange font-bold text-xs sm:text-sm tracking-widest">{edu.period}</span>
                                </div>
                                <h5 className="text-sm sm:text-base md:text-lg text-white/50 font-bold mb-3 sm:mb-4">{edu.institution}</h5>
                                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent-orange/10 border border-accent-orange/20 rounded-lg sm:rounded-xl w-fit">
                                    <p className="text-accent-orange font-black text-xs sm:text-sm uppercase tracking-tighter">{edu.grade}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Education;
