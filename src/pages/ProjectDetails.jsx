import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { resumeData } from '../data';
import { usePortfolio } from '../context/PortfolioContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const { projects } = usePortfolio();
    const projectList = projects && projects.length > 0 ? projects : resumeData.projects;
    const project = projectList.find(p => p.id === id || p._id === id);

    if (!project) {
        return (
            <div className="min-h-screen bg-bg-dark text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-black mb-4">Project Not Found</h1>
                <Link to="/" className="text-accent-orange hover:underline font-bold">
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark text-white font-inter selection:bg-accent-orange selection:text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32">

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs sm:text-sm font-bold mb-6 sm:mb-12"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-12 bg-white/5 border border-white/10">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 sm:mb-6">
                        {project.title}
                    </h1>

                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
                        {project.tech.map((tech, i) => (
                            <span
                                key={i}
                                className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-accent-orange"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-white/70 leading-relaxed text-lg md:text-xl mb-8">
                            {project.description}
                        </p>

                        <p className="text-white/50 leading-relaxed">
                            (This is where you can add a detailed case study, problems faced, solutions engineered, and what you learned while building this specific project. It gives depth to your portfolio.)
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-16 pt-12 border-t border-white/10 flex flex-wrap gap-4">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-orange text-white rounded-full font-bold uppercase tracking-widest hover:bg-accent-red transition-all duration-300"
                        >
                            Live Demo <ExternalLink size={18} />
                        </a>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all duration-300"
                        >
                            Source Code <Github size={18} />
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-50">
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-accent-orange/5 blur-[120px] rounded-full"></div>
            </div>
        </div>
    );
};

export default ProjectDetails;
