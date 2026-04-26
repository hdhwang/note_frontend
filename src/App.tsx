import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router';
import { Layout } from 'antd';
import { SettingsProvider } from './components/settings_context';

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <Layout style={{ minHeight: '100vh' }}>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </Layout>
        </SettingsProvider>
    );
}

export default App;