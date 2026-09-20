import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

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

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}