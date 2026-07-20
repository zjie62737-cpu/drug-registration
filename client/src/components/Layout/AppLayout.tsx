import { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

export type SystemCode = 'nmpa' | 'fda' | 'ema' | 'legacy';

export function detectSystem(pathname: string): SystemCode {
  if (pathname.startsWith('/nmpa')) return 'nmpa';
  if (pathname.startsWith('/fda')) return 'fda';
  if (pathname.startsWith('/ema')) return 'ema';
  return 'legacy';
}

const SYSTEM_CONTENT_BG: Record<SystemCode, string> = {
  nmpa: '#F0F2F5',
  fda: '#F7FAFD',
  ema: '#F8F9FC',
  legacy: '#fff',
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const system = useMemo(() => detectSystem(location.pathname), [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} system={system} />
        <Content style={{
          margin: 24,
          padding: 24,
          background: SYSTEM_CONTENT_BG[system],
          borderRadius: 8,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
