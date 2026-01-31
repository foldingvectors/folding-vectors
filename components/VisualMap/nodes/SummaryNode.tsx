import { Handle, Position } from 'reactflow'

interface SummaryNodeProps {
  data: {
    label: string
    content: string
  }
}

export function SummaryNode({ data }: SummaryNodeProps) {
  return (
    <div className="bg-[var(--bg)] border-2 border-[var(--border)] p-5 min-w-[280px] max-w-[320px]">
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--text)]" />

      <div className="text-xs uppercase tracking-wider opacity-60 mb-3">
        {data.label}
      </div>

      <p className="text-sm leading-relaxed font-medium">
        {data.content}
      </p>
    </div>
  )
}
