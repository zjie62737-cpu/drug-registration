import { useState } from 'react';
import { Tree, Upload, Button, Tag, Progress, Space, Typography, message, Tooltip } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, FileTextOutlined, FileSearchOutlined } from '@ant-design/icons';
import type { CTDModule } from '../../types/regulatory';
import type { DataNode } from 'antd/es/tree';

const { Text } = Typography;

export type CTDSystem = 'nmpa' | 'fda' | 'ema';

interface CTDDocumentTreeProps {
  applicationId?: number;
  treeData: CTDModule[];
  onUpload?: (moduleKey: string, file: File) => Promise<void>;
  editable?: boolean;
  system?: CTDSystem;
  onTemplateClick?: (code: string) => void;
}

const SYSTEM_LABELS: Record<CTDSystem, { heading: string; subtitle: string; empty: string }> = {
  nmpa: {
    heading: 'CTD 文档整体完成度',
    subtitle: '份文件已上传',
    empty: '暂无CTD文档结构数据',
  },
  fda: {
    heading: 'eCTD Overall Completion',
    subtitle: 'documents uploaded',
    empty: 'No eCTD document structure data',
  },
  ema: {
    heading: 'eCTD Overall Completion',
    subtitle: 'documents uploaded',
    empty: 'No eCTD document structure data',
  },
};

function getStatusIcon(status: string) {
  switch (status) {
    case 'uploaded': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'uploading': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    case 'rejected': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default: return <FileTextOutlined style={{ color: '#d9d9d9' }} />;
  }
}

function getStatusTag(status: string) {
  switch (status) {
    case 'uploaded': return <Tag color="success">已上传</Tag>;
    case 'uploading': return <Tag color="warning">部分上传</Tag>;
    case 'rejected': return <Tag color="error">需重传</Tag>;
    default: return <Tag color="default">未上传</Tag>;
  }
}

function buildTreeData(
  modules: CTDModule[],
  onUploadClick: (moduleKey: string) => void,
  uploadingKey: string | null,
  onTemplateClick?: (code: string) => void,
): DataNode[] {
  return modules.map((mod) => ({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
        <Space>
          {getStatusIcon(mod.uploadStatus)}
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            <span style={{ color: '#1A5C9E' }}>{mod.code}</span>
            {' '}{mod.name}
          </span>
          {onTemplateClick && (
            <Tooltip title="点击查看标准格式">
              <a
                onClick={(e) => { e.stopPropagation(); onTemplateClick(mod.code); }}
                style={{ fontSize: 13, color: '#1A5C9E', textDecoration: 'underline', cursor: 'pointer' }}
              >
                <FileSearchOutlined style={{ marginLeft: 4 }} /> 查看模板
              </a>
            </Tooltip>
          )}
        </Space>
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {mod.uploadedCount}/{mod.documentCount} 文件
          </Text>
          {getStatusTag(mod.uploadStatus)}
          <Progress
            percent={mod.documentCount > 0 ? Math.round((mod.uploadedCount / mod.documentCount) * 100) : 0}
            size="small"
            style={{ width: 80, margin: 0 }}
            strokeColor="#1A5C9E"
          />
        </Space>
      </div>
    ),
    key: mod.key,
    children: mod.children?.map((child) => {
      const pct = child.documentCount > 0
        ? Math.round((child.uploadedCount / child.documentCount) * 100)
        : 0;
      return {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
            <Space>
              {getStatusIcon(child.uploadStatus)}
              <span>
                <Text code>{child.code}</Text>
                {' '}{child.name}
              </span>
              {onTemplateClick && (
                <Tooltip title="点击查看标准格式">
                  <a
                    onClick={(e) => { e.stopPropagation(); onTemplateClick(child.code); }}
                    style={{ fontSize: 12, color: '#1A5C9E', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    <FileSearchOutlined /> 模板
                  </a>
                </Tooltip>
              )}
            </Space>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {child.uploadedCount}/{child.documentCount}
              </Text>
              {getStatusTag(child.uploadStatus)}
              <Button
                size="small"
                type="link"
                icon={<UploadOutlined />}
                loading={uploadingKey === child.key}
                onClick={(e) => { e.stopPropagation(); onUploadClick(child.key); }}
                style={{ padding: 0 }}
              />
            </Space>
          </div>
        ),
        key: child.key,
      };
    }),
  }));
}

export default function CTDDocumentTree({ applicationId, treeData, onUpload, editable = true, system = 'nmpa', onTemplateClick }: CTDDocumentTreeProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const labels = SYSTEM_LABELS[system];

  const handleUploadClick = (moduleKey: string) => {
    setPendingKey(moduleKey);
    setModalVisible(true);
    const input = document.getElementById('ctd-file-input') as HTMLInputElement;
    input?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingKey) return;

    setUploadingKey(pendingKey);
    try {
      if (onUpload) {
        await onUpload(pendingKey, file);
      } else {
        // simulate upload
        await new Promise((r) => setTimeout(r, 800));
      }
      message.success(`文件 "${file.name}" 上传成功`);
    } catch {
      message.error('上传失败');
    } finally {
      setUploadingKey(null);
      setPendingKey(null);
      e.target.value = '';
    }
  };

  const treeDataNodes = buildTreeData(treeData, handleUploadClick, uploadingKey, onTemplateClick);

  // calculate overall progress
  const totalDocs = treeData.reduce((s, m) => s + m.documentCount, 0);
  const totalUploaded = treeData.reduce((s, m) => s + m.uploadedCount, 0);
  const overallPct = totalDocs > 0 ? Math.round((totalUploaded / totalDocs) * 100) : 0;

  return (
    <div>
      <div style={{
        marginBottom: 16,
        padding: '16px 20px',
        background: '#F0F5FF',
        borderRadius: 8,
        border: '1px solid #D6E4FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <Text strong style={{ fontSize: 15, color: '#1A5C9E' }}>{labels.heading}</Text>
          <br />
          <Text type="secondary">
            {totalUploaded}/{totalDocs} {labels.subtitle} ({overallPct}%)
          </Text>
        </div>
        <Progress
          type="circle"
          percent={overallPct}
          size={56}
          strokeColor="#1A5C9E"
        />
      </div>

      <input
        id="ctd-file-input"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Tree
        showLine={{ showLeafIcon: false }}
        defaultExpandAll
        treeData={treeDataNodes}
        style={{
          background: '#FAFBFC',
          borderRadius: 8,
          padding: 12,
          border: '1px solid #F0F0F0',
        }}
      />

      {treeData.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>
          {labels.empty}
        </div>
      )}
    </div>
  );
}
