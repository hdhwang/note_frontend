import React from 'react';
import { BrowserRouter} from 'react-router-dom';
import AppRoutes from './components/router';
import {Layout} from 'antd';

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