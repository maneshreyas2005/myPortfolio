import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Code, Briefcase, GraduationCap, FolderGit2, Download, Upload,
  LogOut, Plus, Trash2, Edit3, Save, CheckCircle2, AlertCircle, Eye,
  RefreshCw, Lock, Sparkles, X, ChevronRight, Users, Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import {
  loginAdmin,
  updateProfileApi,
  addSkillApi,
  updateSkillApi,
  deleteSkillApi,
  addExperienceApi,
  updateExperienceApi,
  deleteExperienceApi,
  addProjectApi,
  updateProjectApi,
  deleteProjectApi,
  addEducationApi,
  updateEducationApi,
  deleteEducationApi,
  exportDataApi,
  importDataApi,
  addCommunityItemApi,
  updateCommunityItemApi,
  deleteCommunityItemApi
} from '../dataFetch';

export default function Admin() {
  const {
    profile,
    skills,
    experience,
    projects,
    education,
    community,
    adminToken,
    setAdminToken,
    logout,
    refreshData
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@portfolio.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Profile Form State
  const [profileForm, setProfileForm] = useState(profile);

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  // Skill Modal State
  const [skillModal, setSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillCategory, setSkillCategory] = useState('');
  const [skillItems, setSkillItems] = useState('');
  const [skillAccent, setSkillAccent] = useState('text-accent-orange');

  // Experience Modal State
  const [expModal, setExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expForm, setExpForm] = useState({
    role: '', company: '', period: '', location: '', type: 'On-site', points: '', image: '', sortOrder: 0
  });
  const [expFile, setExpFile] = useState(null);
  const [expPreview, setExpPreview] = useState('');

  // Project Modal State
  const [projModal, setProjModal] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [projForm, setProjForm] = useState({
    title: '', tech: '', description: '', detailedInfo: '', features: '', liveUrl: '', githubUrl: '', image: '', sortOrder: 0
  });
  const [projFile, setProjFile] = useState(null);
  const [projPreview, setProjPreview] = useState('');

  // Education Modal State
  const [eduModal, setEduModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [eduForm, setEduForm] = useState({
    degree: '', institution: '', period: '', grade: ''
  });

  // Community Modal State
  const [comModal, setComModal] = useState(false);
  const [editingCom, setEditingCom] = useState(null);
  const [comForm, setComForm] = useState({
    title: '', description: '', tag: 'Workshop', date: '', sortOrder: 0, image: ''
  });
  const [comFile, setComFile] = useState(null);
  const [comPreview, setComPreview] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const data = await loginAdmin(loginEmail, loginPassword);
      setAdminToken(data.token);
      showToast('Logged in successfully as Administrator');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileApi(profileForm, adminToken);
      await refreshData();
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Skill Save
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    const itemsArray = skillItems.split(',').map(s => s.trim()).filter(Boolean);
    if (!skillCategory || itemsArray.length === 0) {
      showToast('Please provide category and items', 'error');
      return;
    }
    setLoading(true);
    try {
      if (editingSkill) {
        await updateSkillApi(editingSkill._id, { category: skillCategory, items: itemsArray, accent: skillAccent }, adminToken);
        showToast('Skill category updated');
      } else {
        await addSkillApi({ category: skillCategory, items: itemsArray, accent: skillAccent }, adminToken);
        showToast('New skill category added');
      }
      setSkillModal(false);
      setEditingSkill(null);
      setSkillCategory('');
      setSkillItems('');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill category?')) return;
    try {
      await deleteSkillApi(id, adminToken);
      await refreshData();
      showToast('Skill category removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Experience Save
  const handleSaveExp = async (e) => {
    e.preventDefault();
    const pointsArray = Array.isArray(expForm.points)
      ? expForm.points
      : expForm.points.split('\n').map(p => p.trim()).filter(Boolean);

    setLoading(true);
    try {
      let payload;
      if (expFile) {
        payload = new FormData();
        payload.append('role', expForm.role);
        payload.append('company', expForm.company);
        payload.append('period', expForm.period);
        payload.append('location', expForm.location || '');
        payload.append('type', expForm.type || 'On-site');
        payload.append('points', JSON.stringify(pointsArray));
        payload.append('sortOrder', expForm.sortOrder || 0);
        payload.append('image', expFile);
      } else {
        payload = {
          role: expForm.role,
          company: expForm.company,
          period: expForm.period,
          location: expForm.location || '',
          type: expForm.type || 'On-site',
          points: pointsArray,
          image: expForm.image || '',
          sortOrder: Number(expForm.sortOrder) || 0
        };
      }

      if (editingExp) {
        await updateExperienceApi(editingExp._id, payload, adminToken);
        showToast('Experience updated');
      } else {
        await addExperienceApi(payload, adminToken);
        showToast('Experience added');
      }
      setExpModal(false);
      setEditingExp(null);
      setExpFile(null);
      setExpPreview('');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('Delete this work experience entry?')) return;
    try {
      await deleteExperienceApi(id, adminToken);
      await refreshData();
      showToast('Experience removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Project Save
  const handleSaveProj = async (e) => {
    e.preventDefault();
    const techArray = Array.isArray(projForm.tech)
      ? projForm.tech
      : projForm.tech.split(',').map(t => t.trim()).filter(Boolean);

    const featuresArray = Array.isArray(projForm.features)
      ? projForm.features
      : (projForm.features || '').split('\n').map(f => f.trim()).filter(Boolean);

    setLoading(true);
    try {
      let payload;
      if (projFile) {
        payload = new FormData();
        payload.append('title', projForm.title);
        payload.append('tech', JSON.stringify(techArray));
        payload.append('description', projForm.description);
        payload.append('detailedInfo', projForm.detailedInfo || '');
        payload.append('features', JSON.stringify(featuresArray));
        payload.append('liveUrl', projForm.liveUrl || '');
        payload.append('githubUrl', projForm.githubUrl || '');
        payload.append('sortOrder', projForm.sortOrder || 0);
        payload.append('image', projFile);
      } else {
        payload = {
          title: projForm.title,
          tech: techArray,
          description: projForm.description,
          detailedInfo: projForm.detailedInfo || '',
          features: featuresArray,
          liveUrl: projForm.liveUrl || '',
          githubUrl: projForm.githubUrl || '',
          image: projForm.image || '/images/photo3.jpeg',
          sortOrder: Number(projForm.sortOrder) || 0
        };
      }

      if (editingProj) {
        await updateProjectApi(editingProj._id || editingProj.id, payload, adminToken);
        showToast('Project updated');
      } else {
        await addProjectApi(payload, adminToken);
        showToast('New project created');
      }
      setProjModal(false);
      setEditingProj(null);
      setProjFile(null);
      setProjPreview('');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProj = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await deleteProjectApi(id, adminToken);
      await refreshData();
      showToast('Project removed successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Education Save
  const handleSaveEdu = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEdu) {
        await updateEducationApi(editingEdu._id, eduForm, adminToken);
        showToast('Education updated');
      } else {
        await addEducationApi(eduForm, adminToken);
        showToast('Education added');
      }
      setEduModal(false);
      setEditingEdu(null);
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await deleteEducationApi(id, adminToken);
      await refreshData();
      showToast('Education removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Community Save
  const handleSaveCommunity = async (e) => {
    e.preventDefault();
    if (!comFile && !comForm.image && !editingCom) {
      showToast('Please select an image file or provide an image URL', 'error');
      return;
    }
    setLoading(true);
    try {
      let payload;
      if (comFile) {
        payload = new FormData();
        payload.append('title', comForm.title || '');
        payload.append('description', comForm.description || '');
        payload.append('tag', comForm.tag || 'Community');
        payload.append('date', comForm.date || '');
        payload.append('sortOrder', comForm.sortOrder || 0);
        payload.append('image', comFile);
      } else {
        payload = {
          title: comForm.title || '',
          description: comForm.description || '',
          tag: comForm.tag || 'Community',
          date: comForm.date || '',
          sortOrder: Number(comForm.sortOrder) || 0,
          image: comForm.image || '/images/photo3.jpeg'
        };
      }

      if (editingCom) {
        await updateCommunityItemApi(editingCom._id, payload, adminToken);
        showToast('Responsibility photo updated');
      } else {
        await addCommunityItemApi(payload, adminToken);
        showToast('New responsibility photo uploaded');
      }
      setComModal(false);
      setEditingCom(null);
      setComFile(null);
      setComPreview('');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCommunity = async (id) => {
    if (!window.confirm('Delete this responsibility photo?')) return;
    try {
      await deleteCommunityItemApi(id, adminToken);
      await refreshData();
      showToast('Responsibility photo removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Export Backup
  const handleExportBackup = async () => {
    try {
      const data = await exportDataApi(adminToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Import Backup
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.profile || !json.skills || !json.experience || !json.projects || !json.education) {
          throw new Error('Invalid backup file. Required collections missing.');
        }
        if (!window.confirm('This will replace current portfolio data with the imported data. Continue?')) {
          return;
        }
        setLoading(true);
        await importDataApi(json, adminToken);
        await refreshData();
        showToast('Data imported and synced successfully!');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // IF NOT AUTHENTICATED -> SHOW LOGIN SCREEN
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#0d0c0b] text-white flex flex-col justify-center items-center px-4 font-inter selection:bg-accent-orange selection:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#161413] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Header decorative accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F46C38]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F46C38]/10 border border-[#F46C38]/30 flex items-center justify-center text-[#F46C38]">
              <Lock size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin CMS</h1>
              <p className="text-white/40 text-xs">Portfolio Content Management</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#F46C38] transition-colors"
                placeholder="admin@portfolio.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#F46C38] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-[#F46C38]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Log In to Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/40">
              Default Credentials: <code className="text-[#C5FF41]">admin@portfolio.com</code> / <code className="text-[#C5FF41]">admin123</code>
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
            >
              ← Return to Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-[#0d0c0b] text-white font-inter selection:bg-accent-orange selection:text-white flex flex-col">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-2 text-sm font-bold ${toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-accent-lime/10 border-accent-lime/30 text-accent-lime'
              }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-[#121110] px-4 sm:px-6 py-3.5 sm:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F46C38] flex items-center justify-center font-black text-white shadow-md text-sm sm:text-base">
              SM
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight">Portfolio CMS</h1>
              <p className="text-[10px] sm:text-[11px] text-white/40">Connected to MongoDB Atlas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Live Site</span>
            </Link>

            <button
              onClick={refreshData}
              title="Sync Data"
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: <Sparkles size={18} /> },
            { id: 'profile', label: 'Profile Info', icon: <User size={18} /> },
            { id: 'skills', label: 'Skills Stack', icon: <Code size={18} /> },
            { id: 'projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
            { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
            { id: 'community', label: 'Positions of Responsibility', icon: <Users size={18} /> },
            { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
            { id: 'backup', label: 'Backup & JSON', icon: <Download size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all duration-300 text-left cursor-pointer whitespace-nowrap ${activeTab === tab.id
                ? 'bg-[#F46C38] text-white shadow-lg shadow-[#F46C38]/20'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Panels */}
        <main className="flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-[#161413] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-black mb-2">Welcome, Administrator</h2>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Manage all sections of your portfolio in real time. Changes made here are saved directly to MongoDB Atlas and will instantly reflect on your live website.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-3xl font-black text-[#F46C38]">{projects?.length || 0}</span>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mt-1">Projects</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-3xl font-black text-[#C5FF41]">{skills?.length || 0}</span>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mt-1">Skill Categories</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-3xl font-black text-cyan-400">{experience?.length || 0}</span>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mt-1">Experiences</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-3xl font-black text-accent-lime">{community?.length || 0}</span>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mt-1">Responsibilities</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-3xl font-black text-blue-400">{education?.length || 0}</span>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mt-1">Education</p>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('projects')}
                  className="p-6 rounded-3xl bg-[#161413] border border-white/10 hover:border-[#F46C38]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FolderGit2 className="text-[#F46C38]" size={24} />
                    <ChevronRight className="text-white/30 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold">Manage Projects</h3>
                  <p className="text-xs text-white/50 mt-1">Add screenshots, tech stack tags, and descriptions.</p>
                </div>

                <div
                  onClick={() => setActiveTab('profile')}
                  className="p-6 rounded-3xl bg-[#161413] border border-white/10 hover:border-[#C5FF41]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <User className="text-[#C5FF41]" size={24} />
                    <ChevronRight className="text-white/30 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold">Edit Profile & Socials</h3>
                  <p className="text-xs text-white/50 mt-1">Update your title, bio, email, and LinkedIn links.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-[#161413] border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black mb-6">Edit Profile Details</h2>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Title / Headline</label>
                      <input
                        type="text"
                        value={profileForm.title || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Location</label>
                      <input
                        type="text"
                        value={profileForm.location || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={profileForm.github || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profileForm.linkedin || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Profile Image Path / URL</label>
                    <input
                      type="text"
                      value={profileForm.profileImage || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Summary / Bio</label>
                    <textarea
                      rows={4}
                      value={profileForm.summary || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#F46C38] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#F46C38]/20"
                  >
                    <Save size={18} />
                    <span>Save Profile Changes</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Skill Categories</h2>
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setSkillCategory('');
                    setSkillItems('');
                    setSkillAccent('text-accent-lime');
                    setSkillModal(true);
                  }}
                  className="px-4 py-2.5 bg-[#C5FF41] hover:bg-[#d5ff6b] text-[#151312] font-black text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((group, idx) => (
                  <div key={group._id || idx} className="bg-[#161413] border border-white/10 rounded-3xl p-6 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-base font-black uppercase ${group.accent || 'text-accent-orange'}`}>
                        {group.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSkill(group);
                            setSkillCategory(group.category);
                            setSkillItems(group.items.join(', '));
                            setSkillAccent(group.accent || 'text-accent-orange');
                            setSkillModal(true);
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(group._id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.items.map((it, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Portfolio Projects</h2>
                <button
                  onClick={() => {
                    setEditingProj(null);
                    setProjForm({
                      title: '',
                      tech: '',
                      description: '',
                      detailedInfo: '',
                      features: '',
                      liveUrl: '',
                      githubUrl: '',
                      image: '',
                      sortOrder: projects.length + 1
                    });
                    setProjFile(null);
                    setProjPreview('');
                    setProjModal(true);
                  }}
                  className="px-4 py-2.5 bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <div key={proj._id || proj.id || idx} className="bg-[#161413] border border-white/10 rounded-3xl overflow-hidden group flex flex-col">
                    <div className="h-44 bg-white/5 relative overflow-hidden">
                      <img
                        src={proj.image || '/images/photo3.jpeg'}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProj(proj);
                            setProjForm({
                              title: proj.title || '',
                              tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : (proj.tech || ''),
                              description: proj.description || '',
                              detailedInfo: proj.detailedInfo || '',
                              features: Array.isArray(proj.features) ? proj.features.join('\n') : (proj.features || ''),
                              liveUrl: proj.liveUrl || '',
                              githubUrl: proj.githubUrl || '',
                              image: proj.image || '',
                              sortOrder: proj.sortOrder || 0
                            });
                            setProjFile(null);
                            setProjPreview(proj.image || '');
                            setProjModal(true);
                          }}
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-[#F46C38] transition-colors cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProj(proj._id || proj.id);
                          }}
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">{proj.title}</h3>
                          <span className="text-xs font-mono text-white/30">Order: {proj.sortOrder || 0}</span>
                        </div>
                        <p className="text-white/60 text-xs line-clamp-2 mb-4 leading-relaxed">{proj.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(proj.tech) ? proj.tech : []).map((t, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-[#F46C38]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Work Experience</h2>
                <button
                  onClick={() => {
                    setEditingExp(null);
                    setExpForm({ role: '', company: '', period: '', location: '', type: 'On-site', points: '', image: '', sortOrder: (experience?.length || 0) + 1 });
                    setExpFile(null);
                    setExpPreview('');
                    setExpModal(true);
                  }}
                  className="px-4 py-2.5 bg-accent-lime hover:bg-[#d5ff6b] text-[#151312] font-black text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp._id || idx} className="bg-[#161413] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-4 items-start">
                    <div className="flex gap-4 flex-1 items-start">
                      {exp.image && (
                        <img
                          src={exp.image}
                          alt={exp.company}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/15 bg-white/5 shrink-0"
                        />
                      )}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{exp.role}</h3>
                          <span className="text-xs font-bold text-[#F46C38] px-3 py-0.5 rounded-full bg-[#F46C38]/10 border border-[#F46C38]/20">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm font-semibold">{exp.company} • {exp.location} ({exp.type})</p>
                        <ul className="list-disc list-inside text-xs text-white/50 space-y-1 pt-2">
                          {(exp.points || []).map((pt, i) => (
                            <li key={i} className="line-clamp-1">{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpForm({
                            role: exp.role,
                            company: exp.company,
                            period: exp.period,
                            location: exp.location || '',
                            type: exp.type || 'On-site',
                            points: Array.isArray(exp.points) ? exp.points.join('\n') : exp.points,
                            image: exp.image || '',
                            sortOrder: exp.sortOrder || 0
                          });
                          setExpFile(null);
                          setExpPreview(exp.image || '');
                          setExpModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExp(exp._id)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: POSITIONS OF RESPONSIBILITY */}
          {activeTab === 'community' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Positions of Responsibility Gallery</h2>
                  <p className="text-xs text-white/40 mt-1">Manage leadership roles, mentoring sessions, and event highlights</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCom(null);
                    setComForm({ title: '', description: '', tag: 'Workshop', date: '2026', sortOrder: (community?.length || 0) + 1, image: '' });
                    setComFile(null);
                    setComPreview('');
                    setComModal(true);
                  }}
                  className="px-4 py-2.5 bg-accent-lime hover:bg-[#d5ff6b] text-[#151312] font-black text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-accent-lime/20"
                >
                  <Plus size={16} />
                  <span>Add Photo / Event</span>
                </button>
              </div>

              {(!community || community.length === 0) ? (
                <div className="p-12 text-center rounded-3xl bg-[#161413] border border-white/10">
                  <p className="text-white/40 text-sm">No photos uploaded yet. Click "Add Photo / Event" above to upload your first event photo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {community.map((item, idx) => (
                    <div key={item._id || idx} className="bg-[#161413] border border-white/10 rounded-3xl overflow-hidden group flex flex-col">
                      <div className="h-48 bg-white/5 relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title || 'Position of Responsibility'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCom(item);
                              setComForm({
                                title: item.title || '',
                                description: item.description || '',
                                tag: item.tag || 'Workshop',
                                date: item.date || '',
                                sortOrder: item.sortOrder || 0,
                                image: item.image || ''
                              });
                              setComFile(null);
                              setComPreview(item.image || '');
                              setComModal(true);
                            }}
                            className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-[#F46C38] transition-colors cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunity(item._id)}
                            className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-accent-lime font-bold text-[10px] uppercase tracking-wider border border-white/10">
                          {item.tag || 'Responsibility'}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-bold text-white line-clamp-1">{item.title || 'Untitled Impact Item'}</h3>
                            {item.date && <span className="text-[11px] font-bold text-white/40">{item.date}</span>}
                          </div>
                          {item.description && (
                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: EDUCATION */}
          {activeTab === 'education' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Education Entries</h2>
                <button
                  onClick={() => {
                    setEditingEdu(null);
                    setEduForm({ degree: '', institution: '', period: '', grade: '' });
                    setEduModal(true);
                  }}
                  className="px-4 py-2.5 bg-blue-400 hover:bg-blue-300 text-[#151312] font-black text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {education.map((edu, idx) => (
                  <div key={edu._id || idx} className="bg-[#161413] border border-white/10 rounded-3xl p-6 flex justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{edu.degree}</h3>
                      <p className="text-white/60 text-xs font-medium mt-1">{edu.institution}</p>
                      <p className="text-[#F46C38] text-xs font-bold mt-2">{edu.period}</p>
                      <p className="text-white/40 text-xs mt-1">{edu.grade}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <button
                        onClick={() => {
                          setEditingEdu(edu);
                          setEduForm({
                            degree: edu.degree,
                            institution: edu.institution,
                            period: edu.period,
                            grade: edu.grade || ''
                          });
                          setEduModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEdu(edu._id)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 7: BACKUP & JSON */}
          {activeTab === 'backup' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-[#161413] border border-white/10 rounded-3xl p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Backup & JSON Migration</h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Safely export a complete JSON snapshot of all your database collections (Profile, Skills, Experience, Projects, Education) or restore from an existing JSON backup.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {/* Export Card */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#F46C38]/10 text-[#F46C38] flex items-center justify-center mb-3">
                        <Download size={24} />
                      </div>
                      <h3 className="text-lg font-bold">Export JSON Backup</h3>
                      <p className="text-xs text-white/50 mt-1">
                        Download an offline JSON file containing all portfolio data.
                      </p>
                    </div>
                    <button
                      onClick={handleExportBackup}
                      className="w-full py-3 bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Download size={16} />
                      <span>Download Backup JSON</span>
                    </button>
                  </div>

                  {/* Import Card */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-accent-lime/10 text-accent-lime flex items-center justify-center mb-3">
                        <Upload size={24} />
                      </div>
                      <h3 className="text-lg font-bold">Import JSON Data</h3>
                      <p className="text-xs text-white/50 mt-1">
                        Upload a previously exported JSON backup to reset and sync collections.
                      </p>
                    </div>
                    <label className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs">
                      <Upload size={16} />
                      <span>Choose JSON File</span>
                      <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* SKILL MODAL */}
      <AnimatePresence>
        {skillModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingSkill ? 'Edit Skill Category' : 'New Skill Category'}</h3>
                <button onClick={() => setSkillModal(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveSkill} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Category Name</label>
                  <input type="text" required value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} placeholder="e.g. Frontend, DevOps, AI" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Skill Items (comma-separated)</label>
                  <input type="text" required value={skillItems} onChange={(e) => setSkillItems(e.target.value)} placeholder="React.js, Next.js, TailwindCSS" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Accent Color Class</label>
                  <select value={skillAccent} onChange={(e) => setSkillAccent(e.target.value)} className="w-full px-4 py-3 bg-[#201e1d] border border-white/10 rounded-xl text-white outline-none">
                    <option value="text-accent-orange">Orange</option>
                    <option value="text-accent-lime">Lime</option>
                    <option value="text-accent-red">Red</option>
                    <option value="text-blue-400">Blue</option>
                    <option value="text-purple-400">Purple</option>
                    <option value="text-cyan-400">Cyan</option>
                    <option value="text-pink-400">Pink</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setSkillModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold text-xs cursor-pointer">Save Category</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {projModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingProj ? 'Edit Project' : 'New Project'}</h3>
                <button onClick={() => setProjModal(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveProj} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Project Title</label>
                  <input type="text" required value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} placeholder="e.g. AI Interviewer" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Tech Stack (comma-separated)</label>
                  <input type="text" required value={projForm.tech} onChange={(e) => setProjForm({ ...projForm, tech: e.target.value })} placeholder="React.js, Node.js, Socket.io" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Short Summary / Card Description</label>
                  <textarea rows={2} required value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} placeholder="Brief summary of the project shown on the home page card..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Detailed Project Info / Overview (For Project Details Page)</label>
                  <textarea rows={4} value={projForm.detailedInfo} onChange={(e) => setProjForm({ ...projForm, detailedInfo: e.target.value })} placeholder="Comprehensive explanation of what you built, backend architecture, problem statement, and engineering challenges..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Key Features & Highlights (One per line)</label>
                  <textarea rows={3} value={projForm.features} onChange={(e) => setProjForm({ ...projForm, features: e.target.value })} placeholder="35+ secure REST API endpoints across 6 core modules&#10;JWT-based authentication and role-based access control&#10;Integrated backend workflows for inventory and billing" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Live Demo URL</label>
                    <input type="url" value={projForm.liveUrl} onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })} placeholder="https://yourproject.com" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">GitHub / Source Code URL</label>
                    <input type="url" value={projForm.githubUrl} onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#F46C38]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Sort Order</label>
                    <input type="number" value={projForm.sortOrder} onChange={(e) => setProjForm({ ...projForm, sortOrder: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProjFile(file);
                          setProjPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-xs text-white/50 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                  </div>
                </div>

                {projPreview && (
                  <div className="h-32 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <img src={projPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between gap-3">
                  {editingProj ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const idToDelete = editingProj._id || editingProj.id;
                        setProjModal(false);
                        await handleDeleteProj(idToDelete);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Delete Project</span>
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setProjModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs cursor-pointer">Cancel</button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#F46C38] hover:bg-[#ff7b47] text-white font-bold text-xs cursor-pointer">Save Project</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPERIENCE MODAL */}
      <AnimatePresence>
        {expModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingExp ? 'Edit Experience' : 'New Experience'}</h3>
                <button onClick={() => setExpModal(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveExp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Role Title</label>
                    <input type="text" required value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} placeholder="Full Stack Developer" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Company Name</label>
                    <input type="text" required value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} placeholder="Company Inc." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Period</label>
                    <input type="text" required value={expForm.period} onChange={(e) => setExpForm({ ...expForm, period: e.target.value })} placeholder="Mar 2026 - Present" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Location</label>
                    <input type="text" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} placeholder="Mumbai, India" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Type</label>
                    <input type="text" value={expForm.type} onChange={(e) => setExpForm({ ...expForm, type: e.target.value })} placeholder="On-site / Remote" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Bullet Points (one per line)</label>
                  <textarea rows={4} required value={expForm.points} onChange={(e) => setExpForm({ ...expForm, points: e.target.value })} placeholder="Led development of AI application..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>

                {/* Optional Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-white/50">Company Logo / Photo (Optional)</label>
                    {expPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpFile(null);
                          setExpPreview('');
                          setExpForm({ ...expForm, image: '' });
                        }}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setExpFile(file);
                        setExpPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-white/50 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />
                  {expPreview && (
                    <div className="mt-3 w-20 h-20 rounded-xl overflow-hidden border border-white/15 bg-black/40">
                      <img src={expPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setExpModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-accent-lime hover:bg-[#d5ff6b] text-[#151312] font-black text-xs cursor-pointer">Save Experience</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDUCATION MODAL */}
      <AnimatePresence>
        {eduModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingEdu ? 'Edit Education' : 'New Education'}</h3>
                <button onClick={() => setEduModal(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveEdu} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Degree / Program</label>
                  <input type="text" required value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="B.E. in Information Technology" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Institution</label>
                  <input type="text" required value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="University / College" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Period</label>
                    <input type="text" required value={eduForm.period} onChange={(e) => setEduForm({ ...eduForm, period: e.target.value })} placeholder="2024 - Present" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Grade / CGPA</label>
                    <input type="text" value={eduForm.grade} onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })} placeholder="CGPA: 8.92 / 10" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setEduModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-blue-400 hover:bg-blue-300 text-[#151312] font-black text-xs cursor-pointer">Save Education</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POSITIONS OF RESPONSIBILITY MODAL */}
      <AnimatePresence>
        {comModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingCom ? 'Edit Responsibility Photo' : 'Upload Responsibility Photo'}</h3>
                <button onClick={() => setComModal(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveCommunity} className="space-y-4">
                <div>

                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Event / Workshop Title</label>
                  <input
                    type="text"
                    value={comForm.title}
                    onChange={(e) => setComForm({ ...comForm, title: e.target.value })}
                    placeholder="e.g. Full Stack Engineering Workshop"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent-lime"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Category Tag</label>
                    <input
                      type="text"
                      value={comForm.tag}
                      onChange={(e) => setComForm({ ...comForm, tag: e.target.value })}
                      placeholder="Workshop, Speaker, Mentorship"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Year / Date</label>
                    <input
                      type="text"
                      value={comForm.date}
                      onChange={(e) => setComForm({ ...comForm, date: e.target.value })}
                      placeholder="e.g. 2026 or Mar 2026"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-white/50 mb-2">Description / Impact Note</label>
                  <textarea
                    rows={3}
                    value={comForm.description}
                    onChange={(e) => setComForm({ ...comForm, description: e.target.value })}
                    placeholder="Mentored 100+ students on building AI applications..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={comForm.sortOrder}
                      onChange={(e) => setComForm({ ...comForm, sortOrder: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-white/50 mb-2">Upload Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setComFile(file);
                          setComPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-xs text-white/50 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                  </div>
                </div>

                {comPreview && (
                  <div className="h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <img src={comPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setComModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-accent-lime hover:bg-[#d5ff6b] text-[#151312] font-black text-xs cursor-pointer">Save Photo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
