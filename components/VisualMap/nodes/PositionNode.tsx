import { BaseNode } from './BaseNode'

interface PositionNodeProps {
  data: {
    label: string
    content: string
  }
}

export function PositionNode({ data }: PositionNodeProps) {
  return <BaseNode data={data} borderStyle="border-2 border-[var(--border)]" />
}
