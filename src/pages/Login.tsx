import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { GitHubIcon } from '../components/GitHubIcon'
import { TextField } from '../components/TextField'

interface LoginErrors {
  email?: string
  password?: string
}

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})

  const isEmailValid = /.+@.+\..+/.test(email)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: LoginErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required'
    else if (!isEmailValid) nextErrors.email = 'Enter a valid email address'
    if (!password) nextErrors.password = 'Password is required'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    navigate('/dashboard')
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgba(16,24,40,0.05)]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in to continue your career journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" className="w-full">
          Login
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-400">or</span>
        <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
      </div>

      <Button type="button" variant="secondary" size="lg" className="w-full">
        <GitHubIcon className="h-4 w-4" />
        Continue with GitHub
      </Button>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New to CareerForge?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Create account
        </Link>
      </p>
    </div>
  )
}