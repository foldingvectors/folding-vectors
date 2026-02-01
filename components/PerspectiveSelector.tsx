'use client'

import { useState, useRef, useEffect } from 'react'
import { PERSPECTIVES, PERSPECTIVE_CATEGORIES } from '@/lib/perspectives'
import { CheckIcon } from '@/components/icons'
import { ConfirmModal } from '@/components/Modal'

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Ref for the tabs container to enable scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (tabsContainerRef.current && isOpen && !searchQuery) {
      const activeTab = tabsContainerRef.current.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeCategory, isOpen, searchQuery])

  const togglePerspective = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        onChange(selected.filter(p => p !== id))
      }
    } else {
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

  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteCustomPerspective = async () => {
    if (!deleteTargetId) return

    setDeletingCustomId(deleteTargetId)
    try {
      const response = await fetch(`/api/custom-perspectives/${deleteTargetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onChange(selected.filter(s => s !== `custom:${deleteTargetId}`))
        onCustomPerspectivesChange?.()
        setDeleteModalOpen(false)
        setDeleteTargetId(null)
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
    custom: { name: 'Custom', description: 'Your perspectives' },
  }

  // Handle clicking on a perspective chip to open dropdown and focus on its category
  const handlePerspectiveChipClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation()
    setActiveCategory(category)
    setSearchQuery('')
    setIsOpen(true)
  }

  // Render a single perspective item with consistent height
  const renderPerspectiveItem = (
    id: string,
    name: string,
    description: string,
    isCustom: boolean = false,
    customPerspective?: CustomPerspective
  ) => {
    const isSelected = selected.includes(id)
    const isDisabled = !isSelected && selected.length >= maxSelections
    const isDeleting = customPerspective && deletingCustomId === customPerspective.id

    return (
      <div
        key={id}
        className={`
          h-[72px] px-4 rounded-md transition-colors flex items-center gap-3 cursor-pointer
          ${isSelected ? 'bg-[var(--text)] text-[var(--bg)]' : ''}
          ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
          ${!isSelected && !isDisabled ? 'hover:bg-[var(--hover-bg)]' : ''}
        `}
        onClick={() => !isDisabled && togglePerspective(id)}
      >
        {/* Checkbox */}
        <div
          className={`
            w-4 h-4 border rounded flex items-center justify-center flex-shrink-0
            ${isSelected ? 'border-[var(--bg)]' : 'border-[var(--border)]'}
          `}
        >
          {isSelected && <CheckIcon size={12} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{name}</span>
            {isCustom && (
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded border flex-shrink-0
                  ${isSelected ? 'border-[var(--bg)]/40 text-[var(--bg)]' : 'border-[var(--border)] opacity-60'}
                `}
              >
                Custom
              </span>
            )}
          </div>
          <div
            className={`
              text-xs mt-1 line-clamp-2 leading-snug
              ${isSelected ? 'opacity-70' : 'opacity-50'}
            `}
          >
            {description}
          </div>
        </div>

        {/* Edit/Delete buttons for custom perspectives */}
        {isCustom && customPerspective && (
          <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleEditCustomPerspective(customPerspective)}
              className={`
                px-2 py-1 text-xs border rounded hover:opacity-60 transition
                ${isSelected ? 'border-[var(--bg)]/40' : 'border-[var(--border)]'}
              `}
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteModal(customPerspective.id)}
              disabled={isDeleting}
              className={`
                px-2 py-1 text-xs border rounded hover:opacity-60 transition
                ${isSelected ? 'border-[var(--bg)]/40' : 'border-[var(--border)]'}
              `}
            >
              {isDeleting ? '...' : 'Del'}
            </button>
          </div>
        )}
      </div>
    )
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
              onClick={(e) => handlePerspectiveChipClick(e, perspective.category)}
              className="px-3 py-1.5 bg-[var(--text)] text-[var(--bg)] rounded-md text-sm flex items-center gap-2 hover:opacity-80 transition"
            >
              <span className="opacity-60">{CATEGORY_ICONS[perspective.category]}</span>
              <span>{perspective.name}</span>
              {selected.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePerspective(perspective.id)
                  }}
                  className="ml-1 opacity-60 hover:opacity-100 transition"
                  aria-label={`Remove ${perspective.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {selected.length === 0 && (
            <span className="text-sm opacity-40">Select at least one perspective</span>
          )}
        </div>
      </div>

      {/* Expanded view - category tabs and selection */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-[var(--border)] rounded-md bg-[var(--bg)] z-50 shadow-lg overflow-hidden">
          {/* Search - fixed height: 56px */}
          <div className="h-14 px-4 flex items-center border-b border-[var(--border)]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perspectives..."
              className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
            />
          </div>

          {/* Category tabs - fixed height: 48px */}
          {!searchQuery && (
            <div ref={tabsContainerRef} className="h-12 flex items-stretch border-b border-[var(--border)] overflow-x-auto">
              {Object.entries(allCategories).map(([key, category]) => {
                const selectedCount = key === 'custom'
                  ? selected.filter(id => id.startsWith('custom:')).length
                  : selected.filter(id =>
                      PERSPECTIVES.find(p => p.id === id)?.category === key
                    ).length

                if (key === 'custom' && !isLoggedIn) return null

                return (
                  <button
                    key={key}
                    data-category={key}
                    onClick={() => setActiveCategory(key)}
                    className={`
                      flex-shrink-0 px-4 h-full text-sm transition flex items-center gap-2
                      ${activeCategory === key ? 'border-b-2 border-[var(--text)] font-medium' : 'opacity-60 hover:opacity-100'}
                    `}
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

          {/* Category actions - fixed height: 44px */}
          {!searchQuery && (
            <div className="h-11 px-4 flex items-center justify-end border-b border-[var(--border)] bg-[var(--bg)]">
              <div className="flex gap-2">
                {activeCategory === 'custom' && isLoggedIn ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs px-3 py-1 bg-[var(--text)] text-[var(--bg)] rounded hover:opacity-80 transition"
                  >
                    + New
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => selectAll(activeCategory)}
                      className="text-xs px-3 py-1 border border-[var(--border)] rounded hover:opacity-60 transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearCategory(activeCategory)}
                      className="text-xs px-3 py-1 border border-[var(--border)] rounded hover:opacity-60 transition"
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
                    placeholder="Describe how this perspective should analyze documents..."
                    rows={3}
                    className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)] resize-none"
                  />
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

          {/* Perspectives list - fixed height: 290px */}
          <div className="h-[290px] overflow-y-auto px-2 py-2">
            {searchQuery && (
              <div className="px-2 py-1 text-xs opacity-60 mb-2">
                {filteredPerspectives.length + filteredCustomPerspectives.length} result{(filteredPerspectives.length + filteredCustomPerspectives.length) !== 1 ? 's' : ''}
              </div>
            )}

            {/* Custom perspectives (when in custom tab or searching) */}
            {(activeCategory === 'custom' || searchQuery) && (
              <>
                {(searchQuery ? filteredCustomPerspectives : customPerspectives).map(perspective =>
                  renderPerspectiveItem(
                    `custom:${perspective.id}`,
                    perspective.name,
                    perspective.prompt.substring(0, 100) + (perspective.prompt.length > 100 ? '...' : ''),
                    true,
                    perspective
                  )
                )}

                {activeCategory === 'custom' && !searchQuery && customPerspectives.length === 0 && !showCustomForm && (
                  <div className="h-full flex flex-col items-center justify-center opacity-60">
                    <p className="text-sm mb-3">No custom perspectives yet</p>
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="text-xs px-3 py-1.5 bg-[var(--text)] text-[var(--bg)] rounded hover:opacity-80 transition"
                    >
                      Create Your First Perspective
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Built-in perspectives */}
            {activeCategory !== 'custom' && !searchQuery && (
              <>
                {filteredPerspectives.map(perspective =>
                  renderPerspectiveItem(
                    perspective.id,
                    perspective.name,
                    `${perspective.coreFocus} — ${perspective.description}`
                  )
                )}
              </>
            )}

            {/* Search results for built-in */}
            {searchQuery && activeCategory !== 'custom' && (
              <>
                {filteredPerspectives.map(perspective =>
                  renderPerspectiveItem(
                    perspective.id,
                    perspective.name,
                    `${perspective.coreFocus} — ${perspective.description}`
                  )
                )}
              </>
            )}
          </div>

          {/* Footer - fixed height: 52px */}
          <div className="h-13 px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
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

      {/* Delete Custom Perspective Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTargetId(null)
        }}
        onConfirm={handleDeleteCustomPerspective}
        title="Delete Custom Perspective"
        message="Are you sure you want to delete this custom perspective? This action cannot be undone."
        confirmLabel="Delete"
        loading={deletingCustomId !== null}
      />
    </div>
  )
}
