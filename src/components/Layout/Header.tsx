import React, { useMemo, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Space,
  Button,
  Dropdown,
  Breadcrumb,
  theme,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

type AppHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

// Sử dụng React.memo để tránh re-render không cần thiết
const AppHeader: React.FC<AppHeaderProps> = memo(({ collapsed, onToggle }) => {
  const {
    token: { colorBgContainer, colorText, colorIcon },
  } = theme.useToken();

  const { toggleTheme } = React.useContext(ThemeContext);
  const { logout, user } = useAuth();
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter(Boolean);

  const breadcrumbItems = useMemo(() => {
    const items: { title: React.ReactNode }[] = [
      {
        title: (
          <Link to="/dashboard" style={{ color: colorText }}>
            Dashboard
          </Link>
        ),
      },
    ];
    pathnames.forEach((value, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      items.push({
        title: (
          <Link to={href} style={{ color: colorText }}>
            <Text strong style={{ color: colorText }}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Text>
          </Link>
        ),
      });
    });
    return items;
  }, [pathnames, colorText]);


  const userDropdownMenuItems = useMemo(
    () => [
      {
        key: "logout",
        icon: <LogoutOutlined style={{ color: colorIcon }} />,
        label: "Logout",
        onClick: () => logout(),
      },
    ],
    [logout, colorIcon]
  );

  return (
    <AntHeader
      style={{
        padding: "0 16px",
        background: colorBgContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Space align="center">
        <Button
          type="text"
          onClick={onToggle}
          icon={
            collapsed ? (
              <MenuUnfoldOutlined style={{ color: colorIcon }} />
            ) : (
              <MenuFoldOutlined style={{ color: colorIcon }} />
            )
          }
          style={{ fontSize: 16 }}
          aria-label="Toggle sidebar"
        />
        <Breadcrumb items={breadcrumbItems} />
      </Space>

      <Space size="middle" align="center">
      
        <Button
          type="text"
          onClick={toggleTheme}
          icon={<BulbOutlined style={{ fontSize: 18, color: colorIcon }} />}
        />
        <Dropdown menu={{ items: userDropdownMenuItems }} placement="bottomRight" arrow>
          <Space
            style={{
              padding: "0 8px",
              cursor: "pointer",
              display: "flex",
              whiteSpace: "nowrap",
              color: colorText,
            }}
          >
            <UserOutlined style={{ fontSize: 18, color: colorIcon }} />
            <Text strong style={{ color: colorText }}>
              {user?.username || user?.email}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
});

export default AppHeader;