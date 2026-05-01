import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router';
import { Layout, App as AntdApp, ConfigProvider, theme } from 'antd';
import { SettingsProvider, useSettings } from './components/settings_context';
import { NotificationProvider } from './components/notification_context';
import AntdGlobal from './components/antd_global';
import koKR from 'antd/es/locale/ko_KR';

const AppContent: React.FC = () => {
    const { settings } = useSettings();
    const isDarkMode = settings.themeMode === 'dark';

    return (
        <ConfigProvider
            locale={koKR}
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    motionDurationSlow: '0.2s',
                    motionDurationMid: '0.1s',
                }
            }}
        >
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
        </ConfigProvider>
    );
};

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <AppContent />
        </SettingsProvider>
    );
}

export default App;