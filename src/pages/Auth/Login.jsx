import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './Auth.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu')
            return
        }
        try {
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 400))
            login(email.trim(), password)
            navigate('/', { replace: true })
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth">
            <div className="auth__card animate-fade-in-up">
                <div className="auth__logo">
                    <div className="auth__logo-icon">₫</div>
                    <div className="auth__logo-text">
                        <span>FinTrack</span>
                        <span className="auth__logo-sub">Quản lý thu chi cá nhân</span>
                    </div>
                </div>

                <h1 className="auth__title">Đăng nhập</h1>
                <p className="auth__subtitle">
                    Theo dõi thu chi, danh mục và báo cáo chỉ trong vài cú click.
                </p>

                {error && <div className="auth__alert">{error}</div>}

                <form className="auth__form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="auth__input-wrap">
                            <Mail size={16} className="auth__input-icon" />
                            <input
                                type="email"
                                className="form-input auth__input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div className="auth__input-wrap">
                            <Lock size={16} className="auth__input-icon" />
                            <input
                                type="password"
                                className="form-input auth__input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth__submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="auth__footer-text">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="auth__link">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}


