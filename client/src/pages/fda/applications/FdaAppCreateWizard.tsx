import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Breadcrumb, Space, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import StepWizard from '../../../components/shared/StepWizard';
import FdaStepCompany from './steps/FdaStepCompany';
import FdaStepAppType from './steps/FdaStepAppType';
import FdaStepProduct from './steps/FdaStepProduct';
import FdaStepDocs from './steps/FdaStepDocs';
import FdaStepReview from './steps/FdaStepReview';
import { applicationService } from '../../../services/applicationService';

const { Title, Text } = Typography;

const STEPS = [
  { title: 'Company Information', description: 'Applicant & facility details' },
  { title: 'Application Type', description: 'Submission type & drug info' },
  { title: 'Product / CMC', description: 'Product quality information' },
  { title: 'eCTD Documents', description: 'Electronic submission documents' },
  { title: 'Review & Submit', description: 'Validation & final submission' },
];

export interface FdaApplicationFormData {
  // Step 1 - Company Information
  dunsNumber: string;
  feiNumber: string;
  esgAccount: string;
  usAgentName: string;
  usAgentAddress: string;
  usAgentPhone: string;
  usAgentEmail: string;
  companyLegalName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  ndcNumber: string;
  preAssignedBlaNumber: string;
  proprietaryName: string;

  // Step 2 - Application Type
  applicationFormType: string;
  applicationType: string;
  regulatoryPathway: string;
  proposedIndication: string;
  drugSubstanceName: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  rxOtcStatus: string;

  // Step 3 - Product / CMC
  drugSubstanceManufacturer: string;
  drugProductManufacturer: string;
  manufacturingProcessSummary: string;
  specifications: string;
  containerClosureSystem: string;
  stabilityData: string;
  sterilityAssurance: string;

  // Step 4 - eCTD Documents
  eCTDDocuments: Record<string, { fileName: string; status: string }>;
}

const INITIAL_DATA: FdaApplicationFormData = {
  dunsNumber: '',
  feiNumber: '',
  esgAccount: '',
  usAgentName: '',
  usAgentAddress: '',
  usAgentPhone: '',
  usAgentEmail: '',
  companyLegalName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  ndcNumber: '',
  preAssignedBlaNumber: '',
  proprietaryName: '',
  applicationFormType: '',
  applicationType: '',
  regulatoryPathway: '',
  proposedIndication: '',
  drugSubstanceName: '',
  dosageForm: '',
  strength: '',
  routeOfAdministration: '',
  rxOtcStatus: '',
  drugSubstanceManufacturer: '',
  drugProductManufacturer: '',
  manufacturingProcessSummary: '',
  specifications: '',
  containerClosureSystem: '',
  stabilityData: '',
  sterilityAssurance: '',
  eCTDDocuments: {},
};

// ── FDA Government portal styles ──
const FDA_NAVY = '#112E51';
const FDA_BLUE = '#0071BC';
const FDA_RED = '#E31C3D';

