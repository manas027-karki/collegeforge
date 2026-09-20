import { CalendarCheck } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function StudyPlanner() {
  return (
    <PagePlaceholder
      title="Study Planner"
      description="Plan daily study sessions and stay consistent."
      icon={CalendarCheck}
    />
  )
}