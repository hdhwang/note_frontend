import React, { useState, useEffect} from "react";
import {Layout, Menu, MenuProps, Space, Typography} from "antd";
import {SecurityScanOutlined} from "@ant-design/icons";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";

const { Sider } = Layout;

const menuItems = [
    {
        key: '/',
        label: <Link to={'/'}>대시보드</Link>
    },
]
const LayoutNav = () => {
    const location = useLocation();
    const {pathname} = location;
    const navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState(['']);
    useEffect(() => {
        if (pathname.match('/')) {
            setSelectedKeys(['/']);
        }
    }, [pathname]);

    const onClick: MenuProps['onClick'] = (e) => {
        if (e.key === pathname) return;
        setSelectedKeys([e.key]);
        navigate(e.key, {replace: true});
    };
    return (
        <Layout hasSider>
            <Sider
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <NavLink to='/'>
                    <Space direction='vertical' style={{padding: 10, justifyContent: 'center', textAlign: 'center', width: '100%'}}>
                        <Space direction='horizontal' size='small' style={{marginBottom: -5}}>
                            <SecurityScanOutlined style={{color: '#ffffff', fontSize: 30}} />
                            <Typography.Text style={{color: '#ffffff', fontSize: 25}}><b>NOTEPAD</b></Typography.Text>
                        </Space>
                        <Space direction='horizontal' size='small'>
                            <Typography.Text style={{color: '#2492FB', fontSize: 10, letterSpacing: 0.5}}><b>Small</b></Typography.Text>
                            <Typography.Text style={{color: '#E21818', fontSize: 10, letterSpacing: 0.5}}><b>Window</b></Typography.Text>
                            <Typography.Text style={{color: '#FFCC33', fontSize: 10, letterSpacing: 0.5}}><b>Containing</b></Typography.Text>
                            <Typography.Text style={{color: '#1CC84C', fontSize: 10, letterSpacing: 0.5}}><b>Ideas</b></Typography.Text>
                        </Space>
                    </Space>
                </NavLink>
                <Menu theme='dark' mode='inline' onClick={onClick} selectedKeys={selectedKeys} items={menuItems} />
            </Sider>
        </Layout>
    );
};

export default LayoutNav;