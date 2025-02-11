import React, { useState } from 'react';
import { BrowserRouter} from 'react-router-dom';
import AppRoutes from './components/router';
import '@ant-design/v5-patch-for-react-19';
import {Layout} from 'antd';
import 'antd/dist/reset.css';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout>
            <BrowserRouter>
                <AppRoutes collapsed={collapsed} setCollapsed={setCollapsed} />
            </BrowserRouter>
        </Layout>
    );
}

export default App;