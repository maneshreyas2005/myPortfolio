import { useState, useEffect, useCallback } from 'react';
import {
  fetchSkillsData,
  fetchCertificatesData,
  fetchProjectsData
} from '../../dataFetch';
import { SECTIONS, SKILL_CATEGORY_CONFIG } from '../../config/sections';

/**
 * Transforms raw API data into React Flow nodes and edges for the Competency Map.
 * 
 * Node types:
 * - skillCategory: Skill categories (Languages, Frontend, Backend, etc.)
 * - certification: Certifications & achievements
 * - project: Projects
 * 
 * Edge types:
 * - validates: Skill category validates a certification
 * - usedIn: Skill category is used in a project
 */

export function useCompetencyMapData() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [skills, certificates, projects] = await Promise.all([
        fetchSkillsData(),
        fetchCertificatesData(),
        fetchProjectsData()
      ]);

      const newNodes = [];
      const newEdges = [];
      let nodeX = 0;

      // --- Skill Category Nodes (left column) ---
      const skillNodes = {};
      skills.forEach((skill, i) => {
        const nodeId = `skill-${skill.category.toLowerCase().replace(/\s+/g, '-')}`;
        skillNodes[skill.category] = nodeId;
        newNodes.push({
          id: nodeId,
          type: 'skillCategory',
          position: { x: 0, y: i * 180 + 50 },
          data: {
            label: skill.category,
            category: skill.category,
            itemCount: skill.items.length,
            accent: skill.accent || 'text-accent-orange',
            items: skill.items
          },
          style: {
            width: 200,
            height: 100
          }
        });
      });

      // --- Certification Nodes (right column, top) ---
      const certNodes = {};
      certificates.forEach((cert, i) => {
        const nodeId = `cert-${cert._id || i}`;
        certNodes[cert._id || i] = nodeId;
        newNodes.push({
          id: nodeId,
          type: 'certification',
          position: { x: 400, y: i * 180 + 50 },
          data: {
            label: cert.title,
            issuer: cert.issuer,
            date: cert.date,
            tag: cert.tag,
            credentialUrl: cert.credentialUrl,
            image: cert.image,
            description: cert.description,
            verified: !!cert.credentialUrl
          },
          style: {
            width: 220,
            height: 140
          }
        });
      });

      // --- Project Nodes (right column, bottom) ---
      const projectNodes = {};
      const certCount = certificates.length;
      projects.forEach((proj, i) => {
        const nodeId = `proj-${proj.id || proj._id || i}`;
        projectNodes[proj.id || proj._id || i] = nodeId;
        newNodes.push({
          id: nodeId,
          type: 'project',
          position: { x: 400, y: (certCount + i) * 180 + 50 },
          data: {
            title: proj.title,
            tech: proj.tech || [],
            description: proj.description,
            image: proj.image,
            liveUrl: proj.liveUrl,
            githubUrl: proj.githubUrl,
            sortOrder: proj.sortOrder
          },
          style: {
            width: 220,
            height: 140
          }
        });
      });

      // --- Build Edges ---
      // Skill → Certification: match by tag/category
      certificates.forEach((cert) => {
        const certId = cert._id || cert.title;
        const certNodeId = certNodes[certId];
        if (!certNodeId) return;

        // Try to match cert.tag to a skill category
        const matchedSkill = skills.find((s) =>
          s.category.toLowerCase().includes(cert.tag.toLowerCase()) ||
          cert.tag.toLowerCase().includes(s.category.toLowerCase())
        );

        if (matchedSkill && skillNodes[matchedSkill.category]) {
          newEdges.push({
            id: `e-${skillNodes[matchedSkill.category]}-${certNodeId}`,
            source: skillNodes[matchedSkill.category],
            target: certNodeId,
            type: 'validates',
            animated: true,
            style: { stroke: '#C5FF41', strokeWidth: 2 },
            label: 'Validates'
          });
        }
      });

      // Skill → Project: match by tech stack
      projects.forEach((proj) => {
        const projId = proj.id || proj._id || proj.title;
        const projNodeId = projectNodes[projId];
        if (!projNodeId) return;

        const projTech = proj.tech || [];
        skills.forEach((skill) => {
          const skillMatches = projTech.some((t) =>
            t.toLowerCase().includes(skill.category.toLowerCase().split(' ')[0]) ||
            skill.category.toLowerCase().includes(t.toLowerCase().split(' ')[0])
          );

          if (skillMatches && skillNodes[skill.category]) {
            newEdges.push({
              id: `e-${skillNodes[skill.category]}-${projNodeId}`,
              source: skillNodes[skill.category],
              target: projNodeId,
              type: 'usedIn',
              animated: true,
              style: { stroke: '#F46C38', strokeWidth: 2 },
              label: 'Used In'
            });
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      setError(err.message);
      console.error('Competency Map data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { nodes, edges, loading, error };
}
