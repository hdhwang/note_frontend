import React, { useState, useEffect, useCallback, useRef } from "react";
import { Layout, Menu, Space, Typography, Drawer, MenuProps } from "antd";
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
  SettingOutlined,
} from '@ant-design/icons';
import { useSettings } from './settings_context';

const { Sider } = Layout;

const SIDER_MIN_WIDTH = 160;
const SIDER_MAX_WIDTH = 400;
const SIDER_COLLAPSED_WIDTH = 80;

interface LayoutNavProps {
  permissions: string[];
  isMobile: boolean;
  onOpenSettings?: () => void;
}

interface DecodedToken {
  groups?: string[];
  [key: string]: any;
}

const LayoutNav: React.FC<LayoutNavProps> = ({ isMobile, onOpenSettings }) => {
  const { settings, updateSettings } = useSettings();
  const collapsed = settings.collapsed;
  const setCollapsed = (val: boolean) => updateSettings({ collapsed: val });
  const siderWidth = settings.siderWidth;
  const layoutColor = settings.layoutColor;

  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const siderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // 리사이즈 핸들 드래그 로직
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = Math.min(SIDER_MAX_WIDTH, Math.max(SIDER_MIN_WIDTH, e.clientX));
    updateSettings({ siderWidth: newWidth });
  }, [isResizing, updateSettings]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // 메뉴 아이템
  let menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to={'/'}>대시보드</Link> },
    { key: '/bank-account', icon: <BankOutlined />, label: <Link to={'/bank-account'}>계좌번호</Link> },
    { key: '/serial', icon: <KeyOutlined />, label: <Link to={'/serial'}>시리얼 번호</Link> },
    { key: '/note', icon: <FileTextOutlined />, label: <Link to={'/note'}>노트</Link> },
    { key: '/guest-book', icon: <BookOutlined />, label: <Link to={'/guest-book'}>결혼식 방명록</Link> },
    { key: '/lotto', icon: <DotChartOutlined />, label: <Link to={'/lotto'}>로또 번호 생성</Link> },
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
          label: <Link to={'/audit-log'}>감사 로그</Link>,
        });
      }
    }
  } catch (error) {
    console.error('Error permissionList:', error);
  }

  const logoContent = (
    <NavLink to='/'>
      <div style={{ padding: '16px 10px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Space orientation='horizontal' size='small'>
          <EditOutlined style={{ color: '#ffffff', fontSize: 30 }} />
          {(!collapsed || isMobile) && (
            <Typography.Text style={{ color: '#ffffff', fontSize: 20, whiteSpace: 'nowrap' }}>
              <b>NOTEPAD</b>
            </Typography.Text>
          )}
        </Space>
      </div>
    </NavLink>
  );

  const menuContent = (
    <Menu
      theme='dark'
      mode='inline'
      onClick={onClick}
      selectedKeys={selectedKeys}
      items={menuItems}
      style={{ backgroundColor: layoutColor }}
    />
  );

  const resizeHandle = (
    <div
      className="sider-resize-handle"
      style={{ left: siderWidth - 2 }}
      onMouseDown={handleMouseDown}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        width={170}
        styles={{
          body: { padding: 0, backgroundColor: layoutColor, overflowX: 'hidden' },
          header: { display: 'none' },
        }}
      >
        <Layout style={{ minHeight: '100vh', backgroundColor: layoutColor }}>
          <Sider
            collapsed={false}
            width={170}
            style={{
              height: '100vh',
              backgroundColor: layoutColor,
            }}
          >
            {logoContent}
            {menuContent}
          </Sider>
        </Layout>
      </Drawer>
    );
  }

  return (
    <div ref={siderRef} style={{ position: 'relative' }}>
      <Sider
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="md"
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        width={siderWidth}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          backgroundColor: layoutColor,
        }}
      >
        {logoContent}
        {menuContent}
      </Sider>
      {!collapsed && resizeHandle}
    </div>
  );
};

export default LayoutNav;