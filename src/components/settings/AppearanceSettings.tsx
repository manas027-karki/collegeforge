import { Monitor, Moon, Rows2, Rows3, Sparkles, Sun, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DensityPreference, ThemePreference } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { SettingsFeedback, SettingsSection, SettingsToggle } from './SettingsSection'

type AppearanceDraft = {
  theme: ThemePreference
  density: DensityPreference
  reduceAnimations: boolean
}

interface AppearanceOption<T extends string> {
  value: T
  label: string
  description: string
  icon: LucideIcon
}

const themeOptions: AppearanceOption<ThemePreference>[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces for focused work.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'A darker interface for low-light environments.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device preference automatically.',
    icon: Monitor,
  },
]

const densityOptions: AppearanceOption<DensityPreference>[] = [
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'More breathing room throughout the workspace.',
    icon: Rows3,
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Fit more information into each view.',
    icon: Rows2,
  },
]

function ChoiceCard<T extends string>({
  option,
  selected,
  onChange,
  name,
}: {
  option: AppearanceOption<T>
  selected: boolean
  onChange: () => void
  name: string
}) {
  const Icon = option.icon
  const id = `${name}-${option.value}`

  return (
    <>
      <input
        id={id}
        name={name}
        type="radio"
        value={option.value}
        checked={selected}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 ${
          selected
            ? 'border-primary-300 bg-primary-50/70'
            : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            selected ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-neutral-800">{option.label}</span>
          <span className="mt-1 block text-xs leading-5 text-neutral-500">
            {option.description}
          </span>
        </span>
      </label>
    </>
  )
}

export function AppearanceSettings() {
  const savedTheme = useAppStore((state) => state.theme)
  const savedDensity = useAppStore((state) => state.density)
  const savedReduceAnimations = useAppStore((state) => state.reduceAnimations)
  const setTheme = useAppStore((state) => state.setTheme)
  const setDensity = useAppStore((state) => state.setDensity)
  const setReduceAnimations = useAppStore((state) => state.setReduceAnimations)
  const [draft, setDraft] = useState<AppearanceDraft>({
    theme: savedTheme,
    density: savedDensity,
    reduceAnimations: savedReduceAnimations,
  })
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = savedTheme
    root.dataset.density = savedDensity
    root.dataset.reduceAnimations = String(savedReduceAnimations)
  }, [savedTheme, savedDensity, savedReduceAnimations])

  const updateDraft = <Key extends keyof AppearanceDraft>(key: Key, value: AppearanceDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setFeedback('')
  }

  const handleSave = () => {
    setTheme(draft.theme)
    setDensity(draft.density)
    setReduceAnimations(draft.reduceAnimations)
    setFeedback('Appearance preferences saved.')
  }

  const handleCancel = () => {
    setDraft({
      theme: savedTheme,
      density: savedDensity,
      reduceAnimations: savedReduceAnimations,
    })
    setFeedback('')
  }

  return (
    <SettingsSection
      title="Appearance"
      description="Choose how CareerForge looks and how much information it shows at once."
      icon={Sparkles}
    >
      <div className="space-y-4">
        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900">Theme</legend>
            <p className="mt-1 text-sm text-neutral-500">
              The current workspace is light-first. Your preference is saved for global theme support.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="theme"
                  option={option}
                  selected={draft.theme === option.value}
                  onChange={() => updateDraft('theme', option.value)}
                />
              ))}
            </div>
          </fieldset>
        </Card>

        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900">Density</legend>
            <p className="mt-1 text-sm text-neutral-500">
              Adjust the spacing used by your workspace preferences.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {densityOptions.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="density"
                  option={option}
                  selected={draft.density === option.value}
                  onChange={() => updateDraft('density', option.value)}
                />
              ))}
            </div>
          </fieldset>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Reduce animations</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Minimize non-essential transitions and motion across the interface.
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={draft.reduceAnimations}
            label="Reduce animations"
            onChange={() => updateDraft('reduceAnimations', !draft.reduceAnimations)}
          />
        </Card>

        {feedback ? <SettingsFeedback message={feedback} /> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsSection>
  )
}
