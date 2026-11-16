import {
  Code, FolderGit2, Briefcase, Award, Users, GraduationCap
} from 'lucide-react';

export const SECTIONS = [
  { id: 'skills', label: 'Skills', icon: Code, countKey: 'skills' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, countKey: 'projects' },
  { id: 'experience', label: 'Experience', icon: Briefcase, countKey: 'experience' },
  { id: 'certificates', label: 'Certificates', icon: Award, countKey: 'certificates' },
  { id: 'community', label: 'Responsibilities', icon: Users, countKey: 'community' },
  { id: 'education', label: 'Education', icon: GraduationCap, countKey: 'education' }
];

export const SECTION_ORDER = ['skills', 'projects', 'experience', 'certificates', 'community', 'education'];

export const HERO_ID = 'hero';

// Skill category -> color mapping (consistent with Skills.jsx)
export const SKILL_CATEGORY_CONFIG = {
  Languages: { color: 'text-accent-orange', dot: 'bg-accent-orange' },
  Frontend: { color: 'text-accent-lime', dot: 'bg-accent-lime' },
  Backend: { color: 'text-accent-red', dot: 'bg-accent-red' },
  Databases: { color: 'text-blue-400', dot: 'bg-blue-500' },
  Tools: { color: 'text-purple-400', dot: 'bg-purple-500' },
  'AI & APIs': { color: 'text-cyan-400', dot: 'bg-cyan-500' },
  'Soft Skills': { color: 'text-pink-400', dot: 'bg-pink-500' }
};

// Node type colors for the competency map
export const NODE_TYPE_STYLES = {
  skillCategory: { bg: 'bg-[#1c1a19]', border: 'border-[#F46C38]/30', text: 'text-white' },
  certification: { bg: 'bg-[#1c1a19]', border: 'border-[#C5FF41]/30', text: 'text-white' },
  project: { bg: 'bg-[#1c1a19]', border: 'border-accent-orange/30', text: 'text-white' }
};

// Edge type styles
export const EDGE_TYPE_STYLES = {
  validates: { stroke: '#C5FF41', strokeDasharray: '4 2', label: 'Validates' },
  usedIn: { stroke: '#F46C38', strokeDasharray: '', label: 'Used In' }
};
