import React from 'react';
import { Award, ExternalLink, Globe, Server, Database, Compass, Box, Sparkles, Users, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resumeData } from '../../data';

const ICON_MAP = {
  Languages: <CodeIcon className="w-4 h-4" />,
  Frontend: <Globe className="w-4 h-4" />,
  Backend: <Server className="w-4 h-4" />,
  Databases: <Database className="w-4 h-4" />,
  Tools: <Box className="w-4 h-4" />,
  'AI & APIs': <Sparkles className="w-4 h-4" />,
  'Soft Skills': <Users className="w-4 h-4" />
};

function CodeIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M4 5l4-4 4 4M4 14l4-4 4 4" /></svg>;
}

export default function CertificationFilterPanel({ certificates = [], selectedNodeId }) {
  const { skills } = usePortfolio();

  // Build a map of skill category -> connected cert IDs
  const skillToCerts = {};
  certificates.forEach((cert) => {
    const tag = cert.tag || '';
    skills.forEach((skill) => {
      if (
        skill.category.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(skill.category.toLowerCase())
      ) {
        if (!skillToCerts[skill.category]) skillToCerts[skill.category] = [];
        skillToCerts[skill.category].push(cert._id || cert.title);
      }
    });
  });

  // Determine which certs to show based on selected node
  let filteredCerts = certificates;
  let filterLabel = 'All Certifications';
  let filterAccent = 'text-white';

  if (selectedNodeId && selectedNodeId.startsWith('skill-')) {
    const categoryName = selectedNodeId.replace('skill-', '').replace(/-/g, ' ');
    const skill = skills.find((s) => s.category.toLowerCase().replace(/\s+/g, '-') === selectedNodeId.replace('skill-', ''));
    if (skill) {
      const connectedCertIds = skillToCerts[skill.category] || [];
      filteredCerts = certificates.filter((c) => connectedCertIds.includes(c._id || c.title));
      filterLabel = `${skill.category} Certifications`;
      filterAccent = skill.accent || 'text-accent-orange';
    }
  } else if (selectedNodeId && selectedNodeId.startsWith('cert-')) {
    const cert = certificates.find((c) => (c._id || c.title) === selectedNodeId);
    if (cert) {
      filteredCerts = [cert];
      filterLabel = cert.title;
      filterAccent = 'text-accent-lime';
    }
  }

  return (
    <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-black mb-1">Certifications</h2>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterAccent}`}>
            {filterLabel} ({filteredCerts.length})
          </span>
        </div>
        {selectedNodeId && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('reset-competency-map'))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Cert list */}
      <div className="space-y-3">
        {filteredCerts.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">
            No certifications linked to this selection.
          </div>
        ) : (
          filteredCerts.map((cert) => (
            <div key={cert._id || cert.title} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent-lime shrink-0">
                  <Award size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{cert.title}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-white/40">{cert.issuer}</span>
                    <span className="w-px h-3 bg-white/10 mx-1" />
                    <span className="text-[9px] text-white/40">{cert.date}</span>
                  </div>
                </div>
              </div>
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold text-accent-lime hover:text-accent-orange transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>Verify</span>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

