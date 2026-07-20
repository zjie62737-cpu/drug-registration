import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const { token, user } = await authService.login(values);
      setAuth(user, token);
      message.success(`欢迎回来，${user.realName}`);
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
      <Card style={{ width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>药品注册模拟系统</Title>
          <Text type="secondary">NMPA Drug Registration Simulation</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          initialValues={{ username: 'applicant1', password: 'applicant123' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary" style={{ fontSize: 12 }}>测试账号</Text>
        </Divider>
        <div style={{ fontSize: 12, color: '#999', lineHeight: 1.8 }}>
          <div>管理员: admin / admin123</div>
          <div>审评员: reviewer1 / reviewer123</div>
          <div>申请人: applicant1 / applicant123</div>
        </div>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text>还没有账号？</Text>
          <Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
}
