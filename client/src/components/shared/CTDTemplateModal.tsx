import { Modal, Typography, Divider } from 'antd';
import { FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { CTDTemplate } from '../../data/ctdTemplates';

const { Title, Text, Paragraph } = Typography;

interface CTDTemplateModalProps {
  open: boolean;
  onClose: () => void;
  template: CTDTemplate | null;
}

export default function CTDTemplateModal({ open, onClose, template }: CTDTemplateModalProps) {
  if (!template) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={960}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">未找到模板数据</Text>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <InfoCircleOutlined /> 点击CTD文档树中的任意节点可查看该文档类型的标准格式模板
          </Text>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid #D9D9D9',
              borderRadius: 4,
              padding: '4px 20px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            关闭
          </button>
        </div>
      }
      width={960}
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px 24px' },
        header: { padding: '12px 24px', borderBottom: '1px solid #F0F0F0' },
        footer: { padding: '10px 24px', borderTop: '1px solid #F0F0F0' },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ color: '#1A5C9E', fontSize: 18 }} />
          <span style={{ fontWeight: 600, fontSize: 16, color: '#1A5C9E' }}>
            {template.code} {template.title} — 标准格式模板
          </span>
        </div>
      }
      destroyOnClose
    >
      {/* Disclaimer */}
      <div
        style={{
          padding: '10px 14px',
          background: '#FFF1F0',
          border: '1px solid #FFA39E',
          borderRadius: 4,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 13, color: '#CF1322' }}>
          <InfoCircleOutlined style={{ marginRight: 4 }} />
          以下为监管机构规定的标准格式模板，实际申报时请以最新版法规要求为准。
        </Text>
      </div>

      {/* Template content */}
      <div
        className="ctd-template-content"
        dangerouslySetInnerHTML={{ __html: template.content }}
        style={{
          fontSize: 14,
          lineHeight: '22px',
          color: '#333',
        }}
      />

      <Divider style={{ margin: '20px 0 12px' }} />

      {/* Regulatory reference */}
      <div
        style={{
          padding: '10px 14px',
          background: '#F0F5FF',
          border: '1px solid #D6E4FF',
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 13, color: '#1A5C9E' }}>
          <strong>法规依据：</strong>
          {template.regulatoryRef}
        </Text>
      </div>
    </Modal>
  );
}
