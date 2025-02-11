import React, { useState, useEffect } from "react";
import { Layout, Menu, Space, Typography } from "antd";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
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

const { Sider} = Layout;

const LayoutNav = ({collapsed, setCollapsed}) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState(['']);

  useEffect(() => {
    if (pathname.match('/bank-account')) {
      setSelectedKeys(['/bank-account']);
    } else if (pathname.match('/serial')) {
      setSelectedKeys(['/serial']);
    } else if (pathname.match('/note')) {
      setSelectedKeys(['/note']);
    } else if (pathname.match('/guest-book')) {
      setSelectedKeys(['/guest-book']);
    } else if (pathname.match('/lotto')) {
      setSelectedKeys(['/lotto']);
    } else if (pathname.match('/audit-log')) {
      setSelectedKeys(['/audit-log']);
    } else if (pathname.match('/')) {
      setSelectedKeys(['/']);
    }
  }, [pathname]);

  const onClick = (e) => {
    if (e.key === pathname) return;
    setSelectedKeys([e.key]);
    navigate(e.key, { replace: true });
  };

  let menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: !collapsed && <Link to={'/'}>대시보드</Link>,
      title: collapsed ? null : '대시보드',
    },
    {
      key: '/bank-account',
      icon: <BankOutlined />,
      label: !collapsed && <Link to={'/bank-account'}>계좌번호 관리</Link>,
      title: collapsed ? null : '계좌번호 관리',
    },
    {
      key: '/serial',
      icon: <KeyOutlined />,
      label: !collapsed && <Link to={'/serial'}>시리얼 번호 관리</Link>,
      title: collapsed ? null : '시리얼 번호 관리',
    },
    {
      key: '/note',
      icon: <FileTextOutlined />,
      label: !collapsed && <Link to={'/note'}>노트 관리</Link>,
      title: collapsed ? null : '노트 관리',
    },
    {
      key: '/guest-book',
      icon: <BookOutlined />,
      label: !collapsed && <Link to={'/guest-book'}>결혼식 방명록</Link>,
      title: collapsed ? null : '결혼식 방명록',
    },
    {
      key: '/lotto',
      icon: <DotChartOutlined />,
      label: !collapsed && <Link to={'/lotto'}>로또 번호 생성</Link>,
      title: collapsed ? null : '로또 번호 생성',
    },
  ];

  try {
    const accessToken = localStorage.getItem("access_token");
    const decodedToken = jwtDecode(accessToken);
    const permissionList = decodedToken.groups || [];
    if (permissionList) {
      if (permissionList.includes('관리자')) {
        menuItems.push({
          key: '/audit-log',
          icon: <AuditOutlined />,
          label: !collapsed && <Link to={'/audit-log'}>감사 로그</Link>,
          title: collapsed ? null : '감사 로그',
        });
      }
    }
  } catch (error) {
    console.error('Error permissionList:', error);
  }

  return (
    <Layout>
      <Sider
        collapsed={collapsed}
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        breakpoint="md"
        collapsedWidth="80"
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
          <Space direction='vertical' style={{ padding: 10, justifyContent: 'center', textAlign: 'center', width: '100%' }}>
            <Space direction='horizontal' size='small' style={{ marginBottom: -5 }}>
              <EditOutlined style={{ color: '#ffffff', fontSize: 30 }} />
              {!collapsed && <Typography.Text style={{ color: '#ffffff', fontSize: 25 }}><b>NOTEPAD</b></Typography.Text>}
            </Space>
            {!collapsed && (
              <Space direction='horizontal' size='small'>
                <Typography.Text style={{ color: '#E21818', fontSize: 12, letterSpacing: 0.5 }}><b>Window</b></Typography.Text>
                <Typography.Text style={{ color: '#FFCC33', fontSize: 12, letterSpacing: 0.5 }}><b>Containing</b></Typography.Text>
                <Typography.Text style={{ color: '#1CC84C', fontSize: 12, letterSpacing: 0.5 }}><b>Ideas</b></Typography.Text>
              </Space>
            )}
          </Space>
        </NavLink>
        <Menu theme='dark' mode='inline' onClick={onClick} selectedKeys={selectedKeys} items={menuItems} />
      </Sider>
    </Layout>
  );
};

export default LayoutNav;