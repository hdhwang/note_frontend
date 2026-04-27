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
  UserOutlined,
  DatabaseOutlined,
  ToolOutlined,
  LockOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useSettings } from './settings_context';

const { Sider } = Layout;

const SIDER_MIN_WIDTH = 220;
const SIDER_MAX_WIDTH = 400;
const SIDER_COLLAPSED_WIDTH = 80;

const getMenuName = (path: string) => {
  switch (path) {
    case '/': return '대시보드';
    case '/bank-account': return '계좌번호';
    case '/serial': return '시리얼 번호';
    case '/note': return '노트';
    case '/guest-book': return '결혼식 방명록';
    case '/lotto': return '로또 번호 생성';
    case '/users': return '사용자 관리';
    case '/audit-log': return '감사 로그';
    default: return path;
  }
};

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
  const [lastClickedKey, setLastClickedKey] = useState<string | null>(null);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const siderRef = useRef<HTMLDivElement>(null);

  const pathToGroup: Record<string, string> = {
    '/bank-account': 'group-data',
    '/serial': 'group-data',
    '/note': 'group-data',
    '/guest-book': 'group-utils',
    '/lotto': 'group-utils',
    '/users': 'group-admin',
    '/audit-log': 'group-admin',
  };

  const accordionKeys = ['group-data', 'group-utils', 'group-admin'];

  useEffect(() => {
    const path = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;
    
    // 마지막으로 클릭한 키가 현재 경로와 일치하면 그 키를 우선 사용
    // 정보가 없는 경우(새로고침 등), 즐겨찾기에 있는 메뉴라면 즐겨찾기 키를 우선적으로 선택
    let keyToSelect = path;
    if (lastClickedKey && (lastClickedKey === path || lastClickedKey === `fav-${path}`)) {
      keyToSelect = lastClickedKey;
    } else if (settings.favorites?.includes(path)) {
      keyToSelect = `fav-${path}`;
    }
    
    setSelectedKeys([keyToSelect]);
    
    const group = pathToGroup[path];
    
    setOpenKeys(prev => {
      let nextKeys = [...prev];
      
      // 1. 즐겨찾기 그룹: 설정에 저장된 펼침 상태 반영
      const isFavOpen = settings.favoritesExpanded;
      if (isFavOpen && !nextKeys.includes('group-favorites')) {
        nextKeys.push('group-favorites');
      } else if (!isFavOpen && nextKeys.includes('group-favorites')) {
        nextKeys = nextKeys.filter(k => k !== 'group-favorites');
      }
      
      // 현재 경로가 즐겨찾기에 있고 즐겨찾기 그룹이 닫혀있다면 강제로 열어줌 (사용자 편의)
      if (settings.favorites?.includes(path) && !nextKeys.includes('group-favorites')) {
        nextKeys.push('group-favorites');
        updateSettings({ favoritesExpanded: true });
      }
      
      // 2. 일반 그룹 (아코디언): 하나만 열리도록 관리
      if (group && (!lastClickedKey || !lastClickedKey.startsWith('fav-'))) {
        nextKeys = nextKeys.filter(k => !accordionKeys.includes(k) || k === group);
        if (!nextKeys.includes(group)) nextKeys.push(group);
      } else if (!group && (!lastClickedKey || !lastClickedKey.startsWith('fav-'))) {
        nextKeys = nextKeys.filter(k => !accordionKeys.includes(k));
      }
      
      return nextKeys;
    });
  }, [pathname, settings.favorites, settings.favoritesExpanded, lastClickedKey, updateSettings]);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    
    // 즐겨찾기 그룹의 펼침 상태가 변경되었는지 확인
    const isFavNowOpen = keys.includes('group-favorites');
    if (isFavNowOpen !== settings.favoritesExpanded) {
      updateSettings({ favoritesExpanded: isFavNowOpen });
    }

    if (latestOpenKey && accordionKeys.includes(latestOpenKey)) {
      const nextKeys = keys.filter(k => !accordionKeys.includes(k) || k === latestOpenKey);
      setOpenKeys(nextKeys);
    } else {
      setOpenKeys(keys);
    }
  };

  const onClick: MenuProps['onClick'] = (e) => {
    const targetPath = e.key.startsWith('fav-') ? e.key.replace('fav-', '') : e.key;
    if (targetPath === pathname) {
      // 이미 같은 경로일 때도 클릭된 키 정보를 업데이트하여 하이라이트 유지
      setLastClickedKey(e.key);
      setSelectedKeys([e.key]);
      return;
    }
    
    setLastClickedKey(e.key);
    setSelectedKeys([e.key]);
    
    navigate(targetPath, { replace: true });
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
  let menuItems: MenuProps['items'] = [];

  if (settings.favorites && settings.favorites.length > 0) {
    menuItems.push({
      key: 'group-favorites',
      icon: <StarOutlined />,
      label: '즐겨찾기',
      children: settings.favorites.map(path => ({
        key: `fav-${path}`,
        label: <Link to={path}>{getMenuName(path)}</Link>
      }))
    });
  }

  menuItems.push(
    { key: '/', icon: <DashboardOutlined />, label: <Link to={'/'}>대시보드</Link> },
    {
      key: 'group-data',
      icon: <DatabaseOutlined />,
      label: '데이터 관리',
      children: [
        { key: '/bank-account', label: <Link to={'/bank-account'}>계좌번호</Link> },
        { key: '/serial', label: <Link to={'/serial'}>시리얼 번호</Link> },
        { key: '/note', label: <Link to={'/note'}>노트</Link> },
      ]
    },
    {
      key: 'group-utils',
      icon: <ToolOutlined />,
      label: '유틸리티',
      children: [
        { key: '/guest-book', label: <Link to={'/guest-book'}>결혼식 방명록</Link> },
        { key: '/lotto', label: <Link to={'/lotto'}>로또 번호 생성</Link> },
      ]
    }
  );

  try {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      const permissionList = decodedToken.groups || [];
      if (permissionList.includes('관리자')) {
        menuItems.push({
          key: 'group-admin',
          icon: <LockOutlined />,
          label: '시스템 관리',
          children: [
            { key: '/users', label: <Link to={'/users'}>사용자 관리</Link> },
            { key: '/audit-log', label: <Link to={'/audit-log'}>감사 로그</Link> },
          ]
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
      openKeys={openKeys}
      onOpenChange={onOpenChange}
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
        width={240}
        styles={{
          body: { padding: 0, backgroundColor: layoutColor, overflowX: 'hidden' },
          header: { display: 'none' },
        }}
      >
        <Layout style={{ minHeight: '100vh', backgroundColor: layoutColor }}>
          <Sider
            collapsed={false}
            width={240}
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