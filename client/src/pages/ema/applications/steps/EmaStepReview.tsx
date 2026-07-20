import { useMemo } from 'react';
import { Typography, Tag, Card, Alert, Button, Table, Space, Divider } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EuroCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { EmaApplicationFormData } from '../EmaAppCreateWizard';

const { Title, Text } = Typography;

interface Props {
  formData: EmaApplicationFormData;
  onSubmit: () => Promise<void>;
  submitting: boolean;
}

interface ValidationResult {
  key: string;
  step: string;
  field: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const EMA_BLUE = '#003399';
const EMA_RED = '#DA2131';
const EMA_GOLD = '#FFD617';

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

function estimateFee(formData: EmaApplicationFormData): { amount: number; breakdown: string } {
  let base = 0;
  const type = formData.procedureType;

  switch (type) {
    case 'CP':
      base = 310600;
      break;
    case 'DCP':
      base = 141900;
      break;
    case 'MRP':
      base = 103800;
      break;
    case 'INP':
      base = 51800;
      break;
    default:
      base = 0;
  }

  if (formData.orphanDesignation) {
    base = Math.round(base * 0.25); // 75% reduction for orphans
  }

  return {
    amount: base,
    breakdown: type
      ? `Base fee for ${type} procedure${formData.orphanDesignation ? ' (orphan drug - 75% reduction applied)' : ''}`
      : 'Select a procedure type for fee estimation',
  };
}

function validate(formData: EmaApplicationFormData): ValidationResult[] {
  const results: ValidationResult[] = [];
  let id = 0;

  const fail = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'fail' as const, message });
  };
  const warn = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'warning' as const, message });
  };
  const pass = (step: string, field: string, message = 'Completed') => {
    results.push({ key: `v${id++}`, step, field, status: 'pass' as const, message });
  };

  // Step 1 - Procedure Selection
  if (!formData.procedureType) fail('Procedure', 'Procedure Type', 'Select a procedure type');
  else pass('Procedure', 'Procedure Type');

  if (formData.procedureType === 'DCP' || formData.procedureType === 'MRP') {
    if (!formData.rms) fail('Procedure', 'Reference Member State', 'Select RMS for DCP/MRP');
    else pass('Procedure', 'Reference Member State', `RMS: ${formData.rms}`);

    if (formData.cmsList.length === 0) fail('Procedure', 'Concerned Member States', 'Select at least 1 CMS');
    else pass('Procedure', 'Concerned Member States', `${formData.cmsList.length} CMS selected`);

    if (!formData.rmsConfirmationLetter) fail('Procedure', 'RMS Confirmation Letter', 'Upload RMS confirmation letter');
    else pass('Procedure', 'RMS Confirmation Letter');
  }

  if (formData.orphanDesignation && !formData.orphanDesignationNumber) {
    warn('Procedure', 'Orphan Designation Number', 'Provide EU orphan designation number');
  }

  if (!formData.pipExempt && !formData.pipDecisionNumber) {
    fail('Procedure', 'PIP Decision Number', 'PIP required - provide decision number');
  } else if (formData.pipExempt) {
    pass('Procedure', 'Paediatric Investigation Plan', 'Exempt');
  } else {
    pass('Procedure', 'Paediatric Investigation Plan', formData.pipDecisionNumber);
  }

  // Step 2 - Applicant
  if (!formData.applicantLegalName) fail('Applicant', 'Legal Name', 'Enter applicant legal name');
  else pass('Applicant', 'Legal Name', formData.applicantLegalName);

  if (!formData.applicantCountry) fail('Applicant', 'Country', 'Select EU/EEA country');
  else pass('Applicant', 'Country', formData.applicantCountry);

  if (!formData.applicantAddress) fail('Applicant', 'Address', 'Enter registered address');
  else pass('Applicant', 'Address');

  if (!formData.contactPerson) fail('Applicant', 'Contact Person', 'Enter contact person');
  else pass('Applicant', 'Contact Person', formData.contactPerson);

  if (!formData.contactPhone) fail('Applicant', 'Contact Phone', 'Enter contact phone');
  else pass('Applicant', 'Contact Phone');

  if (!formData.technicalContactEmail) fail('Applicant', 'Technical Email', 'Enter technical contact email');
  else pass('Applicant', 'Technical Email', formData.technicalContactEmail);

  if (formData.manufacturingSites.length === 0) fail('Applicant', 'Manufacturing Sites', 'Add at least 1 manufacturing site');
  else pass('Applicant', 'Manufacturing Sites', `${formData.manufacturingSites.length} site(s)`);

  if (!formData.qppvName) fail('Applicant', 'QPPV Name', 'Enter QPPV name');
  else pass('Applicant', 'QPPV Name', formData.qppvName);

  if (!formData.qppvEmail) fail('Applicant', 'QPPV Email', 'Enter QPPV email');
  else pass('Applicant', 'QPPV Email', formData.qppvEmail);

  if (!formData.proposedInventedName) fail('Applicant', 'Proposed Name', 'Enter proposed (invented) name');
  else pass('Applicant', 'Proposed Name', formData.proposedInventedName);

  if (!formData.atcCode) fail('Applicant', 'ATC Code', 'Enter ATC code');
  else pass('Applicant', 'ATC Code', formData.atcCode);

  // Step 3 - Product
  if (!formData.inn) fail('Product', 'INN', 'Enter International Nonproprietary Name');
  else pass('Product', 'INN', formData.inn);

  if (!formData.pharmaceuticalForm) fail('Product', 'Pharmaceutical Form', 'Select pharmaceutical form');
  else pass('Product', 'Pharmaceutical Form', formData.pharmaceuticalForm);

  if (!formData.strength) fail('Product', 'Strength', 'Enter strength');
  else pass('Product', 'Strength', formData.strength);

  if (!formData.therapeuticIndications) fail('Product', 'Indications', 'Enter therapeutic indications');
  else pass('Product', 'Indications');

  if (!formData.posology) fail('Product', 'Posology', 'Enter posology & administration');
  else pass('Product', 'Posology');

  if (formData.packageSizes.length === 0) fail('Product', 'Package Sizes', 'Add at least 1 package size');
  else pass('Product', 'Package Sizes', `${formData.packageSizes.length} size(s)`);

  if (!formData.shelfLife) fail('Product', 'Shelf Life', 'Enter shelf life');
  else pass('Product', 'Shelf Life', formData.shelfLife);

  if (!formData.storageConditions) fail('Product', 'Storage Conditions', 'Enter storage conditions');
  else pass('Product', 'Storage Conditions');

  if (!formData.legalStatus) fail('Product', 'Legal Status', 'Select legal status');
  else pass('Product', 'Legal Status', formData.legalStatus);

  // Step 4 - eCTD Documents
  const eCTDCount = Object.values(formData.eCTDDocuments || {}).filter(
    (d) => d.status === 'uploaded'
  ).length;
  if (eCTDCount === 0) {
    fail('eCTD Docs', 'Documents', 'Upload at least 1 eCTD module');
  } else if (eCTDCount < 5) {
    warn('eCTD Docs', 'Documents', `Only ${eCTDCount} module(s) uploaded (13 recommended)`);
  } else {
    pass('eCTD Docs', `Documents`, `${eCTDCount} module(s) uploaded`);
  }

  // CP mandatory scope check
  if (formData.procedureType !== 'CP' && formData.orphanDesignation) {
    warn('Procedure', 'CP Mandatory Scope', 'Orphan drugs are in the mandatory scope of CP. Consider switching to CP.');
  }

  return results;
}

