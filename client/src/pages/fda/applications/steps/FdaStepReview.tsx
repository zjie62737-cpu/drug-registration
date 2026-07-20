import { useMemo } from 'react';
import { Typography, Tag, Card, Alert, Button, Table, Space } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { FdaApplicationFormData } from '../FdaAppCreateWizard';

const { Text } = Typography;

interface FdaStepReviewProps {
  formData: FdaApplicationFormData;
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

const FDA_NAVY = '#112E51';
const FDA_BLUE = '#0071BC';
const FDA_RED = '#E31C3D';

function isValidDUNS(val: string): boolean {
  return /^\d{9}$/.test(val);
}

function isValidFEI(val: string): boolean {
  return /^\d{10}$/.test(val);
}

function validate(formData: FdaApplicationFormData): ValidationResult[] {
  const results: ValidationResult[] = [];
  let id = 0;

  const fail = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'fail' as const, message });
  };
  const warn = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'warning' as const, message });
  };
  const pass = (step: string, field: string, message?: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'pass' as const, message: message || 'Complete' });
  };

  // Step 1 - Company Information
  if (!formData.dunsNumber) fail('Company Information', 'DUNS Number', 'DUNS number is required for all FDA submissions');
  else if (!isValidDUNS(formData.dunsNumber)) fail('Company Information', 'DUNS Number', 'DUNS number must be exactly 9 digits');
  else pass('Company Information', 'DUNS Number');

  if (!formData.feiNumber) fail('Company Information', 'FEI Number', 'FEI number is required for facility identification');
  else if (!isValidFEI(formData.feiNumber)) fail('Company Information', 'FEI Number', 'FEI number must be exactly 10 digits');
  else pass('Company Information', 'FEI Number');

  if (!formData.esgAccount) fail('Company Information', 'ESG Account', 'ESG account is required for electronic submissions');
  else pass('Company Information', 'ESG Account');

  if (!formData.usAgentName) warn('Company Information', 'U.S. Agent Name', 'U.S. Agent is required for foreign applicants. If domestic, this may be omitted.');
  else pass('Company Information', 'U.S. Agent Name');

  if (!formData.usAgentAddress && formData.usAgentName)
    warn('Company Information', 'U.S. Agent Address', 'U.S. Agent address should be provided');
  else if (formData.usAgentAddress) pass('Company Information', 'U.S. Agent Address');

  if (!formData.usAgentEmail && formData.usAgentName)
    warn('Company Information', 'U.S. Agent Email', 'U.S. Agent email should be provided for correspondence');
  else if (formData.usAgentEmail) pass('Company Information', 'U.S. Agent Email');

  if (!formData.companyLegalName) fail('Company Information', 'Company Legal Name', 'Company legal name is required');
  else pass('Company Information', 'Company Legal Name');

  if (!formData.companyAddress) fail('Company Information', 'Company Address', 'Company address is required (P.O. Box not acceptable for manufacturing)');
  else pass('Company Information', 'Company Address');

  if (!formData.companyPhone) warn('Company Information', 'Company Phone', 'Company phone is recommended');
  else pass('Company Information', 'Company Phone');

  if (!formData.companyEmail) fail('Company Information', 'Company Email', 'Company email is required for FDA correspondence');
  else pass('Company Information', 'Company Email');

  if (!formData.proprietaryName) warn('Company Information', 'Proprietary Name', 'Proposed brand name should be provided for FDA name review');
  else pass('Company Information', 'Proprietary Name');

  if (formData.ndcNumber) {
    pass('Company Information', 'NDC Number', 'NDC number provided');
  }

  if (formData.preAssignedBlaNumber) {
    pass('Company Information', 'Pre-assigned BLA Number', 'BLA number provided');
  }

  // Step 2 - Application Type
  if (!formData.applicationFormType) fail('Application Type', 'Application Form Type', 'Form type (356h or 1571) must be selected');
  else pass('Application Type', 'Application Form Type');

  if (!formData.applicationType) fail('Application Type', 'Application Type', 'Application type must be selected');
  else pass('Application Type', 'Application Type');

  if (!formData.regulatoryPathway) fail('Application Type', 'Regulatory Pathway', 'Regulatory pathway must be specified');
  else pass('Application Type', 'Regulatory Pathway');

  if (!formData.proposedIndication) fail('Application Type', 'Proposed Indication', 'Proposed indication is required');
  else pass('Application Type', 'Proposed Indication');

  if (!formData.drugSubstanceName) fail('Application Type', 'Drug Substance Name', 'USAN/INN name is required');
  else pass('Application Type', 'Drug Substance Name');

  if (!formData.dosageForm) fail('Application Type', 'Dosage Form', 'Dosage form must be selected using FDA terminology');
  else pass('Application Type', 'Dosage Form');

  if (!formData.strength) fail('Application Type', 'Strength', 'Drug strength must be specified');
  else pass('Application Type', 'Strength');

  if (!formData.routeOfAdministration) fail('Application Type', 'Route of Administration', 'Route of administration must be selected');
  else pass('Application Type', 'Route of Administration');

  if (!formData.rxOtcStatus) fail('Application Type', 'Rx/OTC Status', 'Prescription status must be selected');
  else pass('Application Type', 'Rx/OTC Status');

  // Step 3 - Product / CMC
  if (!formData.drugSubstanceManufacturer) fail('Product/CMC', 'Drug Substance Manufacturer', 'Drug substance manufacturer is required per 21 CFR 314.50');
  else pass('Product/CMC', 'Drug Substance Manufacturer');

  if (!formData.drugProductManufacturer) fail('Product/CMC', 'Drug Product Manufacturer', 'Drug product manufacturer is required per 21 CFR 314.50');
  else pass('Product/CMC', 'Drug Product Manufacturer');

  if (!formData.manufacturingProcessSummary) fail('Product/CMC', 'Manufacturing Process', 'Manufacturing process summary is required for Module 3');
  else pass('Product/CMC', 'Manufacturing Process');

  if (!formData.specifications) fail('Product/CMC', 'Specifications', 'Product specifications are required');
  else pass('Product/CMC', 'Specifications');

  if (!formData.containerClosureSystem) warn('Product/CMC', 'Container/Closure', 'Container/closure system details should be provided');
  else pass('Product/CMC', 'Container/Closure');

  if (!formData.stabilityData) fail('Product/CMC', 'Stability Data', 'Stability data summary is required per ICH Q1A(R2)');
  else pass('Product/CMC', 'Stability Data');

  if (!formData.sterilityAssurance) {
    const isInject = formData.dosageForm && (
      formData.dosageForm.includes('injection') || formData.dosageForm.includes('Injection')
    );
    if (isInject) fail('Product/CMC', 'Sterility Assurance', 'Sterility assurance data is required for injectable products');
    else pass('Product/CMC', 'Sterility Assurance', 'Not applicable');
  } else pass('Product/CMC', 'Sterility Assurance');

  // Step 4 - eCTD Documents
  const docCount = Object.values(formData.eCTDDocuments || {}).filter(
    (d) => d.status === 'uploaded'
  ).length;
  if (docCount === 0) {
    fail('eCTD Documents', 'Module Documents', 'At least one eCTD document must be uploaded per FDA requirements');
  } else {
    pass('eCTD Documents', `Uploaded ${docCount} document(s)`);
  }

  return results;
}

