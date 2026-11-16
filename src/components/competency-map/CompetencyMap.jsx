import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCompetencyMapData } from './useCompetencyMapData';
import SkillCategoryNode from './nodes/SkillCategoryNode';
import CertificationNode from './nodes/CertificationNode';
import ProjectNode from './nodes/ProjectNode';
import CurvedEdge from './edges/CurvedEdge';
import CompetencyMapToolbar from './CompetencyMapToolbar';
import CertificationFilterPanel from './CertificationFilterPanel';

const nodeTypes = {
  skillCategory: SkillCategoryNode,
  certification: CertificationNode,
  project: ProjectNode
};

const edgeTypes = {
  curved: CurvedEdge
};

/* 
   ReactFlow v11 requires explicit height/width on the container
   for zustand hooks (useNodesState, useEdgesState, addEdge) to work.
*/
export default function CompetencyMap({ certificates }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState('hierarchical');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const { nodes: dataNodes, edges: dataEdges, loading, error } = useCompetencyMapData();

  // Initialize nodes/edges from data hook
  useEffect(() => {
    if (dataNodes.length > 0) {
      setNodes(dataNodes);
      setEdges(dataEdges);
    }
  }, [dataNodes, dataEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'curved' }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onLayoutToggle = useCallback(() => {
    setLayout((prev) => (prev === 'hierarchical' ? 'force' : 'hierarchical'));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider">Building competency map…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-white/50">
        <p className="text-sm font-bold">Failed to load competency map</p>
        <p className="text-xs text-white/30 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[700px] sm:h-[800px]">
      {/* Graph Area */}
      <div className="flex-1 relative bg-[#131110]/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <CompetencyMapToolbar onLayoutToggle={onLayoutToggle} layout={layout} />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitViewOnInit={true}
          fitViewOptions={{ duration: 1000 }}
          panOnScroll={true}
          minZoom={0.5}
          maxZoom={2}
          defaultZoom={1}
          elementsSelectable={true}
          nodesConnectable={true}
          connectionMode="loose"
          style={{ height: "100%", width: "100%" }}
        >

          <Background
            variant="dots"
            gap={16}
            size={2}
            offset={[0, 0]}
            stopOpacity={[0.1]}
            className="pointer-events-none"
          />

          <MiniMap
            nodeBorderRadius={2}
            minNodeWidth={50}
            minNodeHeight={50}
            className="absolute bottom-4 right-4 z-10 rounded-xl border border-white/10 bg-[#1c1a19] shadow-lg"
          />

          <Controls position="top-right" />
        </ReactFlow>
      </div>

      {/* Filter Panel */}
      <CertificationFilterPanel certificates={certificates} selectedNodeId={selectedNodeId} />
    </div>
  );
}