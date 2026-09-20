import { Hammer } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <Hammer aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            CareerForge
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="px-6 pb-6 text-center text-xs text-neutral-400">
        CareerForge · Career management for students
      </footer>
    </div>
  )
}