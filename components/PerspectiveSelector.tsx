'use client'

import { useState, useEffect } from 'react'
import { PERSPECTIVES, PERSPECTIVE_CATEGORIES, type Perspective } from '@/lib/perspectives'
import { CheckIcon } from '@/components/icons'

interface CustomPerspective {
  id: string
  name: string
  prompt: string
  created_at: string
}

interface PerspectiveSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  maxSelections?: number
  customPerspectives?: CustomPerspective[]
  onCustomPerspectivesChange?: () => void
  isLoggedIn?: boolean
}

// Category icons as simple text symbols
const CATEGORY_ICONS: Record<string, string> = {
  business: '$',
  strategic: '→',
  compliance: '§',
  technical: '</>',
  human: '♦',
  custom: '★',
}

export function PerspectiveSelector({
  selected,
  onChange,
  maxSelections = 5,
  customPerspectives = [],
  onCustomPerspectivesChange,
  isLoggedIn = false,
}: PerspectiveSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('business')
  const [searchQuery, setSearchQuery] = useState('')

  // Custom perspective form state
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [savingCustom, setSavingCustom] = useState(false)
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [deletingCustomId, setDeletingCustomId] = useState<string | null>(null)

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
    if (category === 'custom') {
      const customIds = customPerspectives.map(p => `custom:${p.id}`)
      const otherSelected = selected.filter(id => !id.startsWith('custom:'))
      const newSelected = [...otherSelected, ...customIds].slice(0, maxSelections)
      onChange(newSelected)
    } else {
      const categoryPerspectives = PERSPECTIVES.filter(p => p.category === category)
      const categoryIds = categoryPerspectives.map(p => p.id)
      const otherSelected = selected.filter(id => !categoryIds.includes(id))
      const newSelected = [...otherSelected, ...categoryIds].slice(0, maxSelections)
      onChange(newSelected)
    }
  }

  const clearCategory = (category: string) => {
    if (category === 'custom') {
      const remaining = selected.filter(id => !id.startsWith('custom:'))
      if (remaining.length === 0 && selected.length > 0) {
        onChange([selected[0]])
      } else if (remaining.length > 0) {
        onChange(remaining)
      }
    } else {
      const categoryIds = PERSPECTIVES.filter(p => p.category === category).map(p => p.id)
      const remaining = selected.filter(id => !categoryIds.includes(id))
      if (remaining.length === 0 && selected.length > 0) {
        onChange([selected[0]])
      } else if (remaining.length > 0) {
        onChange(remaining)
      }
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

  // Filter custom perspectives by search
  const filteredCustomPerspectives = searchQuery
    ? customPerspectives.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCategory === 'custom' ? customPerspectives : []

  // Get selected perspective objects (including custom ones)
  const selectedPerspectives = [
    ...PERSPECTIVES.filter(p => selected.includes(p.id)),
    ...customPerspectives
      .filter(p => selected.includes(`custom:${p.id}`))
      .map(p => ({
        id: `custom:${p.id}`,
        name: p.name,
        category: 'custom',
        coreFocus: 'Custom perspective',
        description: p.prompt.substring(0, 100) + (p.prompt.length > 100 ? '...' : ''),
        prompt: p.prompt,
      })),
  ]

  const handleSaveCustomPerspective = async () => {
    if (!customName.trim() || !customPrompt.trim()) return

    setSavingCustom(true)
    try {
      const url = editingCustomId
        ? `/api/custom-perspectives/${editingCustomId}`
        : '/api/custom-perspectives'

      const response = await fetch(url, {
        method: editingCustomId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName, prompt: customPrompt }),
      })

      if (response.ok) {
        setCustomName('')
        setCustomPrompt('')
        setShowCustomForm(false)
        setEditingCustomId(null)
        onCustomPerspectivesChange?.()
      }
    } catch (error) {
      console.error('Error saving custom perspective:', error)
    } finally {
      setSavingCustom(false)
    }
  }

  const handleEditCustomPerspective = (perspective: CustomPerspective) => {
    setEditingCustomId(perspective.id)
    setCustomName(perspective.name)
    setCustomPrompt(perspective.prompt)
    setShowCustomForm(true)
  }

  const handleDeleteCustomPerspective = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom perspective?')) return

    setDeletingCustomId(id)
    try {
      const response = await fetch(`/api/custom-perspectives/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from selected if it was selected
        onChange(selected.filter(s => s !== `custom:${id}`))
        onCustomPerspectivesChange?.()
      }
    } catch (error) {
      console.error('Error deleting custom perspective:', error)
    } finally {
      setDeletingCustomId(null)
    }
  }

  const cancelCustomForm = () => {
    setShowCustomForm(false)
    setEditingCustomId(null)
    setCustomName('')
    setCustomPrompt('')
  }

  // Extended categories to include custom
  const allCategories = {
    ...PERSPECTIVE_CATEGORIES,
    custom: { name: 'Custom', description: 'Your custom perspectives' },
  }

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
              {Object.entries(allCategories).map(([key, category]) => {
                const count = key === 'custom'
                  ? customPerspectives.length
                  : PERSPECTIVES.filter(p => p.category === key).length
                const selectedCount = key === 'custom'
                  ? selected.filter(id => id.startsWith('custom:')).length
                  : selected.filter(id =>
                      PERSPECTIVES.find(p => p.id === id)?.category === key
                    ).length

                // Only show custom tab if logged in
                if (key === 'custom' && !isLoggedIn) return null

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
                {allCategories[activeCategory as keyof typeof allCategories]?.description}
              </span>
              <div className="flex gap-2">
                {activeCategory === 'custom' && isLoggedIn ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs px-2 py-1 bg-[var(--text)] text-[var(--bg)] rounded hover:opacity-80 transition"
                  >
                    + New Perspective
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Custom perspective form */}
          {showCustomForm && activeCategory === 'custom' && (
            <div className="p-4 border-b border-[var(--border)] bg-[var(--hover-bg)]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider opacity-60 mb-1">
                    Perspective Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Sustainability Expert"
                    maxLength={100}
                    className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider opacity-60 mb-1">
                    Analysis Prompt
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe how this perspective should analyze documents. E.g., 'Analyze this document as a sustainability consultant, focusing on environmental impact, ESG considerations, and long-term ecological implications...'"
                    rows={4}
                    className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)] resize-none"
                  />
                  <p className="text-xs opacity-40 mt-1">
                    Your prompt will be used to analyze documents. Output will be structured with Summary, key points, and recommendations.
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancelCustomForm}
                    className="px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomPerspective}
                    disabled={!customName.trim() || !customPrompt.trim() || savingCustom}
                    className="px-3 py-1.5 bg-[var(--text)] text-[var(--bg)] rounded-md text-xs hover:opacity-80 transition disabled:opacity-40"
                  >
                    {savingCustom ? 'Saving...' : editingCustomId ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Perspectives list */}
          <div className="overflow-y-auto flex-1 p-2">
            {searchQuery && (
              <div className="px-2 py-1 text-xs opacity-60 mb-2">
                {filteredPerspectives.length + filteredCustomPerspectives.length} result{(filteredPerspectives.length + filteredCustomPerspectives.length) !== 1 ? 's' : ''}
              </div>
            )}

            {/* Custom perspectives (when in custom tab or searching) */}
            {(activeCategory === 'custom' || searchQuery) && (
              <div className="space-y-1">
                {(searchQuery ? filteredCustomPerspectives : customPerspectives).map(perspective => {
                  const perspectiveId = `custom:${perspective.id}`
                  const isSelected = selected.includes(perspectiveId)
                  const isDisabled = !isSelected && selected.length >= maxSelections
                  const isDeleting = deletingCustomId === perspective.id

                  return (
                    <div
                      key={perspective.id}
                      className={`w-full text-left px-3 py-3 rounded-md transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[var(--text)] text-[var(--bg)]'
                          : isDisabled
                          ? 'opacity-30'
                          : 'hover:bg-[var(--hover-bg)]'
                      }`}
                    >
                      <button
                        onClick={() => !isDisabled && togglePerspective(perspectiveId)}
                        disabled={isDisabled}
                        className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-[var(--bg)]' : 'border-[var(--border)]'
                        } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isSelected && <CheckIcon size={12} />}
                      </button>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => !isDisabled && togglePerspective(perspectiveId)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{perspective.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'border-[var(--bg)] border-opacity-40 text-[var(--bg)]'
                              : 'border-[var(--border)] text-[var(--text)] opacity-60'
                          }`}>
                            Custom
                          </span>
                        </div>
                        <div className={`text-xs mt-1 ${isSelected ? 'opacity-60' : 'opacity-40'}`}>
                          {perspective.prompt.substring(0, 100)}{perspective.prompt.length > 100 ? '...' : ''}
                        </div>
                      </div>
                      {/* Edit/Delete buttons */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditCustomPerspective(perspective)
                          }}
                          className={`px-2 py-1 text-xs border rounded hover:opacity-60 transition ${
                            isSelected ? 'border-[var(--bg)] border-opacity-40' : 'border-[var(--border)]'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCustomPerspective(perspective.id)
                          }}
                          disabled={isDeleting}
                          className={`px-2 py-1 text-xs border rounded hover:opacity-60 transition ${
                            isSelected ? 'border-[var(--bg)] border-opacity-40' : 'border-[var(--border)]'
                          }`}
                        >
                          {isDeleting ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}

                {activeCategory === 'custom' && !searchQuery && customPerspectives.length === 0 && !showCustomForm && (
                  <div className="text-center py-8 opacity-60">
                    <p className="text-sm mb-3">No custom perspectives yet</p>
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="text-xs px-3 py-1.5 bg-[var(--text)] text-[var(--bg)] rounded hover:opacity-80 transition"
                    >
                      Create Your First Perspective
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Built-in perspectives */}
            {activeCategory !== 'custom' && (
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
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${
                              isSelected
                                ? 'border-[var(--bg)] border-opacity-40 text-[var(--bg)]'
                                : 'border-[var(--border)] text-[var(--text)] opacity-60'
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
            )}
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
