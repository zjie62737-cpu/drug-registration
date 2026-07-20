import { useState } from 'react';
import { Typography, message } from 'antd';
import CTDDocumentTree from '../../../../components/shared/CTDDocumentTree';
import CTDTemplateModal from '../../../../components/shared/CTDTemplateModal';
import { FDA_MODULE_TREE_DATA } from '../../../../utils/constants';
import { ctdTemplates, fdaCtdTemplates } from '../../../../data/ctdTemplates';
import type { CTDModule } from '../../../../types/regulatory';
import type { CTDTemplate } from '../../../../data/ctdTemplates';
import type { FdaApplicationFormData } from '../FdaAppCreateWizard';

const { Text } = Typography;

interface FdaStepDocsProps {
  formData: FdaApplicationFormData;
  onChange: (data: Partial<FdaApplicationFormData>) => void;
}

const FDA_NAVY = '#112E51';
const FDA_BLUE = '#0071BC';
const FDA_RED = '#E31C3D';

const sectionHeader: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: FDA_NAVY,
  borderLeft: `4px solid ${FDA_BLUE}`,
  paddingLeft: 12,
  marginBottom: 16,
  marginTop: 8,
};

const warningNote: React.CSSProperties = {
  fontSize: 13,
  color: FDA_RED,
  marginTop: 4,
  lineHeight: '18px',
};

const moduleAlert: React.CSSProperties = {
  padding: '10px 14px',
  background: '#FFF3CD',
  borderRadius: 2,
  border: '1px solid #FFE69C',
  marginBottom: 8,
};

const moduleAlertText: React.CSSProperties = {
  fontSize: 12,
  color: '#856404',
  lineHeight: '18px',
};

const stepBanner: React.CSSProperties = {
  background: '#E1F3F8',
  padding: '12px 16px',
  marginBottom: 24,
  border: '1px solid #B3E0F2',
  borderRadius: 2,
};

const generalNotice: React.CSSProperties = {
  marginBottom: 16,
  padding: '12px 16px',
  background: '#FFF3CD',
  borderRadius: 2,
  border: '1px solid #FFE69C',
};

export default function FdaStepDocs({ formData, onChange }: FdaStepDocsProps) {
  const [treeData] = useState<CTDModule[]>(
    JSON.parse(JSON.stringify(FDA_MODULE_TREE_DATA))
  );
  const [templateModal, setTemplateModal] = useState<CTDTemplate | null>(null);

  // Template lookup: first try FDA-specific variant, then fall back to generic CTD template
  const getTemplate = (code: string): CTDTemplate | undefined => {
    const fdaKey = `${code}-fda`;
    if (fdaCtdTemplates[fdaKey]) return fdaCtdTemplates[fdaKey];
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

  const handleUpload = async (moduleKey: string, file: File): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentDocs = formData.eCTDDocuments || {};
    onChange({
      eCTDDocuments: {
        ...currentDocs,
        [moduleKey]: { fileName: file.name, status: 'uploaded' },
      },
    });

    message.success(`${file.name} uploaded to ${moduleKey}`);
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 15 }}>
          Step 4: eCTD Documents — Electronic Common Technical Document Submission
        </span>
        <div style={{ fontSize: 12, color: FDA_NAVY, marginTop: 2 }}>
          Per FDA Guidance: Providing Regulatory Submissions in Electronic Format — eCTD Specifications (v4.0).
        </div>
      </div>

      {/* General notice */}
      <div style={generalNotice}>
        <Text style={{ color: '#856404', fontSize: 13 }}>
          All submissions to FDA must be in electronic Common Technical Document (eCTD) format per Section 745A(a) of the
          FD&amp;C Act. Upload required documents to each module below. Supported formats: PDF, XML. Each document must be
          PDF v1.4-1.7, PDF/A, or PDF/X compliant. Submit one file per section.
        </Text>
      </div>

      {/* ── eCTD Module Requirements ── */}
      <div style={sectionHeader}>eCTD Module Requirements (per ICH M4 &amp; FDA Guidance)</div>

      {/* Module 1 */}
      <div style={moduleAlert}>
        <Text strong style={{ fontSize: 13, color: '#856404' }}>Module 1 — Administrative Information &amp; Prescribing Information:</Text>
        <br />
        <Text style={moduleAlertText}>
          Must include: Form FDA 356h (signed), Cover Letter, Table of Contents, Administrative Documents, Prescribing
          Information (annotated), Patient Labeling, Container Labels (draft), Environmental Assessment or Claim for Exclusion.
          All forms must use the most current FDA version. Form FDA 356h must be signed by an authorized official.
        </Text>
      </div>

      {/* Module 2 */}
      <div style={moduleAlert}>
        <Text strong style={{ fontSize: 13, color: '#856404' }}>Module 2 — Summaries (Quality, Nonclinical, Clinical):</Text>
        <br />
        <Text style={moduleAlertText}>
          Must include: Quality Overall Summary (QOS), Nonclinical Overview/Summaries, Clinical Overview/Summaries.
          The Clinical Overview should be no more than 50-100 pages. Clinical Summary should be no more than 100-300 pages.
          All summaries must be written by a qualified expert.
        </Text>
      </div>

      {/* Module 3 */}
      <div style={moduleAlert}>
        <Text strong style={{ fontSize: 13, color: '#856404' }}>Module 3 — Quality / CMC Information:</Text>
        <br />
        <Text style={moduleAlertText}>
          Must include complete CMC data package. For NDAs, include full process validation protocol and results.
          For ANDAs, reference FDA Guidance on ANDAs: Stability Testing of Drug Substances and Products. Include batch
          analysis data for at least 3 pilot/registration batches.
        </Text>
      </div>

      {/* Module 4 */}
      <div style={moduleAlert}>
        <Text strong style={{ fontSize: 13, color: '#856404' }}>Module 4 — Nonclinical Study Reports:</Text>
        <br />
        <Text style={moduleAlertText}>
          Must include pharmacology, pharmacokinetics, toxicology studies in eCTD format. Study reports must be signed by
          the study director. Include complete pathology reports and individual animal data. Per ICH M3(R2) and ICH S
          guidelines.
        </Text>
      </div>

      {/* Module 5 */}
      <div style={moduleAlert}>
        <Text strong style={{ fontSize: 13, color: '#856404' }}>Module 5 — Clinical Study Reports:</Text>
        <br />
        <Text style={moduleAlertText}>
          Must include all Phase 1-3 clinical trials. Each study report must include the clinical study protocol,
          statistical analysis plan, and case report forms. Reference ICH E3 and FDA Guidance on Integrated Summaries
          of Effectiveness and Safety (ISEs/ISSs).
        </Text>
      </div>

      {/* Red warning summary */}
      <div style={{ ...warningNote, marginBottom: 16 }}>
        All modules above are required components for FDA submissions per 21 CFR 314.50. Incomplete submissions will
        result in a Refuse-to-File (RTF) decision for NDAs/BLAs, or a Refuse-to-Receive (RTR) decision for ANDAs.
        Review the latest FDA eCTD Conformance Guide before submission.
      </div>

      {/* CTD Document Tree */}
      <CTDDocumentTree
        treeData={treeData}
        onUpload={handleUpload}
        editable
        system="fda"
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
