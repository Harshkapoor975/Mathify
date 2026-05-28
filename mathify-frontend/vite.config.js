// // // // import { defineConfig } from 'vite'
// // // // import react from '@vitejs/plugin-react'

// // // // // https://vite.dev/config/
// // // // export default defineConfig({
// // // //   plugins: [react()],
// // // // })
// // // // import { defineConfig } from 'vite'

// // // // export default defineConfig({
// // // //   server: {
// // // //     allowedHosts: true
// // // //   },
// // // //   plugins: [react()],
// // // // })
// // // import { defineConfig } from 'vite'
// // // import react from '@vitejs/plugin-react'

// // // export default defineConfig({
// // //   plugins: [react()],
// // //   server: {
// // //     allowedHosts: true
// // //   }
// // // })
// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // export default defineConfig({
// //   plugins: [react()],

// //   server: {
// //     proxy: {

// //       '/api': {
// //         target: 'http://localhost:3000',
// //         changeOrigin: true
// //       },

// //       '/socket.io': {
// //         target: 'http://localhost:3000',
// //         ws: true,
// //         changeOrigin: true
// //       }
// //     }
// //   }
// // })
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({

//   plugins: [react()],

//   server: {

//     allowedHosts: [
//       'posted-faucet-passage.ngrok-free.dev'
//     ],

//     proxy: {

//       '/api': {
//         target: 'http://localhost:3000',
//         changeOrigin: true
//       },

//       '/socket.io': {
//         target: 'http://localhost:3000',
//         ws: true,
//         changeOrigin: true
//       }
//     }
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',

    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },

      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})