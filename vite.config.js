import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pluginRewriteAll from 'vite-plugin-rewrite-all';

// thank you to https://github.com/vitejs/vite/issues/2415
// https://stackoverflow.com/questions/6430858/how-does-url-rewrite-works

// Thank you to https://stackoverflow.com/questions/64677212/how-to-configure-proxy-in-vite
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pluginRewriteAll()],
  server: {
    proxy: {
      '/api': {
           target: 'http://127.0.0.1:5000', // https://stackoverflow.com/questions/46127005/why-does-localhost5000-not-work-in-flask
           changeOrigin: true,
           secure: false,      
           ws: true,
       }
    },
  }
})
