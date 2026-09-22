import { ChevronDown, X } from 'lucide-react'
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { Project, ProjectInput, ProjectStatus } from '../../types'
import { Button } from '../Button'
import { TextField } from '../TextField'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from './projectMeta'

interface ProjectModalProps {
  project: Project | null
  suggestions: string[]
  onClose: () => void
  onSave: (values: ProjectInput) => void
}

interface FormState {
  name: string
  description: string
  technologies: string[]
  status: ProjectStatus
  githubUrl: string
  liveUrl: string
  startDate: string
  endDate: string
}

type FormErrors = Partial<Record<'name' | 'description', string>>

const selectClass =
  'h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-9 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

const inputBase =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

function initialFormState(project: Project | null): FormState {
  return project
    ? {
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        status: project.status,
        githubUrl: project.githubUrl ?? '',
        liveUrl: project.liveUrl ?? '',
        startDate: project.startDate ?? '',
        endDate: project.endDate ?? '',
      }
    : {
        name: '',
        description: '',
        technologies: [],
        status: 'PLANNED',
        githubUrl: '',
        liveUrl: '',
        startDate: '',
        endDate: '',
      }
}

function TechnologyInput({
  value,
  suggestions,
  onChange,
}: {
  value: string[]
  suggestions: string[]
  onChange: (value: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const item = draft.trim()
    if (item && !value.includes(item)) onChange([...value, item])
    setDraft('')
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addDraft()
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 shadow-sm transition-colors hover:border-neutral-400 focus-within:border-primary-500">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== item))}
              aria-label={`Remove ${item}`}
              className="rounded-sm text-neutral-400 transition-colors hover:text-rose-600"
            >
              <X aria-hidden="true" className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addDraft}
          list="project-technology-suggestions"
          placeholder={value.length === 0 ? 'e.g. React, TypeScript, Node.js' : 'Add more...'}
          aria-label="Technologies"
          className="min-w-32 flex-1 border-none bg-transparent px-0.5 py-0.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
      <datalist id="project-technology-suggestions">
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <p className="mt-1.5 text-xs text-neutral-500">
        Press Enter to add a technology.
      </p>
    </div>
  )
}

export function ProjectModal({
  project,
  suggestions,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [values, setValues] = useState<FormState>(() => initialFormState(project))
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

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Project name is required.'
    if (!values.description.trim()) nextErrors.description = 'Description is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      name: values.name.trim(),
      description: values.description.trim(),
      technologies: values.technologies,
      status: values.status,
      githubUrl: values.githubUrl.trim() || undefined,
      liveUrl: values.liveUrl.trim() || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
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
              id="project-modal-title"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              {project ? 'Edit project' : 'Add project'}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              {project
                ? 'Update the details of this project.'
                : 'Add a new project to your portfolio.'}
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
          <TextField
            label="Project Name"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="e.g. CareerForge"
            error={errors.name}
          />

          <div>
            <label
              htmlFor="project-description"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Description
            </label>
            <textarea
              id="project-description"
              rows={3}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="What does this project do? What problem does it solve?"
              className={inputBase}
            />
            {errors.description ? (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Technologies
            </label>
            <TechnologyInput
              value={values.technologies}
              suggestions={suggestions}
              onChange={(value) => updateField('technologies', value)}
            />
          </div>

          <div>
            <label
              htmlFor="project-status"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="project-status"
                value={values.status}
                onChange={(event) =>
                  updateField('status', event.target.value as ProjectStatus)
                }
                className={`${selectClass} appearance-none pr-9`}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PROJECT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="GitHub URL"
              value={values.githubUrl}
              onChange={(event) => updateField('githubUrl', event.target.value)}
              placeholder="https://github.com/you/repo"
              type="url"
              hint="Optional"
            />
            <TextField
              label="Live Demo URL"
              value={values.liveUrl}
              onChange={(event) => updateField('liveUrl', event.target.value)}
              placeholder="https://yourapp.example.com"
              type="url"
              hint="Optional"
            />
            <TextField
              label="Start Date"
              type="date"
              value={values.startDate}
              onChange={(event) => updateField('startDate', event.target.value)}
              hint="Optional"
            />
            <TextField
              label="End Date"
              type="date"
              value={values.endDate}
              onChange={(event) => updateField('endDate', event.target.value)}
              hint="Optional"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {project ? 'Save changes' : 'Add project'}
          </Button>
        </div>
      </form>
    </div>
  )
}