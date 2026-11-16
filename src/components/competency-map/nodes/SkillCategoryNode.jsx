import React from 'react';
import { Handle, Position } from 'reactflow';
import { Code, Server, Database, Compass, Box, Globe, Sparkles, Users } from 'lucide-react';

const ICON_MAP = {
  Languages: <Code className="w-4 h-4" />,
  Frontend: <Globe className="w-4 h-4" />,
  Backend: <Server className="w-4 h-4" />,
  Databases: <Database className="w-4 h-4" />,
  Tools: <Box className="w-4 h-4" />,
  'AI & APIs': <Sparkles className="w-4 h-4" />,
  'Soft Skills': <Users className="w-4 h-4" />
};

export default function SkillCategoryNode({ data, selected, connecting }) {
  const accent = data.accent || 'text-accent-orange';
  const icon = ICON_MAP[data.category] || <Code className="w-4 h-4" />;

  return (
    <div
      className={`relative rounded-2xl p-4 border-2 shadow-lg transition-all duration-300
        ${selected ? 'ring-2 ring-accent-orange ring-offset-2 ring-offset-[#151312]' : 'border-white/10 bg-[#1c1a19]'}
        ${connecting ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full rounded-t-xl ${accent.replace('text-', 'bg-')}`} />

      {/* Header */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${accent}`}>
            {icon}
          </div>
          <span className={`font-bold text-white ${accent.replace('text-', '')}`}>
            {data.label}
          </span>
        </div>
        <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-white/60">
          {data.itemCount}
        </span>
      </div>

      {/* Items preview */}
      <div className="mt-3 flex gap-1">
        {data.items.slice(0, 3).map((item, i) => (
          <span key={i} className="text-[9px] text-white/30 truncate w-16">
            {item}
          </span>
        ))}
        {data.items.length > 3 && (
          <span className="text-[9px] text-white/20">+{data.items.length - 3}</span>
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Left} id="left" style={{ stroke: accent.replace('text-', '') }} />
      <Handle type="source" position={Position.Right} id="right" style={{ stroke: accent.replace('text-', '') }} />
    </div>
  );
}