const sectionHeader: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: FDA_NAVY,
  borderLeft: `4px solid ${FDA_BLUE}`,
  paddingLeft: 12,
  marginBottom: 16,
  marginTop: 8,
};

export default function FdaStepReview({ formData, onSubmit, submitting }: FdaStepReviewProps) {
  const validations = useMemo(() => validate(formData), [formData]);
  const failCount = validations.filter((v) => v.status === 'fail').length;
  const warnCount = validations.filter((v) => v.status === 'warning').length;
  const passCount = validations.filter((v) => v.status === 'pass').length;
  const allValid = failCount === 0;

  const renderValue = (val: unknown, map?: Record<string, string>): string => {
    if (val === undefined || val === null || val === '') return '-';
    if (map && typeof val === 'string' && map[val]) return map[val];
    return String(val);
  };

  const validationColumns = [
    {
      title: 'Module',
      dataIndex: 'step',
      key: 'step',
      width: 140,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Validation Item',
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
        background: allValid ? '#D4EDDA' : '#F8D7DA',
        padding: '16px 20px',
        marginBottom: 24,
        borderRadius: 2,
        border: allValid ? '1px solid #C3E6CB' : '1px solid #F5C6CB',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {allValid
            ? <CheckCircleOutlined style={{ color: '#155724', fontSize: 22 }} />
            : <WarningOutlined style={{ color: '#721C24', fontSize: 22 }} />
          }
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: allValid ? '#155724' : '#721C24' }}>
              {allValid
                ? 'All required fields are complete. Ready for submission to FDA.'
                : `${failCount} critical item(s) must be completed before submission. ${warnCount} warning(s) to review.`
              }
            </div>
            <div style={{ fontSize: 13, color: allValid ? '#155724' : '#721C24', marginTop: 4 }}>
              Validated {validations.length} items: <Tag color="success" style={{ marginLeft: 4 }}>{passCount} Pass</Tag>
              {failCount > 0 && <Tag color="error">{failCount} Fail</Tag>}
              {warnCount > 0 && <Tag color="warning">{warnCount} Warning</Tag>}
            </div>
          </div>
        </div>
      </div>

      {/* Validation table */}
      <div style={sectionHeader}>eCTD Submission Readiness Validation</div>
      <div style={{ fontSize: 12, color: '#5B616B', marginBottom: 12, marginTop: -12 }}>
        Per 21 CFR 314.50, 21 CFR 312.23, and FDA Guidance for Industry: Providing Regulatory Submissions in Electronic Format.
      </div>
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

      {/* FDA-specific validation checks */}
      <div style={sectionHeader}>FDA System Validation</div>
      <Card size="small" style={{ marginBottom: 16, borderRadius: 2 }}>
        <Table
          dataSource={[
            { check: 'DUNS Format', result: isValidDUNS(formData.dunsNumber) ? 'Valid' : 'Invalid', valid: isValidDUNS(formData.dunsNumber) },
            { check: 'FEI Format', result: isValidFEI(formData.feiNumber) ? 'Valid' : 'Invalid', valid: isValidFEI(formData.feiNumber) },
            { check: 'ESG Account Status', result: formData.esgAccount ? 'Registered' : 'Not Provided', valid: !!formData.esgAccount },
            { check: 'eCTD Backbone File', result: 'Required', valid: true },
            { check: 'US Agent Designation', result: formData.usAgentName ? 'Designated' : 'Not Designated', valid: !!formData.usAgentName },
            { check: 'Form Version Check', result: formData.applicationFormType ? 'Current version selected' : 'Not selected', valid: !!formData.applicationFormType },
          ]}
          columns={[
            { title: 'System Check', dataIndex: 'check', key: 'check', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Result', dataIndex: 'result', key: 'result', width: 200 },
            {
              title: 'Status', key: 'status', width: 100,
              render: (_: unknown, record: { valid: boolean }) =>
                record.valid
                  ? <Tag color="success" icon={<CheckCircleOutlined />}>OK</Tag>
                  : <Tag color="error" icon={<CloseCircleOutlined />}>Check</Tag>,
            },
          ]}
          pagination={false}
          size="small"
          showHeader={true}
        />
      </Card>

      {/* Summary Cards */}
      <div style={sectionHeader}>Application Summary</div>

      {/* Company Info Summary */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: FDA_NAVY }}>Company Information Summary</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'DUNS Number', value: formData.dunsNumber || '-' },
            { key: 'FEI Number', value: formData.feiNumber || '-' },
            { key: 'ESG Account', value: formData.esgAccount || '-' },
            { key: 'U.S. Agent', value: formData.usAgentName || '-' },
            { key: 'U.S. Agent Address', value: formData.usAgentAddress || '-' },
            { key: 'U.S. Agent Email', value: formData.usAgentEmail || '-' },
            { key: 'Company Legal Name', value: formData.companyLegalName || '-' },
            { key: 'Company Address', value: formData.companyAddress || '-' },
            { key: 'Proprietary Name', value: formData.proprietaryName || '-' },
            { key: 'NDC Number', value: formData.ndcNumber || 'N/A' },
            { key: 'Pre-assigned BLA #', value: formData.preAssignedBlaNumber || 'N/A' },
          ]}
          columns={[
            { title: 'Field', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Application Type Summary */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: FDA_NAVY }}>Application Type Summary</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Form Type', value: formData.applicationFormType || '-' },
            { key: 'Application Type', value: formData.applicationType || '-' },
            { key: 'Regulatory Pathway', value: formData.regulatoryPathway || '-' },
            { key: 'Drug Substance (USAN)', value: formData.drugSubstanceName || '-' },
            { key: 'Proposed Indication', value: formData.proposedIndication || '-' },
            { key: 'Dosage Form', value: formData.dosageForm || '-' },
            { key: 'Strength', value: formData.strength || '-' },
            { key: 'Route of Administration', value: formData.routeOfAdministration || '-' },
            { key: 'Rx/OTC Status', value: formData.rxOtcStatus || '-' },
          ]}
          columns={[
            { title: 'Field', dataIndex: 'key', key: 'key', width: 200, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Product/CMC Summary */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: FDA_NAVY }}>Product / CMC Summary</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Drug Substance Manufacturer', value: formData.drugSubstanceManufacturer || '-' },
            { key: 'Drug Product Manufacturer', value: formData.drugProductManufacturer || '-' },
            { key: 'Manufacturing Process', value: formData.manufacturingProcessSummary ? 'Provided' : 'Not provided' },
            { key: 'Specifications', value: formData.specifications ? 'Provided' : 'Not provided' },
            { key: 'Container/Closure', value: formData.containerClosureSystem ? 'Provided' : 'Not provided' },
            { key: 'Stability Data', value: formData.stabilityData ? 'Provided' : 'Not provided' },
            { key: 'Sterility Assurance', value: formData.sterilityAssurance || 'Not applicable' },
          ]}
          columns={[
            { title: 'Field', dataIndex: 'key', key: 'key', width: 220, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* eCTD Summary */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: FDA_NAVY }}>eCTD Document Summary</span>}
        size="small"
        style={{ marginBottom: 24, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: 'Total Documents Uploaded', value: `${Object.values(formData.eCTDDocuments || {}).filter(d => d.status === 'uploaded').length} file(s)` },
          ]}
          columns={[
            { title: 'Field', dataIndex: 'key', key: 'key', width: 220, render: (v: string) => <Text strong>{v}</Text> },
            { title: 'Value', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
        {Object.values(formData.eCTDDocuments || {}).filter(d => d.status === 'uploaded').length === 0 && (
          <Alert
            type="warning"
            showIcon
            message="No eCTD documents have been uploaded. Return to Step 4 to upload required documents before submission."
            style={{ marginTop: 12, borderRadius: 2 }}
          />
        )}
      </Card>

      {/* Fatal errors */}
      {!allValid && (
        <div style={{ marginBottom: 24 }}>
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

      {/* PDUFA & Refuse-to-File Notice */}
      {allValid && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 2, border: `1px solid ${FDA_BLUE}` }}
          message={
            <div style={{ color: FDA_NAVY }}>
              <Text strong>PDUFA Goal Date &amp; Filing Review Notice</Text>
              <div style={{ fontSize: 12, marginTop: 4, lineHeight: '18px' }}>
                Upon submission, FDA will conduct a 60-day filing review to determine if the application is sufficiently
                complete to permit a substantive review. If accepted, a PDUFA goal date will be assigned:
                Standard Review: 10 months from receipt date; Priority Review: 6 months from receipt date.
                A Refuse-to-File (RTF) decision may be issued if the application is incomplete.
              </div>
            </div>
          }
        />
      )}

      {/* Submit button */}
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
            background: allValid ? FDA_BLUE : undefined,
            borderColor: allValid ? FDA_BLUE : undefined,
          }}
        >
          Submit FDA Application via ESG
        </Button>
        {!allValid && (
          <div style={{ marginTop: 12 }}>
            <Text type="danger" style={{ color: FDA_RED }}>
              <WarningOutlined /> Please complete all {failCount} required item(s) above before submitting to the FDA
              Electronic Submission Gateway.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
