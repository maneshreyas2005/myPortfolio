import React from 'react';
import { Handle, Position } from 'reactflow';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';

export default function ProjectNode({ data, selected, connecting }) {
  return (
    <div
      className={`relative rounded-2xl p-3 border-2 shadow-xl transition-all duration-300
        ${selected ? 'ring-2 ring-[#F46C38] ring-offset-2 ring-offset-[#151312]' : 'border-white/10 bg-[#1c1a19]'}
        ${connecting ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Top: project type indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-xl bg-[#F46C38]/10 flex items-center justify-center text-[#F46C38]">
          <ArrowUpRight size={16} />
        </div>
        <span className="text-[9px] font-bold text-[#F46C38] bg-[#F46C38]/10 px-1.5 py-0.5 rounded">
          Project
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-1 line-clamp-2">
        {data.title}
      </h3>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {(data.tech || []).slice(0, 3).map((tech, i) => (
          <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#F46C38] border border-[#F46C38]/20">
            {tech}
          </span>
        ))}
        {(data.tech || []).length > 3 && (
          <span className="text-[8px] text-white/20">+{(data.tech || []).length - 3}</span>
        )}
      </div>

      {/* Action links */}
      <div className="flex items-center gap-1.5">
        {data.liveUrl && (
          <a
            href={data.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-white/60 hover:text-accent-orange transition-colors"
          >
            Live
          </a>
        )}
        {data.githubUrl && (
          <a
            href={data.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-bold text-white/60 hover:text-white transition-colors"
          >
            <Github size={12} />
            <span>Source</span>
          </a>
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Left} id="left" style={{ stroke: '#F46C38' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ stroke: '#F46C38' }} />
    </div>
  );
}
