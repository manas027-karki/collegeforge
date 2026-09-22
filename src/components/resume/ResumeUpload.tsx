import { FileUp, ShieldCheck, UploadCloud } from 'lucide-react'
import {
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
  type RefObject,
} from 'react'
import { cn } from '../../lib/cn'
import {
  MAX_FILE_SIZE_BYTES,
  formatFileSize,
  getFileTypeFromName,
  isAllowedMimeType,
} from './resumeMeta'

const acceptAttr =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

interface ResumeUploadProps {
  onFileValid: (file: File) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

function getFileError(file: File): string | null {
  const extension = getFileTypeFromName(file.name)
  if (!extension) {
    return `"${file.name}" is not supported. Only PDF and DOCX files are allowed.`
  }
  if (!isAllowedMimeType(file.type)) {
    return `"${file.name}" has an unsupported file type. PDF or DOCX only.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${formatFileSize(
      file.size,
    )}, which exceeds the 5 MB limit.`
  }
  return null
}

export function ResumeUpload({ onFileValid, inputRef }: ResumeUploadProps) {
  const fallbackRef = useRef<HTMLInputElement>(null)
  const effectiveRef = inputRef ?? fallbackRef
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const fileError = getFileError(file)
    if (fileError) {
      setError(fileError)
      return
    }
    setError(null)
    onFileValid(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed bg-white p-6 text-center transition-colors sm:p-8',
        dragActive
          ? 'border-primary-400 bg-primary-50/50'
          : 'border-neutral-300 hover:border-primary-300',
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <UploadCloud aria-hidden="true" className="h-6 w-6" />
      </div>

      <p className="mt-3 text-sm font-medium text-neutral-900">
        Drag &amp; drop your resume here
      </p>
      <p className="mt-0.5 text-sm text-neutral-500">
        or{' '}
        <button
          type="button"
          onClick={() => effectiveRef.current?.click()}
          className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          browse files
        </button>
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <FileUp aria-hidden="true" className="h-3.5 w-3.5" />
          PDF or DOCX only
        </span>
        <span aria-hidden="true" className="hidden text-neutral-300 sm:inline">
          |
        </span>
        <span>Maximum 5 MB</span>
      </div>

      {error ? (
        <p role="alert" className="mx-auto mt-3 max-w-md text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-1.5 text-xs text-neutral-400">
        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        Files are checked in the browser. Uploads move to encrypted server storage
        once backend support is added.
      </p>

      <input
        ref={effectiveRef}
        type="file"
        accept={acceptAttr}
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  )
}