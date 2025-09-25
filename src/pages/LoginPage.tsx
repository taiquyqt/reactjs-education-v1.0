import React from "react";
import { App as AntdApp, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/authApi";
import type { Credentials, AuthResponse } from "../types/Auth";
import type { User } from "../types/User";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/Auth/LoginForm";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authContextLogin, logout: authContextLogout } = useAuth();
  const { message: messageApi } = AntdApp.useApp();

  const handleLogin = async (values: { usernameOrEmail: string; password: string }) => {
    try {
      const payload: Credentials = values.usernameOrEmail.includes("@")
        ? { email: values.usernameOrEmail, password: values.password }
        : { username: values.usernameOrEmail, password: values.password };

      const { token, user: authUser }: AuthResponse = await apiLogin(payload);
      console.log("Phản hồi từ API:", authUser);

      const appUser: User = {
        id: authUser.id,
        username: authUser.username,
        full_name: authUser.fullName,
        email: authUser.email,
        roles: authUser.roles.map((role: string, index: number) => ({
          id: index,
          name: role,
        })),
      };

      authContextLogin(token, appUser);

      const hasAccess = appUser.roles.some((r) => r.name === "admin");

      if (hasAccess) {
        messageApi.success("Login successful!");
        navigate("/");
      } else {
        messageApi.error("You do not have access to the Dashboard.");
        authContextLogout();
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message ||
        "Username or password is incorrect.";
      messageApi.error(errorMessage);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400, borderRadius: 12 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            Admin Dashboard
          </Title>
          <Text type="secondary">Please log in to continue</Text>
        </div>
        <LoginForm onLogin={handleLogin} />
      </Card>
    </div>
  );
};

export default LoginPage;
