import {
  Archive,
  CalendarClock,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Layers,
  Sparkles,
  Star,
  Tag,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Resume } from '../../types'
import { formatDate } from '../../lib/dates'
import { Button } from '../Button'
import { StatusBadge } from '../StatusBadge'
import {
  RESUME_STATUS_LABELS,
  RESUME_STATUS_TONES,
  formatFileSize,
} from './resumeMeta'

interface ResumeDetailsModalProps {
  resume: Resume
  onClose: () => void
  onDownload: (resume: Resume) => void
  onSetCurrent: (resume: Resume) => void
  onArchive: (resume: Resume) => void
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
  label: string
  value?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-neutral-900">
        {value ?? '—'}
      </dd>
    </div>
  )
}

export function ResumeDetailsModal({
  resume,
  onClose,
  onDownload,
  onSetCurrent,
  onArchive,
}: ResumeDetailsModalProps) {
  const [analysisOpen, setAnalysisOpen] = useState(false)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const isCurrent = resume.status === 'CURRENT'

  const viewResume = () => {
    if (resume.fileUrl) {
      window.open(resume.fileUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-details-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {resume.fileName}
              </p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Last updated {formatDate(resume.updatedAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resume details"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={RESUME_STATUS_LABELS[resume.status]}
              tone={RESUME_STATUS_TONES[resume.status]}
            />
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
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Tag}
              label="Target role"
              value={resume.targetRole}
            />
            <DetailItem
              icon={Layers}
              label="Version"
              value={`v${resume.version}`}
            />
            <DetailItem icon={FileText} label="File type" value={resume.fileType} />
            <DetailItem
              icon={FileText}
              label="File size"
              value={resume.fileSize ? formatFileSize(resume.fileSize) : undefined}
            />
            <DetailItem
              icon={CalendarDays}
              label="Uploaded"
              value={formatDate(resume.uploadedAt)}
            />
            <DetailItem
              icon={CalendarClock}
              label="Last updated"
              value={formatDate(resume.updatedAt)}
            />
          </dl>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-900">Preview</h3>
            <div className="mt-2 flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-8">
              <div className="relative flex w-full max-w-xs flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-10 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <FileText aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="mt-3 max-w-full truncate text-sm font-medium text-neutral-900">
                  {resume.fileName}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {resume.fileType} · {formatFileSize(resume.fileSize)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Mock placeholder preview. A live preview is shown once resume files
              are stored on the server.
            </p>
          </div>

          {analysisOpen ? (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50/60 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-violet-900">
                  Resume analysis — coming soon
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-violet-700">
                  AI-powered feedback on ATS compatibility, missing keywords and
                  role match will be added in a future milestone.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {isCurrent ? (
            <Button variant="secondary" onClick={() => onArchive(resume)}>
              <Archive aria-hidden="true" className="h-4 w-4" />
              Archive
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onSetCurrent(resume)}>
              <Star aria-hidden="true" className="h-4 w-4" />
              Set as current
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setAnalysisOpen((value) => !value)}
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Analyze Resume
          </Button>

          <Button onClick={() => onDownload(resume)} disabled={!resume.fileUrl}>
            <Download aria-hidden="true" className="h-4 w-4" />
            Download
          </Button>

          <Button onClick={viewResume} disabled={!resume.fileUrl}>
            <Eye aria-hidden="true" className="h-4 w-4" />
            View Resume
          </Button>
        </div>
      </div>
    </div>
  )
}