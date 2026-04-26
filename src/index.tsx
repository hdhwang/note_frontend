import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 1. 'root' 요소를 찾을 때 TypeScript에게 해당 요소가 반드시 HTML 요소임을 알려줍니다.
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Failed to find the root element. Check your index.html");
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);