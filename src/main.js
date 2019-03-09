import '@babel/polyfill'
import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/database'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'


// Initialize Firebase
//Variables de entorno guardadas en .env.local por seguridad
var config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGINGSENDERID
};
firebase.initializeApp(config);

let app = ''
firebase.auth().onAuthStateChanged(() => {
  if (!app){
    app = new Vue({
      router,
      render: h => h(App)
    }).$mount('#app')
  }
})

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')
