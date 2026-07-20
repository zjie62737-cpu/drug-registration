import { useState } from 'react';
import { Upload, Typography, message } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined } from '@ant-design/icons';
import CTDDocumentTree from '../../../../components/shared/CTDDocumentTree';
import CTDTemplateModal from '../../../../components/shared/CTDTemplateModal';
import { EMA_MODULE_TREE_DATA } from '../../../../utils/constants';
import { ctdTemplates, emaCtdTemplates } from '../../../../data/ctdTemplates';
import type { EmaApplicationFormData } from '../EmaAppCreateWizard';
import type { CTDModule } from '../../../../types/regulatory';
import type { CTDTemplate } from '../../../../data/ctdTemplates';
import type { UploadFile } from 'antd/es/upload';

const { Text } = Typography;

interface Props {
  formData: EmaApplicationFormData;
  onChange: (data: Partial<EmaApplicationFormData>) => void;
}

// ── EU standard form styles ──
const EMA_BLUE = '#003399';
const EMA_RED = '#DA2131';

const sectionHeader: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: EMA_BLUE,
  borderLeft: `4px solid ${EMA_BLUE}`,
  paddingLeft: 12,
  marginBottom: 20,
  marginTop: 8,
  background: '#E6EEF5',
  padding: '10px 12px 10px 16px',
};

const stepBanner: React.CSSProperties = {
  background: '#E6EEF5',
  padding: '12px 16px',
  marginBottom: 24,
  border: '1px solid #B8C9E0',
  borderRadius: 2,
};

const warningText: React.CSSProperties = {
  fontSize: 12,
  color: EMA_RED,
  marginTop: 6,
  lineHeight: '18px',
};

const generalNotice: React.CSSProperties = {
  marginBottom: 16,
  padding: '12px 16px',
  background: '#FFFBE6',
  borderRadius: 2,
  border: '1px solid #FFE58F',
};

const docGroup: React.CSSProperties = {
  padding: '12px 16px',
  background: '#FAFBFC',
  borderRadius: 2,
  border: '1px solid #E8E8E8',
  marginBottom: 12,
};

const docTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 13,
  color: '#333',
  marginBottom: 4,
};

const docDesc: React.CSSProperties = {
  fontSize: 12,
  color: '#666',
  lineHeight: '18px',
  marginBottom: 8,
};

const emaDocNote: React.CSSProperties = {
  padding: '8px 12px',
  background: '#FFF1F0',
  borderRadius: 2,
  border: '1px solid #FFA39E',
  fontSize: 12,
  color: EMA_RED,
  lineHeight: '18px',
  marginBottom: 4,
};

