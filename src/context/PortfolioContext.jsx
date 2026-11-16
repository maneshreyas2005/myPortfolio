import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resumeData } from '../data';
import {
  fetchProfileData,
  fetchSkillsData,
  fetchExperienceData,
  fetchProjectsData,
  fetchEducationData,
  fetchCommunityData,
  fetchCertificatesData
} from '../dataFetch';
import { SECTION_ORDER } from '../config/sections';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  // Initialize with resumeData for instant rendering without layout shifts
  const [profile, setProfile] = useState({
    name: resumeData.name,
    title: resumeData.title,
    summary: resumeData.summary,
    email: resumeData.email,
    phone: resumeData.phone,
    github: resumeData.github,
    linkedin: resumeData.linkedin,
    location: resumeData.location,
    profileImage: '/images/photo3.jpeg',
    visibleSections: [...SECTION_ORDER]
  });
  const [skills, setSkills] = useState(resumeData.skills);
  const [experience, setExperience] = useState(resumeData.experience);
  const [projects, setProjects] = useState(resumeData.projects);
  const [education, setEducation] = useState(resumeData.education);
  const [community, setCommunity] = useState([]);
  const [certificates, setCertificates] = useState(resumeData.certificates || []);
  const [loading, setLoading] = useState(true);

  // Admin authentication state
  const [adminToken, setAdminTokenState] = useState(() => {
    return localStorage.getItem('portfolio_admin_token') || null;
  });

  const setAdminToken = (token) => {
    if (token) {
      localStorage.setItem('portfolio_admin_token', token);
    } else {
      localStorage.removeItem('portfolio_admin_token');
    }
    setAdminTokenState(token);
  };

  const logout = () => {
    setAdminToken(null);
  };

  const refreshData = useCallback(() => {
    let mounted = true;

    // Progressive hydration: fire all requests immediately, update state as each resolves.
    // Static fallback (already in state) is shown instantly; API data replaces it progressively.
    const fetches = {
      profile: fetchProfileData().then((data) => { if (mounted) setProfile(data); }),
      skills: fetchSkillsData().then((data) => { if (mounted) setSkills(data); }),
      experience: fetchExperienceData().then((data) => { if (mounted) setExperience(data); }),
      projects: fetchProjectsData().then((data) => { if (mounted) setProjects(data); }),
      education: fetchEducationData().then((data) => { if (mounted) setEducation(data); }),
      community: fetchCommunityData().then((data) => { if (mounted) setCommunity(data); }),
      certificates: fetchCertificatesData().then((data) => { if (mounted) setCertificates(data); }),
    };

    Promise.all(Object.values(fetches)).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = refreshData();
    return cleanup;
  }, [refreshData]);

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        skills,
        experience,
        projects,
        education,
        community,
        certificates,
        loading,
        refreshData,
        adminToken,
        setAdminToken,
        logout
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
