import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { TextField } from '../TextField'
import { SettingsFeedback, SettingsModal, SettingsSection } from './SettingsSection'

type AccountModal = 'email' | 'password' | null

type EmailFormState = {
  currentEmail: string
  newEmail: string
  confirmEmail: string
}

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type EmailFormErrors = Partial<Record<keyof EmailFormState, string>>
type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>>

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function AccountSettings() {
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const [activeModal, setActiveModal] = useState<AccountModal>(null)
  const [emailValues, setEmailValues] = useState<EmailFormState>({
    currentEmail: profile.email,
    newEmail: '',
    confirmEmail: '',
  })
  const [passwordValues, setPasswordValues] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [emailErrors, setEmailErrors] = useState<EmailFormErrors>({})
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({})
  const [feedback, setFeedback] = useState('')

  const openEmailModal = () => {
    setEmailErrors({})
    setFeedback('')
    setEmailValues({ currentEmail: profile.email, newEmail: '', confirmEmail: '' })
    setActiveModal('email')
  }

  const openPasswordModal = () => {
    setPasswordErrors({})
    setFeedback('')
    setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setActiveModal('password')
  }

  const closeModal = () => {
    setActiveModal(null)
    setEmailErrors({})
    setPasswordErrors({})
  }

  const updateEmailField = (field: keyof EmailFormState, value: string) => {
    setEmailValues((current) => ({ ...current, [field]: value }))
    if (emailErrors[field]) {
      setEmailErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const updatePasswordField = (field: keyof PasswordFormState, value: string) => {
    setPasswordValues((current) => ({ ...current, [field]: value }))
    if (passwordErrors[field]) {
      setPasswordErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: EmailFormErrors = {}
    const currentEmail = emailValues.currentEmail.trim()
    const newEmail = emailValues.newEmail.trim()
    const confirmEmail = emailValues.confirmEmail.trim()

    if (!currentEmail) {
      nextErrors.currentEmail = 'Current email is required.'
    }
    if (!newEmail) {
      nextErrors.newEmail = 'New email is required.'
    } else if (!isValidEmail(newEmail)) {
      nextErrors.newEmail = 'Enter a valid email address.'
    }
    if (!confirmEmail) {
      nextErrors.confirmEmail = 'Confirm your new email.'
    } else if (confirmEmail !== newEmail) {
      nextErrors.confirmEmail = 'Email addresses do not match.'
    }

    setEmailErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    updateProfile({ email: newEmail })
    closeModal()
    setFeedback('Email updated in frontend state.')
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: PasswordFormErrors = {}
    const newPassword = passwordValues.newPassword

    if (!passwordValues.currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required.'
    }
    if (!newPassword) {
      nextErrors.newPassword = 'New password is required.'
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = 'Use at least 8 characters.'
    }
    if (!passwordValues.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.'
    } else if (passwordValues.confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setPasswordErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    closeModal()
    setFeedback('Password changes will be enabled after authentication is connected.')
  }

  return (
    <SettingsSection
      title="Account"
      description="Manage the account details used by your CareerForge workspace."
      icon={ShieldCheck}
    >
      <div className="space-y-4">
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Mail aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900">Email</h2>
              <p className="mt-1 break-words text-sm text-neutral-500">{profile.email}</p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={openEmailModal}>
            Change Email
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <KeyRound aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900">Password</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Password management will be available when authentication is connected.
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={openPasswordModal}>
            Change Password
          </Button>
        </Card>

        {feedback ? <SettingsFeedback message={feedback} /> : null}
      </div>

      {activeModal === 'email' ? (
        <SettingsModal
          title="Change email"
          description="Update the email address associated with this frontend demo."
          onClose={closeModal}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" form="change-email-form">
                Save Email
              </Button>
            </>
          }
        >
          <form id="change-email-form" onSubmit={handleEmailSubmit} noValidate className="space-y-4">
            <TextField
              label="Current Email"
              type="email"
              value={emailValues.currentEmail}
              onChange={(event) => updateEmailField('currentEmail', event.target.value)}
              autoComplete="email"
              error={emailErrors.currentEmail}
            />
            <TextField
              label="New Email"
              type="email"
              value={emailValues.newEmail}
              onChange={(event) => updateEmailField('newEmail', event.target.value)}
              autoComplete="email"
              error={emailErrors.newEmail}
            />
            <TextField
              label="Confirm New Email"
              type="email"
              value={emailValues.confirmEmail}
              onChange={(event) => updateEmailField('confirmEmail', event.target.value)}
              autoComplete="email"
              error={emailErrors.confirmEmail}
            />
          </form>
        </SettingsModal>
      ) : null}

      {activeModal === 'password' ? (
        <SettingsModal
          title="Change password"
          description="This form is visual only until authentication is connected."
          onClose={closeModal}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" form="change-password-form">
                Update Password
              </Button>
            </>
          }
        >
          <form
            id="change-password-form"
            onSubmit={handlePasswordSubmit}
            noValidate
            className="space-y-4"
          >
            <TextField
              label="Current Password"
              type="password"
              value={passwordValues.currentPassword}
              onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
              autoComplete="current-password"
              error={passwordErrors.currentPassword}
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordValues.newPassword}
              onChange={(event) => updatePasswordField('newPassword', event.target.value)}
              autoComplete="new-password"
              hint="At least 8 characters"
              error={passwordErrors.newPassword}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordValues.confirmPassword}
              onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
              autoComplete="new-password"
              error={passwordErrors.confirmPassword}
            />
          </form>
        </SettingsModal>
      ) : null}
    </SettingsSection>
  )
}
