import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Timeline, Typography, Spin, Tag } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/applicationService';
import { useAuthStore } from '../../store/authStore';
import { APPLICATION_STATUS } from '../../utils/constants';
import type { DashboardStats, Activity } from '../../types/application';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getActivities(),
    ])
      .then(([s, a]) => {
        setStats(s);
        setActivities(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const activityIcons: Record<string, React.ReactNode> = {
    submitted: <SendOutlined />,
    stage_completed: <CheckCircleOutlined />,
    approve: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    request_supplement: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    reject: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  };

  const activityColors: Record<string, string> = {
    submitted: 'blue',
    stage_completed: 'green',
    approve: 'green',
    request_supplement: 'orange',
    reject: 'red',
    review: 'blue',
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        欢迎回来，{user?.realName}
      </Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications')}>
            <Statistic
              title="全部申请"
              value={stats?.total || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications?status=draft')}>
            <Statistic
              title="草稿"
              value={stats?.draft || 0}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications?status=under_review')}>
            <Statistic
              title="审评中"
              value={stats?.underReview || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications?status=supplement_needed')}>
            <Statistic
              title="需补正"
              value={stats?.supplement || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications?status=approved')}>
            <Statistic
              title="已批准"
              value={stats?.approved || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/applications?status=rejected')}>
            <Statistic
              title="未批准"
              value={stats?.rejected || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title="最近动态">
        {activities.length === 0 ? (
          <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无动态</div>
        ) : (
          <Timeline
            items={activities.map((a) => ({
              color: activityColors[a.type] || 'gray',
              dot: activityIcons[a.type] || undefined,
              children: (
                <div>
                  <div>
                    {a.description}
                    {a.applicationNo && (
                      <Tag
                        style={{ marginLeft: 8, cursor: 'pointer' }}
                        onClick={() => navigate(`/applications/${a.applicationId}`)}
                      >
                        {a.applicationNo}
                      </Tag>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(a.time).toLocaleString('zh-CN')}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
