import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Typography, Divider, message } from 'antd';
import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import { applicationService } from '../../services/applicationService';
import { APPLICATION_TYPES, DRUG_TYPES } from '../../utils/constants';

const { Title } = Typography;
const { TextArea } = Input;

export default function ApplicationCreatePage() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSaveDraft = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const app = await applicationService.create(values);
      setCreatedId(app.id);
      message.success('草稿已保存');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      let app;
      if (createdId) {
        app = await applicationService.submit(createdId);
      } else {
        app = await applicationService.create(values);
        app = await applicationService.submit(app.id);
      }
      message.success(`申请已提交！受理号: ${app.applicationNo}`);
      navigate(`/applications/${app.id}`);
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>新建药品注册申请</Title>

      <Card style={{ maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          size="large"
          initialValues={{
            type: 'NDA',
            drugType: '化学药品',
          }}
        >
          <Form.Item
            name="type"
            label="注册申请类型"
            rules={[{ required: true, message: '请选择注册类型' }]}
          >
            <Select
              options={Object.entries(APPLICATION_TYPES).map(([k, v]) => ({
                value: k,
                label: `${v} (${k})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="drugName"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="如：盐酸莫西沙星片" />
          </Form.Item>

          <Form.Item
            name="drugType"
            label="药品分类"
            rules={[{ required: true, message: '请选择药品分类' }]}
          >
            <Select options={DRUG_TYPES.map((t) => ({ value: t, label: t }))} />
          </Form.Item>

          <Form.Item name="specification" label="规格">
            <Input placeholder="如：0.4g/片" />
          </Form.Item>

          <Form.Item name="manufacturer" label="生产企业">
            <Input placeholder="如：恒瑞医药" />
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/applications')}>取消</Button>
          <Button
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSaveDraft}
          >
            保存草稿
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmit}
          >
            直接提交
          </Button>
        </div>
      </Card>
    </div>
  );
}
