import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutNav from "./layout";
import { Layout, Spin, Typography, message, Dropdown, Button } from "antd";
import Forbidden from "./error/forbidden";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
const { Header, Footer } = Layout;

interface Props {
    permissionRequired: string[];
}

const SecureRoute: FC<Props> = ({ component: Component, permissionRequired }) => {
    const [spinning, setSpinning] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const navigate = useNavigate();

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

    const items: MenuProps['items'] = [
        // {
        //     label: (
        //       <Button type="link">비밀번호 변경</Button>
        //     ),
        //     key: '0',
        // },
        // {
        //     type: 'divider',
        // },
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
            }}
          >
              {/* 왼쪽 콘텐츠 */}
              <div>Logo or Title</div>

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
          <LayoutNav permissions={permissions} />
          {spinning ? <Spin size="large" /> : <Component />}
          <pre />
          <Footer style={{
              marginLeft: 200,
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
      </>
    );
};

export default SecureRoute;