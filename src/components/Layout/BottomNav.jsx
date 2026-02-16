import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, TrendingUp, TrendingDown, Tag, Wallet,
    Target, Repeat, PiggyBank, BarChart3
} from 'lucide-react'
import './BottomNav.css'

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/income', icon: TrendingUp, label: 'Thu nhập' },
    { path: '/expense', icon: TrendingDown, label: 'Chi tiêu' },
    { path: '/budget', icon: Target, label: 'Ngân sách' },
    { path: '/savings', icon: PiggyBank, label: 'Tiết kiệm' },
]

export default function BottomNav() {
    const location = useLocation()

    return (
        <nav className="bottom-nav">
            {menuItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
                    }
                    end={item.path === '/'}
                >
                    <item.icon size={20} />
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

