import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutNav from "./layout";
import SettingsDrawer from "./settings";
import { Layout, Spin, Typography, message, Dropdown, Button, Modal, Form, Input, ConfigProvider, MenuProps, theme, Badge, Popover, Space } from "antd";
import { MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, BellOutlined, CheckCircleFilled, CloseCircleFilled, InfoCircleFilled, ExclamationCircleFilled, StarOutlined, StarFilled, SearchOutlined, QuestionCircleOutlined, DashboardOutlined, BankOutlined, KeyOutlined, FileTextOutlined, BookOutlined, DotChartOutlined, UserOutlined, AuditOutlined } from '@ant-design/icons';
import koKR from 'antd/es/locale/ko_KR';
import Forbidden from "./error/forbidden";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useSettings } from './settings_context';
import { useNotification } from './notification_context';

const { Header, Footer, Content } = Layout;

const getMenuName = (item: any) => {
    if (typeof item.content === 'string') {
        if (item.content.includes('설정')) return '환경 설정';
        if (item.content.includes('비밀번호')) return '보안 설정';
        if (item.content.includes('로그인')) return '로그인';
    }
    const path = item.pathname || '/';
    const mainPath = path === '/' ? '/' : `/${path.split('/')[1]}`;
    switch (mainPath) {
        case '/': return '대시보드';
        case '/bank-account': return '계좌번호';
        case '/serial': return '시리얼 번호';
        case '/note': return '노트';
        case '/guest-book': return '결혼식 방명록';
        case '/lotto': return '로또 번호 생성';
        case '/users': return '사용자 관리';
        case '/audit-log': return '감사 로그';
        case '/login': return '로그인';
        default: return '시스템 알림';
    }
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />;
        case 'error': return <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />;
        case 'warning': return <ExclamationCircleFilled style={{ color: '#faad14', fontSize: 20 }} />;
        case 'info':
        default: return <InfoCircleFilled style={{ color: '#1677ff', fontSize: 20 }} />;
    }
};

interface DecodedToken {
    groups?: string[];
    username?: string;
    first_name?: string;
    exp?: number;
}

interface SecureRouteProps {
    component: React.ComponentType<any>;
    permissionRequired?: string[];
}

const MOBILE_BREAKPOINT = 768;

