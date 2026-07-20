import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Tag, Divider, Button, Breadcrumb, Statistic } from 'antd';
import {
  SafetyCertificateOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  HomeOutlined,
  AuditOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SystemCard {
  key: string;
  flag: string;
  title: string;
  subtitle: string;
  description: string;
  types: { label: string; desc: string }[];
  avgReview: string;
  color: string;
  bgColor: string;
  route: string;
}

const SYSTEMS: SystemCard[] = [
  {
    key: 'nmpa',
    flag: '🇨🇳',
    title: '中国NMPA',
    subtitle: '国家药品监督管理局 · 药品注册申请',
    description: '化学药品、生物制品、中药、药用辅料、药包材的注册分类管理。涵盖临床试验申请(IND)、上市许可申请(NDA)、仿制药申请(ANDA)、补充申请、再注册等类型。',
    types: [
      { label: 'IND', desc: '药物临床试验申请' },
      { label: 'NDA', desc: '新药上市许可申请' },
      { label: 'ANDA', desc: '仿制药申请' },
      { label: '原辅包', desc: '原料药/辅料/药包材登记' },
    ],
    avgReview: 'NDA技术审评时限: 200个工作日（优先审评: 130个工作日）',
    color: '#1A5C9E',
    bgColor: '#F0F5FF',
    route: '/nmpa',
  },
  {
    key: 'fda',
    flag: '🇺🇸',
    title: '美国FDA',
    subtitle: 'U.S. Food and Drug Administration · Drug Registration',
    description: 'FDA Center for Drug Evaluation and Research (CDER) drug approval pathways. Including IND, NDA, BLA, ANDA, and 505(b)(2) application types.',
    types: [
      { label: 'IND', desc: 'Investigational New Drug' },
      { label: 'NDA', desc: 'New Drug Application (505(b)(1))' },
      { label: 'BLA', desc: 'Biologics License Application' },
      { label: 'ANDA', desc: 'Abbreviated New Drug Application' },
    ],
    avgReview: 'Standard Review: 10-12 months | Priority Review: 6-8 months (PDUFA)',
    color: '#005EA2',
    bgColor: '#F0F7FF',
    route: '/fda',
  },
  {
    key: 'ema',
    flag: '🇪🇺',
    title: '欧盟EMA',
    subtitle: 'European Medicines Agency · Marketing Authorisation',
    description: 'EMA centralised marketing authorisation under Regulation (EC) No 726/2004. CP, DCP, MRP and independent national procedures.',
    types: [
      { label: 'CP', desc: 'Centralised Procedure' },
      { label: 'DCP', desc: 'Decentralised Procedure' },
      { label: 'MRP', desc: 'Mutual Recognition Procedure' },
      { label: 'INP', desc: 'Independent National Procedure' },
    ],
    avgReview: 'CP: CHMP 210 days + EC Decision 67 days = ~277 days total',
    color: '#003399',
    bgColor: '#F5F7FF',
    route: '/ema',
  },
];

export default function PortalHomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F2F5',
      fontFamily: '"Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* === Government Top Bar === */}
      <div style={{
        background: '#1A3A6B',
        color: '#fff',
        padding: '0 48px',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
      }}>
        <Space size={20}>
          <span style={{ letterSpacing: 1 }}>国家药品监督管理局网上办事大厅</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.75 }}>National Medical Products Administration</span>
        </Space>
        <Space size={12}>
          <span><PhoneOutlined /> 010-88330000</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>政务服务大厅</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>English</span>
        </Space>
      </div>

      {/* === Main Header with Logo === */}
      <div style={{
        background: '#fff',
        borderBottom: '3px solid #1A5C9E',
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Space size={16}>
          <div style={{
            width: 56, height: 56, background: '#1A5C9E', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AuditOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A3A6B', letterSpacing: 2 }}>
              药品注册审评模拟平台
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Drug Registration & Review Simulation Platform
            </div>
          </div>
        </Space>
        <Space size={20}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#999' }}>咨询热线</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A5C9E' }}>010-68585566</div>
          </div>
        </Space>
      </div>

      {/* === Breadcrumb === */}
      <div style={{ padding: '12px 48px', background: '#fff', borderBottom: '1px solid #E8E8E8' }}>
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> 首页</> },
            { title: '药品注册审评模拟平台' },
          ]}
        />
      </div>

      {/* === Notice Banner === */}
      <div style={{ padding: '10px 48px', background: '#FFF7E6', borderBottom: '1px solid #FFD591' }}>
        <Text style={{ color: '#D46B08', fontSize: 13 }}>
          <Text strong>通知：</Text>
          本平台为药品注册申报流程模拟教学系统，仅供学习培训使用。实际操作请登录国家药品监督管理局官方网站（nmpa.gov.cn）办理。
        </Text>
      </div>

      {/* === Hero / Introduction === */}
      <div style={{
        background: 'linear-gradient(180deg, #1A5C9E 0%, #256EB5 50%, #F0F2F5 100%)',
        padding: '36px 48px 72px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <Title level={1} style={{ color: '#fff', fontWeight: 700, marginBottom: 12, fontSize: 32, letterSpacing: 3 }}>
          药品注册审评模拟平台
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
          模拟中国NMPA、美国FDA、欧盟EMA全流程注册审批系统 | 覆盖IND / NDA / ANDA / BLA等注册类型
        </Text>
        <div style={{ marginTop: 20 }}>
          <Space size={12}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 2 }}>化学药品</Tag>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 2 }}>生物制品</Tag>
            <Tag color="orange" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 2 }}>中药</Tag>
            <Tag color="purple" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 2 }}>原辅包登记</Tag>
          </Space>
        </div>
      </div>

      {/* === System Entry Cards === */}
      <div style={{ padding: '0 48px 32px', marginTop: -40 }}>
        <Row gutter={[24, 24]}>
          {SYSTEMS.map((sys) => (
            <Col xs={24} md={8} key={sys.key}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid #E8E8E8',
                  borderTop: `4px solid ${sys.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
                styles={{ body: { padding: 0 } }}
                onClick={() => navigate(sys.route)}
              >
                {/* Card Header */}
                <div style={{
                  background: sys.bgColor,
                  padding: '20px 24px',
                  borderBottom: '1px solid #E8E8E8',
                }}>
                  <Space align="center" size={12}>
                    <span style={{ fontSize: 32 }}>{sys.flag}</span>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: sys.color }}>
                        {sys.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {sys.subtitle}
                      </div>
                    </div>
                  </Space>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px 24px' }}>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.6, minHeight: 60 }}>
                    {sys.description}
                  </Paragraph>

                  {/* Registration Types */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                      <FileTextOutlined /> 注册申报类型
                    </div>
                    <Space wrap size={[4, 4]}>
                      {sys.types.map((t) => (
                        <Tag
                          key={t.label}
                          style={{
                            background: '#fff',
                            border: `1px solid ${sys.color}40`,
                            color: sys.color,
                            borderRadius: 2,
                            fontSize: 12,
                          }}
                        >
                          <Text strong>{t.label}</Text>: {t.desc}
                        </Tag>
                      ))}
                    </Space>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  {/* Review Timeline */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                      <ClockCircleOutlined /> 审评时限参考
                    </div>
                    <Text style={{ fontSize: 12, color: sys.color }}>
                      {sys.avgReview}
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      background: sys.color,
                      borderColor: sys.color,
                      borderRadius: 2,
                      height: 40,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                    onClick={(e) => { e.stopPropagation(); navigate(sys.route); }}
                  >
                    进入申报系统 <ThunderboltOutlined />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* === Statistics === */}
      <div style={{ padding: '0 48px 32px' }}>
        <Card style={{ borderRadius: 2, border: '1px solid #E8E8E8' }}>
          <Row gutter={[32, 24]}>
            <Col xs={12} md={4}>
              <Statistic
                title="NMPA 总申请数"
                value={156}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#1A5C9E' }}
              />
            </Col>
            <Col xs={12} md={4}>
              <Statistic
                title="FDA 总申请数"
                value={89}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#005EA2' }}
              />
            </Col>
            <Col xs={12} md={4}>
              <Statistic
                title="EMA 总申请数"
                value={47}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#003399' }}
              />
            </Col>
            <Col xs={12} md={4}>
              <Statistic
                title="审评通过率"
                value="78.4"
                suffix="%"
                prefix={<FileProtectOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={12} md={4}>
              <Statistic
                title="平均审评周期"
                value={185}
                suffix="天"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={12} md={4}>
              <Statistic
                title="活跃用户"
                value={34}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>
      </div>

      {/* === Footer === */}
      <div style={{
        background: '#1A3A6B',
        color: 'rgba(255,255,255,0.7)',
        padding: '28px 48px',
      }}>
        <Row gutter={[32, 16]}>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>关于本平台</div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              药品注册审评模拟平台是一个用于教学培训的药品注册全流程模拟系统，涵盖中国NMPA、美国FDA、欧盟EMA三大监管体系的注册申报流程。
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>功能特性</div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              CTD/M4模块化申报资料管理<br />
              7阶段NMPA审评流程模拟（含平行审评三线架构）<br />
              FDA/EMA注册路径模拟<br />
              审评意见与发补通知管理<br />
              注册证书与受理号生成
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>联系方式</div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              <EnvironmentOutlined /> 北京市经济技术开发区广德大街22号院二区<br />
              <PhoneOutlined /> 010-68585566<br />
              <MailOutlined /> cde@cde.org.cn<br />
              <div style={{ marginTop: 4 }}>邮编：100076</div>
            </div>
          </Col>
        </Row>
        <Divider style={{ margin: '20px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center', fontSize: 12 }}>
          Drug Registration Simulation Platform | For Educational Purposes Only | 本平台仅用于教学培训模拟，不涉及任何真实药品注册数据
        </div>
      </div>
    </div>
  );
}
