import React, { useState, useCallback } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { updateProfileApi } from '../../dataFetch';

export default function ToggleSwitch({ section, onToggle }) {
  const { profile, adminToken } = usePortfolio();
  const [isSaving, setIsSaving] = useState(false);

  const isVisible = profile.visibleSections?.includes(section.id) ?? true;

  const handleToggle = useCallback(async () => {
    if (!adminToken) return;

    setIsSaving(true);
    const newVisible = isVisible
      ? profile.visibleSections.filter((s) => s !== section.id)
      : [...profile.visibleSections, section.id];

    try {
      await updateProfileApi({ visibleSections: newVisible }, adminToken);
      onToggle?.(section.id, !isVisible);
    } catch (err) {
      console.error(`Failed to ${isVisible ? 'hide' : 'show'} ${section.label}:`, err);
    } finally {
      setIsSaving(false);
    }
  }, [profile, adminToken, setProfile, section, isVisible, onToggle]);

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVisible ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5 text-white/30'}`}>
          <section.icon size={20} />
        </div>
        <div>
          <h4 className={`text-sm font-bold ${isVisible ? 'text-white' : 'text-white/40'}`}>
            {section.label}
          </h4>
          <p className="text-[10px] text-white/30">Section</p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={isSaving}
        className={`relative inline-flex w-10 h-6 rounded-full transition-colors ${isVisible ? 'bg-accent-orange' : 'bg-white/10'}`}
        aria-checked={isVisible}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isVisible ? 'translate-x-5' : 'translate-x-1'}`}
          aria-hidden="true"
        />
      </button>
      {isSaving && (
        <span className="text-[10px] text-accent-orange animate-pulse">Saving…</span>
      )}
    </div>
  );
}
