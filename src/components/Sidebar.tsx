import { Hammer, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { footerNavItems, navItems } from '../config/navigation'
import { mockData } from '../data/mockData'
import { cn } from '../lib/cn'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from './Avatar'

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
        <Hammer aria-hidden="true" className="h-4.5 w-4.5" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
        CareerForge
      </span>
    </div>
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const profile = useAppStore((s) => s.profile)
  const closeSidebar = useAppStore((s) => s.closeSidebar)

  useEffect(() => {
    if (sidebarOpen) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    closeSidebar()
    navigate('/login')
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px] transition-opacity lg:hidden',
          sidebarOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        id="sidebar"
        aria-label="Primary navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-neutral-100 px-5">
          <Brand />
        </div>

        <nav aria-label="Sections" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                    )
                  }
                >
                  <item.icon
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0"
                  />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            General
          </p>
          <ul className="space-y-0.5">
            {footerNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                    )
                  }
                >
                  <item.icon
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0"
                  />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-neutral-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar label={profile.fullName} className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{profile.fullName}</p>
              <p className="truncate text-xs text-neutral-500">{mockData.user.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}