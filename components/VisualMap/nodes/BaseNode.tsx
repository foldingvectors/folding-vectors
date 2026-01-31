import { Handle, Position } from 'reactflow'
import { useState } from 'react'

interface BaseNodeProps {
  data: {
    label: string
    content: string
    items?: string[]
  }
  borderStyle?: string
  icon?: string
}

export function BaseNode({ data, borderStyle = 'border-[var(--border)]', icon = '' }: BaseNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasContent = data.content || (data.items && data.items.length > 0)
  const displayContent = data.content || (data.items ? data.items.join('\n\n') : '')

  return (
    <div
      className={`bg-[var(--bg)] border ${borderStyle} p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${
        isExpanded ? 'w-[400px]' : 'w-[280px]'
      }`}
      onClick={() => hasContent && setIsExpanded(!isExpanded)}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--text)] !w-2 !h-2 !rounded-full" />

      <div className="text-xs uppercase tracking-wider opacity-60 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{data.label}</span>
        </div>
        {hasContent && (
          <span className="text-[10px] opacity-40">
            {isExpanded ? 'click to collapse' : 'click to expand'}
          </span>
        )}
      </div>

      {data.items && data.items.length > 0 ? (
        <div className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {isExpanded ? (
            <ul className="space-y-2">
              {data.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="opacity-40 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="line-clamp-3">
              {data.items.length} item{data.items.length > 1 ? 's' : ''}: {data.items[0]}
              {data.items.length > 1 && '...'}
            </p>
          )}
        </div>
      ) : (
        <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-4'}`}>
          {displayContent}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--text)] !w-2 !h-2 !rounded-full" />
    </div>
  )
}
