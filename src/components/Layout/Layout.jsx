import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon, Monitor } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import './Layout.css'

const pageTitles = {
    '/': 'Tổng quan',
    '/transactions': 'Giao dịch',
    '/categories': 'Danh mục',
    '/search': 'Tìm kiếm',
    '/backup': 'Backup / Restore',
}

export default function Layout({ onExportData, onImportData, notifications = [] }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [notifOpen, setNotifOpen] = useState(false)
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const location = useLocation()

    const title = pageTitles[location.pathname] || 'FinTrack'
    const hasNotifications = Array.isArray(notifications) && notifications.length > 0

    useEffect(() => {
        setNotifOpen(false)
        if (location.pathname !== '/search') {
            setSearchValue('')
            return
        }
        const params = new URLSearchParams(location.search || '')
        setSearchValue(params.get('q') || '')
    }, [location.pathname, location.search])

    const goSearch = () => {
        const q = (searchValue || '').trim()
        if (!q) return navigate('/search')
        navigate(`/search?q=${encodeURIComponent(q)}`)
    }

    const handleLogout = () => {
        if (confirm('Đăng xuất khỏi tài khoản hiện tại?')) {
            logout()
            navigate('/login', { replace: true })
        }
    }

    const goToAccount = () => {
        navigate('/account')
    }

    const goToBackup = () => {
        navigate('/backup')
    }

    return (
        <div className={`layout ${collapsed ? 'layout--collapsed' : ''}`}>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="layout__overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <Sidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggle={() => setCollapsed(!collapsed)}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="layout__main">
                <header className="layout__header">
                    <div className="layout__header-left">
                        <button
                            className="layout__menu-btn btn-icon btn-ghost"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="layout__title">{title}</h1>
                    </div>
                    <div className="layout__header-right">
                        <div className="layout__search">
                            <Search size={16} className="layout__search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="layout__search-input"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') goSearch()
                                }}
                            />
                        </div>
                        <button
                            className="btn-icon btn-ghost layout__theme-toggle"
                            onClick={toggleTheme}
                            title={`Theme: ${theme === 'system' ? 'Hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}`}
                        >
                            {theme === 'system' ? (
                                <Monitor size={18} />
                            ) : theme === 'dark' ? (
                                <Moon size={18} />
                            ) : (
                                <Sun size={18} />
                            )}
                        </button>
                        {onExportData && (
                            <button className="btn btn-secondary btn-sm" onClick={goToBackup}>
                                Backup
                            </button>
                        )}
                        <div className="layout__notif">
                            <button
                                className="btn-icon btn-ghost layout__notif-btn"
                                onClick={() => hasNotifications && setNotifOpen(o => !o)}
                                title={hasNotifications ? 'Thông báo' : 'Không có thông báo'}
                                disabled={!hasNotifications}
                            >
                                <Bell size={18} />
                                {hasNotifications && <span className="layout__notif-dot"></span>}
                            </button>
                            {notifOpen && hasNotifications && (
                                <div className="layout__notif-panel">
                                    <div className="layout__notif-header">
                                        <span>Thông báo</span>
                                        <span className="layout__notif-count">{notifications.length}</span>
                                    </div>
                                    <div className="layout__notif-list">
                                        {notifications.map((n) => (
                                            <button
                                                key={n.id}
                                                className={`layout__notif-item layout__notif-item--${n.type || 'default'}`}
                                                onClick={() => {
                                                    setNotifOpen(false)
                                                    if (n.href) {
                                                        navigate(n.href)
                                                    }
                                                }}
                                            >
                                                <div className="layout__notif-item-title">{n.title}</div>
                                                <div className="layout__notif-item-msg">{n.message}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            className="layout__avatar"
                            onClick={goToAccount}
                            title={user ? `Tài khoản (${user.name || user.email})` : 'Tài khoản'}
                        >
                            <span>
                                {(user?.name || user?.email || 'U')[0].toUpperCase()}
                            </span>
                        </button>
                    </div>
                </header>

                <main className="layout__content">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    )
}
