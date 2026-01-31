'use client'

import { useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

import {
  SummaryNode,
  OpportunityNode,
  RiskNode,
  QuestionNode,
  RecommendationNode,
  RedFlagNode,
  ComplianceNode,
  PositionNode,
  FinalNode,
} from './nodes'
import { analysisToGraph } from '@/lib/analysis-to-graph'

interface AnalysisMapProps {
  perspectiveId: string
  resultText: string
}

const nodeTypes = {
  summaryNode: SummaryNode,
  opportunityNode: OpportunityNode,
  riskNode: RiskNode,
  questionNode: QuestionNode,
  recommendationNode: RecommendationNode,
  redFlagNode: RedFlagNode,
  complianceNode: ComplianceNode,
  positionNode: PositionNode,
  finalNode: FinalNode,
}

export function AnalysisMap({ perspectiveId, resultText }: AnalysisMapProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => analysisToGraph(perspectiveId, resultText),
    [perspectiveId, resultText]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when perspective changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm opacity-60">
        Unable to parse analysis results for visualization
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        style: { stroke: 'var(--text)', strokeWidth: 1 },
        animated: false,
      }}
      key={perspectiveId} // Force re-render when perspective changes
    >
      <Background
        color="var(--border)"
        gap={20}
        size={1}
      />
      <Controls
        className="!bg-[var(--bg)] !border-[var(--border)] !shadow-none"
        showInteractive={false}
      />
      <MiniMap
        nodeColor="var(--text)"
        maskColor="var(--bg)"
        className="!bg-[var(--bg)] !border-[var(--border)]"
      />
    </ReactFlow>
  )
}
