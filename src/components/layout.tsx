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
} from '@ant-design/icons';

const { Sider } = Layout;

// 사이드바 너비 제한
const SIDER_MIN_WIDTH = 160;
const SIDER_MAX_WIDTH = 400;
const SIDER_COLLAPSED_WIDTH = 80;

// 1. Props 타입 정의
interface LayoutNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  permissions: string[];
  isMobile: boolean;
  siderWidth: number;
  onSiderWidthChange: (width: number) => void;
}

// 2. JWT 토큰 구조 정의
interface DecodedToken {
  groups?: string[];
  [key: string]: any; // 기타 필드 허용
}

const LayoutNav: React.FC<LayoutNavProps> = ({ collapsed, setCollapsed, isMobile, siderWidth, onSiderWidthChange }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const siderRef = useRef<HTMLDivElement>(null);

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
    // 모바일에서 메뉴 클릭 시 사이드바 닫기
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
    onSiderWidthChange(newWidth);
  }, [isResizing, onSiderWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 드래그 중 텍스트 선택 방지
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

  // 3. 메뉴 아이템 타입 정의 (MenuProps['items'])
  // label을 항상 제공하여 collapsed 상태에서 툴팁이 표시되도록 수정
  let menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>대시보드</Link>,
    },
    {
      key: '/bank-account',
      icon: <BankOutlined />,
      label: <Link to={'/bank-account'}>계좌번호 관리</Link>,
    },
    {
      key: '/serial',
      icon: <KeyOutlined />,
      label: <Link to={'/serial'}>시리얼 번호 관리</Link>,
    },
    {
      key: '/note',
      icon: <FileTextOutlined />,
      label: <Link to={'/note'}>노트 관리</Link>,
    },
    {
      key: '/guest-book',
      icon: <BookOutlined />,
      label: <Link to={'/guest-book'}>결혼식 방명록</Link>,
    },
    {
      key: '/lotto',
      icon: <DotChartOutlined />,
      label: <Link to={'/lotto'}>로또 번호 생성</Link>,
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
          label: <Link to={'/audit-log'}>감사 로그</Link>,
        });
      }
    }
  } catch (error) {
    console.error('Error permissionList:', error);
  }

  // 사이드바 로고 영역
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

  // 사이드바 메뉴 영역
  const menuContent = (
      <Menu
          theme='dark'
          mode='inline'
          onClick={onClick}
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ backgroundColor: '#1B3150' }}
      />
  );

  // 리사이즈 핸들 (사이드바 우측 가장자리에 위치)
  const resizeHandle = (
      <div
          className="sider-resize-handle"
          style={{ left: siderWidth - 2 }}
          onMouseDown={handleMouseDown}
      />
  );

  // 모바일: Drawer로 오버레이 표시
  if (isMobile) {
    return (
        <Drawer
            placement="left"
            open={!collapsed}
            onClose={() => setCollapsed(true)}
            width={200}
            styles={{
              body: { padding: 0, backgroundColor: '#1B3150' },
              header: { display: 'none' },
            }}
        >
          {logoContent}
          {menuContent}
        </Drawer>
    );
  }

  // 데스크톱: Sider + 리사이즈 핸들
  const currentWidth = collapsed ? SIDER_COLLAPSED_WIDTH : siderWidth;

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
              backgroundColor: '#1B3150',
            }}
        >
          {logoContent}
          {menuContent}
        </Sider>
        {/* 접히지 않은 상태에서만 리사이즈 핸들 표시 */}
        {!collapsed && resizeHandle}
      </div>
  );
};

export default LayoutNav;