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
import Forbidden from "./error/forbidden";
import NotFound from "./error/not_found";

const AppRoutes = ({ collapsed, setCollapsed }) => {
    return useRoutes([
        {path: '/', element: <SecureRoute component={Dashboard} permissionRequired={['사용자', '관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/bank-account', element: <SecureRoute component={BankAccount} permissionRequired={['사용자','관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/serial', element: <SecureRoute component={Serial} permissionRequired={['사용자', '관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/note', element: <SecureRoute component={Note} permissionRequired={['사용자', '관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/guest-book', element: <SecureRoute component={GuestBook} permissionRequired={['사용자', '관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/lotto', element: <SecureRoute component={Lotto} permissionRequired={['사용자', '관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},
        {path: '/audit-log', element: <SecureRoute component={AuditLog} permissionRequired={['관리자']} collapsed={collapsed} setCollapsed={setCollapsed} />},

        {path: "/login", element: <Login/>},
        {path: "/forbidden", element: <Forbidden/>},
        {path: "*", element: <NotFound/>},
    ]);
}

export default AppRoutes;