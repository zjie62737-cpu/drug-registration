import { Layout, Button, Dropdown, Badge, Space, Avatar, Tag } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  KeyOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/applicationService';
import { ROLE_LABELS } from '../../utils/constants';
import type { Notification } from '../../types/application';
import type { SystemCode } from './AppLayout';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  system: SystemCode;
}

const SYSTEM_INFO: Record<SystemCode, { label: string; color: string; bgColor: string }> = {
  nmpa: { label: 'NMPA 中国药品注册', color: '#1A5C9E', bgColor: '#1A3A6B' },
  fda: { label: 'FDA Drug Registration', color: '#0071BC', bgColor: '#112E51' },
  ema: { label: 'EMA Marketing Authorisation', color: '#003399', bgColor: '#003399' },
  legacy: { label: '药品注册系统', color: '#1677ff', bgColor: '#1677ff' },
};

export default function Header({ collapsed, onToggle, system }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dashboardService.getNotifications().then(setNotifications).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    await dashboardService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const sysInfo = SYSTEM_INFO[system];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `${user?.realName} (${ROLE_LABELS[user?.role || ''] || user?.role})`,
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'portal',
      icon: <HomeOutlined />,
      label: '返回门户',
      onClick: () => navigate('/'),
    },
    {
      key: 'password',
      icon: <KeyOutlined />,
      label: '修改密码',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') handleLogout();
    if (key === 'portal') navigate('/');
  };

  const notifItems = notifications.length === 0
    ? [{ key: 'empty', label: '暂无通知', disabled: true }]
    : [
        ...notifications.slice(0, 10).map((n) => ({
          key: String(n.id),
          label: (
            <div style={{ maxWidth: 300 }}>
              <div style={{ fontWeight: n.isRead ? 'normal' : 600 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{n.message}</div>
            </div>
          ),
        })),
        { type: 'divider' as const },
        {
          key: 'markAll',
          label: '全部标记为已读',
          onClick: handleMarkAllRead,
        },
      ];

  return (
    <AntHeader
      style={{
        background: sysInfo.bgColor,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `3px solid ${sysInfo.color}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 16, width: 48, height: 48, color: '#fff' }}
        />
        <Tag style={{ margin: 0, borderColor: 'rgba(255,255,255,0.4)', color: '#fff', background: 'transparent' }}>
          {sysInfo.label}
        </Tag>
      </Space>

      <Space size="large">
        <Dropdown
          menu={{ items: notifItems }}
          open={notifOpen}
          onOpenChange={setNotifOpen}
          trigger={['click']}
        >
          <Badge count={unreadCount} size="small">
            <Button type="text" icon={<BellOutlined style={{ fontSize: 18, color: '#fff' }} />} />
          </Badge>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
            <span style={{ color: '#fff' }}>{user?.realName}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
