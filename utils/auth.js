const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'

// ========== Token 相关 ==========


// 获取 Token
export function getAccessToken() {
    return uni.getStorageSync(AccessTokenKey)
}

// 获取 RefreshToken
export function getRefreshToken() {
    return uni.getStorageSync(RefreshTokenKey)
}

// 设置 Token
export function setToken(token) {
    uni.setStorageSync(AccessTokenKey, token.accessToken)
    uni.setStorageSync(RefreshTokenKey, token.refreshToken)
}

// 移除 Token
export function removeToken() {
    uni.removeStorageSync(AccessTokenKey)
    uni.removeStorageSync(RefreshTokenKey)
}
