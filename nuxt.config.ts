export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  runtimeConfig: {
    // The private keys which are only available server-side
    apiSecret: '123',
    // Keys within public are also exposed client-side
    public: {
      apiBase: '/api'
    }
  },
  css: ["@/assets/css/styles.css"],
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  nitro: {
    routeRules: {
      '/nhlPlayers/': { proxy: 'https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/' },
      "/proxy/**": { proxy: '/api/**' },
    },
    proxy: {
      '/api/nhlPlayers/': {
        target: 'https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nhlPlayers/, ''),
      },
      '/api/teams': {
        target: 'https://statsapi.web.nhl.com/api/v1/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/teams/, ''),
      },
    }
  },
})