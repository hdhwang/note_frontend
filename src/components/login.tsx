import React from "react";
import { Form, Input, Button, Typography, Card, message, ConfigProvider, theme } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSettings } from './settings_context';

const { Title } = Typography;

interface LoginResponse {
  access: string;
  refresh: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isDarkMode = settings.themeMode === 'dark';

  const onFinish = async (values: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post<LoginResponse>(`${apiUrl}/token`, {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        const { access, refresh } = response.data;
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        navigate("/");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        message.error("아이디 또는 비밀번호가 잘못되었습니다.");
      } else {
        message.error("로그인 중 오류가 발생했습니다.");
      }
      console.error(error);
    }
  };

  return (
      <ConfigProvider theme={isDarkMode ? { algorithm: theme.darkAlgorithm } : undefined}>
      <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: isDarkMode ? '#141414' : '#f0f2f5',
          }}
      >
        <Card className="login-card" style={{ width: 400 }}>
          <Title level={3} style={{ fontSize: 30, textAlign: "center" }}>
            <b>Notepad</b>
          </Title>
          <Form
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
          >
            <Form.Item
                name="username"
                rules={[
                  { required: true, message: "사용자 이름을 입력해주세요!" },
                ]}
            >
              <Input
                  prefix={<UserOutlined />}
                  placeholder="사용자 이름"
              />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                  { required: true, message: "비밀번호를 입력해주세요!" },
                ]}
            >
              <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="비밀번호"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                로그인
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      </ConfigProvider>
  );
};

export default Login;