import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Tag, Button, Typography, Space, Progress, Spin } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { applicationService } from '../../services/applicationService';
import { FDA_APPLICATION_TYPES, FDA_REVIEW_TIMELINES } from '../../utils/constants';
import type { Application } from '../../types/application';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// ── FDA Color Scheme ──
const FDA_NAVY = '#112E51';
const FDA_BLUE = '#0071BC';
const FDA_LIGHT_BLUE = '#E1F3F8';

// CDER review divisions
const CDER_DIVISIONS = [
  { name: 'ODE I (Cardiovascular/Renal)', apps: 0 },
  { name: 'ODE II (Metabolism/Endocrinology)', apps: 0 },
  { name: 'ODE III (Dermatology/Dental)', apps: 0 },
  { name: 'ODE IV (Non-Malignant Hematology)', apps: 0 },
  { name: 'ODE V (Gastroenterology)', apps: 0 },
  { name: 'OND (Neurology)', apps: 0 },
  { name: 'OHE (Oncology/Hematology)', apps: 0 },
  { name: 'OIDP (Infectious Disease)', apps: 0 },
];

export default function FdaDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    applicationService.list({ page: 1, pageSize: 20 })
      .then((res) => setRecentApps(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Spin size="large" />
    </div>
  );

  // Application type stats
  const typeCounts: Record<string, number> = {};
  recentApps.forEach((a) => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });

  const fdaApplicationTypeCards = [
    { key: 'IND', color: FDA_BLUE, icon: <ExperimentOutlined />, label: 'INDs', desc: 'Investigational New Drug' },
    { key: 'NDA', color: FDA_NAVY, icon: <FileTextOutlined />, label: 'NDAs', desc: 'New Drug Application' },
    { key: 'BLA', color: '#2E8540', icon: <SafetyCertificateOutlined />, label: 'BLAs', desc: 'Biologics License Application' },
    { key: 'ANDA', color: '#FDB81B', icon: <ThunderboltOutlined />, label: 'ANDAs', desc: 'Abbreviated New Drug Application' },
  ];

  const approvedCount = recentApps.filter((a) => a.status === 'approved').length;
  const underReviewCount = recentApps.filter((a) => a.status === 'under_review').length;
  const rejectedCount = recentApps.filter((a) => a.status === 'rejected').length;
  const submittedCount = recentApps.filter((a) => a.status === 'submitted').length;

  const columns: ColumnsType<Application> = [
    {
      title: 'Application #',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 155,
      render: (no) => no || <Tag color="default">Draft</Tag>,
    },
    {
      title: 'Product Name',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 180,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (t) => FDA_APPLICATION_TYPES[t] || t,
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, r) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          draft: { color: 'default', label: 'Draft' },
          submitted: { color: 'blue', label: 'Submitted' },
          under_review: { color: 'processing', label: 'Under Review' },
          supplement_needed: { color: 'warning', label: 'Supplement Needed' },
          approved: { color: 'success', label: 'Approved' },
          rejected: { color: 'error', label: 'Rejected' },
        };
        const cfg = statusMap[r.status] || { color: 'default', label: r.status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => navigate(`/fda/applications/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: `3px solid ${FDA_NAVY}`,
      }}>
        <div>
          <Title level={4} style={{ margin: 0, color: FDA_NAVY, fontSize: 20 }}>
            FDA Drug Registration & Review
          </Title>
          <Text style={{ color: '#5B616B', fontSize: 13 }}>
            U.S. Food and Drug Administration | Center for Drug Evaluation and Research (CDER)
          </Text>
          <div style={{ marginTop: 4, fontSize: 11, color: '#AEB0B5' }}>
            Simulation System — Not connected to actual FDA databases
          </div>
        </div>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: FDA_BLUE, borderColor: FDA_BLUE, borderRadius: 2 }}
            onClick={() => navigate('/fda/applications/new')}
          >
            New IND
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderRadius: 2, borderColor: '#DFE1E2' }}
            onClick={() => navigate('/fda/applications/new')}
          >
            New NDA
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderRadius: 2, borderColor: '#DFE1E2' }}
            onClick={() => navigate('/fda/applications/new')}
          >
            New BLA
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ borderRadius: 2, borderColor: '#DFE1E2' }}
            onClick={() => navigate('/fda/applications/new')}
          >
            New ANDA
          </Button>
        </Space>
      </div>

      {/* Application Type Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {fdaApplicationTypeCards.map((t) => {
          const count = typeCounts[t.key] || 0;
          return (
            <Col xs={12} sm={6} key={t.key}>
              <Card
                hoverable
                onClick={() => navigate('/fda/applications')}
                style={{
                  borderRadius: 2,
                  border: '1px solid #DFE1E2',
                  borderTop: `3px solid ${t.color}`,
                }}
                styles={{ body: { padding: '16px 20px' } }}
              >
                <Statistic
                  title={
                    <Space>
                      <span style={{ color: t.color }}>{t.icon}</span>
                      <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 13 }}>{t.label}</span>
                    </Space>
                  }
                  value={count}
                  suffix={<Text type="secondary" style={{ fontSize: 11 }}>{t.desc}</Text>}
                  valueStyle={{ color: t.color, fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Review Timelines */}
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 14 }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                FDA Review Timelines
              </span>
            }
            size="small"
            style={{ borderRadius: 2, border: '1px solid #DFE1E2' }}
          >
            {Object.entries(FDA_REVIEW_TIMELINES).map(([type, timeline]) => (
              <div key={type} style={{ padding: '10px 0', borderBottom: '1px solid #F1F1F1' }}>
                <Text strong style={{ color: FDA_NAVY, fontSize: 13 }}>{type}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>{timeline}</Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* Review Statistics */}
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 14 }}>
                Review Statistics
              </span>
            }
            size="small"
            style={{ borderRadius: 2, border: '1px solid #DFE1E2' }}
          >
            <Row gutter={[8, 16]}>
              <Col span={12}>
                <Statistic title="Total" value={recentApps.length} valueStyle={{ color: FDA_NAVY, fontSize: 24 }} />
              </Col>
              <Col span={12}>
                <Statistic title="Submitted" value={submittedCount} valueStyle={{ color: '#1677ff', fontSize: 24 }} />
              </Col>
              <Col span={12}>
                <Statistic title="Under Review" value={underReviewCount} valueStyle={{ color: FDA_BLUE, fontSize: 24 }} />
              </Col>
              <Col span={12}>
                <Statistic title="Approved" value={approvedCount} valueStyle={{ color: '#2E8540', fontSize: 24 }} />
              </Col>
              <Col span={12}>
                <Statistic title="Rejected" value={rejectedCount} valueStyle={{ color: '#E31C3D', fontSize: 24 }} />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* PDUFA Goal Date Tracker */}
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 14 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                PDUFA Review Goals
              </span>
            }
            size="small"
            style={{ borderRadius: 2, border: '1px solid #DFE1E2' }}
          >
            <div style={{ padding: '10px 0', borderBottom: '1px solid #F1F1F1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>Standard Review</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>10 months</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>NDA/BLA original applications</Text>
              <Progress percent={70} strokeColor={FDA_NAVY} size="small" style={{ marginTop: 4 }} />
            </div>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #F1F1F1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>Priority Review</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>6 months</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Serious conditions, unmet medical need</Text>
              <Progress percent={85} strokeColor={FDA_BLUE} size="small" style={{ marginTop: 4 }} />
            </div>
            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>IND Safety Review</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>30 days</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Initial IND submission review</Text>
              <Progress percent={95} strokeColor="#2E8540" size="small" style={{ marginTop: 4 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* CDER Review Divisions */}
      <Card
        title={
          <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 14 }}>
            CDER Review Divisions
          </span>
        }
        size="small"
        style={{ marginTop: 16, borderRadius: 2, border: '1px solid #DFE1E2' }}
      >
        <Row gutter={[16, 8]}>
          {CDER_DIVISIONS.map((div) => (
            <Col xs={12} sm={6} key={div.name}>
              <div style={{
                padding: '8px 12px',
                background: FDA_LIGHT_BLUE,
                borderRadius: 2,
                fontSize: 12,
                color: FDA_NAVY,
                fontWeight: 500,
                borderLeft: `3px solid ${FDA_BLUE}`,
              }}>
                {div.name}
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Submissions */}
      <Card
        title={
          <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 14 }}>
            Recent Submissions
          </span>
        }
        style={{ marginTop: 16, borderRadius: 2, border: '1px solid #DFE1E2' }}
      >
        <Table
          columns={columns}
          dataSource={recentApps}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 750 }}
        />
      </Card>

      {/* Disclaimer */}
      <div style={{
        textAlign: 'center',
        marginTop: 32,
        padding: '16px 24px',
        background: '#F5F5F5',
        borderRadius: 2,
        border: '1px solid #DFE1E2',
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          FDA Drug Registration & Review System | This platform is for educational training and simulation purposes only.
          It is not connected to any actual FDA systems. No real regulatory data is submitted or stored.
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>
          For actual FDA drug submissions, please visit{' '}
          <a href="https://www.fda.gov/drugs" target="_blank" rel="noopener noreferrer" style={{ color: FDA_BLUE }}>
            www.fda.gov/drugs
          </a>
          {' '}and the{' '}
          <a href="https://www.fda.gov/electronic-submissions" target="_blank" rel="noopener noreferrer" style={{ color: FDA_BLUE }}>
            FDA Electronic Submissions Gateway
          </a>.
        </Text>
      </div>
    </div>
  );
}
