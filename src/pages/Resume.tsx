import { useMemo, useRef, useState } from 'react'
import {
  BadgeCheck,
  Download,
  Eye,
  FileText,
  SearchX,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDeleteResumeDialog } from '../components/resume/ConfirmDeleteResumeDialog'
import { ResumeDetailsModal } from '../components/resume/ResumeDetailsModal'
import { ResumeFilters } from '../components/resume/ResumeFilters'
import { ResumeGrid } from '../components/resume/ResumeGrid'
import { ResumeStats } from '../components/resume/ResumeStats'
import { ResumeUpload } from '../components/resume/ResumeUpload'
import {
  UploadModal,
  type UploadFormValues,
} from '../components/resume/UploadModal'
import {
  filterResumes,
  getNextResumeVersion,
  getResumeStats,
} from '../components/resume/resumeFilter'
import { formatFileSize } from '../components/resume/resumeMeta'
import { formatShortDate } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { Resume } from '../types'

export function Resume() {
  const resumes = useAppStore((state) => state.resumes)
  const resumeFilters = useAppStore((state) => state.resumeFilters)
  const setResumeFilters = useAppStore((state) => state.setResumeFilters)
  const addResume = useAppStore((state) => state.addResume)
  const deleteResume = useAppStore((state) => state.deleteResume)
  const archiveResume = useAppStore((state) => state.archiveResume)
  const setCurrentResume = useAppStore((state) => state.setCurrentResume)

  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null)

  const currentResume = useMemo(
    () => resumes.find((resume) => resume.status === 'CURRENT') ?? null,
    [resumes],
  )

  const filteredResumes = useMemo(
    () => filterResumes(resumes, resumeFilters),
    [resumes, resumeFilters],
  )

  const stats = useMemo(() => getResumeStats(resumes), [resumes])
  const nextVersion = useMemo(() => getNextResumeVersion(resumes), [resumes])

  const detailsResume = useMemo(
    () => (detailsId ? resumes.find((resume) => resume.id === detailsId) ?? null : null),
    [resumes, detailsId],
  )

  const handleResetFilters = () => {
    setResumeFilters({ search: '', status: 'ALL', fileType: 'ALL', sort: 'NEWEST' })
  }

  const openUploadPicker = () => {
    uploadInputRef.current?.click()
  }

  const handleFileValid = (file: File) => {
    setPendingFile(file)
    setUploadOpen(true)
  }

  const handleUpload = (values: UploadFormValues) => {
    if (pendingFile) {
      addResume({ ...values, fileUrl: URL.createObjectURL(pendingFile) })
    } else {
      addResume(values)
    }
    setPendingFile(null)
    setUploadOpen(false)
  }

  const handleDownload = (resume: Resume) => {
    if (!resume.fileUrl) return
    const link = document.createElement('a')
    link.href = resume.fileUrl
    link.download = resume.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteResume(deleteTarget.id)
    setDeleteTarget(null)
    if (detailsId === deleteTarget?.id) setDetailsId(null)
  }

  const currentMeta = currentResume
    ? [
        currentResume.fileType,
        currentResume.fileSize
          ? formatFileSize(currentResume.fileSize)
          : null,
        `Updated ${formatShortDate(currentResume.updatedAt)}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Resume Manager
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Upload, version and keep your resumes ready for applications.
          </p>
        </div>
        <Button onClick={openUploadPicker} className="shrink-0">
          <Upload aria-hidden="true" className="h-4 w-4" />
          Upload Resume
        </Button>
      </section>

      <ResumeStats stats={stats} />

      <ResumeUpload onFileValid={handleFileValid} inputRef={uploadInputRef} />

      {currentResume ? (
        <section
          aria-label="Current resume"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <BadgeCheck aria-hidden="true" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label="Current Resume" tone="green" />
                  <span className="rounded-md bg-white/70 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    v{currentResume.version}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-base font-semibold text-neutral-900">
                  {currentResume.fileName}
                </p>
                <p className="mt-0.5 truncate text-sm text-neutral-600">
                  {currentResume.targetRole} · {currentMeta}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setDetailsId(currentResume.id)}
              >
                <Eye aria-hidden="true" className="h-4 w-4" />
                View
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDownload(currentResume)}
                disabled={!currentResume.fileUrl}
                title={
                  currentResume.fileUrl
                    ? 'Download file'
                    : 'No stored file to download'
                }
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="secondary"
                disabled
                title="Coming soon - AI analysis"
                aria-disabled="true"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Analyze
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <ResumeFilters
        search={resumeFilters.search}
        onSearchChange={(value) => setResumeFilters({ search: value })}
        status={resumeFilters.status}
        onStatusChange={(value) => setResumeFilters({ status: value })}
        fileType={resumeFilters.fileType}
        onFileTypeChange={(value) => setResumeFilters({ fileType: value })}
        sort={resumeFilters.sort}
        onSortChange={(value) => setResumeFilters({ sort: value })}
        resultCount={filteredResumes.length}
        totalCount={resumes.length}
        onClear={handleResetFilters}
      />

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your first resume above and it will become your current version."
          action={
            <Button onClick={openUploadPicker}>
              <Upload aria-hidden="true" className="h-4 w-4" />
              Upload Resume
            </Button>
          }
        />
      ) : filteredResumes.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching resumes"
          description="Nothing matches your current filters. Try adjusting search, status or file type."
          action={
            <Button variant="secondary" onClick={handleResetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ResumeGrid
          resumes={filteredResumes}
          onView={(resume) => setDetailsId(resume.id)}
          onDownload={handleDownload}
          onSetCurrent={(resume) => setCurrentResume(resume.id)}
          onArchive={(resume) => archiveResume(resume.id)}
          onDelete={setDeleteTarget}
        />
      )}

      {uploadOpen ? (
        <UploadModal
          file={pendingFile as File}
          nextVersion={nextVersion}
          onClose={() => {
            setUploadOpen(false)
            setPendingFile(null)
          }}
          onSave={handleUpload}
        />
      ) : null}

      {detailsResume ? (
        <ResumeDetailsModal
          resume={detailsResume}
          onClose={() => setDetailsId(null)}
          onDownload={handleDownload}
          onSetCurrent={(resume) => setCurrentResume(resume.id)}
          onArchive={(resume) => archiveResume(resume.id)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteResumeDialog
          resume={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  )
}