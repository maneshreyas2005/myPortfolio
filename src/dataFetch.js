import { resumeData } from './data';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5000';

/* ─────────────────────────────────────────
   Public Data Fetching with Fallbacks
───────────────────────────────────────── */

export const fetchProfileData = async () => {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error(`Profile fetch failed with status ${res.status}`);
    const data = await res.json();
    return {
      name: data.name || resumeData.name,
      title: data.title || resumeData.title,
      summary: data.summary || resumeData.summary,
      email: data.email || resumeData.email,
      phone: data.phone || resumeData.phone,
      github: data.github || resumeData.github,
      linkedin: data.linkedin || resumeData.linkedin,
      location: data.location || resumeData.location,
      profileImage: data.profileImage || '/images/photo3.jpeg',
      theme: data.theme || {}
    };
  } catch (err) {
    console.warn('Profile fetch error, using local fallback:', err.message);
    return {
      name: resumeData.name,
      title: resumeData.title,
      summary: resumeData.summary,
      email: resumeData.email,
      phone: resumeData.phone,
      github: resumeData.github,
      linkedin: resumeData.linkedin,
      location: resumeData.location,
      profileImage: '/images/photo3.jpeg'
    };
  }
};

export const fetchSkillsData = async () => {
  try {
    const res = await fetch(`${API_BASE}/skills`);
    if (!res.ok) throw new Error(`Skills fetch failed with status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return resumeData.skills;
  } catch (err) {
    console.warn('Skills fetch error, using local fallback:', err.message);
    return resumeData.skills;
  }
};

export const fetchExperienceData = async () => {
  try {
    const res = await fetch(`${API_BASE}/experience`);
    if (!res.ok) throw new Error(`Experience fetch failed with status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return resumeData.experience;
  } catch (err) {
    console.warn('Experience fetch error, using local fallback:', err.message);
    return resumeData.experience;
  }
};

export const fetchProjectsData = async () => {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`Projects fetch failed with status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return resumeData.projects;
  } catch (err) {
    console.warn('Projects fetch error, using local fallback:', err.message);
    return resumeData.projects;
  }
};

export const fetchEducationData = async () => {
  try {
    const res = await fetch(`${API_BASE}/education`);
    if (!res.ok) throw new Error(`Education fetch failed with status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return resumeData.education;
  } catch (err) {
    console.warn('Education fetch error, using local fallback:', err.message);
    return resumeData.education;
  }
};

export const fetchCommunityData = async () => {
  try {
    const res = await fetch(`${API_BASE}/community`);
    if (!res.ok) throw new Error(`Community fetch failed with status ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Community fetch error, using local fallback:', err.message);
    return [
      {
        _id: 'default-1',
        title: 'Interactive Tech Workshop',
        description: 'Mentoring engineering students on Full Stack architecture and AI APIs.',
        image: '/images/articles/featured-judge.jpg',
        tag: 'Workshop',
        date: '2026'
      },
      {
        _id: 'default-2',
        title: 'Campus Developer Bootcamp',
        description: 'Hands-on session building real-world React & Node.js applications.',
        image: '/images/photo3.jpeg',
        tag: 'Mentorship',
        date: '2025'
      },
      {
        _id: 'default-3',
        title: 'Hackathon Evaluation & Keynote',
        description: 'Reviewing student innovations and guiding them on system design.',
        image: '/images/articles/featured-judge.jpg',
        tag: 'Speaker',
        date: '2025'
      }
    ];
  }
};

/* ─────────────────────────────────────────
   Admin API Actions
───────────────────────────────────────── */

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login');
  return data;
};

export const verifyAdminToken = async (token) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Token expired or invalid');
  return await res.json();
};

export const updateProfileApi = async (profileData, token) => {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
};

// Skill CRUD
export const addSkillApi = async (skillData, token) => {
  const res = await fetch(`${API_BASE}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(skillData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add skill');
  return data;
};

export const updateSkillApi = async (id, skillData, token) => {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(skillData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update skill');
  return data;
};

export const deleteSkillApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete skill');
  return data;
};

// Experience CRUD
export const addExperienceApi = async (expData, token) => {
  const res = await fetch(`${API_BASE}/experience`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add experience');
  return data;
};

export const updateExperienceApi = async (id, expData, token) => {
  const res = await fetch(`${API_BASE}/experience/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update experience');
  return data;
};

export const deleteExperienceApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/experience/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete experience');
  return data;
};

// Project CRUD (supports FormData for image uploads or JSON)
export const addProjectApi = async (projectData, token) => {
  const isFormData = projectData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers,
    body: isFormData ? projectData : JSON.stringify(projectData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add project');
  return data;
};

export const updateProjectApi = async (id, projectData, token) => {
  const isFormData = projectData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? projectData : JSON.stringify(projectData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update project');
  return data;
};

export const deleteProjectApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete project');
  return data;
};

// Education CRUD
export const addEducationApi = async (eduData, token) => {
  const res = await fetch(`${API_BASE}/education`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eduData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add education');
  return data;
};

export const updateEducationApi = async (id, eduData, token) => {
  const res = await fetch(`${API_BASE}/education/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eduData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update education');
  return data;
};

export const deleteEducationApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/education/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete education');
  return data;
};

// Export & Import
export const exportDataApi = async (token) => {
  const res = await fetch(`${API_BASE}/export`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to export data');
  return await res.json();
};

export const importDataApi = async (jsonData, token) => {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(jsonData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to import data');
  return data;
};

// Community CRUD (supports FormData for image uploads or JSON)
export const addCommunityItemApi = async (communityData, token) => {
  const isFormData = communityData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/community`, {
    method: 'POST',
    headers,
    body: isFormData ? communityData : JSON.stringify(communityData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add community item');
  return data;
};

export const updateCommunityItemApi = async (id, communityData, token) => {
  const isFormData = communityData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/community/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? communityData : JSON.stringify(communityData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update community item');
  return data;
};

export const deleteCommunityItemApi = async (id, token) => {
  const res = await fetch(`${API_BASE}/community/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete community item');
  return data;
};

