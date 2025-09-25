import React, { useCallback, useState, Suspense, lazy } from "react";
import { Layout, Spin } from "antd";
import { Outlet } from "react-router-dom";

// Tải động các component
const Sidebar = lazy(() => import("./Sidebar"));
const AppHeader = lazy(() => import("./Header"));

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);
  const handleBreakpoint = useCallback((broken: boolean) => {
    setCollapsed(broken);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Suspense fallback={<Spin size="large" style={{ margin: 'auto', display: 'block', padding: '50px' }} />}>
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} onBreakpoint={handleBreakpoint} />
        <Layout>
          <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
          <Content style={{ margin: "16px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Suspense>
    </Layout>
  );
};

export default MainLayout;