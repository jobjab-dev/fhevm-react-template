import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'jobjab-fhevm-sdk': '../../packages/fhevm-sdk/src',
    },
  },
  optimizeDeps: {
    exclude: ['jobjab-fhevm-sdk'],
  },
})

