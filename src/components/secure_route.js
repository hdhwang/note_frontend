import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutNav from "./layout";
import { Layout, Spin, Typography, message } from "antd";
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
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");

            if (!accessToken) {
                // message.error("로그인이 필요합니다.");
                navigate("/login");
                return;
            }

            try {
                // Access token 검증
                await axios.post(`${process.env.REACT_APP_API_URL}/token/verify`, {
                    token: accessToken
                },{
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                // Decode the token to extract groups
                const decodedToken = jwtDecode(accessToken);
                setPermissions(decodedToken.groups || []);
                setLoading(false);
                setSpinning(false);
            } catch (error) {
                if (error.response && error.response.status === 401 && refreshToken) {
                    // Access token이 만료된 경우 refresh token으로 새로운 access token 발급
                    try {
                        const response = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh`, {
                            refresh: refreshToken,
                        });

                        if (response.status === 200) {
                            const { access } = response.data;
                            localStorage.setItem("access_token", access);
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
          <Header style={{
              marginLeft: 200,
              marginRight: 0,
              textAlign: 'center',
              color: 'white',
              backgroundColor: '#131629',
              fontSize: 'calc(10px + 2vmin)'
          }}>
              <Typography.Text style={{ color: '#ffffff', fontSize: 25 }}><b>NOTEPAD</b></Typography.Text>
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