import { LoaderCircle, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { Card } from '../Card'
import { TextField } from '../TextField'
import { AuthMessage } from './AuthMessage'
import { PasswordInput } from './PasswordInput'

interface RegisterErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

type PasswordStrength = 'weak' | 'medium' | 'strong'

type LegalDocument = 'terms' | 'privacy'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const strengthConfig: Record<PasswordStrength, { label: string; bar: string; text: string }> = {
  weak: { label: 'Weak', bar: 'bg-rose-500', text: 'text-rose-600' },
  medium: { label: 'Medium', bar: 'bg-amber-500', text: 'text-amber-600' },
  strong: { label: 'Strong', bar: 'bg-emerald-500', text: 'text-emerald-600' },
}

function waitForMockRequest(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (password.length >= 10 && hasUpper && hasLower && hasNumber && hasSpecial) {
    return 'strong'
  }

  if (hasLower && (hasNumber || hasSpecial)) return 'medium'

  return 'weak'
}

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMockUser = useAppStore((state) => state.registerMockUser)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null)

  const strength = strengthConfig[getPasswordStrength(password)]
  const strengthLevel = getPasswordStrength(password)

  function updateError(field: keyof RegisterErrors, value: string | undefined) {
    setErrors((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}
    const normalizedName = fullName.trim()
    const normalizedEmail = email.trim()

    if (!normalizedName) {
      nextErrors.fullName = 'Please enter your full name.'
    } else if (normalizedName.length < 2) {
      nextErrors.fullName = 'Full name must contain at least 2 characters.'
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must contain at least 8 characters.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!acceptedTerms) {
      nextErrors.terms = 'Please accept the Terms of Service and Privacy Policy.'
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    void waitForMockRequest(650).then(() => {
      registerMockUser({ fullName: normalizedName, email: normalizedEmail })
      setIsSubmitting(false)
      navigate('/dashboard')
    })
  }

  return (
    <Card className="p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
          CareerForge account
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
          Create your CareerForge account
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Start tracking your career journey today.
        </p>
      </div>

      <AuthMessage type="info" className="mt-6">
        Demo authentication is currently enabled.
      </AuthMessage>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate aria-busy={isSubmitting}>
        <TextField
          label="Full Name"
          autoComplete="name"
          placeholder="Your full name"
          value={fullName}
          error={errors.fullName}
          disabled={isSubmitting}
          onChange={(event) => {
            setFullName(event.target.value)
            updateError('fullName', undefined)
          }}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          disabled={isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value)
            updateError('email', undefined)
          }}
        />

        <div>
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            error={errors.password}
            disabled={isSubmitting}
            onChange={(event) => {
              setPassword(event.target.value)
              updateError('password', undefined)
            }}
          />
          <div className="mt-2.5" aria-label="Password strength">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Password strength</span>
              <span className={strength.text}>{strength.label}</span>
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-1" aria-hidden="true">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-1.5 rounded-full ${
                    level <= (strengthLevel === 'weak' ? 1 : strengthLevel === 'medium' ? 2 : 3)
                      ? strength.bar
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              Use at least 8 characters. Add mixed characters for a stronger password.
            </p>
          </div>
        </div>

        <PasswordInput
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          error={errors.confirmPassword}
          disabled={isSubmitting}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            updateError('confirmPassword', undefined)
          }}
        />

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptedTerms}
              disabled={isSubmitting}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked)
                updateError('terms', undefined)
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="text-sm leading-5 text-neutral-600">
              <label htmlFor="accept-terms">I agree to the </label>
              <button
                type="button"
                onClick={() => setLegalDocument('terms')}
                className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Terms of Service
              </button>
              <span> and </span>
              <button
                type="button"
                onClick={() => setLegalDocument('privacy')}
                className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          {errors.terms ? (
            <p role="alert" className="mt-1.5 text-xs text-rose-600">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {legalDocument ? (
        <section
          className="mt-5 rounded-xl border border-primary-100 bg-primary-50/60 p-4"
          role="dialog"
          aria-labelledby="legal-document-title"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="legal-document-title" className="text-sm font-semibold text-neutral-900">
              {legalDocument === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
            <button
              type="button"
              onClick={() => setLegalDocument(null)}
              autoFocus
              aria-label={`Close ${legalDocument === 'terms' ? 'Terms of Service' : 'Privacy Policy'}`}
              className="rounded-md p-1 text-neutral-400 hover:bg-white hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <AuthMessage type="info" className="mt-3">
            CareerForge legal documents will be added before production deployment.
          </AuthMessage>
        </section>
      ) : null}

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
