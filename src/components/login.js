import React from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/token`, {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        // 로그인 성공
        const { access, refresh } = response.data; // 토큰 데이터

        // 토큰 저장
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        navigate("/"); // 메인 페이지로 이동
      }
    } catch (error) {
      // 로그인 실패 처리
      if (error.response && error.response.status === 401) {
        message.error("아이디 또는 비밀번호가 잘못되었습니다.");
      } else {
        message.error("로그인 중 오류가 발생했습니다.");
      }
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{fontSize: 30, textAlign: "center" }}>
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
  );
};

export default Login;