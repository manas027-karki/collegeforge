import { Briefcase } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function Jobs() {
  return (
    <PagePlaceholder
      title="Jobs"
      description="Find internships and full-time roles matching your profile."
      icon={Briefcase}
    />
  )
}