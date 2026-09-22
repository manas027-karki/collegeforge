import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  StudyTask,
  StudyTaskInput,
  TaskPriority,
} from '../../types'
import { Button } from '../Button'
import { TextField } from '../TextField'
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from './studyMeta'

export type TaskFormValues = Omit<StudyTaskInput, 'status'>

interface TaskModalProps {
  task: StudyTask | null
  onClose: () => void
  onSave: (values: TaskFormValues) => void
}

interface FormState {
  title: string
  description: string
  category: string
  priority: TaskPriority
  dueDate: string
  estimatedMinutes: string
}

type FormErrors = Partial<
  Record<'title' | 'category' | 'priority' | 'dueDate' | 'estimatedMinutes', string>
>

const selectClass =
  'h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-9 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

function initialFormState(task: StudyTask | null): FormState {
  return task
    ? {
        title: task.title,
        description: task.description ?? '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : '',
      }
    : {
        title: '',
        description: '',
        category: 'DSA',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedMinutes: '',
      }
}

export function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [values, setValues] = useState<FormState>(() => initialFormState(task))
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
    if (!values.title.trim()) nextErrors.title = 'Title is required.'
    if (!values.category) nextErrors.category = 'Category is required.'
    if (!values.dueDate) nextErrors.dueDate = 'Due date is required.'

    if (values.estimatedMinutes.trim() !== '') {
      const minutes = Number(values.estimatedMinutes)
      if (!Number.isFinite(minutes) || minutes <= 0) {
        nextErrors.estimatedMinutes = 'Enter a positive number of minutes.'
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const minutes = Number(values.estimatedMinutes)

    onSave({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      category: values.category,
      priority: values.priority,
      dueDate: values.dueDate,
      estimatedMinutes:
        values.estimatedMinutes.trim() !== '' &&
        Number.isFinite(minutes) &&
        minutes > 0
          ? minutes
          : undefined,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
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
              id="task-modal-title"
              className="text-lg font-semibold tracking-tight text-neutral-900"
            >
              {task ? 'Edit task' : 'Add task'}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              {task
                ? 'Update the details of this study task.'
                : 'Schedule a new task in your study plan.'}
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
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="e.g. Solve 3 Array problems"
            error={errors.title}
          />

          <div>
            <label
              htmlFor="task-description"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Optional notes, topics or links for this task."
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-category"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="task-category"
                  value={values.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className={`${selectClass} appearance-none pr-9`}
                >
                  {TASK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
              {errors.category ? (
                <p role="alert" className="mt-1.5 text-xs text-rose-600">
                  {errors.category}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={values.priority}
                  onChange={(event) =>
                    updateField('priority', event.target.value)
                  }
                  className={`${selectClass} appearance-none pr-9`}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
              {errors.priority ? (
                <p role="alert" className="mt-1.5 text-xs text-rose-600">
                  {errors.priority}
                </p>
              ) : null}
            </div>

            <TextField
              label="Due Date"
              type="date"
              value={values.dueDate}
              onChange={(event) => updateField('dueDate', event.target.value)}
              error={errors.dueDate}
            />

            <TextField
              label="Estimated Minutes"
              type="number"
              min={5}
              step={5}
              value={values.estimatedMinutes}
              onChange={(event) =>
                updateField('estimatedMinutes', event.target.value)
              }
              placeholder="e.g. 60"
              hint="Optional"
              error={errors.estimatedMinutes}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </div>
  )
}