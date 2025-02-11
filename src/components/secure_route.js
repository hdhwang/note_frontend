import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutNav from "./layout";
import { Layout, Spin, Typography, message, Dropdown, Button, Modal, Form, Input, ConfigProvider } from "antd";
import koKR from 'antd/lib/locale/ko_KR';
import Forbidden from "./error/forbidden";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
const { Header, Footer } = Layout;

const SecureRoute = ({ component: Component, permissionRequired, collapsed, setCollapsed }) => {
    const [spinning, setSpinning] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        const verifyToken = async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                await axios.post(`${process.env.REACT_APP_API_URL}/token/verify`, {
                    token: accessToken
                },{
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const decodedToken = jwtDecode(accessToken);
                setPermissions(decodedToken.groups || []);
                setUsername(decodedToken.username || '');
                setFirstname(decodedToken.first_name || '');
                setLoading(false);
                setSpinning(false);
            } catch (error) {
                if (error.response && error.response.status === 401 && refreshToken) {
                    try {
                        const response = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh`, {
                            refresh: refreshToken,
                        });

                        if (response.status === 200) {
                            const { access } = response.data;
                            localStorage.setItem("access_token", access);
                            const decodedToken = jwtDecode(access);
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

    const handlePasswordChange = async (values) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            await axios.put(
              `${process.env.REACT_APP_API_URL}/api/v1/account/user`,
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

    const items = [
        {
            label: (
              <Button type="link" onClick={showPasswordModal}>비밀번호 변경</Button>
            ),
            key: '0',
        },
        {
            type: 'divider',
        },
        {
            label: (
              <Button type="link" onClick={handleLogout}>로그아웃</Button>
            ),
            key: '1',
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

    return (
      <>
          <Header
            style={{
                display: 'flex',
                justifyContent: 'space-between', // 좌우로 요소 배치
                alignItems: 'center', // 세로 중앙 정렬
                backgroundColor: '#131629',
                color: 'white',
                padding: '0 20px', // 좌우 여백
                height: '64px',
            }}
          >
              {/* 왼쪽 콘텐츠 */}
              <div></div>

              {/* 우측 Dropdown */}
              <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
              >
                  <Typography.Text
                    style={{
                        color: '#ffffff',
                        fontSize: 15,
                        cursor: 'pointer',
                    }}
                  >
                      <b>{username} ({firstname})</b>
                  </Typography.Text>
              </Dropdown>
          </Header>
          <LayoutNav permissions={permissions} collapsed={collapsed} setCollapsed={setCollapsed} />
          {spinning ? <Spin size="large" /> : <ConfigProvider locale={koKR}><Component collapsed={collapsed} /></ConfigProvider>}
          <Footer style={{
              marginLeft: 80,
              marginRight: 0,
              bottom: 0,
              textAlign: 'center',
              color: 'white',
              backgroundColor: 'lightgrey',
              fontSize: 'calc(14px)',
              padding: '10px 10px',
          }}>
              COPYRIGHT © HWANG HADONG. ALL RIGHT RESERVED
          </Footer>
          <Modal
            title="비밀번호 변경"
            open={isPasswordModalVisible}
            onCancel={handlePasswordModalClose}
            footer={null}
          >
              <Form form={form} onFinish={handlePasswordChange} layout="vertical">
                  <Form.Item
                    name="currentPassword"
                    label="기존 비밀번호"
                    rules={[{ required: true, message: "기존 비밀번호를 입력하세요" }]}
                  >
                      <Input.Password style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="신규 비밀번호"
                    rules={[{ required: true, message: "신규 비밀번호를 입력하세요" }]}
                  >
                      <Input.Password style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="confirmNewPassword"
                    label="신규 비밀번호 확인"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "신규 비밀번호 확인을 입력하세요" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('신규 비밀번호가 일치하지 않습니다.'));
                            },
                        }),
                    ]}
                  >
                      <Input.Password style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item style={{ textAlign: 'right' }}>
                      <Button type="primary" htmlType="submit">
                          비밀번호 변경
                      </Button>
                  </Form.Item>
              </Form>
          </Modal>
      </>
    );
};

export default SecureRoute;