import { BaseNode } from './BaseNode'

interface ComplianceNodeProps {
  data: {
    label: string
    content: string
  }
}

export function ComplianceNode({ data }: ComplianceNodeProps) {
  return <BaseNode data={data} icon="*" />
}
