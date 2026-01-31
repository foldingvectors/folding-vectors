import { Handle, Position } from 'reactflow'

interface RedFlagNodeProps {
  data: {
    label: string
    content: string
  }
}

export function RedFlagNode({ data }: RedFlagNodeProps) {
  return (
    <div className="bg-[var(--bg)] border-2 border-[var(--border)] p-4 min-w-[250px] max-w-[280px]">
      <Handle type="target" position={Position.Top} className="!bg-[var(--text)]" />

      <div className="text-xs uppercase tracking-wider opacity-60 mb-2 flex items-center gap-2">
        <span>!</span>
        <span>{data.label}</span>
      </div>

      <p className="text-sm leading-relaxed font-medium">
        {data.content}
      </p>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--text)]" />
    </div>
  )
}
