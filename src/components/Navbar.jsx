import { motion } from 'framer-motion';
import { Home, Briefcase, Code, GraduationCap, Users, Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SECTION_ORDER } from '../config/sections';

const Navbar = () => {
    const { profile } = usePortfolio();
    const visibleSections = Array.isArray(profile?.visibleSections) ? profile.visibleSections : SECTION_ORDER;

    const allNavItems = [
        { id: 'home', icon: <Home className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Home', href: '#home' },
        { id: 'skills', icon: <Code className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Skills', href: '#skills' },
        { id: 'projects', icon: <Briefcase className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Work', href: '#projects' },
        { id: 'certificates', icon: <Award className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Certificates', href: '#certificates' },
        { id: 'community', icon: <Users className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Responsibilities', href: '#community' },
        { id: 'education', icon: <GraduationCap className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Education', href: '#education' },
    ];

    const navItems = allNavItems.filter((item) => item.id === 'home' || visibleSections.includes(item.id));

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 px-3.5 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl w-[94%] max-w-[360px] sm:max-w-none sm:w-auto"
        >
            <ul className="flex items-center justify-around sm:justify-center gap-1 sm:gap-6">
                {navItems.map((item, index) => (
                    <li key={index}>
                        <a
                            href={item.href}
                            data-analytics="true"
                            data-analytics-id={`nav-${item.label.toLowerCase()}`}
                            data-analytics-type="nav_link"
                            className="text-white/70 hover:text-accent-orange transition-colors duration-300 flex items-center gap-2 p-1 sm:p-0 group"
                            title={item.label}
                        >
                            {item.icon}
                            <span className="hidden md:block text-sm font-medium">{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </motion.nav>
    );
};

export default Navbar;
