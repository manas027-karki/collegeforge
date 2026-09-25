import { Binary, Briefcase, PlugZap } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { GitHubIcon } from '../GitHubIcon'
import { Button } from '../Button'
import { Card } from '../Card'
import { SettingsFeedback, SettingsSection } from './SettingsSection'
import { StatusBadge } from '../StatusBadge'

interface Integration {
  name: string
  description: string
  icon: ReactNode
  connectLabel: string
}

const integrations: Integration[] = [
  {
    name: 'GitHub',
    description: 'Connect GitHub to automatically import your repositories and project activity.',
    icon: <GitHubIcon className="h-5 w-5" />,
    connectLabel: 'Connect GitHub',
  },
  {
    name: 'LeetCode',
    description: 'Connect your LeetCode activity to automatically sync your DSA progress.',
    icon: <Binary aria-hidden="true" className="h-5 w-5" />,
    connectLabel: 'Connect LeetCode',
  },
  {
    name: 'LinkedIn',
    description: 'Connect LinkedIn for future profile and career workflow integrations.',
    icon: <Briefcase aria-hidden="true" className="h-5 w-5" />,
    connectLabel: 'Connect LinkedIn',
  },
]

function IntegrationCard({
  integration,
  onConnect,
}: {
  integration: Integration
  onConnect: () => void
}) {
  return (
    <Card className="flex h-full flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
          {integration.icon}
        </span>
        <StatusBadge label="Not Connected" tone="neutral" />
      </div>
      <div className="flex-1">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          {integration.name}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-neutral-500">{integration.description}</p>
      </div>
      <Button type="button" variant="secondary" onClick={onConnect}>
        {integration.connectLabel}
      </Button>
    </Card>
  )
}

export function IntegrationSettings() {
  const [feedback, setFeedback] = useState('')

  const handleConnect = (integration: Integration) => {
    setFeedback(
      `${integration.name} integration will be available after backend OAuth integration is implemented.`,
    )
  }

  return (
    <SettingsSection
      title="Integrations"
      description="Connect the tools that will help bring your career workflow together."
      icon={PlugZap}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.name}
            integration={integration}
            onConnect={() => handleConnect(integration)}
          />
        ))}
      </div>
      {feedback ? <SettingsFeedback message={feedback} tone="info" /> : null}
    </SettingsSection>
  )
}
