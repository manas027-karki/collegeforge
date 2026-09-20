import { Inbox } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function Applications() {
  return (
    <PagePlaceholder
      title="Applications"
      description="Track every application across your hiring pipeline."
      icon={Inbox}
    />
  )
}