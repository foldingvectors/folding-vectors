import { BaseNode } from './BaseNode'

interface RecommendationNodeProps {
  data: {
    label: string
    content: string
  }
}

export function RecommendationNode({ data }: RecommendationNodeProps) {
  return <BaseNode data={data} icon=">" />
}
