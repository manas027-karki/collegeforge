import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'

interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})

  const isEmailValid = /.+@.+\..+/.test(email)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}
    if (!name.trim()) nextErrors.name = 'Name is required'
    if (!email.trim()) nextErrors.email = 'Email is required'
    else if (!isEmailValid) nextErrors.email = 'Enter a valid email address'
    if (!password) nextErrors.password = 'Password is required'
    else if (password.length < 6)
      nextErrors.password = 'Password must be at least 6 characters'
    if (confirmPassword !== password)
      nextErrors.confirmPassword = 'Passwords do not match'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    navigate('/dashboard')
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgba(16,24,40,0.05)]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Start tracking your DSA, applications and projects in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TextField
          label="Name"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          error={errors.name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Login
        </Link>
      </p>
    </div>
  )
}