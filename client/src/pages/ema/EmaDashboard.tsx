import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Tag, Button, Typography, Space, Spin, Timeline, Badge, Progress } from 'antd';
import {
  GlobalOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { applicationService } from '../../services/applicationService';
import { EMA_PROCEDURE_TYPES, EMA_REVIEW_TIMELINES } from '../../utils/constants';
import type { Application } from '../../types/application';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// ── EMA colour constants ──
const EMA_BLUE = '#003399';
const EMA_GOLD = '#FFD617';
const EMA_RED = '#DA2131';
const EMA_LIGHT_BG = '#F4F5F7';

const emaProcedures = [
  {
    key: 'CP',
    color: EMA_BLUE,
    icon: <GlobalOutlined />,
    title: 'Centralised Procedure',
    desc: 'Single MA valid in all EU/EEA. Mandatory for biotech, orphan, ATMPs.',
    fee: '€310,600',
  },
  {
    key: 'DCP',
    color: '#1A5C9E',
    icon: <SafetyCertificateOutlined />,
    title: 'Decentralised Procedure',
    desc: 'For products not yet authorised in any MS. RMS leads assessment.',
    fee: '€141,900',
  },
  {
    key: 'MRP',
    color: '#2563EB',
    icon: <FileTextOutlined />,
    title: 'Mutual Recognition',
    desc: 'For products already authorised in one MS. 90-day mutual recognition.',
    fee: '€103,800',
  },
  {
    key: 'INP',
    color: '#0891B2',
    icon: <CheckCircleOutlined />,
    title: 'National Procedure',
    desc: 'Single Member State authorisation. Varies by national authority.',
    fee: '~€51,800',
  },
];

export default function EmaDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    applicationService.list({ page: 1, pageSize: 10 })
      .then((res) => setRecentApps(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const applicationsByStatus = {
    total: recentApps.length,
    approved: recentApps.filter((a) => a.status === 'approved').length,
    underReview: recentApps.filter((a) => a.status === 'under_review').length,
    rejected: recentApps.filter((a) => a.status === 'rejected').length,
    draft: recentApps.filter((a) => a.status === 'draft').length,
  };

  // CHMP assessment day counter (simulated)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const chmpCycleDay = dayOfYear % 30;
  const daysToD120 = Math.max(0, 120 - (dayOfYear % 150));
  const daysToD180 = Math.max(0, 180 - (dayOfYear % 210));

  const columns: ColumnsType<Application> = [
    {
      title: 'Application #',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 130,
      render: (no) => no || <Tag color="default">Draft</Tag>,
    },
    {
      title: 'Product Name',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 160,
    },
    {
      title: 'Procedure',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (t) => {
        const colors: Record<string, string> = {
          CP: EMA_BLUE, DCP: '#1A5C9E', MRP: '#2563EB', INP: '#0891B2',
        };
        return <Tag color={colors[t] || 'default'} style={{ borderRadius: 2 }}>{t}</Tag>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, r) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: 'Draft', color: 'default' },
          submitted: { label: 'Submitted', color: 'blue' },
          under_review: { label: 'Under Assessment', color: 'processing' },
          supplement_needed: { label: 'LoQ Issued', color: 'warning' },
          approved: { label: 'Approved', color: 'success' },
          rejected: { label: 'Rejected', color: 'error' },
        };
        const cfg = statusMap[r.status] || { label: r.status, color: 'default' };
        return <Tag color={cfg.color} style={{ borderRadius: 2 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 110,
      render: (d) => new Date(d).toLocaleDateString('en-GB'),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => navigate(`/ema/applications/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* ── EMA Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${EMA_BLUE} 0%, #004CBF 100%)`,
        margin: -24,
        marginBottom: 24,
        padding: '16px 24px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: EMA_GOLD,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: EMA_BLUE, fontWeight: 700, fontSize: 16 }}>EMA</span>
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>
                  European Medicines Agency
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                  Marketing Authorisation Dashboard
                </Text>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Space size={4}>
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} style={{ color: EMA_GOLD, fontSize: 10 }}>&#9733;</span>
                ))}
                <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>An agency of the European Union</span>
              </Space>
            </div>
          </div>
          <Space size="middle">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>CHMP Assessment Window</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Day {chmpCycleDay}</div>
            </div>
          </Space>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Text strong style={{ fontSize: 15, color: EMA_BLUE }}>
            Marketing Authorisation Applications
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: EMA_BLUE, borderColor: EMA_BLUE, borderRadius: 2 }}
            onClick={() => navigate('/ema/applications/new')}
          >
            New CP Application
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderColor: '#1A5C9E', color: '#1A5C9E', borderRadius: 2 }}
            onClick={() => navigate('/ema/applications/new')}
          >
            New DCP
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderColor: '#2563EB', color: '#2563EB', borderRadius: 2 }}
            onClick={() => navigate('/ema/applications/new')}
          >
            New MRP
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderColor: '#0891B2', color: '#0891B2', borderRadius: 2 }}
            onClick={() => navigate('/ema/applications/new')}
          >
            New INP
          </Button>
        </Space>
      </div>

      {/* ── Procedure Type Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {emaProcedures.map((p) => {
          const count = recentApps.filter((a) => a.type === p.key).length;
          return (
            <Col xs={12} sm={6} key={p.key}>
              <Card
                hoverable
                onClick={() => navigate('/ema/applications')}
                style={{ borderRadius: 2, border: `1px solid #E0E0E0` }}
                styles={{ body: { padding: '16px 20px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `${p.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: p.color,
                  }}>
                    {p.icon}
                  </div>
                  <div>
                    <Text strong style={{ color: p.color, fontSize: 15 }}>{p.key}</Text>
                    <br />
                    <Text style={{ fontSize: 11, color: '#666' }}>{p.title}</Text>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: 8,
                  borderTop: '1px solid #F0F0F0',
                }}>
                  <Statistic
                    value={count}
                    valueStyle={{ color: p.color, fontSize: 28, fontWeight: 700 }}
                    suffix={<Text style={{ fontSize: 11, color: '#999' }}>apps</Text>}
                  />
                  <Text style={{ fontSize: 11, color: '#999' }}>{p.fee}</Text>
                </div>
                <Progress
                  percent={count > 0 ? Math.min(100, (count / Math.max(recentApps.length, 1)) * 100) : 0}
                  strokeColor={p.color}
                  trailColor="#F0F0F0"
                  showInfo={false}
                  size="small"
                  style={{ marginTop: 4, marginBottom: 0 }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]}>
        {/* ── CHMP Assessment Timeline ── */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: EMA_BLUE }} />
                <span style={{ fontSize: 14, color: EMA_BLUE }}>CHMP Assessment Phases</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 2, height: '100%' }}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Day 0</Text>
                      <br />
                      <Text style={{ fontSize: 12, color: '#666' }}>Application submitted and validated</Text>
                    </>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <>
                      <Text strong>Day 80</Text>
                      <br />
                      <Text style={{ fontSize: 12, color: '#666' }}>Rapporteur & Co-Rapporteur assessment reports</Text>
                    </>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <>
                      <Text strong>Day 120</Text>
                      <br />
                      <Text style={{ fontSize: 12, color: '#666' }}>CHMP List of Questions (LoQ) issued</Text>
                      <Badge status="processing" text={`${daysToD120} days remaining`} style={{ fontSize: 11 }} />
                    </>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <>
                      <Text strong>Day 180</Text>
                      <br />
                      <Text style={{ fontSize: 12, color: '#666' }}>CHMP Opinion (positive / negative)</Text>
                      <Badge status="default" text={`${daysToD180} days remaining`} style={{ fontSize: 11 }} />
                    </>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Day 247</Text>
                      <br />
                      <Text style={{ fontSize: 12, color: '#666' }}>European Commission final decision</Text>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* ── EMA Review Timelines ── */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: EMA_BLUE }} />
                <span style={{ fontSize: 14, color: EMA_BLUE }}>Procedure Timelines</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 2, height: '100%' }}
          >
            {Object.entries(EMA_REVIEW_TIMELINES).map(([type, timeline]) => (
              <div key={type} style={{
                padding: '10px 0',
                borderBottom: '1px solid #F0F0F0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge
                    color={
                      type === 'CP' ? EMA_BLUE :
                      type === 'DCP' ? '#1A5C9E' :
                      type === 'MRP' ? '#2563EB' : '#0891B2'
                    }
                  />
                  <Text strong style={{ fontSize: 13 }}>{type}</Text>
                </div>
                <Text style={{ fontSize: 12, color: '#666', marginLeft: 22 }}>{timeline}</Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* ── Statistics ── */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: EMA_BLUE }} />
                <span style={{ fontSize: 14, color: EMA_BLUE }}>Application Statistics</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 2, height: '100%' }}
          >
            <Row gutter={[12, 16]}>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 2, background: '#F8FAFC' }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12, color: '#666' }}>Total</Text>}
                    value={applicationsByStatus.total}
                    valueStyle={{ color: EMA_BLUE, fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 2, background: '#F0FDF4' }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12, color: '#666' }}>Approved</Text>}
                    value={applicationsByStatus.approved}
                    valueStyle={{ color: '#16A34A', fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 2, background: '#EFF6FF' }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12, color: '#666' }}>Under Assessment</Text>}
                    value={applicationsByStatus.underReview}
                    valueStyle={{ color: '#2563EB', fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ borderRadius: 2, background: '#FEF2F2' }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12, color: '#666' }}>Rejected / Withdrawn</Text>}
                    value={applicationsByStatus.rejected}
                    valueStyle={{ color: EMA_RED, fontSize: 24 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Recent Applications ── */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: 14, fontWeight: 600, color: EMA_BLUE }}>Recent Applications</span>
          </Space>
        }
        style={{ marginTop: 16, borderRadius: 2 }}
      >
        <Table
          columns={columns}
          dataSource={recentApps}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
          locale={{ emptyText: 'No applications found' }}
        />
      </Card>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 24,
        padding: '12px 0',
        textAlign: 'center',
        borderTop: '1px solid #E0E0E0',
      }}>
        <Text style={{ fontSize: 11, color: '#999' }}>
          EMA data is simulated for training purposes. Not linked to actual EMA systems.
        </Text>
        <br />
        <Space size={4} style={{ marginTop: 4 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ color: '#BBB', fontSize: 8 }}>&#9733;</span>
          ))}
        </Space>
      </div>
    </div>
  );
}
