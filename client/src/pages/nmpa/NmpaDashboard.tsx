import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Statistic, Table, Tag, Button, Typography, Space, Spin, Progress, Tooltip,
} from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ExperimentOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { dashboardService, applicationService } from '../../services/applicationService';
import { APPLICATION_TYPES, APPLICATION_STATUS, STAGE_LABELS, NMPA_REVIEW_TIMELINES } from '../../utils/constants';
import type { DashboardStats, Application } from '../../types/application';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function NmpaDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      applicationService.list({ page: 1, pageSize: 10 }),
    ])
      .then(([s, res]) => {
        setStats(s);
        setRecentApps(res.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  // Application type distribution for pie chart
  const typeCounts: Record<string, number> = {};
  recentApps.forEach((a) => {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
  });

  // Stage distribution - count apps in each stage
  const stageCounts: Record<string, number> = {};
  recentApps.forEach((app) => {
    const active = app.stages?.find((s) => s.status === 'in_progress');
    if (active) {
      stageCounts[active.stageName] = (stageCounts[active.stageName] || 0) + 1;
    }
  });

  const pieColors = ['#1A5C9E', '#47A8E5', '#73D13D', '#FFC53D', '#FF7A45'];
  const typeEntries = Object.entries(typeCounts);
  const totalType = typeEntries.reduce((s, [, c]) => s + c, 1) || 1;

  const getDeadlineApps = () => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    return recentApps.filter((app) => {
      const active = app.stages?.find((s) => s.status === 'in_progress');
      if (!active?.deadline) return false;
      return new Date(active.deadline).getTime() - now < week;
    });
  };
  const deadlineApps = getDeadlineApps();

  const columns: ColumnsType<Application> = [
    {
      title: '受理号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 140,
      render: (no) => no || <Tag>草稿</Tag>,
    },
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 160,
    },
    {
      title: '注册类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (t) => {
        const label = APPLICATION_TYPES[t] || t;
        const timeline = NMPA_REVIEW_TIMELINES[t];
        return timeline ? (
          <Tooltip title={timeline}>
            <span>{label}</span>
          </Tooltip>
        ) : label;
      },
    },
    {
      title: '当前阶段',
      key: 'currentStage',
      width: 120,
      render: (_, r) => {
        const active = r.stages?.find((s) => s.status === 'in_progress');
        if (!active) return '-';
        const label = STAGE_LABELS[active.stageName] || active.stageName;
        // Mark parallel stages
        if (active.stageName === 'onsite_inspection' || active.stageName === 'sample_testing') {
          return <span>{label} <Tag color="blue" style={{ fontSize: 10, padding: '0 4px' }}>并行</Tag></span>;
        }
        if (active.stageName === 'technical_review') {
          return <span>{label} <Tag color="geekblue" style={{ fontSize: 10, padding: '0 4px' }}>三线</Tag></span>;
        }
        return label;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s) => {
        const cfg = APPLICATION_STATUS[s];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : s;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (d) => new Date(d).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => navigate(`/nmpa/applications/${r.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#1A5C9E' }}>
            NMPA 药品注册管理
          </Title>
          <span style={{ color: '#999', fontSize: 13 }}>National Medical Products Administration — 药品审评中心 (CDE)</span>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#1A5C9E', borderColor: '#1A5C9E' }}
            onClick={() => navigate('/nmpa/applications/new?type=IND')}
          >
            新建IND
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/nmpa/applications/new?type=NDA')}
          >
            新建NDA
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/nmpa/applications/new?type=ANDA')}
          >
            新建ANDA
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/nmpa/applications')}>
            <Statistic
              title="全部申请"
              value={stats?.total || 0}
              prefix={<FileTextOutlined style={{ color: '#1A5C9E' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/nmpa/applications?status=draft')}>
            <Statistic
              title="草稿"
              value={stats?.draft || 0}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={3}>
          <Card hoverable onClick={() => navigate('/nmpa/applications?status=submitted')}>
            <Statistic
              title="已提交"
              value={stats?.submitted || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1A5C9E' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={3}>
          <Card hoverable onClick={() => navigate('/nmpa/applications?status=under_review')}>
            <Statistic
              title="审评中"
              value={stats?.underReview || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={3}>
          <Card hoverable onClick={() => navigate('/nmpa/applications?status=approved')}>
            <Statistic
              title="已批准"
              value={stats?.approved || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={3}>
          <Card hoverable onClick={() => navigate('/nmpa/applications?status=rejected')}>
            <Statistic
              title="不批准"
              value={stats?.rejected || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Application Type Distribution */}
        <Col xs={24} md={8}>
          <Card title="注册类型分布" size="small">
            {typeEntries.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无数据</div>
            ) : (
              <div>
                {typeEntries.map(([type, count], idx) => {
                  const pct = Math.round((count / totalType) * 100);
                  return (
                    <div key={type} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{APPLICATION_TYPES[type] || type}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{count} ({pct}%)</span>
                      </div>
                      <Progress
                        percent={pct}
                        showInfo={false}
                        strokeColor={pieColors[idx % pieColors.length]}
                        trailColor="#F0F0F0"
                        size="small"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Stage Distribution — 7 core CDE stages */}
        <Col xs={24} md={8}>
          <Card title="审评阶段分布" size="small">
            {Object.keys(stageCounts).length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无进行中的审评</div>
            ) : (
              <div>
                {Object.entries(stageCounts).map(([stage, count]) => {
                  const label = STAGE_LABELS[stage] || stage;
                  const isParallel = stage === 'onsite_inspection' || stage === 'sample_testing';
                  const isTechReview = stage === 'technical_review';
                  return (
                    <div key={stage} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0', borderBottom: '1px solid #F5F5F5',
                    }}>
                      <span>
                        <Tag color={isTechReview ? 'geekblue' : 'blue'}>{label}</Tag>
                        {isParallel && <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', marginLeft: 2 }}>并行</Tag>}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Deadline Alerts */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>审评时限预警</span>
                <Tooltip title="依据《药品注册管理办法》2020年版：NDA标准审评200个工作日，优先审评130个工作日，IND 60个工作日">
                  <InfoCircleOutlined style={{ color: '#999', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            size="small"
          >
            {deadlineApps.length === 0 ? (
              <div style={{ color: '#52c41a', textAlign: 'center', padding: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24 }} />
                <div style={{ marginTop: 8 }}>无即将到期的审评事项</div>
              </div>
            ) : (
              <div>
                {deadlineApps.slice(0, 5).map((app) => {
                  const active = app.stages?.find((s) => s.status === 'in_progress');
                  const daysLeft = active?.deadline
                    ? Math.ceil((new Date(active.deadline).getTime() - Date.now()) / 86400000)
                    : 0;
                  return (
                    <div key={app.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid #F5F5F5',
                    }}>
                      <div>
                        <div style={{ fontSize: 13 }}>{app.drugName}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {STAGE_LABELS[active?.stageName || ''] || ''}
                        </div>
                      </div>
                      <Tag color={daysLeft < 3 ? 'error' : daysLeft < 7 ? 'warning' : 'processing'}>
                        {daysLeft}天后
                      </Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* NMPA Review Timeline Reference */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#1A5C9E' }} />
            <span>审评时限参考（药品注册管理办法2020年版）</span>
          </Space>
        }
        size="small"
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 8]}>
          {Object.entries(NMPA_REVIEW_TIMELINES).map(([type, label]) => (
            <Col xs={24} sm={12} md={8} lg={Math.floor(24 / Object.keys(NMPA_REVIEW_TIMELINES).length)} key={type}>
              <div style={{
                padding: '8px 12px',
                background: '#F0F5FF',
                borderRadius: 6,
                border: '1px solid #D6E4FF',
              }}>
                <Text strong style={{ fontSize: 13, color: '#1A5C9E' }}>
                  {APPLICATION_TYPES[type] || type}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Applications */}
      <Card title="最近申请" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={recentApps}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
