import { useState } from 'react';
import { Typography, message } from 'antd';
import CTDDocumentTree from '../../../../components/shared/CTDDocumentTree';
import CTDTemplateModal from '../../../../components/shared/CTDTemplateModal';
import { CTD_MODULE_TREE_DATA } from '../../../../utils/constants';
import { ctdTemplates } from '../../../../data/ctdTemplates';
import type { NmpaApplicationFormData, CTDModule } from '../../../../types/regulatory';
import type { CTDTemplate } from '../../../../data/ctdTemplates';

const { Text } = Typography;

interface StepCTDDocsProps {
  formData: NmpaApplicationFormData;
  onChange: (data: Partial<NmpaApplicationFormData>) => void;
}

// ── Styles ──
const sectionHeader: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1A5C9E',
  borderLeft: '3px solid #1A5C9E',
  paddingLeft: 12,
  marginBottom: 16,
  marginTop: 8,
};

const warningText: React.CSSProperties = {
  fontSize: 12,
  color: '#E54545',
  marginTop: 4,
  lineHeight: '18px',
};

const moduleNote: React.CSSProperties = {
  padding: '10px 14px',
  background: '#FFFBE6',
  borderRadius: 2,
  border: '1px solid #FFE58F',
  marginBottom: 8,
};

const moduleNoteText: React.CSSProperties = {
  fontSize: 12,
  color: '#D48806',
  lineHeight: '18px',
};

export default function StepCTDDocs({ formData, onChange }: StepCTDDocsProps) {
  const [treeData] = useState<CTDModule[]>(
    JSON.parse(JSON.stringify(CTD_MODULE_TREE_DATA))
  );
  const [templateModal, setTemplateModal] = useState<CTDTemplate | null>(null);

  const handleTemplateClick = (code: string) => {
    const tmpl = ctdTemplates[code];
    if (tmpl) {
      setTemplateModal(tmpl);
    } else {
      message.info(`"${code}" 的标准格式模板正在编制中，敬请期待。`);
    }
  };

  const handleUpload = async (moduleKey: string, file: File): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentDocs = formData.ctdDocuments || {};
    onChange({
      ctdDocuments: {
        ...currentDocs,
        [moduleKey]: { fileName: file.name, status: 'uploaded' },
      },
    });

    message.success(`${file.name} 上传至 ${moduleKey}`);
  };

  return (
    <div>
      {/* Step header */}
      <div style={{
        background: '#F0F5FF',
        padding: '12px 16px',
        marginBottom: 24,
        border: '1px solid #D6E4FF',
        borderRadius: 2,
      }}>
        <span style={{ color: '#1A5C9E', fontWeight: 600, fontSize: 15 }}>
          第4步：CTD申报资料 — 按CTD格式上传各模块文件
        </span>
      </div>

      {/* General notice */}
      <div style={{
        marginBottom: 16,
        padding: '12px 16px',
        background: '#FFFBE6',
        borderRadius: 2,
        border: '1px solid #FFE58F',
      }}>
        <Text style={{ color: '#D48806', fontSize: 13 }}>
          请按照CTD（通用技术文件）格式将申报资料上传到对应的模块和子模块中。
          每个子模块至少需要上传一份文件。支持PDF、DOC、DOCX、XLS、XLSX格式。
        </Text>
      </div>

      {/* ── CTD模块要求 ── */}
      <div style={sectionHeader}>CTD模块上传要求</div>

      {/* Module 1 */}
      <div style={moduleNote}>
        <Text strong style={{ fontSize: 13, color: '#D48806' }}>Module 1 — 行政信息与处方信息：</Text>
        <br />
        <Text style={moduleNoteText}>
          必须上传：申请表、证明性文件（营业执照、生产许可证、GMP证书等）、专利声明、说明书、标签样稿、质量标准、检验报告。
        </Text>
      </div>

      {/* Module 2 */}
      <div style={moduleNote}>
        <Text strong style={{ fontSize: 13, color: '#D48806' }}>Module 2 — 研究内容概要/CTD总结：</Text>
        <br />
        <Text style={moduleNoteText}>
          必须上传：CTD总目录(2.1)、引言(2.2)、质量综述QOS(2.3)、非临床综述(2.4)、临床综述(2.5)。
        </Text>
      </div>

      {/* Module 3 */}
      <div style={moduleNote}>
        <Text strong style={{ fontSize: 13, color: '#D48806' }}>Module 3 — 质量研究资料：</Text>
        <br />
        <Text style={moduleNoteText}>
          重点必须上传：原料药基本信息到稳定性(3.2.S.1-7)、制剂处方到稳定性(3.2.P.1-8)。ICH M4格式要求。
        </Text>
      </div>

      {/* Module 4 */}
      <div style={moduleNote}>
        <Text strong style={{ fontSize: 13, color: '#D48806' }}>Module 4 — 非临床研究报告：</Text>
        <br />
        <Text style={moduleNoteText}>
          必须上传：药理学报告、药代动力学报告、毒理学报告。参照ICH M3和对应指南。
        </Text>
      </div>

      {/* Module 5 */}
      <div style={moduleNote}>
        <Text strong style={{ fontSize: 13, color: '#D48806' }}>Module 5 — 临床研究报告：</Text>
        <br />
        <Text style={moduleNoteText}>
          必须上传：生物等效性/生物利用度报告(5.1/5.2)、临床药理学报告、临床疗效和安全性报告(5.3/5.4)。参照ICH E3/E6/E8/E9。
        </Text>
      </div>

      {/* Red warning summary */}
      <div style={{ ...warningText, marginBottom: 16 }}>
        以上各模块均为NMPA药品注册申请的必需要件。缺少任一模块的完整资料将导致形式审查不通过，申报资料将被退回。
      </div>

      {/* CTD Document Tree */}
      <CTDDocumentTree
        treeData={treeData}
        onUpload={handleUpload}
        editable
        system="nmpa"
        onTemplateClick={handleTemplateClick}
      />

      {/* Template Modal */}
      <CTDTemplateModal
        open={templateModal !== null}
        onClose={() => setTemplateModal(null)}
        template={templateModal}
      />
    </div>
  );
}
