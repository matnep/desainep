import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/desainep/',
  plugins: [react(), tailwindcss()],
  build: {
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'game': [
            './src/components/RocketGame.jsx',
            './src/components/VictoryScreen.jsx',
            './src/components/GameOverScreen.jsx'
          ]
        }
      }
    }
  }
})
