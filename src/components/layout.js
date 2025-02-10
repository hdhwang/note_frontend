import React, { useState, useEffect} from "react";
import {Layout, Menu, MenuProps, Space, Typography} from "antd";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

import {
  DashboardOutlined,
  BankOutlined,
  FileTextOutlined,
  BookOutlined,
  KeyOutlined,
  AuditOutlined,
  DotChartOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const LayoutNav = () => {
    const location = useLocation();
    const {pathname} = location;
    const navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState(['']);

    useEffect(() => {
        if (pathname.match('/bank-account')) {
            setSelectedKeys(['/bank-account']);
        }
        else if (pathname.match('/serial')) {
            setSelectedKeys(['/serial']);
        }
        else if (pathname.match('/note')) {
            setSelectedKeys(['/note']);
        }
        else if (pathname.match('/guest-book')) {
            setSelectedKeys(['/guest-book']);
        }
        else if (pathname.match('/lotto')) {
            setSelectedKeys(['/lotto']);
        }
        else if (pathname.match('/audit-log')) {
            setSelectedKeys(['/audit-log']);
        }
        else if (pathname.match('/')) {
            setSelectedKeys(['/']);
        }
    }, [pathname]);

    const onClick: MenuProps['onClick'] = (e) => {
        if (e.key === pathname) return;
        setSelectedKeys([e.key]);
        navigate(e.key, {replace: true});
    };

        let menuItems = [
          {
                key: '/',
                label: <Link to={'/'}><DashboardOutlined style={{ marginRight: 8 }} /> 대시보드</Link>
            },
            {
                  key: '/bank-account',
                  label: <Link to={'/bank-account'}><BankOutlined style={{ marginRight: 8 }} />계좌번호 관리</Link>
            },
            {
                key: '/serial',
                  label: <Link to={'/serial'}><KeyOutlined style={{ marginRight: 8 }} />시리얼 번호 관리</Link>
            },
            {
                key: '/note',
                  label: <Link to={'/note'}><FileTextOutlined style={{ marginRight: 8 }} />노트 관리</Link>
            },
            {
                key: '/guest-book',
                  label: <Link to={'/guest-book'}><BookOutlined style={{ marginRight: 8 }} />결혼식 방명록</Link>
            },
            {
                key: '/lotto',
                  label: <Link to={'/lotto'}><DotChartOutlined style={{ marginRight: 8 }} />로또 번호 생성</Link>
            },
    ]

    try {
        const accessToken = localStorage.getItem("access_token");
        const decodedToken = jwtDecode(accessToken);
        const permissionList = decodedToken.groups || [];
        if (permissionList) {
            if (permissionList.includes('관리자')) {
                menuItems.push({
                    key: '/audit-log',
                    label: <Link to={'/audit-log'}><AuditOutlined style={{ marginRight: 8 }} />감사 로그</Link>
                });
            }
        }
    }
    catch (error) {
        console.error('Error permissionList:', error);
    }

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
                            <EditOutlined style={{color: '#ffffff', fontSize: 30}} />
                            <Typography.Text style={{color: '#ffffff', fontSize: 25}}><b>NOTEPAD</b></Typography.Text>
                        </Space>
                        <Space direction='horizontal' size='small'>
                            <Typography.Text style={{color: '#E21818', fontSize: 12, letterSpacing: 0.5}}><b>Window</b></Typography.Text>
                            <Typography.Text style={{color: '#FFCC33', fontSize: 12, letterSpacing: 0.5}}><b>Containing</b></Typography.Text>
                            <Typography.Text style={{color: '#1CC84C', fontSize: 12, letterSpacing: 0.5}}><b>Ideas</b></Typography.Text>
                        </Space>
                    </Space>
                </NavLink>
                <Menu theme='dark' mode='inline' onClick={onClick} selectedKeys={selectedKeys} items={menuItems} />
            </Sider>
        </Layout>
    );
};

export default LayoutNav;