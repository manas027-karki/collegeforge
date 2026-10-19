import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppStore } from '../../store/useAppStore'

interface AuthRouteProps {
  children?: ReactNode
}

/**
 * Shown while the session cookie is being verified.
 *
 * Without this, a signed-in visitor would be redirected to the login screen on
 * every refresh, because the cookie cannot be checked synchronously.
 */
function SessionLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-neutral-50"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-primary-600" />
        <p className="text-sm text-neutral-500">Restoring your session…</p>
      </div>
    </div>
  )
}

/**
 * Route guard for pages that need a signed-in user.
 *
 * The decision is driven by `authStatus`, not by a boolean in local storage:
 * the session lives in an httpOnly cookie, so the only way to know it is real
 * is to ask the API.
 */
export function ProtectedRoute({ children }: AuthRouteProps) {
  const authStatus = useAppStore((state) => state.authStatus)

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <SessionLoader />
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

/**
 * Route guard for pages that only make sense when signed out.
 *
 * Keeps a signed-in visitor from landing on the login form and being bounced
 * straight back to the dashboard.
 */
export function PublicOnlyRoute({ children }: AuthRouteProps) {
  const authStatus = useAppStore((state) => state.authStatus)

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <SessionLoader />
  }

  if (authStatus === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
