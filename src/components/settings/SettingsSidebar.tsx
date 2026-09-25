import {
  BellRing,
  CircleUserRound,
  CreditCard,
  Palette,
  PlugZap,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/cn'

export type SettingsSectionKey =
  | 'profile'
  | 'account'
  | 'notifications'
  | 'appearance'
  | 'integrations'
  | 'danger'

interface SettingsSidebarProps {
  activeSection: SettingsSectionKey
  onSectionChange: (section: SettingsSectionKey) => void
}

interface SettingsNavItem {
  key: SettingsSectionKey
  label: string
  icon: LucideIcon
}

const settingsNavItems: SettingsNavItem[] = [
  { key: 'profile', label: 'Profile', icon: CircleUserRound },
  { key: 'account', label: 'Account', icon: CreditCard },
  { key: 'notifications', label: 'Notifications', icon: BellRing },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'integrations', label: 'Integrations', icon: PlugZap },
  { key: 'danger', label: 'Danger Zone', icon: TriangleAlert },
]

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <>
      <aside aria-label="Settings navigation" className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="px-3 pb-3 pt-2">
            <p className="text-sm font-semibold tracking-tight text-neutral-900">Settings</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Personalize your workspace.
            </p>
          </div>
          <nav aria-label="Settings sections">
            <ul className="space-y-0.5">
              {settingsNavItems.map((item) => {
                const Icon = item.icon
                const active = item.key === activeSection

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onSectionChange(item.key)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                      )}
                    >
                      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="lg:hidden">
        <label
          htmlFor="settings-section-select"
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          Settings section
        </label>
        <select
          id="settings-section-select"
          value={activeSection}
          onChange={(event) => onSectionChange(event.target.value as SettingsSectionKey)}
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
        >
          {settingsNavItems.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
