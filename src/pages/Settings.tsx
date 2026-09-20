import { Settings as SettingsIcon } from 'lucide-react'
import { PagePlaceholder } from '../components/PagePlaceholder'

export function Settings() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Manage your profile, notifications and connected accounts."
      icon={SettingsIcon}
    />
  )
}