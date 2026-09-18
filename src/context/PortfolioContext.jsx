import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resumeData } from '../data';
import {
  fetchProfileData,
  fetchSkillsData,
  fetchExperienceData,
  fetchProjectsData,
  fetchEducationData,
  fetchCommunityData
} from '../dataFetch';

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
    profileImage: '/images/photo3.jpeg'
  });
  const [skills, setSkills] = useState(resumeData.skills);
  const [experience, setExperience] = useState(resumeData.experience);
  const [projects, setProjects] = useState(resumeData.projects);
  const [education, setEducation] = useState(resumeData.education);
  const [community, setCommunity] = useState([]);
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

  const refreshData = useCallback(async () => {
    try {
      const [p, s, exp, prj, edu, com] = await Promise.allSettled([
        fetchProfileData(),
        fetchSkillsData(),
        fetchExperienceData(),
        fetchProjectsData(),
        fetchEducationData(),
        fetchCommunityData()
      ]);

      if (p.status === 'fulfilled' && p.value) setProfile(p.value);
      if (s.status === 'fulfilled' && s.value) setSkills(s.value);
      if (exp.status === 'fulfilled' && exp.value) setExperience(exp.value);
      if (prj.status === 'fulfilled' && prj.value) setProjects(prj.value);
      if (edu.status === 'fulfilled' && edu.value) setEducation(edu.value);
      if (com.status === 'fulfilled' && com.value) setCommunity(com.value);
    } catch (err) {
      console.warn('Portfolio refresh warning:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
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
