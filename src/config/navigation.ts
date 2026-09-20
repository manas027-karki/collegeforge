import {
  BarChart3,
  Binary,
  Briefcase,
  CalendarCheck,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/applications', label: 'Applications', icon: Inbox },
  { path: '/dsa', label: 'DSA Tracker', icon: Binary },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/study', label: 'Study Planner', icon: CalendarCheck },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export const footerNavItems: NavItem[] = [
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function getPageTitle(pathname: string): string {
  const all = [...navItems, ...footerNavItems]
  return (
    all.find((item) => item.path === pathname)?.label ?? 'Dashboard'
  )
}