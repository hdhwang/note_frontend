import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router';
import { Layout, App as AntdApp } from 'antd';
import { SettingsProvider } from './components/settings_context';
import { NotificationProvider } from './components/notification_context';
import AntdGlobal from './components/antd_global';

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <AntdApp>
                <AntdGlobal />
                <NotificationProvider>
                    <Layout style={{ minHeight: '100vh' }}>
                        <BrowserRouter>
                            <AppRoutes />
                        </BrowserRouter>
                    </Layout>
                </NotificationProvider>
            </AntdApp>
        </SettingsProvider>
    );
}

export default App;