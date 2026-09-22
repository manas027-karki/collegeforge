import { FileText, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { ResumeFileType } from '../../types'
import { Button } from '../Button'
import { TextField } from '../TextField'
import { formatFileSize, getFileTypeFromName, TARGET_ROLES } from './resumeMeta'

export interface UploadFormValues {
  fileName: string
  targetRole: string
  fileType: ResumeFileType
  fileSize: number
}

interface UploadModalProps {
  file: File
  nextVersion: number
  onClose: () => void
  onSave: (values: UploadFormValues) => void
}

interface FormState {
  fileName: string
  targetRole: string
}

type FormErrors = Partial<Record<'fileName' | 'targetRole', string>>

const fileTypeFromName = (fileName: string): ResumeFileType =>
  getFileTypeFromName(fileName) ?? 'PDF'

export function UploadModal({
  file,
  nextVersion,
  onClose,
  onSave,
}: UploadModalProps) {
  const [values, setValues] = useState<FormState>({
    fileName: file.name,
    targetRole: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const updateField = (field: keyof FormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!values.fileName.trim()) nextErrors.fileName = 'File name is required.'
    if (!values.targetRole.trim())
      nextErrors.targetRole = 'Target role is required.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      fileName: values.fileName.trim(),
      targetRole: values.targetRole.trim(),
      fileType: fileTypeFromName(file.name),
      fileSize: file.size,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="upload-modal-title"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              Upload resume
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Add a new version and make it your current resume.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {file.name}
              </p>
              <p className="text-xs text-neutral-500">
                {getFileTypeFromName(file.name)} · {formatFileSize(file.size)} ·
                validated in the browser
              </p>
            </div>
          </div>

          <TextField
            label="File name"
            value={values.fileName}
            onChange={(event) => updateField('fileName', event.target.value)}
            placeholder="e.g. Manas_SDE_Resume.pdf"
            error={errors.fileName}
          />

          <div>
            <TextField
              label="Target role"
              value={values.targetRole}
              onChange={(event) => updateField('targetRole', event.target.value)}
              placeholder="e.g. Software Engineer"
              list="resume-target-roles"
              error={errors.targetRole}
            />
            <datalist id="resume-target-roles">
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
            <p className="text-sm font-medium text-neutral-700">
              Version number
            </p>
            <span className="inline-flex rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200">
              v{nextVersion} · auto-assigned
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Upload resume</Button>
        </div>
      </form>
    </div>
  )
}