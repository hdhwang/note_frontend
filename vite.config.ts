import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
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