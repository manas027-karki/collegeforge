import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { Application, ApplicationInput, ApplicationStatus } from '../../types'
import { TODAY_ISO } from '../../lib/dates'
import { Button } from '../Button'
import { TextField } from '../TextField'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from './applicationMeta'

interface ApplicationModalProps {
  application: Application | null
  onClose: () => void
  onSave: (values: ApplicationInput) => void
}

interface FormState {
  jobId: string
  company: string
  role: string
  location: string
  status: string
  appliedAt: string
  deadline: string
  notes: string
}

type FormErrors = Partial<Record<'company' | 'role' | 'location' | 'appliedAt', string>>

const fieldClass =
  'h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

function initialFormState(application: Application | null): FormState {
  return application
    ? {
        jobId: application.jobId,
        company: application.company,
        role: application.role,
        location: application.location,
        status: application.status,
        appliedAt: application.appliedAt,
        deadline: application.deadline ?? '',
        notes: application.notes ?? '',
      }
    : { jobId: '', company: '', role: '', location: '', status: 'SAVED', appliedAt: TODAY_ISO, deadline: '', notes: '' }
}

export function ApplicationModal({
  application,
  onClose,
  onSave,
}: ApplicationModalProps) {
  const [values, setValues] = useState<FormState>(() => initialFormState(application))
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
    if (!values.company.trim()) nextErrors.company = 'Company is required.'
    if (!values.role.trim()) nextErrors.role = 'Role is required.'
    if (!values.location.trim()) nextErrors.location = 'Location is required.'
    if (!values.appliedAt) nextErrors.appliedAt = 'Application date is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      jobId: values.jobId,
      company: values.company.trim(),
      role: values.role.trim(),
      location: values.location.trim(),
      status: values.status as ApplicationStatus,
      appliedAt: values.appliedAt,
      deadline: values.deadline.trim() || undefined,
      notes: values.notes.trim() || undefined,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
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
              id="application-modal-title"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              {application ? 'Edit application' : 'Add application'}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              {application
                ? 'Update the details of this application.'
                : 'Track a new application in your pipeline.'}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Company"
              value={values.company}
              onChange={(event) => updateField('company', event.target.value)}
              placeholder="e.g. Microsoft"
              error={errors.company}
            />
            <TextField
              label="Role"
              value={values.role}
              onChange={(event) => updateField('role', event.target.value)}
              placeholder="e.g. SWE Intern"
              error={errors.role}
            />
            <TextField
              label="Location"
              value={values.location}
              onChange={(event) => updateField('location', event.target.value)}
              placeholder="e.g. Bengaluru"
              error={errors.location}
            />
            <div>
              <label
                htmlFor="application-status"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="application-status"
                  value={values.status}
                  onChange={(event) => updateField('status', event.target.value)}
                  className={`${fieldClass} appearance-none pr-9`}
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {APPLICATION_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>
            <TextField
              label="Application date"
              type="date"
              value={values.appliedAt}
              onChange={(event) => updateField('appliedAt', event.target.value)}
              error={errors.appliedAt}
            />
            <TextField
              label="Deadline"
              type="date"
              value={values.deadline}
              onChange={(event) => updateField('deadline', event.target.value)}
              hint="Optional"
            />
          </div>

          <div>
            <label
              htmlFor="application-notes"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Notes
            </label>
            <textarea
              id="application-notes"
              rows={4}
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Referral links, recruiter updates, prep reminders..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {application ? 'Save changes' : 'Add application'}
          </Button>
        </div>
      </form>
    </div>
  )
}