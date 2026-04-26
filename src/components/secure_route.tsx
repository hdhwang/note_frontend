import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutNav from "./layout";
import { Layout, Spin, Typography, message, Dropdown, Button, Modal, Form, Input, ConfigProvider, MenuProps, theme } from "antd";
import { MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import koKR from 'antd/es/locale/ko_KR';
import Forbidden from "./error/forbidden";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const { Header, Footer, Content } = Layout;

interface DecodedToken {
    groups?: string[];
    username?: string;
    first_name?: string;
    exp?: number;
}

interface SecureRouteProps {
    component: React.ComponentType<any>;
    permissionRequired?: string[];
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

// 모바일 판별 기준 (Ant Design Sider의 md breakpoint와 동일)
const MOBILE_BREAKPOINT = 768;

const SecureRoute: React.FC<SecureRouteProps> = ({
                                                     component: Component,
                                                     permissionRequired,
                                                     collapsed,
                                                     setCollapsed
                                                 }) => {
    const [spinning, setSpinning] = useState<boolean>(true);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [firstname, setFirstname] = useState<string>('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < MOBILE_BREAKPOINT);
    const [siderWidth, setSiderWidth] = useState<number>(200);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    );

    const navigate = useNavigate();
    const [form] = Form.useForm();

    // 화면 크기 변경 감지
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
            // 모바일 전환 시 사이드바 자동으로 닫기
            if (mobile) {
                setCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        // 초기 실행
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [setCollapsed]);

    // 시스템 다크 모드 감지
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
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
            label: '비밀번호 변경',
            key: '0',
            onClick: showPasswordModal,
        },
        { type: 'divider' },
        {
            label: '로그아웃',
            key: '1',
            danger: true,
            onClick: handleLogout,
        },
    ];

    // 런타임 에러 방지: 컴포넌트 이름은 반드시 대문자 'Spin'이어야 함
    if (loading) {
        return <Spin spinning={spinning} fullscreen />;
    }

    if (permissionRequired != null && permissionRequired.length > 0) {
        const allowByPermission = permissionRequired.some(item => permissions.includes(item));
        if (!allowByPermission) {
            return <Forbidden />;
        }
    }

    // 모바일에서는 marginLeft 0, 데스크톱에서는 사이드바 너비만큼
    const mainMarginLeft = isMobile ? 0 : (collapsed ? 80 : siderWidth);

    return (
        <ConfigProvider
            locale={koKR}
            theme={isDarkMode ? { algorithm: theme.darkAlgorithm } : undefined}
        >
        <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
            {/* 왼쪽 사이드바 (fixed 고정 / 모바일에서는 Drawer) */}
            <LayoutNav permissions={permissions} collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} siderWidth={siderWidth} onSiderWidthChange={setSiderWidth} />

            {/* 오른쪽 메인 영역 */}
            <Layout style={{
                marginLeft: mainMarginLeft,
                transition: 'margin-left 0.2s',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#1B3150',
                    padding: '0 20px',
                    height: '64px',
                    flexShrink: 0,
                    zIndex: 10,
                    width: '100%'
                }}>
                    {/* 사이드바 접기/펼치기 토글 버튼 */}
                    <div>
                        <Button
                            type="text"
                            icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: '#ffffff', fontSize: 18 }}
                        />
                    </div>
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" overlayClassName="header-dropdown">
                        <Typography.Text style={{ color: '#ffffff', fontSize: 15, cursor: 'pointer' }}>
                            <b>{username} ({firstname})</b>
                        </Typography.Text>
                    </Dropdown>
                </Header>

                {/* 실제 스크롤이 발생하는 핵심 영역 */}
                <Content style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: isDarkMode ? '#141414' : '#f0f2f5',
                }}>
                    {spinning ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                    ) : (
                        <Component collapsed={collapsed} />
                    )}
                </Content>

                <Footer style={{
                    textAlign: 'center',
                    color: isDarkMode ? '#999' : '#666',
                    backgroundColor: isDarkMode ? '#141414' : '#f0f2f5',
                    padding: '10px',
                    flexShrink: 0,
                    height: '44px',
                    borderTop: isDarkMode ? '1px solid #303030' : '1px solid #e8e8e8'
                }}>
                    COPYRIGHT © HWANG HADONG. ALL RIGHT RESERVED
                </Footer>
            </Layout>

            {/* 비밀번호 변경 모달 */}
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
                </Form>
            </Modal>
        </Layout>
        </ConfigProvider>
    );
};

export default SecureRoute;