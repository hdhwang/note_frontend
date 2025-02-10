import React from 'react';
import { useRoutes } from 'react-router-dom';
import SecureRoute from "./secure_route";
import Dashboard from './dashboard';
import BankAccount from './bank_account';
import Serial from './serial';
import Note from './note';
import GuestBook from './guest_book';
import Lotto from './lotto';
import AuditLog from './audit_log';
import Login from './login';
// import LoginCallback from './login_callback';
import Forbidden from "./error/forbidden";
import NotFound from "./error/not_found";

const AppRoutes = () => {
    return useRoutes([
        {path: '/', element: <SecureRoute component={Dashboard} permissionRequired={[]}/>},
        {path: '/bank-account', element: <SecureRoute component={BankAccount} permissionRequired={[]}/>},
        {path: '/serial', element: <SecureRoute component={Serial} permissionRequired={[]}/>},
        {path: '/note', element: <SecureRoute component={Note} permissionRequired={[]}/>},
        {path: '/guest-book', element: <SecureRoute component={GuestBook} permissionRequired={[]}/>},
        {path: '/lotto', element: <SecureRoute component={Lotto} permissionRequired={[]}/>},
        {path: '/audit-log', element: <SecureRoute component={AuditLog} permissionRequired={[]}/>},

        {path: "/login", element: <Login/>},
        // {path: "/login/callback", element: <LoginCallback/>},
        {path: "/forbidden", element: <Forbidden/>},
        {path: "*", element: <NotFound/>},
    ]);
}

export default AppRoutes;