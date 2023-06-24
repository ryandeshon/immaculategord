

// https://nuxt.com/docs/api/configuration/nuxt-config
// export default defineNuxtConfig({
//   css: ["@/assets/css/styles.css"],
//   build: {
//     postcss: {
//       postcssOptions: require("./postcss.config.js"),
//     },
//   },
// })

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@/assets/css/styles.css"],
  modules: ['@nuxtjs/tailwindcss']
})