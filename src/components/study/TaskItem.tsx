import {
  CalendarDays,
  Check,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { StudyTask } from '../../types'
import { cn } from '../../lib/cn'
import { StatusBadge } from '../StatusBadge'
import {
  formatMinutes,
  getDueLabel,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_TONES,
} from './studyMeta'

interface TaskItemProps {
  task: StudyTask
  onToggle: (task: StudyTask) => void
  onEdit: (task: StudyTask) => void
  onDelete: (task: StudyTask) => void
}

function TaskItemMenu({
  task,
  onEdit,
  onDelete,
}: Pick<TaskItemProps, 'task' | 'onEdit' | 'onDelete'>) {
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
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${task.title}`}
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
            onClick={run(() => onEdit(task))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <Pencil aria-hidden="true" className="h-4 w-4 text-neutral-400" />
            Edit task
          </button>

          <div className="my-1 border-t border-neutral-100" />

          <button
            role="menuitem"
            type="button"
            onClick={run(() => onDelete(task))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete task
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const completed = task.status === 'COMPLETED'
  const minutes = formatMinutes(task.estimatedMinutes)

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-4 transition-colors hover:bg-neutral-50 sm:px-5',
        completed && 'bg-neutral-50/60 hover:bg-neutral-50',
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={`Mark "${task.title}" as ${completed ? 'to do' : 'completed'}`}
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
            completed
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-neutral-300 bg-white text-transparent hover:border-primary-500',
          )}
        >
          <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            title="Edit task"
          >
            <span
              className={cn(
                'block text-sm font-medium transition-colors',
                completed
                  ? 'text-neutral-400 line-through'
                  : 'text-neutral-900 hover:text-primary-700',
              )}
            >
              {task.title}
            </span>
            {task.description ? (
              <span
                className={cn(
                  'mt-0.5 block truncate text-xs',
                  completed ? 'text-neutral-400' : 'text-neutral-500',
                )}
              >
                {task.description}
              </span>
            ) : null}
          </button>
          <TaskItemMenu task={task} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {task.category}
          </span>
          <StatusBadge
            label={TASK_PRIORITY_LABELS[task.priority]}
            tone={TASK_PRIORITY_TONES[task.priority]}
          />
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {getDueLabel(task.dueDate)}
          </span>
          {minutes ? (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
              <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {minutes}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}