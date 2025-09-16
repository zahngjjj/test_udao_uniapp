import Vue from 'vue'
import App from './App'
import store from './store' // store
import plugins from './plugins' // plugins
import './permission' // permission
import formCreate from '@form-create/vant'

// #ifdef H5
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)
// #endif

Vue.use(plugins)
Vue.use(formCreate)

Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
