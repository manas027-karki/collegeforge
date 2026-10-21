import { LoaderCircle, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { UserProfile } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { TextField } from '../TextField'
import { SettingsFeedback, SettingsSection } from './SettingsSection'

type ProfileFormState = {
  fullName: string
  email: string
  phone: string
  college: string
  degree: string
  graduationYear: string
  bio: string
}

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>

const COMPLETION_FIELDS: Array<keyof ProfileFormState> = [
  'fullName',
  'email',
  'college',
  'degree',
  'graduationYear',
  'bio',
]

function profileToForm(profile: UserProfile): ProfileFormState {
  return {
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone ?? '',
    college: profile.college ?? '',
    degree: profile.degree ?? '',
    graduationYear: profile.graduationYear ?? '',
    bio: profile.bio ?? '',
  }
}

function validateProfile(values: ProfileFormState): ProfileFormErrors {
  const errors: ProfileFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.graduationYear.trim()) {
    const graduationYear = Number(values.graduationYear.trim())
    if (
      !/^\d{4}$/.test(values.graduationYear.trim()) ||
      !Number.isInteger(graduationYear) ||
      graduationYear < 1900
    ) {
      errors.graduationYear = 'Enter a valid four-digit graduation year.'
    }
  }

  return errors
}

interface ProfileFormProps {
  profile: UserProfile
  pending: boolean
  error: string | null
  onSubmit: (values: ProfileFormState) => Promise<void>
}

function ProfileForm({ profile, pending, error, onSubmit }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormState>(() => profileToForm(profile))
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [feedback, setFeedback] = useState('')

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFeedback('')
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProfile(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setFeedback('')
      return
    }

    const nextValues: ProfileFormState = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      college: values.college.trim(),
      degree: values.degree.trim(),
      graduationYear: values.graduationYear.trim(),
      bio: values.bio.trim(),
    }

    try {
      await onSubmit(nextValues)
      setValues(nextValues)
      setFeedback('Profile updated successfully.')
    } catch {
      // The store already recorded the reason; it is rendered below.
    }
  }

  const handleCancel = () => {
    setValues(profileToForm(profile))
    setErrors({})
    setFeedback('')
  }

  const filledFields = COMPLETION_FIELDS.filter((field) => values[field].trim().length > 0).length
  const completion = Math.round((filledFields / COMPLETION_FIELDS.length) * 100)

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900">
              Personal information
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Saved to your CareerForge account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Full Name"
              value={values.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              autoComplete="name"
              error={errors.fullName}
            />
            <TextField
              label="Email"
              type="email"
              value={values.email}
              readOnly
              autoComplete="email"
              error={errors.email}
              hint="Your sign-in address cannot be changed here."
              className="opacity-70"
            />
            <TextField
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              autoComplete="tel"
              hint="Optional"
            />
            <TextField
              label="Graduation Year"
              value={values.graduationYear}
              onChange={(event) => updateField('graduationYear', event.target.value)}
              inputMode="numeric"
              placeholder="YYYY"
              hint="Optional"
              error={errors.graduationYear}
            />
            <TextField
              label="College"
              value={values.college}
              onChange={(event) => updateField('college', event.target.value)}
              error={errors.college}
            />
            <TextField
              label="Degree"
              value={values.degree}
              onChange={(event) => updateField('degree', event.target.value)}
              error={errors.degree}
            />
          </div>

          <div>
            <label
              htmlFor="profile-bio"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={4}
              value={values.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              maxLength={240}
              placeholder="Tell us a little about your goals and interests."
              className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              Optional · {values.bio.length}/240 characters
            </p>
          </div>

          {feedback ? <SettingsFeedback message={feedback} /> : null}
          {error ? <SettingsFeedback message={error} tone="error" /> : null}

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="h-fit p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Profile Completion</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Complete your profile to improve your CareerForge experience.
            </p>
          </div>
          <span className="text-2xl font-semibold tracking-tight text-primary-600">
            {completion}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Profile completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completion}
          className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-[width] duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          {filledFields} of {COMPLETION_FIELDS.length} recommended fields completed
        </p>
      </Card>
    </div>
  )
}

export function ProfileSettings() {
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const fetchProfile = useAppStore((state) => state.fetchProfile)
  const profilePending = useAppStore((state) => state.profilePending)
  const profileError = useAppStore((state) => state.profileError)
  const profileLoaded = useAppStore((state) => state.profileLoaded)
  const profileVersion = useAppStore((state) => state.profileVersion)

  // Reload from the API when the page opens, so the form shows what is
  // actually stored rather than whatever happened to be in local state.
  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  return (
    <SettingsSection
      title="Profile"
      description="Keep your personal and academic details up to date."
      icon={UserRound}
    >
      {profileLoaded ? (
        <ProfileForm
          // Remount the form when the profile is reloaded from the API, so the
          // fields reflect the server rather than a stale local copy. A save
          // does not change this key, so the confirmation survives.
          key={profileVersion}
          profile={profile}
          pending={profilePending}
          error={profileError}
          onSubmit={updateProfile}
        />
      ) : (
        <Card className="flex items-center gap-3 p-8 text-sm text-neutral-500">
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-primary-600" />
          Loading your profile...
        </Card>
      )}
    </SettingsSection>
  )
}
