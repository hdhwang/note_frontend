import React from 'react';
import { useRoutes } from 'react-router-dom';
import SecureRoute from "./secure_route";
import Dashboard from './dashboard';
import Forbidden from "./error/forbidden";
import NotFound from "./error/not_found";

const AppRoutes = () => {
    return useRoutes([
        {path: '/', element: <SecureRoute component={Dashboard} permissionRequired={[]}/>},

        {path: "/forbidden", element: <Forbidden/>},
        {path: "*", element: <NotFound/>},
    ]);
}

export default AppRoutes;