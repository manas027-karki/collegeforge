import { LoaderCircle, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { Card } from '../Card'
import { TextField } from '../TextField'
import { useAppStore } from '../../store/useAppStore'
import { AuthDivider } from './AuthDivider'
import { AuthMessage } from './AuthMessage'
import { PasswordInput } from './PasswordInput'
import { SocialLoginButton } from './SocialLoginButton'

interface LoginErrors {
  email?: string
  password?: string
}

interface LoginMessage {
  type: 'error' | 'info'
  text: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function waitForMockRequest(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

export function LoginForm() {
  const navigate = useNavigate()
  const loginMockUser = useAppStore((state) => state.loginMockUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [message, setMessage] = useState<LoginMessage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')

  function handleEmailChange(value: string) {
    setEmail(value)
    setErrors((current) => ({ ...current, email: undefined }))
    setMessage(null)
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setErrors((current) => ({ ...current, password: undefined }))
    setMessage(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const nextErrors: LoginErrors = {}
    if (!email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must contain at least 8 characters.'
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    void waitForMockRequest(650).then(() => {
      loginMockUser(email)
      setIsSubmitting(false)
      navigate('/dashboard')
    })
  }

  function openForgotPassword() {
    setForgotEmail(email)
    setForgotError('')
    setForgotMessage('')
    setForgotOpen(true)
  }

  function handleForgotPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setForgotMessage('')

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.')
      return
    }

    if (!emailPattern.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.')
      return
    }

    setForgotError('')
    setForgotMessage('Password reset will be available after backend authentication is implemented.')
  }

  function handleSocialLogin() {
    setMessage({
      type: 'info',
      text: 'GitHub authentication will be enabled after backend OAuth integration.',
    })
  }

  return (
    <Card className="p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
          CareerForge account
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-neutral-500">Sign in to continue to CareerForge.</p>
      </div>

      <AuthMessage type="info" className="mt-6">
        Demo authentication is currently enabled.
      </AuthMessage>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate aria-busy={isSubmitting}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          disabled={isSubmitting}
          onChange={(event) => handleEmailChange(event.target.value)}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          error={errors.password}
          disabled={isSubmitting}
          onChange={(event) => handlePasswordChange(event.target.value)}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={openForgotPassword}
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Forgot password?
          </button>
        </div>

        {message ? <AuthMessage type={message.type}>{message.text}</AuthMessage> : null}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <AuthDivider />

      <SocialLoginButton onClick={handleSocialLogin} disabled={isSubmitting} />

      {forgotOpen ? (
        <section className="mt-5 rounded-xl border border-primary-100 bg-primary-50/60 p-4" aria-labelledby="reset-password-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="reset-password-title" className="text-sm font-semibold text-neutral-900">
                Reset your password
              </h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Enter the email associated with your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              aria-label="Close reset password"
              className="rounded-md p-1 text-neutral-400 hover:bg-white hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-3" noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={forgotEmail}
              error={forgotError}
              autoFocus
              onChange={(event) => {
                setForgotEmail(event.target.value)
                setForgotError('')
              }}
            />
            <Button type="submit" size="sm" className="w-full">
              Send Reset Link
            </Button>
          </form>

          {forgotMessage ? <AuthMessage type="info" className="mt-3">{forgotMessage}</AuthMessage> : null}
        </section>
      ) : null}

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>
    </Card>
  )
}
