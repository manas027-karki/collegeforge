import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { getPageTitle } from '../config/navigation'
import { useAppStore } from '../store/useAppStore'
import { Avatar } from './Avatar'
import { NotificationsMenu } from './NotificationsMenu'

export function Topbar() {
  const { pathname } = useLocation()
  const openSidebar = useAppStore((s) => s.openSidebar)
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={openSidebar}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      <h1 className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsMenu />
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />
        <span className="lg:hidden">
          <Avatar label="Manas Kumar" />
        </span>
      </div>
    </header>
  )
}