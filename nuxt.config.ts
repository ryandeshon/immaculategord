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
    '@nuxtjs/axios',
    '@nuxtjs/tailwindcss'
  ],
  axios: {
    proxy: true
  },
  proxy: {
    '/nhl': {
      target: 'https://suggest.svc.nhl.com',
      pathRewrite: {
        '^/nhl': '/svc/suggest/v1/minplayers'
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
})