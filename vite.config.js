import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // 기존 CRA처럼 3000번 포트를 쓰려면 설정
        open: true,
    },
    build: {
        outDir: 'build', // CRA와 동일한 결과물 폴더명 설정
    }
});