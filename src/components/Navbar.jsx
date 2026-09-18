import { motion } from 'framer-motion';
import { Home, Briefcase, Code, GraduationCap, Users } from 'lucide-react';

const Navbar = () => {
    const navItems = [
        { icon: <Home className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Home', href: '#home' },
        { icon: <Code className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Skills', href: '#skills' },
        { icon: <Briefcase className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Work', href: '#projects' },
        { icon: <Users className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Community', href: '#community' },
        { icon: <GraduationCap className="w-[18px] h-[18px] sm:w-5 sm:h-5" />, label: 'Education', href: '#education' },
    ];

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
