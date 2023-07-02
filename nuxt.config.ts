export default defineNuxtConfig({
  ssr: true,
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
    devProxy: {
      '/nhlPlayers/': {
        target: 'https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nhlPlayers/, ''),
      },
    }
  },
})