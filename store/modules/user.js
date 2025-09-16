import {defineStore} from 'pinia'
import store from '../index' // 引入pinia实例 store
import storage from '@/utils/storage'
import constant from "@/utils/constant";
import {login, logout, getInfo} from '@/api/login'
import {setToken, removeToken} from "@/utils/auth";

export const user = defineStore({
    id: 'user',
    //定义状态
    state: () => ({
        id: 0, // 用户编号
        name: storage.get(constant.name),
        avatar: storage.get(constant.avatar),
        roles: storage.get(constant.roles),
        permissions: storage.get(constant.permissions)
    }),
    //定义getter
    getters: {
        // 是否登录
        getAvatar() {
            return this.avatar
        },
        getName() {
            return this.name
        }
    },
    actions: {
        async SET_ID(id) {
            this.id = id
        },
        async SET_NAME(name) {
            this.name = name
            storage.set(constant.name, name)
        },
        async SET_AVATAR(avatar) {
            this.avatar = avatar
            storage.set(constant.avatar, avatar)
        },
        async SET_ROLES(roles) {
            this.roles = roles
            storage.set(constant.roles, roles)
        },
        async SET_PERMISSIONS(permissions) {
            this.permissions = permissions
            storage.set(constant.permissions, permissions)
        },
        // 登录
        async Login(userInfo) {
            const username = userInfo.username.trim()
            const password = userInfo.password
            const captchaVerification = userInfo.captchaVerification

            return new Promise((resolve, reject) => {
                login(username, password, captchaVerification).then(res => {
                    setToken(res.data)
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 获取用户信息
        async GetInfo() {
            return new Promise((resolve, reject) => {
                getInfo().then(res => {
                    res = res.data; // 读取 data 数据
                    const user = res.user
                    const avatar = (user == null || user.avatar === "" || user.avatar == null) ? require("@/static/images/profile.jpg") : user.avatar
                    const nickname = (user == null || user.nickname === "" || user.nickname == null) ? "" : user.nickname
                    if (res.roles && res.roles.length > 0) {
                        this.SET_ROLES(res.roles)
                        this.SET_ROLES(res.permissions)
                    } else {
                        this.SET_ROLES(['ROLE_DEFAULT'])
                    }
                    this.SET_NAME(nickname)
                    this.SET_AVATAR(avatar)
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 退出系统
        async LogOut() {
            return new Promise((resolve, reject) => {
                logout().then(() => {
                    this.SET_ROLES([])
                    this.SET_PERMISSIONS([])
                    removeToken()
                    storage.clean()
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
})

// 无需使用pinia的组件中使用
export function useUserStore() {
    return user(store)
}