const EMA_ECTD_DOCS = [
  {
    key: 'm1_0',
    code: '1.0',
    title: 'Cover Letter',
    desc: 'Include proposed (invented) name, INN, pharmaceutical form, strength, ATC code, proposed indication, and confirmation that all required fees have been paid.',
    required: true,
  },
  {
    key: 'm1_1',
    code: '1.1',
    title: 'Application Form',
    desc: 'Complete EU Application Form including declarations on ethical conduct of clinical trials (GCP compliance), environmental risk assessment, and compliance with EU legislation.',
    required: true,
  },
  {
    key: 'm1_2',
    code: '1.2',
    title: 'Comprehensive Table of Contents',
    desc: 'Comprehensive Table of Contents of the dossier.',
    required: true,
  },
  {
    key: 'm1_3',
    code: '1.3',
    title: 'Administrative Information',
    desc: 'Summary of Product Characteristics (SmPC), Labelling and Package Leaflet in all EU languages (after Day 210), GMP certificates, Manufacturing Authorisation, QP declaration, GCP certificates, PIP compliance statement.',
    required: true,
  },
  {
    key: 'm1_4',
    code: '1.4',
    title: 'Expert Reports',
    desc: 'Quality Expert Report, Nonclinical Expert Report, Clinical Expert Report. Each signed by a qualified expert with CV.',
    required: true,
  },
  {
    key: 'm1_5',
    code: '1.5',
    title: 'Environmental Risk Assessment (ERA)',
    desc: 'Mandatory for all new MAA applications per EMA/CHMP/SWP/4447/00 guideline.',
    required: true,
  },
  {
    key: 'm1_6',
    code: '1.6',
    title: 'Risk Management Plan (RMP)',
    desc: 'EU-RMP per GVP Module V. Must include safety specification, pharmacovigilance plan, risk minimisation measures.',
    required: true,
  },
  {
    key: 'm2_3',
    code: '2.3',
    title: 'Quality Overall Summary (QOS)',
    desc: 'Reference ICH M4Q. Module 2.3 is typically 80-100 pages for a full application.',
    required: true,
  },
  {
    key: 'm2_5',
    code: '2.5',
    title: 'Clinical Overview',
    desc: 'Must include benefit-risk assessment per CHMP template. Typically 50-100 pages for a full MAA with new clinical data.',
    required: true,
  },
  {
    key: 'm2_4',
    code: '2.4',
    title: 'Nonclinical Overview',
    desc: 'Written summary and integrated analysis of nonclinical data. Includes pharmacology, pharmacokinetics, and toxicology overview.',
    required: true,
  },
  {
    key: 'm3',
    code: '3',
    title: 'Module 3 - Quality (CMC)',
    desc: 'Full Quality/Chemical, Manufacturing and Controls data. EU-specific: Ph. Eur. monographs for quality, EU GMP for manufacturing.',
    required: true,
  },
  {
    key: 'm4',
    code: '4',
    title: 'Module 4 - Nonclinical Study Reports',
    desc: 'Full nonclinical study reports per ICH M4S. Pharmacology, pharmacokinetics, toxicology.',
    required: true,
  },
  {
    key: 'm5',
    code: '5',
    title: 'Module 5 - Clinical Study Reports',
    desc: 'Full clinical study reports per ICH M4E. EU Clinical Trials Directive compliance required.',
    required: true,
  },
];

