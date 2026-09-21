import { ChevronDown, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Difficulty, DSAProblemInput, DSAPlatform } from '../../types'
import { Button } from '../Button'
import { TextField } from '../TextField'
import { DIFFICULTY_LABELS, DIFFICULTY_ORDER, DSA_TOPICS } from './dsaMeta'

interface AddProblemModalProps {
  onClose: () => void
  onSubmit: (input: DSAProblemInput) => void
}

interface AddFormState {
  title: string
  difficulty: string
  topic: string
  platform: string
  url: string
}

type FormErrors = Partial<Record<'title' | 'difficulty' | 'topic', string>>

const initialForm: AddFormState = {
  title: '',
  difficulty: 'EASY',
  topic: DSA_TOPICS[0],
  platform: 'LEETCODE',
  url: '',
}

const fieldClass =
  'h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

function SelectField({
  label,
  value,
  onChange,
  children,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          className={`${fieldClass} appearance-none pr-9`}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function AddProblemModal({ onClose, onSubmit }: AddProblemModalProps) {
  const [values, setValues] = useState<AddFormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})

  const submit = (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Problem title is required.'
    if (!values.difficulty) nextErrors.difficulty = 'Difficulty is required.'
    if (!values.topic) nextErrors.topic = 'Topic is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      title: values.title.trim(),
      difficulty: values.difficulty as Difficulty,
      topic: values.topic,
      platform: values.platform as DSAPlatform,
      url: values.url.trim(),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-problem-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <form
        onSubmit={submit}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="add-problem-title"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              Add problem
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Add a custom problem to track alongside your existing set.
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
            label="Title"
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="e.g. Insert Interval"
            error={errors.title}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField
              label="Difficulty"
              value={values.difficulty}
              onChange={(value) =>
                setValues((current) => ({ ...current, difficulty: value }))
              }
              error={errors.difficulty}
            >
              {DIFFICULTY_ORDER.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {DIFFICULTY_LABELS[difficulty]}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Topic"
              value={values.topic}
              onChange={(value) =>
                setValues((current) => ({ ...current, topic: value }))
              }
              error={errors.topic}
            >
              {DSA_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Platform"
              value={values.platform}
              onChange={(value) =>
                setValues((current) => ({ ...current, platform: value }))
              }
            >
              <option value="LEETCODE">LeetCode</option>
              <option value="OTHER">Other</option>
            </SelectField>
          </div>

          <TextField
            label="URL"
            value={values.url}
            onChange={(event) =>
              setValues((current) => ({ ...current, url: event.target.value }))
            }
            placeholder="https://leetcode.com/problems/..."
            hint="Optional"
          />
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add problem</Button>
        </div>
      </form>
    </div>
  )
}