import { BaseNode } from './BaseNode'

interface RiskNodeProps {
  data: {
    label: string
    content: string
  }
}

export function RiskNode({ data }: RiskNodeProps) {
  return <BaseNode data={data} icon="-" />
}
