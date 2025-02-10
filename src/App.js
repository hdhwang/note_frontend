import React from 'react';
import { BrowserRouter} from 'react-router-dom';
import AppRoutes from './components/router';
import '@ant-design/v5-patch-for-react-19';
import {Layout} from 'antd';
import 'antd/dist/reset.css';

const App = () => {
    return (
        <Layout>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </Layout>
    );
}

export default App;