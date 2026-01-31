import { Handle, Position } from 'reactflow'

interface FinalNodeProps {
  data: {
    label: string
    content: string
  }
}

export function FinalNode({ data }: FinalNodeProps) {
  return (
    <div className="bg-[var(--text)] text-[var(--bg)] border-2 border-[var(--border)] p-4 min-w-[250px] max-w-[280px]">
      <Handle type="target" position={Position.Top} className="!bg-[var(--bg)]" />

      <div className="text-xs uppercase tracking-wider opacity-60 mb-2">
        {data.label}
      </div>

      <p className="text-sm leading-relaxed font-medium">
        {data.content}
      </p>
    </div>
  )
}
