'use client'

import { useState } from 'react'
import { PERSPECTIVES, PERSPECTIVE_CATEGORIES, type Perspective } from '@/lib/perspectives'
import { CheckIcon } from '@/components/icons'

interface PerspectiveSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  maxSelections?: number
}

// Category icons as simple text symbols
const CATEGORY_ICONS: Record<string, string> = {
  business: '$',
  strategic: '→',
  compliance: '§',
  technical: '</>',
  human: '♦',
}

export function PerspectiveSelector({
  selected,
  onChange,
  maxSelections = 5,
}: PerspectiveSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('business')
  const [searchQuery, setSearchQuery] = useState('')

  const togglePerspective = (id: string) => {
    if (selected.includes(id)) {
      // Always allow deselection unless it's the last one
      if (selected.length > 1) {
        onChange(selected.filter(p => p !== id))
      }
    } else {
      // Check max selections
      if (selected.length < maxSelections) {
        onChange([...selected, id])
      }
    }
  }

  const selectAll = (category: string) => {
    const categoryPerspectives = PERSPECTIVES.filter(p => p.category === category)
    const categoryIds = categoryPerspectives.map(p => p.id)
    const otherSelected = selected.filter(id => !categoryIds.includes(id))
    const newSelected = [...otherSelected, ...categoryIds].slice(0, maxSelections)
    onChange(newSelected)
  }

  const clearCategory = (category: string) => {
    const categoryIds = PERSPECTIVES.filter(p => p.category === category).map(p => p.id)
    const remaining = selected.filter(id => !categoryIds.includes(id))
    // Keep at least one selected
    if (remaining.length === 0 && selected.length > 0) {
      onChange([selected[0]])
    } else if (remaining.length > 0) {
      onChange(remaining)
    }
  }

  // Filter perspectives by search
  const filteredPerspectives = searchQuery
    ? PERSPECTIVES.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.coreFocus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PERSPECTIVES.filter(p => p.category === activeCategory)

  // Get selected perspective objects
  const selectedPerspectives = PERSPECTIVES.filter(p => selected.includes(p.id))

  return (
    <div className="relative">
      {/* Collapsed view - shows selected perspectives */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-[var(--border)] rounded-md p-4 cursor-pointer hover:opacity-80 transition"
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs uppercase tracking-wider opacity-60">
            Perspectives ({selected.length}/{maxSelections})
          </label>
          <span className="text-xs opacity-40">
            {isOpen ? 'click to close' : 'click to edit'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedPerspectives.map(perspective => (
            <div
              key={perspective.id}
              className="px-3 py-1.5 bg-[var(--text)] text-[var(--bg)] rounded-md text-sm flex items-center gap-2"
            >
              <span className="opacity-60">{CATEGORY_ICONS[perspective.category]}</span>
              <span>{perspective.name}</span>
            </div>
          ))}
          {selected.length === 0 && (
            <span className="text-sm opacity-40">Select at least one perspective</span>
          )}
        </div>
      </div>

      {/* Expanded view - category tabs and selection */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-[var(--border)] rounded-md bg-[var(--bg)] z-50 shadow-lg max-h-[500px] overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-[var(--border)]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perspectives..."
              className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
            />
          </div>

          {/* Category tabs - only show when not searching */}
          {!searchQuery && (
            <div className="flex border-b border-[var(--border)] overflow-x-auto">
              {Object.entries(PERSPECTIVE_CATEGORIES).map(([key, category]) => {
                const count = PERSPECTIVES.filter(p => p.category === key).length
                const selectedCount = selected.filter(id =>
                  PERSPECTIVES.find(p => p.id === id)?.category === key
                ).length
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex-shrink-0 px-4 py-2 text-sm transition flex items-center gap-2 ${
                      activeCategory === key
                        ? 'border-b-2 border-[var(--text)] font-medium'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[key]}</span>
                    <span>{category.name}</span>
                    {selectedCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-[var(--text)] text-[var(--bg)] rounded text-xs">
                        {selectedCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Category actions - only show when not searching */}
          {!searchQuery && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
              <span className="text-xs opacity-60">
                {PERSPECTIVE_CATEGORIES[activeCategory as keyof typeof PERSPECTIVE_CATEGORIES]?.description}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => selectAll(activeCategory)}
                  className="text-xs px-2 py-1 border border-[var(--border)] rounded hover:opacity-60 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearCategory(activeCategory)}
                  className="text-xs px-2 py-1 border border-[var(--border)] rounded hover:opacity-60 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Perspectives list */}
          <div className="overflow-y-auto flex-1 p-2">
            {searchQuery && (
              <div className="px-2 py-1 text-xs opacity-60 mb-2">
                {filteredPerspectives.length} result{filteredPerspectives.length !== 1 ? 's' : ''}
              </div>
            )}
            <div className="space-y-1">
              {filteredPerspectives.map(perspective => {
                const isSelected = selected.includes(perspective.id)
                const isDisabled = !isSelected && selected.length >= maxSelections
                return (
                  <button
                    key={perspective.id}
                    onClick={() => !isDisabled && togglePerspective(perspective.id)}
                    disabled={isDisabled}
                    className={`w-full text-left px-3 py-3 rounded-md transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[var(--text)] text-[var(--bg)]'
                        : isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-[var(--bg)]' : 'border-[var(--border)]'
                    }`}>
                      {isSelected && <CheckIcon size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{perspective.name}</span>
                        {searchQuery && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[var(--bg)] text-[var(--text)] bg-opacity-20' : 'bg-[var(--text)] bg-opacity-10'
                          }`}>
                            {PERSPECTIVE_CATEGORIES[perspective.category as keyof typeof PERSPECTIVE_CATEGORIES]?.name}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                        {perspective.coreFocus}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'opacity-60' : 'opacity-40'}`}>
                        {perspective.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs opacity-60">
              {selected.length} of {maxSelections} selected
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md text-sm hover:opacity-80 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
