import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Typography, Tabs, Button, Space, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { reviewService } from '../../services/reviewService';
import { STAGE_LABELS, APPLICATION_TYPES } from '../../utils/constants';

const { Title } = Typography;

interface TaskItem {
  id: number;
  applicationId: number;
  stageName: string;
  status: string;
  deadline?: string;
  startedAt?: string;
  notes?: string;
  application: {
    id: number;
    applicationNo: string;
    drugName: string;
    type: string;
    status: string;
    applicant: { id: number; realName: string; organization: string };
  };
}

export default function ReviewTaskListPage() {
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [my, pending] = await Promise.all([
        reviewService.getMyTasks(),
        reviewService.getPendingStages(),
      ]);
      setMyTasks(my);
      setPendingTasks(pending);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns: ColumnsType<TaskItem> = [
    {
      title: '受理号',
      dataIndex: ['application', 'applicationNo'],
      key: 'applicationNo',
      width: 150,
    },
    {
      title: '药品名称',
      dataIndex: ['application', 'drugName'],
      key: 'drugName',
      width: 180,
    },
    {
      title: '注册类型',
      dataIndex: ['application', 'type'],
      key: 'type',
      width: 120,
      render: (t) => APPLICATION_TYPES[t] || t,
    },
    {
      title: '审评阶段',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 120,
      render: (s) => STAGE_LABELS[s] || s,
    },
    {
      title: '申请人',
      dataIndex: ['application', 'applicant', 'realName'],
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请单位',
      dataIndex: ['application', 'applicant', 'organization'],
      key: 'org',
      width: 150,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 170,
      render: (d) => d ? new Date(d).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/applications/${record.application.id}`)}
        >
          审评
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'my',
      label: `我的任务 (${myTasks.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={myTasks}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: 'pending',
      label: `待认领 (${pendingTasks.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={pendingTasks}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>审评任务</Title>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
