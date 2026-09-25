import { RotateCcw, ShieldAlert, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { SettingsFeedback, SettingsModal, SettingsSection } from './SettingsSection'

type DangerModal = 'reset' | 'delete' | null

const accountDeletionMessage =
  'Account deletion will be available after backend authentication and database integration.'

export function DangerZone() {
  const resetDemoData = useAppStore((state) => state.resetDemoData)
  const [activeModal, setActiveModal] = useState<DangerModal>(null)
  const [feedback, setFeedback] = useState('')

  const openResetModal = () => {
    setFeedback('')
    setActiveModal('reset')
  }

  const openDeleteModal = () => {
    setFeedback('')
    setActiveModal('delete')
  }

  const closeModal = () => setActiveModal(null)

  const handleReset = () => {
    resetDemoData()
    closeModal()
    setFeedback('Demo data reset successfully.')
  }

  const handleDelete = () => {
    closeModal()
    setFeedback(accountDeletionMessage)
  }

  return (
    <SettingsSection
      title="Danger Zone"
      description="These actions affect the frontend demo only."
      icon={ShieldAlert}
    >
      <div className="space-y-4">
        <Card className="border-rose-200 bg-rose-50/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <RotateCcw aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-neutral-900">Reset Demo Data</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Restore the seeded applications, projects, DSA progress, study tasks and other
                  frontend demo records.
                </p>
              </div>
            </div>
            <Button type="button" variant="danger" onClick={openResetModal}>
              Reset Demo Data
            </Button>
          </div>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <Trash2 aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-neutral-900">Delete Account</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Account deletion is not available in this frontend-only build.
                </p>
              </div>
            </div>
            <Button type="button" variant="danger" onClick={openDeleteModal}>
              Delete Account
            </Button>
          </div>
        </Card>

        {feedback ? <SettingsFeedback message={feedback} tone="warning" /> : null}
      </div>

      {activeModal === 'reset' ? (
        <SettingsModal
          title="Reset all CareerForge demo data?"
          onClose={closeModal}
          tone="danger"
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleReset}>
                Reset Demo Data
              </Button>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </span>
            <p className="text-sm leading-6 text-neutral-600">
              This will remove your current mock applications, projects, DSA progress, study tasks
              and other frontend demo data. This action cannot be undone.
            </p>
          </div>
        </SettingsModal>
      ) : null}

      {activeModal === 'delete' ? (
        <SettingsModal
          title="Delete account"
          onClose={closeModal}
          tone="danger"
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete}>
                I Understand
              </Button>
            </>
          }
        >
          <p className="text-sm leading-6 text-neutral-600">{accountDeletionMessage}</p>
        </SettingsModal>
      ) : null}
    </SettingsSection>
  )
}
