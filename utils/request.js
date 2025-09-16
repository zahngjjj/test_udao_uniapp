import config from '@/config'
import {getAccessToken} from "@/utils/auth";
import {tansParams} from "@/utils/common";
import {showConfirm, toast} from "./common";
import {useUserStore} from '@/store/modules/user.js'
import errorCode from '@/utils/errorCode'


let timeout = 10000
const baseUrl = config.baseUrl + config.baseApi;

const request = (config) => {
    // 是否要设置 token
    const isToken = (config.headers || {}).isToken === false
    config.header = config.header || {}
    if (getAccessToken() && !isToken) {
        config.header['Authorization'] = 'Bearer ' + getAccessToken()
    }
    //设置租户
    // todo 我暂时不用租户，先用默认的1
    config.header['tenant-id'] = 1

    if (config.params){
        let url = config.url + '?' + tansParams(config.params)
        url = url.slice(0, -1)
        config.url = url
    }

    return new Promise((resolve, reject) => {
        uni.request({
            method: config.method || 'get',
            timeout: config.timeout ||  timeout,
            url: config.baseUrl || baseUrl + config.url,
            data: config.data,
            // header: config.header,
            header: config.header,
            dataType: 'json'
        }).then(res => {
            // console.log(response,"返回了什么")
            // let [error, res] = response // 这行代码提示 response is not iterable
            // if (error) {
            //     toast('后端接口连接异常')
            //     reject('后端接口连接异常')
            //     return
            // }
            const code = res.data.code || 200
            const msg = errorCode[code] || res.data.msg || errorCode['default']
            if (code === 401) {
                showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(res => {
                    if (res.confirm) {
                        const userStore = useUserStore()
                        userStore.LogOut().then(res => {
                            uni.reLaunch({ url: '/pages/login' })
                        })
                    }
                })
                reject('无效的会话，或者会话已过期，请重新登录。')
            } else if (code === 500) {
                toast(msg)
                reject('500')
            } else if (code !== 200) {
                toast(msg)
                reject(code)
            }
            resolve(res.data)
        })
            .catch(error => {
                let { message } = error
                if (message === 'Network Error') {
                    message = '后端接口连接异常'
                } else if (message.includes('timeout')) {
                    message = '系统接口请求超时'
                } else if (message.includes('Request failed with status code')) {
                    message = '系统接口' + message.substr(message.length - 3) + '异常'
                }
                toast(message)
                reject(error)
            })
    })
}

export default request