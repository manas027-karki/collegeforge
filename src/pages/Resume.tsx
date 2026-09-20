import { FileText } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function Resume() {
  return (
    <PagePlaceholder
      title="Resume"
      description="Manage resume versions and keep them ready for applications."
      icon={FileText}
    />
  )
}