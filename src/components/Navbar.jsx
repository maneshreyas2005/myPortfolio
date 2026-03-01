import { motion } from 'framer-motion';
import { Home, Briefcase, Code, GraduationCap, User, Mail } from 'lucide-react';

const Navbar = () => {
    const navItems = [
        { icon: <Home size={20} />, label: 'Home', href: '#home' },
        { icon: <User size={20} />, label: 'About', href: '#about' },
        { icon: <Code size={20} />, label: 'Projects', href: '#projects' },
        { icon: <Briefcase size={20} />, label: 'Experience', href: '#experience' },
        { icon: <GraduationCap size={20} />, label: 'Education', href: '#education' },
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl"
        >
            <ul className="flex items-center gap-6">
                {navItems.map((item, index) => (
                    <li key={index}>
                        <a
                            href={item.href}
                            className="text-white/70 hover:text-accent-orange transition-colors duration-300 flex items-center gap-2 group"
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
