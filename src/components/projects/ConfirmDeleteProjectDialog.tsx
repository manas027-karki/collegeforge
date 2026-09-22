import { Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import type { Project } from '../../types'
import { Button } from '../Button'

interface ConfirmDeleteProjectDialogProps {
  project: Project
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteProjectDialog({
  project,
  onCancel,
  onConfirm,
}: ConfirmDeleteProjectDialogProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="delete-project-title"
          className="mt-3 text-base font-semibold tracking-tight text-neutral-900"
        >
          Delete project?
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          This will permanently remove{' '}
          <span className="font-medium text-neutral-700">{project.name}</span> from
          your portfolio.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}