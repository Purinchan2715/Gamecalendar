import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pagesにデプロイする場合はbaseを設定する
  // 例: base: '/リポジトリ名/',
  base: './',
})
