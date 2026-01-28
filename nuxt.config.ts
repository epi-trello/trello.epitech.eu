// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Désactiver SSR pour éviter "Cannot read properties of null (reading 'ce')" (reka-ui / Nuxt UI en SSR)
  routeRules: {
    '/': { ssr: false },
    '/boards': { ssr: false },
    '/boards/**': { ssr: false },
    '/login': { ssr: false },
    '/sign-up': { ssr: false },
    '/settings': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
