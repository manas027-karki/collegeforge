import { CalendarPlus, SearchX } from 'lucide-react'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'

interface EmptyTasksProps {
  variant: 'empty' | 'no-matches'
  onAdd: () => void
  onClear: () => void
}

export function EmptyTasks({ variant, onAdd, onClear }: EmptyTasksProps) {
  if (variant === 'empty') {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No tasks yet"
        description="Add your first study task to start planning your preparation."
        action={
          <Button onClick={onAdd}>
            <CalendarPlus aria-hidden="true" className="h-4 w-4" />
            Add Task
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={SearchX}
      title="No matching tasks"
      description="Nothing matches your current search or filters. Try adjusting them."
      action={
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  )
}