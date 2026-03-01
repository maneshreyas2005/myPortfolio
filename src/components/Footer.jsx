import { resumeData } from '../data';
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="rounded-[2.5rem] py-20 px-4 bg-[#0a0909]">
            <div className=" px-3 max-w-6xl mx-auto flex flex-col items-center">
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-7xl font-black mb-6 tracking-tighter">
                            Let's create something <span className="text-accent-orange">extraordinary</span>.
                        </h2>
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start">
                            <a href={`mailto:${resumeData.email}`} className="text-lg md:text-2xl font-bold hover:text-accent-orange transition-colors">
                                {resumeData.email}
                            </a>
                            <a href={`tel:${resumeData.phone}`} className="text-lg md:text-2xl font-bold hover:text-accent-orange transition-colors">
                                {resumeData.phone}
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="p-8 bg-white/5 rounded-full border border-white/10 hover:bg-accent-orange hover:text-white transition-all duration-300 group"
                    >
                        <ArrowUp size={40} className="group-hover:-translate-y-2 transition-transform" />
                    </button>
                </div>

                <div className="w-full h-px bg-white/10 mb-12"></div>

                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 font-bold uppercase tracking-widest text-xs">
                    <p>© {new Date().getFullYear()} {resumeData.name}. All rights reserved.</p>

                    <div className="flex gap-8">
                        <a href={resumeData.linkedin} target="_blank" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href={resumeData.github} target="_blank" className="hover:text-white transition-colors">GitHub</a>
                    </div>

                    <p>Built with React & Tailwind</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
