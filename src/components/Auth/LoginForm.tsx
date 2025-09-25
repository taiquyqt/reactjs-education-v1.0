import React from "react";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (values: LoginFormValues) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  return (
    <Form
      name="login"
      onFinish={onLogin}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="usernameOrEmail"
        label="Username or email"
        rules={[
          { required: true, message: "Please enter username or email" },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Please enter username or email"
          autoComplete="username"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please enter password" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Please enter password"
          autoComplete="current-password"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
