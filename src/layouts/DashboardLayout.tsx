import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { useAppStore } from '../store/useAppStore'

export function DashboardLayout() {
  const { pathname } = useLocation()
  const closeSidebar = useAppStore((s) => s.closeSidebar)

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}