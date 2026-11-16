import React from 'react';
import { MarkerType } from 'reactflow';

const EDGE_STYLES = {
  validates: { stroke: '#C5FF41', strokeDasharray: '4 2', label: 'Validates' },
  usedIn: { stroke: '#F46C38', strokeDasharray: '', label: 'Used In' }
};

export default function CurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
  label
}) {
  const edgeStyle = EDGE_STYLES[data?.type] || EDGE_STYLES.validates;
  const controlX = (sourceX + targetX) / 2;
  const controlY = sourceY < targetY ? sourceY + 50 : sourceY - 50;

  return (
    <svg width="100%" height="100%" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={edgeStyle.stroke} />
        </marker>
      </defs>
      <path
        d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY}, ${targetX} ${targetY}`}
        fill="none"
        stroke={edgeStyle.stroke}
        strokeWidth={2}
        strokeDasharray={edgeStyle.strokeDasharray}
        markerEnd={`url(#arrowhead-${id})`}
        style={{ ...style }}
      />
      {data?.showEdgeLabels && (
        <text
          x={controlX}
          y={controlY - 10}
          fill="#ffffff60"
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          {edgeStyle.label}
        </text>
      )}
    </svg>
  );
}
