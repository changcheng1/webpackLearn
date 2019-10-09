$('#index').html("jquery")
require("./css/index.css")
require("./css/index.less")
import VueRouter from 'vue-router'
import routes from './router'
import Vue from 'vue'
import ElementUI from 'element-ui';
Vue.use(ElementUI);
var router = new VueRouter({
  routes,
  mode: 'hash'
})
Vue.use(VueRouter);
var app = new Vue({
    router,
    data:function(){
      return {
          text:'hellow word'
      }
    }
}).$mount('#app');
console.log("app",app)