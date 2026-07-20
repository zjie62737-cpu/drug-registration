import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Card, Button, Input, Select, Space, Tag, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { applicationService } from '../../services/applicationService';
import { useAuthStore } from '../../store/authStore';
import { APPLICATION_TYPES, APPLICATION_STATUS, STAGE_LABELS } from '../../utils/constants';
import type { Application } from '../../types/application';

const { Title } = Typography;

export default function ApplicationListPage() {
  const [data, setData] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.list({
        page,
        pageSize: 20,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      setData(res.items);
      setTotal(res.total);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, typeFilter]);

  const handleDelete = async (id: number) => {
    try {
      await applicationService.delete(id);
      message.success('删除成功');
      fetchData();
    } catch { /* handled */ }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const columns: ColumnsType<Application> = [
    {
      title: '受理号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 150,
      render: (no) => no || <Tag>草稿</Tag>,
    },
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 180,
    },
    {
      title: '注册类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (t) => APPLICATION_TYPES[t] || t,
    },
    {
      title: '药品分类',
      dataIndex: 'drugType',
      key: 'drugType',
      width: 100,
    },
    {
      title: '申请人',
      key: 'applicant',
      width: 120,
      render: (_, r) => r.applicant?.realName || '-',
    },
    {
      title: '当前阶段',
      key: 'currentStage',
      width: 120,
      render: (_, r) => {
        const activeStage = r.stages?.find((s) => s.status === 'in_progress');
        return activeStage ? STAGE_LABELS[activeStage.stageName] || activeStage.stageName : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s) => {
        const cfg = APPLICATION_STATUS[s];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : s;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (d) => new Date(d).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/applications/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'draft' && record.applicantId === user?.id && (
            <Popconfirm
              title="确定删除？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>注册申请列表</Title>
        {(user?.role === 'applicant' || user?.role === 'admin') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/applications/new')}>
            新建申请
          </Button>
        )}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="申请状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter || undefined}
            onChange={(v) => { setStatusFilter(v || ''); setPage(1); }}
            options={Object.entries(APPLICATION_STATUS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            placeholder="注册类型"
            allowClear
            style={{ width: 180 }}
            value={typeFilter || undefined}
            onChange={(v) => { setTypeFilter(v || ''); setPage(1); }}
            options={Object.entries(APPLICATION_TYPES).map(([k, v]) => ({ value: k, label: v }))}
          />
          <Input
            placeholder="搜索药品名称/受理号"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 条`,
            showSizeChanger: false,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
