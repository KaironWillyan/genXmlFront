import '../favicon.ico'
import { createApp, provide } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'
import 'jquery'
import 'vue-bootstrap-table'

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.mount('#app')

// import { initKeycloak } from './services/keycloakService';
// (async () => {
//   const keycloak = await initKeycloak()
//   console.log(keycloak)
//   if (keycloak) {
//     const authenticated = keycloak.authenticated
//     if (!authenticated) {
//       // Redireciona para a página de login do Keycloak
//       keycloak.login()
//       return
//     }
// const app = createApp(App)
// const pinia = createPinia()
// app.use(router)
// app.use(pinia)
// app.mount('#app')

//     provide('keycloakInstance',keycloak)
//   }
// })()

