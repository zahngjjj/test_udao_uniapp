/**
 * 显示消息提示框
 * @param content 提示的标题
 */
export function  toast(content){
    uni.showToast({
        title: content,
        icon: 'none',
    })
}

/**
 * 显示模态弹窗
 * @param content 提示的标题
 */
export function showConfirm(content) {
    return new Promise((resolve, reject) => {
        uni.showModal({
            title: '提示',
            content: content,
            cancelText: '取消',
            confirmText: '确定',
            success: function(res) {
                resolve(res)
            }
        })
    })
}

/**
 * 显示加载提示框
 * @param content
 */
export function showLoading(content) {
    uni.showLoading({
        title: content,
        icon: 'none'
    })
}

export function closeLoading() {
    uni.hideLoading()
}

/**
 * 参数处理
 * @param params 参数
 */
export function tansParams(params) {
    let result = ''
    for (const propName of Object.keys(params)) {
        const value = params[propName]
        var part = encodeURIComponent(propName) + "="
        if (value !== null && value !== "" && typeof (value) !== "undefined") {
            if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
                        let params = propName + '[' + key + ']'
                        var subPart = encodeURIComponent(params) + "="
                        result += subPart + encodeURIComponent(value[key]) + "&"
                    }
                }
            } else {
                result += part + encodeURIComponent(value) + "&"
            }
        }
    }
    return result
}


/**
 * 时间格式化函数
 * @param {number|string} timestamp 时间戳或时间字符串
 * @param {string} format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!timestamp) return ''
    
    // 判断是否为时间戳（数字格式）
    let date
    if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
        // 如果是13位时间戳，直接使用；如果是10位，需要乘以1000
        const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
        date = new Date(parseInt(ts))
    } else if (typeof timestamp === 'string') {
        // 如果已经是格式化的时间字符串，直接返回
        if (timestamp.includes('-') || timestamp.includes('/')) {
            return timestamp
        }
        // 如果是字符串格式的时间戳
        const ts = timestamp.length === 10 ? timestamp * 1000 : timestamp
        date = new Date(parseInt(ts))
    } else {
        return timestamp
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return timestamp
    }
    
    // 格式化处理
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    // 根据format参数返回不同格式
    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`
        case 'HH:mm:ss':
            return `${hours}:${minutes}:${seconds}`
        case 'YYYY/MM/DD HH:mm':
            return `${year}/${month}/${day} ${hours}:${minutes}`
        default:
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
}

/**
 * 获取相对时间（如：刚刚、5分钟前、1小时前等）
 * @param {number|string} timestamp 时间戳
 * @returns {string} 相对时间字符串
 */
export function getRelativeTime(timestamp) {
    if (!timestamp) return ''
    
    const now = new Date().getTime()
    const ts = typeof timestamp === 'string' && timestamp.length === 10 
        ? timestamp * 1000 
        : parseInt(timestamp)
    
    const diff = now - ts
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    
    if (diff < minute) {
        return '刚刚'
    } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`
    } else if (diff < 7 * day) {
        return `${Math.floor(diff / day)}天前`
    } else {
        return formatTime(timestamp, 'YYYY-MM-DD')
    }
}