import { BellRing } from 'lucide-react'
import { useState } from 'react'
import type { NotificationSettings as NotificationPreferences } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { SettingsFeedback, SettingsSection, SettingsToggle } from './SettingsSection'

type NotificationKey = keyof NotificationPreferences

interface NotificationGroup {
  title: string
  description: string
  items: Array<{
    key: NotificationKey
    label: string
    description: string
  }>
}

const notificationGroups: NotificationGroup[] = [
  {
    title: 'Application Notifications',
    description: 'Stay on top of the opportunities you are pursuing.',
    items: [
      {
        key: 'applicationDeadlines',
        label: 'Application deadline reminders',
        description: 'Receive reminders before an application deadline.',
      },
      {
        key: 'interviewReminders',
        label: 'Interview reminders',
        description: 'Get notified about upcoming interviews and prep time.',
      },
      {
        key: 'applicationUpdates',
        label: 'Application status updates',
        description: 'See when an application changes status.',
      },
    ],
  },
  {
    title: 'Study Notifications',
    description: 'Build a consistent study routine with helpful nudges.',
    items: [
      {
        key: 'studyReminders',
        label: 'Study task reminders',
        description: 'Receive reminders for tasks scheduled in your planner.',
      },
      {
        key: 'dailyStudySummary',
        label: 'Daily study summary',
        description: 'Get a daily recap of your study plan and progress.',
      },
      {
        key: 'weeklyProgressSummary',
        label: 'Weekly progress summary',
        description: 'Review your completed study work each week.',
      },
    ],
  },
  {
    title: 'Career Notifications',
    description: 'Keep your career planning workspace current.',
    items: [
      {
        key: 'jobRecommendations',
        label: 'New job recommendations',
        description: 'Be notified when new recommended roles are available.',
      },
      {
        key: 'resumeReminders',
        label: 'Resume reminders',
        description: 'Get reminders to keep your resume current.',
      },
      {
        key: 'dsaReminders',
        label: 'DSA progress reminders',
        description: 'Stay motivated with reminders for your DSA practice.',
      },
    ],
  },
]

export function NotificationSettings() {
  const savedPreferences = useAppStore((state) => state.notificationSettings)
  const updateNotificationSettings = useAppStore((state) => state.updateNotificationSettings)
  const [values, setValues] = useState<NotificationPreferences>(() => ({ ...savedPreferences }))
  const [feedback, setFeedback] = useState('')

  const togglePreference = (key: NotificationKey) => {
    setValues((current) => ({ ...current, [key]: !current[key] }))
    setFeedback('')
  }

  const handleSave = () => {
    updateNotificationSettings(values)
    setFeedback('Notification preferences saved.')
  }

  const handleCancel = () => {
    setValues({ ...savedPreferences })
    setFeedback('')
  }

  return (
    <SettingsSection
      title="Notifications"
      description="Choose which updates you want to receive from CareerForge."
      icon={BellRing}
    >
      <Card className="divide-y divide-neutral-100">
        {notificationGroups.map((group) => (
          <div key={group.title} className="p-5 sm:p-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-semibold text-neutral-900">{group.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{group.description}</p>
            </div>
            <ul className="mt-5 space-y-4">
              {group.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-start justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50/50 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">{item.description}</p>
                  </div>
                  <SettingsToggle
                    checked={values[item.key]}
                    label={item.label}
                    onChange={() => togglePreference(item.key)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
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
    </SettingsSection>
  )
}
