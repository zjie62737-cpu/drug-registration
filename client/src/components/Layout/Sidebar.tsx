import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  FormOutlined,
  AuditOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

type SystemCode = 'nmpa' | 'fda' | 'ema' | 'legacy';

function detectSystem(pathname: string): SystemCode {
  if (pathname.startsWith('/nmpa')) return 'nmpa';
  if (pathname.startsWith('/fda')) return 'fda';
  if (pathname.startsWith('/ema')) return 'ema';
  return 'legacy';
}

const SYSTEM_CONFIG: Record<SystemCode, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  nmpa: { label: '🇨🇳 NMPA 药品注册', icon: <ExperimentOutlined />, color: '#1A5C9E', bgColor: '#1A3A6B' },
  fda: { label: '🇺🇸 FDA Drug Registration', icon: <GlobalOutlined />, color: '#0071BC', bgColor: '#112E51' },
  ema: { label: '🇪🇺 EMA Marketing Authorisation', icon: <SafetyCertificateOutlined />, color: '#003399', bgColor: '#003399' },
  legacy: { label: '🏥 药品注册系统', icon: <MedicineBoxOutlined />, color: '#1A5C9E', bgColor: '#1A3A6B' },
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const system = useMemo(() => detectSystem(location.pathname), [location.pathname]);
  const sysCfg = SYSTEM_CONFIG[system];

  // Build menu based on current system
  const menuItems = useMemo(() => {
    const items: MenuProps['items'] = [];

    // Portal link always first
    items.push({
      key: '/',
      icon: <HomeOutlined />,
      label: '返回门户',
    });

    // System dashboard
    if (system !== 'legacy') {
      items.push({ type: 'divider' as const });
      items.push({
        key: `/${system}`,
        icon: sysCfg.icon,
        label: `${system.toUpperCase()} 仪表盘`,
      });
    } else {
      items.push({
        key: '/home',
        icon: <DashboardOutlined />,
        label: '仪表盘',
      });
    }

    // Applications list
    if (system !== 'legacy') {
      items.push({
        key: `/${system}/applications`,
        icon: <FileTextOutlined />,
        label: '注册申请列表',
      });
    } else {
      items.push({
        key: '/applications',
        icon: <FileTextOutlined />,
        label: '注册申请',
      });
    }

    // Create application
    if (user?.role === 'applicant' || user?.role === 'admin') {
      if (system !== 'legacy') {
        items.push({
          key: `/${system}/applications/new`,
          icon: <FormOutlined />,
          label: '新建注册申请',
        });
      } else {
        items.push({
          key: '/applications/new',
          icon: <FormOutlined />,
          label: '新建申请',
        });
      }
    }

    // Review tasks
    if (user?.role === 'reviewer' || user?.role === 'approver' || user?.role === 'admin') {
      if (system === 'legacy') {
        items.push({
          key: '/reviewer/tasks',
          icon: <AuditOutlined />,
          label: '审评任务',
        });
      }
    }

    // Admin
    if (user?.role === 'admin') {
      if (system === 'legacy') {
        items.push({
          key: '/admin/users',
          icon: <UserOutlined />,
          label: '用户管理',
        });
      }
    }

    return items;
  }, [system, user?.role, sysCfg]);

  // Compute selected key
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path === `/${system}` || (system === 'legacy' && path === '/home')) return path;
    // Match parent key
    const matchedItem = menuItems?.find((item) => {
      if (item && 'key' in item && typeof item.key === 'string' && item.key !== '/') {
        return path.startsWith(item.key);
      }
      return false;
    });
    return matchedItem && 'key' in matchedItem ? matchedItem.key as string : path;
  }, [location.pathname, system, menuItems]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: sysCfg.bgColor,
      }}>
        {collapsed ? (
          <span style={{ fontSize: 22 }}>{sysCfg.icon}</span>
        ) : (
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {sysCfg.label}
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
