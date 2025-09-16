import App from './App'
import plugins  from "./plugins";
import pstore from './store'
// 引入全局uview-plus
import uviewPlus from './uni_modules/uview-plus/index.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
// 使用 uview-plus
Vue.use(uviewPlus)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  //注册pinia
  app.use(pstore)
  // 使用 uview-plus
  app.use(uviewPlus)
  return {
    app
  }
}
// #endif