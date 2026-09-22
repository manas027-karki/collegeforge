import type { Resume } from '../../types'
import { ResumeCard } from './ResumeCard'

interface ResumeGridProps {
  resumes: Resume[]
  onView: (resume: Resume) => void
  onDownload: (resume: Resume) => void
  onSetCurrent: (resume: Resume) => void
  onArchive: (resume: Resume) => void
  onDelete: (resume: Resume) => void
}

export function ResumeGrid({
  resumes,
  onView,
  onDownload,
  onSetCurrent,
  onArchive,
  onDelete,
}: ResumeGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onView={onView}
          onDownload={onDownload}
          onSetCurrent={onSetCurrent}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}