const topBarStyle: React.CSSProperties = {
  background: FDA_NAVY,
  color: '#fff',
  padding: '6px 24px',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

const dotGovBadge: React.CSSProperties = {
  background: '#fff',
  color: FDA_NAVY,
  padding: '1px 6px',
  borderRadius: 2,
  fontSize: 11,
  fontWeight: 700,
  marginLeft: 8,
  letterSpacing: '0.3px',
};

const secondaryBarStyle: React.CSSProperties = {
  background: '#fff',
  padding: '10px 24px',
  borderBottom: '1px solid #DFE1E2',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const pageHeaderStyle: React.CSSProperties = {
  background: '#fff',
  padding: '16px 24px',
  borderBottom: '1px solid #DFE1E2',
};

const footerStyle: React.CSSProperties = {
  marginTop: 32,
  padding: '24px',
  background: FDA_NAVY,
  color: '#fff',
  fontSize: 12,
};

export default function FdaAppCreateWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FdaApplicationFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);

  const handleDataChange = useCallback((partial: Partial<FdaApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        type: formData.applicationType || 'IND',
        drugName: formData.proprietaryName || formData.drugSubstanceName || 'FDA Application',
        drugType: formData.dosageForm || 'Not specified',
        specification: formData.strength || 'Not specified',
        manufacturer: formData.companyLegalName || '',
        regulatorySystemId: 'fda',
        applicationCategory: formData.applicationFormType || formData.applicationType,
        genericName: formData.drugSubstanceName,
        tradeName: formData.proprietaryName,
        dosageForm: formData.dosageForm,
        indication: formData.proposedIndication,
        usageDosage: formData.routeOfAdministration,
        atcCode: formData.rxOtcStatus,
        isOverseas: !!formData.usAgentName,
        productionSite: formData.drugProductManufacturer || formData.companyAddress,
        isSmallEnterprise: false,
        feePayer: formData.companyLegalName,
      };

      const app = await applicationService.create(payload);
      const submitted = await applicationService.submit(app.id);
      message.success(`FDA Application successfully submitted! Application #: ${submitted.applicationNo}`);
      navigate(`/fda/applications/${submitted.id}`);
    } catch {
      // errors handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FdaStepCompany formData={formData} onChange={handleDataChange} />;
      case 1:
        return <FdaStepAppType formData={formData} onChange={handleDataChange} />;
      case 2:
        return <FdaStepProduct formData={formData} onChange={handleDataChange} />;
      case 3:
        return <FdaStepDocs formData={formData} onChange={handleDataChange} />;
      case 4:
        return <FdaStepReview formData={formData} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ margin: -24 }}>
      {/* ── FDA Top Government Bar ── */}
      <div style={topBarStyle}>
        <Space size={6}>
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='white'/%3E%3Ctext x='20' y='27' text-anchor='middle' font-size='22' font-family='serif' fill='%23112E51'%3E%26starf;%3C/text%3E%3C/svg%3E"
            alt="FDA"
            style={{ width: 20, height: 20 }}
          />
          <span style={{ fontWeight: 500 }}>U.S. Food and Drug Administration</span>
          <span style={dotGovBadge}>.gov</span>
        </Space>
        <Space size={16}>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Protecting and Promoting Public Health</Text>
        </Space>
      </div>

      {/* ── Secondary Bar ── */}
      <div style={secondaryBarStyle}>
        <div style={{
          background: FDA_NAVY,
          color: '#fff',
          width: 36,
          height: 36,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
        }}>
          FDA
        </div>
        <div>
          <div style={{ fontWeight: 700, color: FDA_NAVY, fontSize: 15 }}>Drug Registration & Review Simulation</div>
          <div style={{ fontSize: 11, color: '#5B616B' }}>Electronic Submission Gateway</div>
        </div>
      </div>

      {/* ── Page header with breadcrumb ── */}
      <div style={pageHeaderStyle}>
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> Home</> },
            { title: <a href="/fda">FDA Drug Registration</a> },
            { title: <span style={{ color: FDA_BLUE }}>New Application</span> },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/fda')}
            size="small"
          >
            Back to Dashboard
          </Button>
          <Title level={4} style={{ margin: 0, color: FDA_NAVY, fontSize: 18 }}>
            New Drug Application Submission
          </Title>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: '#5B616B' }}>
          Complete all steps to submit your application to the FDA. Fields marked with <span style={{ color: FDA_RED }}>*</span> are required.
          For assistance, contact CDER at <a href="#" style={{ color: FDA_BLUE }}>CDERCentralDocumentRoom@fda.hhs.gov</a>.
        </div>
      </div>

      {/* ── Main content area ── */}
      <div style={{ padding: 24, background: '#F5F5F5' }}>
        <Card
          style={{
            borderRadius: 2,
            border: '1px solid #DFE1E2',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          styles={{ body: { padding: '24px 32px' } }}
        >
          <StepWizard
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          >
            <div style={{ minHeight: 400 }}>
              {renderStep()}
            </div>
          </StepWizard>

          {currentStep < STEPS.length - 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid #DFE1E2',
            }}>
              <Button
                size="large"
                disabled={currentStep === 0}
                onClick={handlePrev}
              >
                Previous Step
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                style={{
                  background: FDA_BLUE,
                  borderColor: FDA_BLUE,
                  borderRadius: 2,
                }}
              >
                Next Step
              </Button>
            </div>
          )}
        </Card>

        {/* ── FDA Government Footer ── */}
        <div style={footerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>About FDA</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '20px' }}>
                The Food and Drug Administration is responsible for protecting the public health by ensuring the safety,
                efficacy, and security of human and veterinary drugs, biological products, and medical devices.
              </div>
            </div>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Quick Links</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '22px' }}>
                <div>Drugs@FDA</div>
                <div>Orange Book</div>
                <div>eCTD Submission Standards</div>
                <div>CDER Guidance Documents</div>
              </div>
            </div>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Contact CDER</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '22px' }}>
                <div>10903 New Hampshire Avenue</div>
                <div>Silver Spring, MD 20993</div>
                <div>1-855-543-3784</div>
                <div>druginfo@fda.hhs.gov</div>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 12,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
          }}>
            FDA Drug Registration Simulation System | This platform is for educational training purposes only.
            Not linked to actual FDA systems. No real regulatory data is submitted.
          </div>
        </div>
      </div>
    </div>
  );
}
