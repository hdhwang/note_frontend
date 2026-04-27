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
    '/guest-book': 'group-data',
    '/lotto': 'group-utils',
    '/users': 'group-admin',
    '/audit-log': 'group-admin',
  };

  const accordionKeys = ['group-data', 'group-utils', 'group-admin'];

  // 1. 선택된 키(하이라이트) 관리 - 뒤로가기/외부링크 등 경로 변화 시에만 대응
  useEffect(() => {
    const path = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;
    
    // 현재 선택된 키가 이미 이 경로를 가리키고 있다면 변경하지 않음 (깜빡임 방지)
    const currentKey = selectedKeys[0];
    const currentPath = currentKey?.startsWith('fav-') ? currentKey.replace('fav-', '') : currentKey;
    
    if (currentPath === path) return;

    // 경로가 완전히 달라진 경우에만 자동 선택 로직 수행
    let keyToSelect = path;
    if (settings.favorites?.includes(path)) {
      keyToSelect = `fav-${path}`;
    }
    setSelectedKeys([keyToSelect]);
  }, [pathname, settings.favorites]); // selectedKeys는 의존성에서 제외 (무한 루프 방지)

  // 2. 초기 렌더링 시 즐겨찾기 그룹 설정 반영
  useEffect(() => {
    if (settings.favoritesExpanded) {
      setOpenKeys(prev => prev.includes('group-favorites') ? prev : [...prev, 'group-favorites']);
    }
  }, []); // 마운트 시 1회만 실행

  // 3. 경로 변경 시에만 자동 그룹 펼침 (사용자의 수동 조작 방해 금지)
  useEffect(() => {
    const path = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;
    const group = pathToGroup[path];
    
    // 현재 선택이 즐겨찾기 기반인지 판단
    let isFavoriteSelection = false;
    if (lastClickedKey && (lastClickedKey === path || lastClickedKey === `fav-${path}`)) {
      isFavoriteSelection = lastClickedKey.startsWith('fav-');
    } else if (settings.favorites?.includes(path)) {
      isFavoriteSelection = true;
    }

    setOpenKeys(prev => {
      let nextKeys = [...prev];
      let changed = false;

      if (isFavoriteSelection) {
        // 즐겨찾기로 이동 시 원본 그룹은 무시하고 즐겨찾기 그룹만 펼침
        if (!nextKeys.includes('group-favorites')) {
          nextKeys.push('group-favorites');
          changed = true;
        }
      } else if (group) {
        // 일반 메뉴로 이동 시 해당 아코디언 그룹을 펼치고 다른 것은 닫음
        if (!nextKeys.includes(group)) {
          nextKeys = nextKeys.filter(k => !accordionKeys.includes(k));
          nextKeys.push(group);
          changed = true;
        }
      }

      return changed ? nextKeys : prev;
    });
  }, [pathname]); // 오직 페이지 이동 시에만 실행됨

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
    
    setLastClickedKey(e.key);
    setSelectedKeys([e.key]);
    
    if (targetPath !== pathname) {
      navigate(targetPath, { replace: true });
    }

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
        { key: '/guest-book', label: <Link to={'/guest-book'}>결혼식 방명록</Link> },
        { key: '/bank-account', label: <Link to={'/bank-account'}>계좌번호</Link> },
        { key: '/note', label: <Link to={'/note'}>노트</Link> },
        { key: '/serial', label: <Link to={'/serial'}>시리얼 번호</Link> },
      ]
    },
    {
      key: 'group-utils',
      icon: <ToolOutlined />,
      label: '유틸리티',
      children: [
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
          <EditOutlined style={{ color: '#ffffff', fontSize: 30, flexShrink: 0 }} />
          <div style={{ 
            width: (!collapsed || isMobile) ? 'auto' : 0, 
            opacity: (!collapsed || isMobile) ? 1 : 0, 
            overflow: 'hidden', 
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap'
          }}>
            <Typography.Text style={{ color: '#ffffff', fontSize: 20, marginLeft: 10 }}>
              <b>NOTEPAD</b>
            </Typography.Text>
          </div>
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
        size={240}
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