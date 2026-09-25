import { useState } from 'react'
import { AccountSettings } from '../components/settings/AccountSettings'
import { AppearanceSettings } from '../components/settings/AppearanceSettings'
import { DangerZone } from '../components/settings/DangerZone'
import { IntegrationSettings } from '../components/settings/IntegrationSettings'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { ProfileSettings } from '../components/settings/ProfileSettings'
import {
  SettingsSidebar,
  type SettingsSectionKey,
} from '../components/settings/SettingsSidebar'

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>('profile')

  const section = (() => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />
      case 'account':
        return <AccountSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'integrations':
        return <IntegrationSettings />
      case 'danger':
        return <DangerZone />
    }
  })()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile, preferences and connected workspace tools.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="min-w-0">
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
        <div className="min-w-0">{section}</div>
      </div>
    </div>
  )
}
