import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import './vendor/fontAwesome'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
