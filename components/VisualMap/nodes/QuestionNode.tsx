import { BaseNode } from './BaseNode'

interface QuestionNodeProps {
  data: {
    label: string
    content: string
  }
}

export function QuestionNode({ data }: QuestionNodeProps) {
  return <BaseNode data={data} icon="?" />
}
