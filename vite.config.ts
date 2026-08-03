import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                // Ensure external APIs or routes do not get served by the service worker
                navigateFallbackDenylist: [/^\/api/],
            },
            manifest: {
                name: 'Notepad',
                short_name: 'Notepad',
                description: 'A premium, modern Notepad application',
                theme_color: '#1B3150',
                background_color: '#1B3150',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'favicon.ico',
                        sizes: '64x64 32x32 24x24 16x16',
                        type: 'image/x-icon'
                    },
                    {
                        src: 'logo192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        port: 3000,
        open: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'build',
        rolldownOptions: {
            output: {
                // 객체 형태 대신 함수 형태로 작성하여 타입 에러를 해결합니다.
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // antd, react, react-dom 등을 vendor 체인으로 분리
                        if (id.includes('antd') || id.includes('react') || id.includes('react-dom')) {
                            return 'vendor';
                        }
                        // 그 외 라이브러리들도 분리하고 싶다면 여기서 처리 가능
                        return 'libs';
                    }
                },
            },
        },
    },
});