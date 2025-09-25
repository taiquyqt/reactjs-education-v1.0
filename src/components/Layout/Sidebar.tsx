import React, { useMemo, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  ProfileOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ReadOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onBreakpoint?: (broken: boolean) => void;
};

const mainMenuItems = [
  { key: "1", icon: <AppstoreOutlined />, label: "Dashboard", path: "/dashboard" },
  { key: "2", icon: <ReadOutlined />, label: "Subjects", path: "/subjects" },
  { key: "3", icon: <TeamOutlined />, label: "Classes", path: "/classes" },
  { key: "4", icon: <ClockCircleOutlined />, label: "Schedule", path: "/schedule" },
  { key: "5", icon: <BookOutlined />, label: "Materials", path: "/materials" },
  { key: "6", icon: <ProfileOutlined />, label: "Assignments", path: "/assignments" },
  { key: "7", icon: <ProfileOutlined />, label: "Quizzes", path: "/quizzes" },
  { key: "8", icon: <FileTextOutlined />, label: "Submissions", path: "/submissions" },
  { key: "9", icon: <CalendarOutlined />, label: "Attendance", path: "/attendance" },
  { key: "10", icon: <UserOutlined />, label: "Users", path: "/users" },
  { key: "11", icon: <AuditOutlined />, label: "Logs", path: "/logs" },
];

const Sidebar: React.FC<SidebarProps> = memo(({ collapsed, onBreakpoint }) => {
  const location = useLocation();

  const [selectedKey, renderedMenuItems] = useMemo(() => {
    const currentPath = location.pathname === "/" ? "/dashboard" : location.pathname;
    const item = mainMenuItems.find((i) => i.path === currentPath);
    const key = item ? item.key : "1";

    const items = mainMenuItems.map((menuItem) => ({
      key: menuItem.key,
      icon: menuItem.icon,
      label: <Link to={menuItem.path}>{menuItem.label}</Link> as React.ReactNode,
    }));

    return [key, items];
  }, [location.pathname]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      breakpoint="lg"
      collapsedWidth={80}
      onBreakpoint={onBreakpoint}
      style={{ position: "sticky", top: 0, height: "100vh" }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        <ReadOutlined style={{ fontSize: 28, marginRight: collapsed ? 0 : 8 }} />
        {!collapsed && "Admin"}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={renderedMenuItems} />
    </Sider>
  );
});

export default Sidebar;