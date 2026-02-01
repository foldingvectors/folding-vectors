'use client'

import { useEffect, useRef, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg w-full max-w-md fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl opacity-60 hover:opacity-100 transition"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Confirm dialog component
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[var(--border)] rounded-md text-sm hover:opacity-60 transition disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md text-sm hover:opacity-80 transition disabled:opacity-40"
          >
            {loading ? '...' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm opacity-80">{message}</p>
    </Modal>
  )
}

// Input modal for rename
interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  title: string
  label: string
  placeholder?: string
  initialValue?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

export function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder = '',
  initialValue = '',
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue)

  // Reset value when modal opens with new initial value
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue)
    }
  }, [isOpen, initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[var(--border)] rounded-md text-sm hover:opacity-60 transition disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={loading || !value.trim()}
            className="px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md text-sm hover:opacity-80 transition disabled:opacity-40"
          >
            {loading ? '...' : confirmLabel}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-wider opacity-60 mb-2">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
          autoFocus
          disabled={loading}
        />
      </form>
    </Modal>
  )
}

