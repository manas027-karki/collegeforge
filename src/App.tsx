import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthLayout } from './components/auth/AuthLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/ProtectedRoute'
import { ThemeApplier } from './components/ThemeApplier'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Analytics } from './pages/Analytics'
import { Applications } from './pages/Applications'
import { DSA } from './pages/DSA'
import { Dashboard } from './pages/Dashboard'
import { Jobs } from './pages/Jobs'
import { Login } from './pages/Login'
import { Projects } from './pages/Projects'
import { Register } from './pages/Register'
import { Resume } from './pages/Resume'
import { Settings } from './pages/Settings'
import { StudyPlanner } from './pages/StudyPlanner'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const bootstrapSession = useAppStore((state) => state.bootstrapSession)

  // Verify the session cookie once, before any guard makes a routing
  // decision. The cookie is httpOnly, so the app cannot read it directly and
  // has to ask the API whether the visitor is signed in.
  useEffect(() => {
    void bootstrapSession()
  }, [bootstrapSession])

  return (
    <BrowserRouter>
      <ThemeApplier />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/study" element={<StudyPlanner />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
