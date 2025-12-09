import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    // [新增] 設定基礎路徑，必須與 Nginx location /bus/ 對應
    base: '/bus/',

    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5174,
        strictPort: true,
        cors: true,
        allowedHosts: [
            'srv415056.hstgr.cloud',
            'localhost',
            '62.72.59.32'
        ],
        // [修改] HMR 設定
        hmr: {
            host: 'srv415056.hstgr.cloud',
            // 同樣改為 80，走 Nginx 進來
            clientPort: 80,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    }
})
