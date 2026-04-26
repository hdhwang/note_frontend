import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router';
import { Layout } from 'antd';
import { SettingsProvider } from './components/settings_context';
import { NotificationProvider } from './components/notification_context';

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <NotificationProvider>
                <Layout style={{ minHeight: '100vh' }}>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </Layout>
            </NotificationProvider>
        </SettingsProvider>
    );
}

export default App;