import React, { useState, useEffect } from "react";
import { Layout, Menu, Space, Typography, MenuProps } from "antd";
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

const { Sider } = Layout;

// 1. Props 타입 정의
interface LayoutNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  permissions: string[];
}

// 2. JWT 토큰 구조 정의
interface DecodedToken {
  groups?: string[];
  [key: string]: any; // 기타 필드 허용
}

const LayoutNav: React.FC<LayoutNavProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);

  useEffect(() => {
    // 경로 일치 로직을 조금 더 깔끔하게 정리했습니다.
    const path = pathname === '/' ? '/' : pathname.split('/')[1];
    if (path === '/') {
      setSelectedKeys(['/']);
    } else {
      setSelectedKeys([`/${path}`]);
    }
  }, [pathname]);

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === pathname) return;
    setSelectedKeys([e.key]);
    navigate(e.key, { replace: true });
  };

  // 3. 메뉴 아이템 타입 정의 (MenuProps['items'])
  let menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: !collapsed ? <Link to={'/'}>대시보드</Link> : null,
    },
    {
      key: '/bank-account',
      icon: <BankOutlined />,
      label: !collapsed ? <Link to={'/bank-account'}>계좌번호 관리</Link> : null,
    },
    {
      key: '/serial',
      icon: <KeyOutlined />,
      label: !collapsed ? <Link to={'/serial'}>시리얼 번호 관리</Link> : null,
    },
    {
      key: '/note',
      icon: <FileTextOutlined />,
      label: !collapsed ? <Link to={'/note'}>노트 관리</Link> : null,
    },
    {
      key: '/guest-book',
      icon: <BookOutlined />,
      label: !collapsed ? <Link to={'/guest-book'}>결혼식 방명록</Link> : null,
    },
    {
      key: '/lotto',
      icon: <DotChartOutlined />,
      label: !collapsed ? <Link to={'/lotto'}>로또 번호 생성</Link> : null,
    },
  ];

  try {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      const permissionList = decodedToken.groups || [];

      if (permissionList.includes('관리자')) {
        menuItems.push({
          key: '/audit-log',
          icon: <AuditOutlined />,
          label: !collapsed ? <Link to={'/audit-log'}>감사 로그</Link> : null,
        });
      }
    }
  } catch (error) {
    console.error('Error permissionList:', error);
  }

  return (
      <Sider
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="md"
          collapsedWidth="80"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
          }}
      >
        <NavLink to='/'>
          <div style={{ padding: '16px 10px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Space orientation='horizontal' size='small'>
              <EditOutlined style={{ color: '#ffffff', fontSize: 30 }} />
              {!collapsed && (
                  <Typography.Text style={{ color: '#ffffff', fontSize: 20 }}>
                    <b>NOTEPAD</b>
                  </Typography.Text>
              )}
            </Space>
          </div>
        </NavLink>
        <Menu
            theme='dark'
            mode='inline'
            onClick={onClick}
            selectedKeys={selectedKeys}
            items={menuItems}
        />
      </Sider>
  );
};

export default LayoutNav;