import { Outlet } from 'react-router-dom'
import { AuthBranding } from './AuthBranding'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] md:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)] lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <aside className="hidden border-r border-neutral-200 md:flex">
          <AuthBranding />
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-[480px]">
            <div className="md:hidden">
              <AuthBranding compact />
            </div>
            <Outlet />
            <p className="mt-6 text-center text-xs text-neutral-400">
              Demo authentication · No backend is connected
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