const SecureRoute: React.FC<SecureRouteProps> = ({
                                                     component: Component,
                                                     permissionRequired,
                                                 }) => {
    const { settings, updateSettings } = useSettings();
    const collapsed = settings.collapsed;
    const setCollapsed = (val: boolean) => updateSettings({ collapsed: val });
    const siderWidth = settings.siderWidth;
    const isDarkMode = settings.themeMode === 'dark';
    const layoutColor = settings.layoutColor;

    const { notifications, unreadCount, markAsRead, clearNotifications } = useNotification();

    const [spinning, setSpinning] = useState<boolean>(true);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [firstname, setFirstname] = useState<string>('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < MOBILE_BREAKPOINT);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [form] = Form.useForm();

    // 화면 크기 변경 감지
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const verifyToken = async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const apiUrl = import.meta.env.VITE_API_URL;

                await axios.post(`${apiUrl}/token/verify`, {
                    token: accessToken
                },{
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const decodedToken = jwtDecode<DecodedToken>(accessToken);
                setPermissions(decodedToken.groups || []);
                setUsername(decodedToken.username || '');
                setFirstname(decodedToken.first_name || '');
                setLoading(false);
                setSpinning(false);
            } catch (error: any) {
                if (error.response && error.response.status === 401 && refreshToken) {
                    try {
                        const response = await axios.post(`${import.meta.env.VITE_API_URL}/token/refresh`, {
                            refresh: refreshToken,
                        });

                        if (response.status === 200) {
                            const { access } = response.data;
                            localStorage.setItem("access_token", access);
                            const decodedToken = jwtDecode<DecodedToken>(access);
                            setPermissions(decodedToken.groups || []);
                            setUsername(decodedToken.username || '');
                            setFirstname(decodedToken.first_name || '');
                            setLoading(false);
                            setSpinning(false);
                        }
                    } catch (refreshError) {
                        message.error("세션이 만료되었습니다. 다시 로그인 해주세요.");
                        navigate("/login");
                    }
                } else {
                    message.error("로그인이 필요합니다.");
                    navigate("/login");
                }
            }
        };

        verifyToken();
    }, [navigate]);

    // 단축키 핸들러
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 페이지 검색: Cmd+K 또는 Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchModalVisible(true);
            }
            // 즐겨찾기 토글: Alt+S
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                toggleFavorite();
            }
            // 도움말: Ctrl+/
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                setIsHelpModalVisible(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pathname, settings.favorites]);

    const toggleFavorite = () => {
        const isFavorite = settings.favorites?.includes(pathname);
        let newFavorites = [...(settings.favorites || [])];
        if (isFavorite) {
            newFavorites = newFavorites.filter(p => p !== pathname);
        } else {
            newFavorites.push(pathname);
        }
        updateSettings({ favorites: newFavorites });
    };

    const PAGES = [
        { name: '대시보드', path: '/', icon: <DashboardOutlined /> },
        { name: '결혼식 방명록', path: '/guest-book', icon: <BookOutlined /> },
        { name: '계좌번호', path: '/bank-account', icon: <BankOutlined /> },
        { name: '노트', path: '/note', icon: <FileTextOutlined /> },
        { name: '시리얼 번호', path: '/serial', icon: <KeyOutlined /> },
        { name: '로또 번호 생성', path: '/lotto', icon: <DotChartOutlined /> },
        { name: '사용자 관리', path: '/users', icon: <UserOutlined />, adminOnly: true },
        { name: '감사 로그', path: '/audit-log', icon: <AuditOutlined />, adminOnly: true },
    ];

    const filteredPages = PAGES.filter(page => {
        const hasPermission = !page.adminOnly || permissions.includes('관리자');
        const matchesQuery = page.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             page.path.toLowerCase().includes(searchQuery.toLowerCase());
        return hasPermission && matchesQuery;
    });

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    const showPasswordModal = () => {
        form.resetFields();
        setIsPasswordModalVisible(true);
    };

    const handlePasswordModalClose = () => {
        form.resetFields();
        setIsPasswordModalVisible(false);
    };

    const handlePasswordChange = async (values: any) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/v1/account/user`,
                {
                    password: values.currentPassword,
                    new_password: values.newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            message.success("비밀번호가 성공적으로 변경되었습니다.");
            handlePasswordModalClose();
        } catch (error) {
            message.error("비밀번호 변경에 실패했습니다.");
        }
    };

    const items: MenuProps['items'] = [
        {
            label: '환경 설정',
            key: 'settings',
            onClick: () => setIsSettingsVisible(true),
        },
        {
            label: '비밀번호 변경',
            key: 'password',
            onClick: showPasswordModal,
        },
        { type: 'divider' },
        {
            label: '로그아웃',
            key: 'logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    if (loading) {
        return <Spin spinning={spinning} fullscreen />;
    }

    if (permissionRequired != null && permissionRequired.length > 0) {
        const allowByPermission = permissionRequired.some(item => permissions.includes(item));
        if (!allowByPermission) {
            return <Forbidden />;
        }
    }

    const mainMarginLeft = isMobile ? 0 : (collapsed ? 80 : siderWidth);

    return (
        <ConfigProvider
            locale={koKR}
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : undefined,
                token: {
                    motionDurationSlow: '0.2s', // 0.15s -> 0.2s로 통일
                    motionDurationMid: '0.1s',
                }
            }}
        >
        <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
            <LayoutNav permissions={permissions} isMobile={isMobile} onOpenSettings={() => setIsSettingsVisible(true)} />

            <Layout style={{
                marginLeft: mainMarginLeft,
                width: isMobile ? '100%' : `calc(100% - ${mainMarginLeft}px)`,
                transition: 'margin-left 0.2s, width 0.2s',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: layoutColor,
                    padding: isMobile ? '0 10px' : '0 20px',
                    height: '64px',
                    flexShrink: 0,
                    zIndex: 10,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
                        <Button
                            type="text"
                            icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: '#ffffff', fontSize: 18 }}
                        />
                        <Button
                            type="text"
                            icon={<SearchOutlined />}
                            onClick={() => setIsSearchModalVisible(true)}
                            style={{ color: '#ffffff', fontSize: 18 }}
                            title="페이지 검색 (Ctrl+K)"
                        />
                        <Button
                            type="text"
                            icon={settings.favorites?.includes(pathname) ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                            onClick={toggleFavorite}
                            style={{ color: '#ffffff', fontSize: 18 }}
                            title="즐겨찾기 추가/해제 (Alt+S)"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
                        {!isMobile && (
                            <Button
                                type="text"
                                icon={<QuestionCircleOutlined />}
                                onClick={() => setIsHelpModalVisible(true)}
                                style={{ color: '#ffffff', fontSize: 20 }}
                                title="단축키 도움말 (Ctrl+/)"
                            />
                        )}
                        <Popover
                            content={
                                <div style={{ width: isMobile ? 280 : 300, maxHeight: 400, overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <Typography.Text strong>최근 알림</Typography.Text>
                                        <Button type="link" size="small" onClick={clearNotifications}>모두 지우기</Button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>새로운 알림이 없습니다.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {notifications.map((item, index) => (
                                                <div key={index} style={{ 
                                                    opacity: item.read ? 0.6 : 1, 
                                                    padding: '12px 16px', 
                                                    borderBottom: index < notifications.length - 1 ? '1px solid rgba(140, 140, 140, 0.12)' : 'none',
                                                    display: 'flex',
                                                    gap: 12
                                                }}>
                                                    <div style={{ marginTop: 2 }}>{getNotificationIcon(item.type)}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{getMenuName(item)}</Typography.Text>
                                                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography.Text>
                                                        </div>
                                                        <Typography.Text style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontSize: 14 }}>{item.content as React.ReactNode}</Typography.Text>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            }
                            trigger="click"
                            placement={isMobile ? "bottom" : "bottomRight"}
                            onOpenChange={(visible) => {
                                if (visible) markAsRead();
                            }}
                        >
                            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                                <BellOutlined style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }} />
                            </Badge>
                        </Popover>
                        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                            {isMobile ? (
                                <UserOutlined style={{ color: '#ffffff', fontSize: 20, cursor: 'pointer' }} />
                            ) : (
                                <Typography.Text style={{ color: '#ffffff', fontSize: 15, cursor: 'pointer' }}>
                                    <b>{username} ({firstname})</b>
                                </Typography.Text>
                            )}
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                }}>
                    {spinning ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                    ) : (
                        <Component />
                    )}
                </Content>

                <Footer style={{
                    textAlign: 'center',
                    color: isDarkMode ? '#999' : '#666',
                    backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                    padding: '10px',
                    flexShrink: 0,
                    height: '44px',
                    borderTop: isDarkMode ? '1px solid #303030' : '1px solid #e8e8e8'
                }}>
                    COPYRIGHT © HWANG HADONG. ALL RIGHT RESERVED
                </Footer>
            </Layout>

            <Modal
                title="비밀번호 변경"
                open={isPasswordModalVisible}
                onOk={() => form.submit()}
                onCancel={handlePasswordModalClose}
            >
                <Form form={form} onFinish={handlePasswordChange} layout="vertical">
                    <Form.Item
                        name="currentPassword"
                        label="현재 비밀번호"
                        rules={[{ required: true, message: '현재 비밀번호를 입력해주세요.' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="새 비밀번호"
                        rules={[{ required: true, message: '새 비밀번호를 입력해주세요.' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="새 비밀번호 확인"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: '새 비밀번호를 다시 입력해주세요.' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('새 비밀번호가 일치하지 않습니다.'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>

            <SettingsDrawer open={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} />

            {/* 페이지 검색 모달 */}
            <Modal
                title="페이지 검색"
                open={isSearchModalVisible}
                onCancel={() => {
                    setIsSearchModalVisible(false);
                    setSearchQuery('');
                }}
                footer={null}
                styles={{ body: { padding: '20px' } }}
                destroyOnHidden
            >
                <Input
                    placeholder="찾으시는 페이지 이름을 입력하세요..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredPages.map((page, index) => (
                        <div
                            key={index}
                            style={{ 
                                cursor: 'pointer', 
                                borderRadius: 8, 
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16
                            }}
                            onClick={() => {
                                navigate(page.path);
                                setIsSearchModalVisible(false);
                                setSearchQuery('');
                            }}
                            className="search-result-item"
                        >
                            <div style={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: 8, 
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {React.cloneElement(page.icon as React.ReactElement<any>, { style: { fontSize: 18 } })}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography.Text strong>{page.name}</Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{page.path}</Typography.Text>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredPages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Typography.Text type="secondary">검색 결과가 없습니다.</Typography.Text>
                    </div>
                )}
            </Modal>

            {/* 도움말 모달 */}
            <Modal
                title="시스템 단축키 안내"
                open={isHelpModalVisible}
                onCancel={() => setIsHelpModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsHelpModalVisible(false)}>
                        확인
                    </Button>
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { title: '페이지 검색', key: 'Cmd/Ctrl + K', icon: <SearchOutlined /> },
                        { title: '즐겨찾기 토글', key: 'Alt + S', icon: <StarOutlined /> },
                        { title: '단축키 도움말', key: 'Ctrl + /', icon: <QuestionCircleOutlined /> },
                    ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 18, color: '#1677ff' }}>{item.icon}</span>
                                <Typography.Text>{item.title}</Typography.Text>
                            </div>
                            <Space>
                                {item.key.split(' ').map((k, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <Typography.Text type="secondary">+</Typography.Text>}
                                        <kbd style={{
                                            padding: '2px 6px',
                                            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                            border: `1px solid ${isDarkMode ? '#555' : '#d9d9d9'}`,
                                            borderRadius: 4,
                                            fontSize: 12,
                                            boxShadow: '0 1px 0 rgba(0,0,0,0.2)'
                                        }}>{k}</kbd>
                                    </React.Fragment>
                                ))}
                            </Space>
                        </div>
                    ))}
                </div>
            </Modal>
        </Layout>
        </ConfigProvider>
    );
};

export default SecureRoute;