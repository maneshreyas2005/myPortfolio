import React from 'react';
import { useReactFlow } from 'reactflow';
import { RefreshCw } from 'lucide-react';

const FitViewIconCustom = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 0 0-9-9 9.5 9.5 0 0 0-5 2.04" />
    <polyline points="3 3 3 12 12 12" />
    <path d="M21 12a9 9 0 0 1 9 9 9.5 9.5 0 0 1 5-2.04" />
    <polyline points="21 21 21 12 12 12" />
  </svg>
);

const ZoomInIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export default function CompetencyMapToolbar({ onLayoutToggle, layout }) {
  const { getNodes, fitView, zoomIn, zoomOut } = useReactFlow();
  const nodeCount = getNodes().length;

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
      <button
        onClick={zoomOut}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        title="Zoom out"
      >
        <ZoomOutIcon />
      </button>
      <button
        onClick={zoomIn}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        title="Zoom in"
      >
        <ZoomInIcon />
      </button>
      <button
        onClick={() => fitView({ duration: 1000 })}
        className="p-2 rounded-lg bg-accent-orange/10 border border-accent-orange/20 text-accent-orange hover:bg-accent-orange/20 transition-colors"
        title="Fit view"
      >
        <FitViewIconCustom />
        <span className="text-[10px] font-bold ml-1 hidden sm:inline">Fit</span>
      </button>
      <button
        onClick={onLayoutToggle}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        title="Toggle layout"
      >
        <RefreshCw size={16} />
        <span className="text-[10px] font-bold ml-1 hidden sm:inline">{layout}</span>
      </button>
      <div className="h-4 w-px bg-white/10 mx-2" />
      <span className="text-[10px] font-bold text-white/40">
        {nodeCount} nodes
      </span>
    </div>
  );
}