export default function EmaStepReview({ formData, onSubmit, submitting }: Props) {
  const validations = useMemo(() => validate(formData), [formData]);
  const failCount = validations.filter((v) => v.status === 'fail').length;
  const warnCount = validations.filter((v) => v.status === 'warning').length;
  const passCount = validations.filter((v) => v.status === 'pass').length;
  const allValid = failCount === 0;
  const fee = useMemo(() => estimateFee(formData), [formData]);
  const eCTDCount = useMemo(
    () => Object.values(formData.eCTDDocuments || {}).filter((d) => d.status === 'uploaded').length,
    [formData.eCTDDocuments]
  );

  const renderValue = (val: unknown): string => {
    if (val === undefined || val === null || val === '') return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) return val.join(', ') || '-';
    return String(val);
  };

  const validationColumns = [
    {
      title: 'Step',
      dataIndex: 'step',
      key: 'step',
      width: 120,
      render: (v: string) => <Text strong style={{ color: EMA_BLUE }}>{v}</Text>,
    },
    {
      title: 'Check Item',
      dataIndex: 'field',
      key: 'field',
      width: 180,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        switch (status) {
          case 'pass': return <Tag color="success" icon={<CheckCircleOutlined />}>Pass</Tag>;
          case 'fail': return <Tag color="error" icon={<CloseCircleOutlined />}>Fail</Tag>;
          case 'warning': return <Tag color="warning" icon={<ExclamationCircleOutlined />}>Warning</Tag>;
          default: return null;
        }
      },
    },
    {
      title: 'Details',
      dataIndex: 'message',
      key: 'message',
      render: (msg: string, record: ValidationResult) => (
        <Text type={record.status === 'fail' ? 'danger' : record.status === 'warning' ? 'warning' : 'secondary'}>
          {msg}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Overall status banner */}
      <div style={{
        background: allValid ? '#F6FFED' : '#FFF2F0',
        padding: '16px 20px',
        marginBottom: 24,
        borderRadius: 2,
        border: allValid ? '1px solid #B7EB8F' : '1px solid #FFCCC7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {allValid
            ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
            : <WarningOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />
          }
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {allValid
                ? 'All mandatory items are complete. Application ready for submission to EMA.'
                : `${failCount} item(s) require attention before submission, ${warnCount} warning(s).`
              }
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              Total checks: {validations.length} |
              <Tag color="success" style={{ marginLeft: 4 }}>{passCount} Passed</Tag>
              {failCount > 0 && <Tag color="error">{failCount} Failed</Tag>}
              {warnCount > 0 && <Tag color="warning">{warnCount} Warnings</Tag>}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Estimation Card */}
      <Card
        title={
          <Space>
            <EuroCircleOutlined style={{ color: EMA_GOLD }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: EMA_BLUE }}>EMA Fee Estimation</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16, borderRadius: 2, border: `1px solid ${EMA_GOLD}` }}
      >
        {formData.procedureType ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14 }}>{fee.breakdown}</Text>
              <Text strong style={{ fontSize: 24, color: EMA_BLUE }}>
                &euro;{fee.amount.toLocaleString()}
              </Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ fontSize: 12, color: '#666' }}>
              <div>CP full application: &euro;310,600 | DCP: &euro;141,900 | MRP: &euro;103,800 | INP: ~&euro;51,800</div>
              <div style={{ marginTop: 4 }}>Fee reductions apply for: SMEs (50-80%), Orphan drugs (75%), Paediatric use (compliance reward)</div>
            </div>
          </div>
        ) : (
          <Text type="secondary">Select a procedure type in Step 1 to view fee estimation.</Text>
        )}
      </Card>

      {/* Validation Table */}
      <div style={sectionHeader}>Pre-Submission Validation Checklist</div>

      {/* Fatal errors */}
      {!allValid && (
        <div style={{ marginBottom: 16 }}>
          {validations.filter((v) => v.status === 'fail').map((v) => (
            <Alert
              key={v.key}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              message={
                <span>
                  <Text strong>[{v.step}]</Text> {v.field}: {v.message}
                </span>
              }
              style={{ marginBottom: 4, borderRadius: 2 }}
            />
          ))}
        </div>
      )}

      <Table
        dataSource={validations}
        columns={validationColumns}
        pagination={false}
        size="small"
        style={{ marginBottom: 24 }}
        rowClassName={(record) =>
          record.status === 'fail' ? 'review-row-fail' : ''
        }
        locale={{ emptyText: 'No validation results' }}
      />

      {/* Summary Cards */}
      <div style={sectionHeader}>Application Summary</div>

      {/* Procedure Summary */}
      <Card
        title={<span style={{ fontSize: 14, fontWeight: 600, color: EMA_BLUE }}>
          <GlobalOutlined style={{ marginRight: 8 }} />Procedure Selection
        </span>}
        size="small"
        style={{ marginBottom: 12, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Procedure Type', value: formData.procedureType || '-' },
            { key: 'RMS', value: formData.rms || 'N/A' },
            { key: 'CMS', value: formData.cmsList.length > 0 ? formData.cmsList.join(', ') : 'N/A' },
            { key: 'RMS Letter', value: formData.rmsConfirmationLetter ? 'Uploaded' : 'Not uploaded' },
            { key: 'Orphan Designation', value: formData.orphanDesignation ? `Yes — ${formData.orphanDesignationNumber || 'no number'}` : 'No' },
            { key: 'PIP', value: formData.pipExempt ? 'Exempt' : (formData.pipDecisionNumber || 'Not provided') },
            { key: 'Scientific Advice', value: formData.scientificAdviceNumbers || '-' },
          ]}
          columns={[
            { title: 'Item', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Applicant Summary */}
      <Card
        title={<span style={{ fontSize: 14, fontWeight: 600, color: EMA_BLUE }}>Applicant Information</span>}
        size="small"
        style={{ marginBottom: 12, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Legal Name', value: formData.applicantLegalName || '-' },
            { key: 'Country', value: formData.applicantCountry || '-' },
            { key: 'Address', value: formData.applicantAddress || '-' },
            { key: 'Contact Person', value: formData.contactPerson || '-' },
            { key: 'Phone', value: formData.contactPhone || '-' },
            { key: 'Technical Email', value: formData.technicalContactEmail || '-' },
            { key: 'Manufacturing Sites', value: `${formData.manufacturingSites.length} site(s)` },
            { key: 'QPPV', value: formData.qppvName || '-' },
            { key: 'Proposed Name', value: formData.proposedInventedName || '-' },
            { key: 'ATC Code', value: formData.atcCode || '-' },
          ]}
          columns={[
            { title: 'Item', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Product Summary */}
      <Card
        title={<span style={{ fontSize: 14, fontWeight: 600, color: EMA_BLUE }}>Product Details</span>}
        size="small"
        style={{ marginBottom: 12, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'INN', value: formData.inn || '-' },
            { key: 'Pharmaceutical Form', value: formData.pharmaceuticalForm || '-' },
            { key: 'Strength', value: formData.strength || '-' },
            { key: 'Indications', value: formData.therapeuticIndications || '-' },
            { key: 'Posology', value: formData.posology || '-' },
            { key: 'Package Sizes', value: formData.packageSizes.length > 0 ? formData.packageSizes.join(', ') : '-' },
            { key: 'Shelf Life', value: formData.shelfLife || '-' },
            { key: 'Storage', value: formData.storageConditions || '-' },
            { key: 'Legal Status', value: formData.legalStatus || '-' },
          ]}
          columns={[
            { title: 'Item', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value', render: (v: string) => v === '-' ? <Text type="secondary">-</Text> : v },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* eCTD Summary */}
      <Card
        title={<span style={{ fontSize: 14, fontWeight: 600, color: EMA_BLUE }}>eCTD Documents</span>}
        size="small"
        style={{ marginBottom: 24, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Modules Uploaded', value: `${Object.values(formData.eCTDDocuments || {}).filter(d => d.status === 'uploaded').length} / 13` },
          ]}
          columns={[
            { title: 'Item', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
        {eCTDCount === 0 && (
          <Alert
            type="warning"
            showIcon
            message="No eCTD modules uploaded. Return to Step 4 to upload required documents before submission."
            style={{ marginTop: 12, borderRadius: 2 }}
          />
        )}
      </Card>

      {/* Submit Button */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <Button
          type="primary"
          size="large"
          onClick={onSubmit}
          loading={submitting}
          disabled={!allValid}
          style={{
            height: 48,
            padding: '0 48px',
            fontSize: 16,
            borderRadius: 2,
            background: allValid ? EMA_BLUE : undefined,
            borderColor: allValid ? EMA_BLUE : undefined,
          }}
        >
          Submit Marketing Authorisation Application to EMA
        </Button>
        {!allValid && (
          <div style={{ marginTop: 12 }}>
            <Text type="danger">
              <WarningOutlined /> Please resolve all {failCount} failed validation checks before submitting.
            </Text>
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          By submitting, you confirm that all information is complete and accurate in accordance with EU pharmaceutical
          legislation (Directive 2001/83/EC and Regulation (EC) No 726/2004).
        </div>
      </div>
    </div>
  );
}
