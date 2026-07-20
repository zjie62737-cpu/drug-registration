import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../../services/reviewService';
import { ROLE_LABELS } from '../../utils/constants';
import type { User } from '../../types/user';

const { Title } = Typography;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.list();
      setUsers(data);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'applicant' });
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.update(editingUser.id, values);
        message.success('更新成功');
      } else {
        await userService.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchUsers();
    } catch { /* handled */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.delete(id);
      message.success('删除成功');
      fetchUsers();
    } catch { /* handled */ }
  };

  const roleColors: Record<string, string> = {
    admin: 'purple',
    reviewer: 'blue',
    approver: 'orange',
    applicant: 'green',
  };

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', key: 'realName', width: 120 },
    { title: '所属单位', dataIndex: 'organization', key: 'organization', width: 180 },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 120,
      render: (r) => <Tag color={roleColors[r]}>{ROLE_LABELS[r] || r}</Tag>,
    },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 180, render: (v) => v || '-' },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 140, render: (v) => v || '-' },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: (d) => new Date(d).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'actions', width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此用户？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          添加用户
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="realName" label="真实姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="organization" label="所属单位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[
              { value: 'applicant', label: '申请人' },
              { value: 'reviewer', label: '审评员' },
              { value: 'approver', label: '审批人' },
              { value: 'admin', label: '管理员' },
            ]} />
          </Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
