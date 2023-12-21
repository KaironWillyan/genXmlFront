// // src/services/keycloakService.ts
// import Keycloak from 'keycloak-js'
// import { provide } from 'vue'

// const keycloak = new Keycloak({
//   url: 'https://sso.rdamasio.com.br/auth',
//   realm: 'RDamasio',
//   clientId: 'app-catraca'
// })

// export const initKeycloak = async (): Promise<Keycloak | null> => {
//   try {
//     const authenticated = await keycloak.init({
//       // Configuração para autenticação ao carregar
//       onLoad: 'login-required'
//       // Configuração para autenticação silenciosa
//       // silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
//     })
//     console.log(`User is ${authenticated ? 'authenticated' : 'not authenticated'}`)
//     return keycloak
//   } catch (error) {
//     console.error('Failed to initialize adapter:', error)
//     return null
//   }
// }
// export const getKeycloakInstance = (): Keycloak => {
//   return keycloak
// }

// provide('keycloakInstance', getKeycloakInstance())
