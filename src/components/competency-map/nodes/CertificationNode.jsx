import React from 'react';
import { Handle, Position } from 'reactflow';
import { ShieldCheck, Calendar, ExternalLink, Award } from 'lucide-react';

export default function CertificationNode({ data, selected, connecting }) {
  const isVerified = !!data.credentialUrl;

  return (
    <div
      className={`relative rounded-2xl p-3 border-2 shadow-xl transition-all duration-300
        ${selected ? 'ring-2 ring-accent-lime ring-offset-2 ring-offset-[#151312]' : 'border-white/10 bg-[#1c1a19]'}
        ${connecting ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Top section: icon + verified badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-xl bg-accent-lime/10 flex items-center justify-center text-accent-lime">
          <Award size={16} />
        </div>
        {isVerified && (
          <span className="text-[9px] font-bold text-accent-lime bg-accent-lime/10 px-1.5 py-0.5 rounded">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-1 line-clamp-2">
        {data.label}
      </h3>

      {/* Issuer */}
      <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1">
        <Calendar className="w-3 h-3" />
        <span>{data.date || ''}</span>
        <span className="w-px h-3 bg-white/10 mx-1" />
        <span>{data.issuer || ''}</span>
      </div>

      {/* Tag */}
      {data.tag && (
        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-accent-orange border border-accent-orange/20 mb-2">
          {data.tag}
        </span>
      )}

      {/* Verification link */}
      {data.credentialUrl && (
        <a
          href={data.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[9px] font-bold text-accent-lime hover:text-accent-orange transition-colors mt-1"
        >
          <ExternalLink size={12} />
          <span>Verify</span>
        </a>
      )}

      {/* Connection handles */}
      <Handle type="target" position={Position.Left} id="left" style={{ stroke: '#C5FF41' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ stroke: '#C5FF41' }} />
    </div>
  );
}
