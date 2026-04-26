import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router';
import { Layout } from 'antd';

const App: React.FC = () => {
    // useState에 <boolean> 타입을 명시하여 타입 안정성을 확보합니다.
    const [collapsed, setCollapsed] = useState<boolean>(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <BrowserRouter>
                {/* AppRoutes 컴포넌트도 .tsx로 변경 후 Props 타입을 정의해야 에러가 나지 않습니다. */}
                <AppRoutes collapsed={collapsed} setCollapsed={setCollapsed} />
            </BrowserRouter>
        </Layout>
    );
}

export default App;