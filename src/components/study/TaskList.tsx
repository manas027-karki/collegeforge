import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { StudyTask } from '../../types'
import { cn } from '../../lib/cn'
import { Card } from '../Card'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  overdue: StudyTask[]
  today: StudyTask[]
  upcoming: StudyTask[]
  completed: StudyTask[]
  emptyState?: ReactNode
  onToggle: (task: StudyTask) => void
  onEdit: (task: StudyTask) => void
  onDelete: (task: StudyTask) => void
}

interface SectionProps {
  title: string
  icon: LucideIcon
  accent?: 'neutral' | 'rose'
  tasks: StudyTask[]
  children: ReactNode
}

function TaskSection({ title, icon: Icon, accent, tasks, children }: SectionProps) {
  if (tasks.length === 0) return null
  return (
    <section aria-label={title}>
      <Card className="overflow-hidden">
        <header
          className={cn(
            'flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3',
          )}
        >
          <h2
            className={cn(
              'flex items-center gap-2 text-sm font-semibold',
              accent === 'rose' ? 'text-rose-600' : 'text-neutral-900',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {title}
            <span
              className={cn(
                'text-xs font-medium',
                accent === 'rose' ? 'text-rose-400' : 'text-neutral-400',
              )}
            >
              {tasks.length}
            </span>
          </h2>
        </header>
        <div className="divide-y divide-neutral-100">{children}</div>
      </Card>
    </section>
  )
}

export function TaskList({
  overdue,
  today,
  upcoming,
  completed,
  emptyState,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  const hasTasks =
    overdue.length > 0 || today.length > 0 || upcoming.length > 0 || completed.length > 0

  if (!hasTasks) {
    return <div>{emptyState}</div>
  }

  return (
    <div className="space-y-5">
      <TaskSection title="Overdue" icon={AlertTriangle} accent="rose" tasks={overdue}>
        {overdue.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TaskSection>

      <TaskSection title="Today's Tasks" icon={CalendarCheck} tasks={today}>
        {today.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TaskSection>

      <TaskSection title="Upcoming" icon={CalendarClock} tasks={upcoming}>
        {upcoming.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TaskSection>

      <TaskSection title="Completed" icon={CheckCircle2} tasks={completed}>
        {completed.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TaskSection>
    </div>
  )
}