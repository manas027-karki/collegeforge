import { FolderKanban } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function Projects() {
  return (
    <PagePlaceholder
      title="Projects"
      description="Build and showcase your project portfolio to employers."
      icon={FolderKanban}
    />
  )
}