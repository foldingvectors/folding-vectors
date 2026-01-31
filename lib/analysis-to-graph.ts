import dagre from 'dagre'
import { Node, Edge } from 'reactflow'

interface ParsedResult {
  summary?: string
  competitive_position?: string
  opportunities?: string[]
  risks?: string[]
  strategic_risks?: string[]
  red_flags?: string[]
  compliance?: string[]
  questions?: string[]
  recommendations?: string[]
  recommendation?: string
}

export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

const NODE_WIDTH = 300
const NODE_HEIGHT = 120

// Parse JSON result from API
export function parseResult(resultText: string): ParsedResult | null {
  try {
    const cleaned = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// Convert parsed result to React Flow nodes and edges
// Now creates one node per category with all items inside
export function analysisToGraph(
  perspectiveId: string,
  resultText: string
): GraphData {
  const parsed = parseResult(resultText)

  if (!parsed) {
    return { nodes: [], edges: [] }
  }

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Helper to create node ID
  const createId = (type: string) => `${perspectiveId}-${type}`

  // Summary node (center/top)
  const summaryId = createId('summary')
  if (parsed.summary) {
    nodes.push({
      id: summaryId,
      type: 'summaryNode',
      data: {
        label: 'Summary',
        content: parsed.summary
      },
      position: { x: 0, y: 0 },
    })
  }

  // Competitive position (for strategy perspective) - directly under summary
  if (parsed.competitive_position) {
    const id = createId('position')
    nodes.push({
      id,
      type: 'positionNode',
      data: {
        label: 'Competitive Position',
        content: parsed.competitive_position
      },
      position: { x: 0, y: 0 },
    })
    if (parsed.summary) {
      edges.push({
        id: `e-${summaryId}-${id}`,
        source: summaryId,
        target: id,
        type: 'smoothstep',
        style: { stroke: 'var(--border)', strokeWidth: 1 }
      })
    }
  }

  // Group nodes by category - one node per category
  const categories: { type: string; nodeType: string; items: string[]; label: string }[] = []

  // Opportunities
  if (parsed.opportunities && parsed.opportunities.length > 0) {
    categories.push({
      type: 'opportunities',
      nodeType: 'opportunityNode',
      items: parsed.opportunities,
      label: `Opportunities (${parsed.opportunities.length})`
    })
  }

  // Risks
  const risks = parsed.risks || parsed.strategic_risks || []
  if (risks.length > 0) {
    categories.push({
      type: 'risks',
      nodeType: 'riskNode',
      items: risks,
      label: `Risks (${risks.length})`
    })
  }

  // Red flags
  if (parsed.red_flags && parsed.red_flags.length > 0) {
    categories.push({
      type: 'redflags',
      nodeType: 'redFlagNode',
      items: parsed.red_flags,
      label: `Critical Issues (${parsed.red_flags.length})`
    })
  }

  // Compliance
  if (parsed.compliance && parsed.compliance.length > 0) {
    categories.push({
      type: 'compliance',
      nodeType: 'complianceNode',
      items: parsed.compliance,
      label: `Compliance (${parsed.compliance.length})`
    })
  }

  // Questions
  if (parsed.questions && parsed.questions.length > 0) {
    categories.push({
      type: 'questions',
      nodeType: 'questionNode',
      items: parsed.questions,
      label: `Questions (${parsed.questions.length})`
    })
  }

  // Recommendations
  if (parsed.recommendations && parsed.recommendations.length > 0) {
    categories.push({
      type: 'recommendations',
      nodeType: 'recommendationNode',
      items: parsed.recommendations,
      label: `Recommendations (${parsed.recommendations.length})`
    })
  }

  // Create one node per category with all items inside
  categories.forEach((category) => {
    const id = createId(category.type)
    nodes.push({
      id,
      type: category.nodeType,
      data: {
        label: category.label,
        content: '', // Empty content, use items instead
        items: category.items
      },
      position: { x: 0, y: 0 },
    })

    // Connect to summary
    if (parsed.summary) {
      edges.push({
        id: `e-${summaryId}-${id}`,
        source: summaryId,
        target: id,
        type: 'smoothstep',
        style: { stroke: 'var(--border)', strokeWidth: 1 }
      })
    }
  })

  // Final recommendation (investor perspective)
  if (parsed.recommendation) {
    const id = createId('final')
    nodes.push({
      id,
      type: 'finalNode',
      data: {
        label: 'Recommendation',
        content: parsed.recommendation
      },
      position: { x: 0, y: 0 },
    })
    // Connect to all other nodes at bottom
    const otherNodeIds = nodes.filter(n => n.id !== summaryId && n.id !== id).map(n => n.id)
    if (otherNodeIds.length > 0) {
      otherNodeIds.forEach(sourceId => {
        edges.push({
          id: `e-${sourceId}-${id}`,
          source: sourceId,
          target: id,
          type: 'smoothstep',
          style: { stroke: 'var(--border)', strokeWidth: 1 }
        })
      })
    } else if (parsed.summary) {
      edges.push({
        id: `e-${summaryId}-${id}`,
        source: summaryId,
        target: id,
        type: 'smoothstep',
        style: { stroke: 'var(--border)', strokeWidth: 1 }
      })
    }
  }

  // Apply dagre layout
  return applyLayout(nodes, edges)
}

// Use dagre for automatic layout
function applyLayout(nodes: Node[], edges: Edge[]): GraphData {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom
    nodesep: 60,   // Horizontal spacing between nodes
    ranksep: 80,   // Vertical spacing between ranks
    marginx: 40,
    marginy: 40,
    align: 'UL'
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
