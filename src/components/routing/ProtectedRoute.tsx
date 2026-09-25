import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppStore } from '../../store/useAppStore'

interface AuthRouteProps {
  children?: ReactNode
}

export function ProtectedRoute({ children }: AuthRouteProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export function PublicOnlyRoute({ children }: AuthRouteProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
