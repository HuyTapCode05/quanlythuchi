import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './Auth.css'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!name || !email || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin')
            return
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp')
            return
        }
        try {
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 400))
            register(name.trim(), email.trim(), password)
            navigate('/', { replace: true })
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại')
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
                        <span className="auth__logo-sub">Bắt đầu quản lý tài chính của bạn</span>
                    </div>
                </div>

                <h1 className="auth__title">Tạo tài khoản</h1>
                <p className="auth__subtitle">
                    Lưu lại lịch sử thu chi, danh mục và các báo cáo trực quan.
                </p>

                {error && <div className="auth__alert">{error}</div>}

                <form className="auth__form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <div className="auth__input-wrap">
                            <User size={16} className="auth__input-icon" />
                            <input
                                type="text"
                                className="form-input auth__input"
                                placeholder="VD: Huy"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                    </div>

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
                                placeholder="Ít nhất 6 ký tự"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nhập lại mật khẩu</label>
                        <div className="auth__input-wrap">
                            <Lock size={16} className="auth__input-icon" />
                            <input
                                type="password"
                                className="form-input auth__input"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth__submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="auth__footer-text">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="auth__link">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}


