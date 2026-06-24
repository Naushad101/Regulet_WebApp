import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


function serveStaticHtml() {
  return {
    name: 'serve-static-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.html') && req.url !== '/index.html') {
          next();
          return;
        }
        next();
      });
    }
  };
}

// prod
 
// export default defineConfig({
//   plugins: [react()],
//    build: {
//     chunkSizeWarningLimit: 800,
//   },
//   server: {
//     proxy: {
//       '/bnt-soft': {
//         target: 'http://172.31.2.36:8082',
//         changeOrigin: true,
//         secure: false
//       },
//       '/payment': {
//         target: 'http://172.31.2.36:8082',
//         changeOrigin: true,
//         secure: false
//       },
//       "/sales-team": {
//         target: "http://172.31.2.36:8082",
//         changeOrigin: true,
//         secure: false,
//       }
//     },
//     port:80
//   }
// });


// dev
export default defineConfig({
  plugins: [react(), serveStaticHtml()],
  server: {
    proxy: {
      '/bnt-soft': {
        target: 'http://172.31.2.14:8082',
        changeOrigin: true,
        secure: false
      },
      '/payment': {
        target: 'http://172.31.2.14:8082',
        changeOrigin: true,
        secure: false
      },
      "/sales-team": {
        target: "http://172.31.2.14:8082",
        changeOrigin: true,
        secure: false,
      }
    }
  }
});


// backend - prod 
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://hrm.bnt-soft.com',
//         changeOrigin: true,
//         secure: false
//       },
//       '/payment': {
//         target: 'https://hrm.bnt-soft.com/api',
//         changeOrigin: true,
//         secure: false
//       },
//       "/sales-team": {
//         target: "https://hrm.bnt-soft.com/api",
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// });


//  target: 'https://hrm.bnt-soft.com/api'

//  'http://192.168.137.218:8082'