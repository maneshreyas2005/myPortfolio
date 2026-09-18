import { resumeData } from '../data';
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const Footer = () => {
    const { profile } = usePortfolio();
    const data = profile || resumeData;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="rounded-3xl sm:rounded-[2.5rem] py-12 sm:py-20 px-4 sm:px-6 bg-[#0a0909]">
            <div className="px-0 sm:px-3 max-w-6xl mx-auto flex flex-col items-center">
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10 mb-12 sm:mb-20">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tighter max-w-2xl">
                            Let's create something <span className="text-accent-orange">extraordinary</span>.
                        </h2>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-6 md:gap-8 justify-center md:justify-start items-center">
                            <a href={`mailto:${data.email}`} className="text-sm sm:text-xl md:text-2xl font-bold hover:text-accent-orange transition-colors break-all sm:break-normal">
                                {data.email}
                            </a>
                            <a href={`tel:${data.phone}`} className="text-sm sm:text-xl md:text-2xl font-bold hover:text-accent-orange transition-colors">
                                {data.phone}
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="p-4 sm:p-6 sm:p-8 bg-white/5 rounded-full border border-white/10 hover:bg-accent-orange hover:text-white transition-all duration-300 group"
                        title="Scroll to top"
                    >
                        <ArrowUp className="w-5 h-5 sm:w-8 sm:h-8 group-hover:-translate-y-2 transition-transform" />
                    </button>
                </div>

                <div className="w-full h-px bg-white/10 mb-8 sm:mb-12"></div>

                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8 text-white/40 font-bold uppercase tracking-widest text-[11px] sm:text-xs text-center sm:text-left">
                    <p>© {new Date().getFullYear()} {data.name}. All rights reserved.</p>

                    <div className="flex gap-6 sm:gap-8">
                        <a href={data.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href={data.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>

                    <p>Built with React & Tailwind</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
