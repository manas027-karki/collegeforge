import {
  Archive,
  BadgeCheck,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Resume } from '../../types'
import { formatShortDate } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { Card } from '../Card'
import { StatusBadge } from '../StatusBadge'
import {
  RESUME_STATUS_LABELS,
  RESUME_STATUS_TONES,
  formatFileSize,
} from './resumeMeta'

interface ResumeCardProps {
  resume: Resume
  onView: (resume: Resume) => void
  onDownload: (resume: Resume) => void
  onSetCurrent: (resume: Resume) => void
  onArchive: (resume: Resume) => void
  onDelete: (resume: Resume) => void
}

function ResumeCardMenu({
  resume,
  onSetCurrent,
  onArchive,
  onDelete,
}: Pick<
  ResumeCardProps,
  'resume' | 'onSetCurrent' | 'onArchive' | 'onDelete'
>) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${resume.fileName}`}
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            disabled={resume.status === 'CURRENT'}
            onClick={run(() => onSetCurrent(resume))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
          >
            <BadgeCheck aria-hidden="true" className="h-4 w-4 text-neutral-400" />
            Set as current
          </button>

          <button
            role="menuitem"
            type="button"
            disabled={resume.status === 'ARCHIVED'}
            onClick={run(() => onArchive(resume))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
          >
            <Archive aria-hidden="true" className="h-4 w-4 text-neutral-400" />
            Archive resume
          </button>

          <div className="my-1 border-t border-neutral-100" />

          <button
            role="menuitem"
            type="button"
            onClick={run(() => onDelete(resume))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete resume
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ResumeFileIcon({ fileType }: { fileType: Resume['fileType'] }) {
  const toneClass =
    fileType === 'PDF'
      ? 'bg-rose-50 text-rose-600'
      : 'bg-sky-50 text-sky-600'
  const fileLabel = fileType === 'PDF' ? 'PDF' : 'DOCX'
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
        toneClass,
      )}
    >
      <FileText aria-hidden="true" className="h-5 w-5" />
      <span className="sr-only">{fileLabel}</span>
    </span>
  )
}

export function ResumeCard({
  resume,
  onView,
  onDownload,
  onSetCurrent,
  onArchive,
  onDelete,
}: ResumeCardProps) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onView(resume)}
          className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          title={`View ${resume.fileName}`}
        >
          <ResumeFileIcon fileType={resume.fileType} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700">
              {resume.fileName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-neutral-500">
              {resume.targetRole}
            </span>
          </span>
        </button>
        <ResumeCardMenu
          resume={resume}
          onSetCurrent={onSetCurrent}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          v{resume.version}
        </span>
        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {resume.fileType}
        </span>
        {resume.fileSize ? (
          <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
            {formatFileSize(resume.fileSize)}
          </span>
        ) : null}
        <StatusBadge
          label={RESUME_STATUS_LABELS[resume.status]}
          tone={RESUME_STATUS_TONES[resume.status]}
        />
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Uploaded {formatShortDate(resume.uploadedAt)} · Updated{' '}
        {formatShortDate(resume.updatedAt)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(resume)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
            View
          </button>
          <button
            type="button"
            onClick={() => onDownload(resume)}
            disabled={!resume.fileUrl}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40"
            title={resume.fileUrl ? 'Download file' : 'No stored file to download'}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </Card>
  )
}