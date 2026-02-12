export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount)
}

export const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d)
}

export const formatDateShort = (dateStr) => {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit'
    }).format(d)
}

export const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(d)
}

export const getRelativeTime = (dateStr) => {
    const now = new Date()
    const d = new Date(dateStr)
    const diff = Math.floor((now - d) / 1000)

    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
    return formatDate(dateStr)
}

export const CHART_COLORS = [
    '#6c5ce7', '#00cec9', '#ff6b6b', '#ffa502', '#2ed573',
    '#a55eea', '#1e90ff', '#ff6348', '#00b894', '#fd79a8'
]
