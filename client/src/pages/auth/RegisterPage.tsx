import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Select, message } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, MailOutlined, PhoneOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { token, user } = await authService.register(values);
      setAuth(user, token);
      message.success('注册成功！');
      navigate('/');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 460, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>注册新账号</Title>
          <Text type="secondary">加入药品注册模拟系统</Text>
        </div>

        <Form name="register" onFinish={onFinish} size="large" layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="登录用户名" />
          </Form.Item>

          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="至少6位" />
          </Form.Item>

          <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input placeholder="如：王注册" />
          </Form.Item>

          <Form.Item name="organization" label="所属单位" rules={[{ required: true, message: '请输入所属单位' }]}>
            <Input prefix={<BankOutlined />} placeholder="如：恒瑞医药" />
          </Form.Item>

          <Form.Item name="role" label="注册角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="选择注册角色">
              <Option value="applicant">申请人（药品注册专员）</Option>
              <Option value="reviewer">审评员</Option>
              <Option value="approver">审批人</Option>
            </Select>
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input prefix={<MailOutlined />} placeholder="选填" />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input prefix={<PhoneOutlined />} placeholder="选填" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>已有账号？</Text>
          <Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
}
