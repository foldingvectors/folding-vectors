import { BaseNode } from './BaseNode'

interface OpportunityNodeProps {
  data: {
    label: string
    content: string
  }
}

export function OpportunityNode({ data }: OpportunityNodeProps) {
  return <BaseNode data={data} icon="+" />
}
