import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="btn-icon btn-ghost" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal__body">{children}</div>
                {footer && <div className="modal__footer">{footer}</div>}
            </div>
        </div>
    )
}
