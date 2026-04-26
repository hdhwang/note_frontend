/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // 여기에 사용하는 다른 환경 변수들도 추가하세요.
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}