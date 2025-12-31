import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Eye } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/viewer', label: 'Viewer', icon: Eye },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--binance-yellow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            💰 Family Payment Tracker
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--binance-yellow)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(240, 185, 11, 0.1)' : 'transparent',
                    border: isActive ? '1px solid var(--binance-yellow)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    fontWeight: isActive ? '600' : '500',
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <main style={{
        flex: 1,
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </main>
    </div>
  )
}