export default function EmaStepDocs({ formData, onChange }: Props) {
  const eCTDDocuments = formData.eCTDDocuments || {};

  const [treeData] = useState<CTDModule[]>(
    JSON.parse(JSON.stringify(EMA_MODULE_TREE_DATA))
  );
  const [templateModal, setTemplateModal] = useState<CTDTemplate | null>(null);

  // Template lookup: first try EMA-specific variant, then fall back to generic CTD template
  const getTemplate = (code: string): CTDTemplate | undefined => {
    const emaKey = `${code}-ema`;
    if (emaCtdTemplates[emaKey]) return emaCtdTemplates[emaKey];
    return ctdTemplates[code];
  };

  const handleTemplateClick = (code: string) => {
    const tmpl = getTemplate(code);
    if (tmpl) {
      setTemplateModal(tmpl);
    } else {
      message.info(`Template for "${code}" is under development.`);
    }
  };

  const handleUploadDoc = (moduleKey: string, file: File) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        onChange({
          eCTDDocuments: {
            ...formData.eCTDDocuments,
            [moduleKey]: { fileName: file.name, status: 'uploaded' },
          },
        });
        message.success(`${file.name} uploaded to Module ${moduleKey}`);
        resolve();
      }, 600);
    });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: EMA_BLUE, fontWeight: 600, fontSize: 15 }}>
          Step 4: eCTD Documents &mdash; Upload the electronic Common Technical Document in EU M1 format
        </span>
      </div>

      {/* General notice */}
      <div style={generalNotice}>
        <Text style={{ color: '#8C6E00', fontSize: 13 }}>
          Upload all required eCTD modules in the EU format. Module 1 is EU-specific. Modules 2-5 follow ICH M4
          structure but with EU-specific requirements noted below. Accepted formats: PDF, DOC, DOCX, XLS, XLSX.
        </Text>
      </div>

      {/* ── Module 1 (EU-specific) ── */}
      <div style={sectionHeader}>Module 1 &mdash; Administrative Information (EU-Specific)</div>

      {EMA_ECTD_DOCS.filter((d) => d.key.startsWith('m1_')).map((doc) => {
        const uploaded = eCTDDocuments[doc.key];
        return (
          <div key={doc.key} style={docGroup}>
            <div style={docTitle}>
              {doc.required && <span style={{ color: EMA_RED }}>* </span>}
              Module {doc.code}: {doc.title}
            </div>
            <div style={{ ...docDesc, color: EMA_RED }}>{doc.desc}</div>
            {uploaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FilePdfOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <Text style={{ color: '#52c41a', fontSize: 13 }}>{uploaded.fileName}</Text>
                <Text
                  style={{ color: EMA_BLUE, cursor: 'pointer', fontSize: 12 }}
                  onClick={() => {
                    const { [doc.key]: _, ...rest } = eCTDDocuments;
                    onChange({ eCTDDocuments: rest });
                  }}
                >
                  Remove
                </Text>
              </div>
            ) : (
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleUploadDoc(doc.key, file);
                  return false;
                }}
              >
                <button style={{
                  border: '1px solid #D9D9D9',
                  borderRadius: 2,
                  padding: '4px 14px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}>
                  <UploadOutlined /> Upload
                </button>
              </Upload>
            )}
          </div>
        );
      })}

      {/* ── Module 2-5 ── */}
      <div style={sectionHeader}>Modules 2-5 &mdash; ICH M4 Common Technical Document</div>

      <div style={generalNotice}>
        <Text style={{ color: '#8C6E00', fontSize: 13 }}>
          Modules 2-5 follow the same ICH M4 structure as NMPA/FDA. Note EU-specific requirements: Ph. Eur. monographs
          for quality, EU GMP for manufacturing, EU Clinical Trials Directive compliance for Module 5.
        </Text>
      </div>

      {EMA_ECTD_DOCS.filter((d) => !d.key.startsWith('m1_')).map((doc) => {
        const uploaded = eCTDDocuments[doc.key];
        return (
          <div key={doc.key} style={docGroup}>
            <div style={docTitle}>
              {doc.required && <span style={{ color: EMA_RED }}>* </span>}
              Module {doc.code}: {doc.title}
            </div>
            <div style={{ ...docDesc, color: EMA_RED }}>{doc.desc}</div>
            {uploaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FilePdfOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <Text style={{ color: '#52c41a', fontSize: 13 }}>{uploaded.fileName}</Text>
                <Text
                  style={{ color: EMA_BLUE, cursor: 'pointer', fontSize: 12 }}
                  onClick={() => {
                    const { [doc.key]: _, ...rest } = eCTDDocuments;
                    onChange({ eCTDDocuments: rest });
                  }}
                >
                  Remove
                </Text>
              </div>
            ) : (
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleUploadDoc(doc.key, file);
                  return false;
                }}
              >
                <button style={{
                  border: '1px solid #D9D9D9',
                  borderRadius: 2,
                  padding: '4px 14px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}>
                  <UploadOutlined /> Upload
                </button>
              </Upload>
            )}
          </div>
        );
      })}

      {/* CTD Document Tree Overview */}
      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <CTDDocumentTree
          treeData={treeData}
          onUpload={async (moduleKey, file) => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            onChange({
              eCTDDocuments: {
                ...formData.eCTDDocuments,
                [moduleKey]: { fileName: file.name, status: 'uploaded' },
              },
            });
            message.success(`${file.name} uploaded to ${moduleKey}`);
          }}
          editable
          system="ema"
          onTemplateClick={handleTemplateClick}
        />
      </div>

      {/* Template Modal */}
      <CTDTemplateModal
        open={templateModal !== null}
        onClose={() => setTemplateModal(null)}
        template={templateModal}
      />

      {/* Red warning summary */}
      <div style={emaDocNote}>
        All modules above are mandatory for a valid EMA marketing authorisation application. Missing any required module
        will result in Day 0 validation failure and the application will not be accepted for review. Use eCTD format
        per EU Module 1 specifications and ICH M4 guidelines for Modules 2-5.
      </div>
    </div>
  );
}
