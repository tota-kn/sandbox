import { defineConfig } from 'wxt'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  manifest: {
    name: 'ブックマークタグ管理',
    description: 'ブックマークをタグで効率的に管理するための拡張機能',
    version: '1.0.0',
    permissions: ['bookmarks'],
    options_ui: {
      page: 'options/index.html',
      // open_in_tab: true
    }
  },
  vite: () => ({
    plugins: [
      vue(),
      tailwindcss()
    ],
  }),
})
