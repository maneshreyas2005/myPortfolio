import React, { useState, useCallback } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { updateProfileApi } from '../../dataFetch';
import { SECTION_ORDER } from '../../config/sections';

export default function ToggleSwitch({ section, onToggle, onError }) {
  const { profile, setProfile, adminToken } = usePortfolio();
  const [isSaving, setIsSaving] = useState(false);

  const currentSections = Array.isArray(profile?.visibleSections)
    ? profile.visibleSections
    : SECTION_ORDER;
  const isVisible = currentSections.includes(section.id);

  const handleToggle = useCallback(async () => {
    if (!adminToken) {
      console.warn('Cannot toggle section: Admin token missing');
      onError?.('You must be logged in as an administrator to change visibility');
      return;
    }

    setIsSaving(true);
    const newVisible = isVisible
      ? currentSections.filter((s) => s !== section.id)
      : [...currentSections, section.id];

    // Optimistic UI update
    setProfile?.((prev) => ({ ...prev, visibleSections: newVisible }));

    try {
      await updateProfileApi({ visibleSections: newVisible }, adminToken);
      onToggle?.(section.id, !isVisible);
    } catch (err) {
      // Revert on error
      setProfile?.((prev) => ({ ...prev, visibleSections: currentSections }));
      console.error(`Failed to ${isVisible ? 'hide' : 'show'} ${section.label}:`, err);
      onError?.(err.message || `Failed to update ${section.label} visibility`);
    } finally {
      setIsSaving(false);
    }
  }, [currentSections, adminToken, setProfile, section, isVisible, onToggle, onError]);

  return (
    <div
      onClick={handleToggle}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group select-none"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isVisible
              ? 'bg-white/10 border border-white/20 text-white'
              : 'bg-white/5 border border-white/5 text-white/30'
          }`}
        >
          <section.icon size={20} />
        </div>
        <div>
          <h4 className={`text-sm font-bold transition-colors ${isVisible ? 'text-white' : 'text-white/40'}`}>
            {section.label}
          </h4>
          <p className="text-[10px] text-white/30">
            {isVisible ? 'Visible on website' : 'Hidden from website'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSaving && (
          <span className="text-[10px] text-accent-orange animate-pulse">Saving…</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          disabled={isSaving}
          className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
            isVisible ? 'bg-accent-orange' : 'bg-white/10'
          }`}
          aria-checked={isVisible}
        >
          <span
            className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform my-1 ${
              isVisible ? 'translate-x-6' : 'translate-x-1'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
