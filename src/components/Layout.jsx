import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Icon from './Icon'

const NAV = [
  { to: '/bookings', label: 'Брони', icon: 'calendar' },
  { to: '/stats', label: 'Статистика', icon: 'chart' },
  { to: '/chats', label: 'Чаты', icon: 'chat' },
  { to: '/settings', label: 'Настройки', icon: 'settings' },
]

const TITLES = {
  '/bookings': 'Менеджмент броней',
  '/stats': 'Статистика продаж',
  '/chats': 'История чатов',
  '/settings': 'Настройки',
}

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full">
      <aside className="w-60 shrink-0 bg-surface-1 border-r border-line flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="wordmark text-lg text-fg">Beibarys</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-surface-2 text-fg'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={n.icon}
                    className={`w-[18px] h-[18px] ${isActive ? 'text-gold' : ''}`}
                  />
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <button onClick={onLogout} className="btn-ghost w-full justify-start">
            <Icon name="logout" />
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center px-8 border-b border-line bg-surface-0/80 backdrop-blur">
          <h1 className="text-base font-semibold text-fg">{TITLES[pathname] || ''}</h1>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
