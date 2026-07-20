import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Breadcrumb, Space, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import StepWizard from '../../../components/shared/StepWizard';
import EmaStepProcedure from './steps/EmaStepProcedure';
import EmaStepApplicant from './steps/EmaStepApplicant';
import EmaStepProduct from './steps/EmaStepProduct';
import EmaStepDocs from './steps/EmaStepDocs';
import EmaStepReview from './steps/EmaStepReview';
import { applicationService } from '../../../services/applicationService';

const { Title, Text } = Typography;

export interface EmaManufacturingSite {
  id: string;
  name: string;
  address: string;
  gmpCertificate: string;
}

export interface EmaApplicationFormData {
  // Step 1 - Procedure Selection
  procedureType: string;
  rms: string;
  cmsList: string[];
  rmsConfirmationLetter: { fileName: string; status: string } | null;
  orphanDesignationNumber: string;
  orphanDesignation: boolean;
  pipDecisionNumber: string;
  pipExempt: boolean;
  scientificAdviceNumbers: string;

  // Step 2 - Applicant Information
  applicantLegalName: string;
  applicantAddress: string;
  applicantCountry: string;
  contactPerson: string;
  contactPhone: string;
  technicalContactEmail: string;
  manufacturingSites: EmaManufacturingSite[];
  qppvName: string;
  qppvEmail: string;
  proposedInventedName: string;
  atcCode: string;

  // Step 3 - Product Details
  inn: string;
  pharmaceuticalForm: string;
  strength: string;
  therapeuticIndications: string;
  posology: string;
  packageSizes: string[];
  shelfLife: string;
  storageConditions: string;
  legalStatus: string;

  // Step 4 - eCTD Documents
  eCTDDocuments: Record<string, { fileName: string; status: string }>;
}

const STEPS = [
  { title: 'Procedure Selection', description: 'Select procedure type & prerequisites' },
  { title: 'Applicant Information', description: 'Applicant & manufacturing details' },
  { title: 'Product Details', description: 'Pharmaceutical product information' },
  { title: 'eCTD Documents', description: 'Electronic CTD dossier upload' },
  { title: 'Review & Submit', description: 'Validation & submission to EMA' },
];

const INITIAL_DATA: EmaApplicationFormData = {
  procedureType: '',
  rms: '',
  cmsList: [],
  rmsConfirmationLetter: null,
  orphanDesignationNumber: '',
  orphanDesignation: false,
  pipDecisionNumber: '',
  pipExempt: false,
  scientificAdviceNumbers: '',
  applicantLegalName: '',
  applicantAddress: '',
  applicantCountry: '',
  contactPerson: '',
  contactPhone: '',
  technicalContactEmail: '',
  manufacturingSites: [],
  qppvName: '',
  qppvEmail: '',
  proposedInventedName: '',
  atcCode: '',
  inn: '',
  pharmaceuticalForm: '',
  strength: '',
  therapeuticIndications: '',
  posology: '',
  packageSizes: [],
  shelfLife: '',
  storageConditions: '',
  legalStatus: '',
  eCTDDocuments: {},
};

// ── EMA Government portal styles ──
const EMA_BLUE = '#003399';
const EMA_RED = '#DA2131';
const EMA_LIGHT_BG = '#F4F5F7';

const euTopBarStyle: React.CSSProperties = {
  background: EMA_BLUE,
  color: '#fff',
  padding: '6px 24px',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const euFlagStars: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  color: '#FFD617',
  fontSize: 12,
  letterSpacing: 1,
};

const pageHeaderStyle: React.CSSProperties = {
  background: '#fff',
  padding: '16px 24px',
  borderBottom: '1px solid #E0E0E0',
};

const pageHeaderLogo: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const emaLogoStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  background: EMA_BLUE,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFD617',
  fontSize: 18,
  fontWeight: 700,
};

const contentBg: React.CSSProperties = {
  padding: 24,
  background: EMA_LIGHT_BG,
};

const footerStyle: React.CSSProperties = {
  marginTop: 32,
  padding: '16px 24px',
  background: EMA_BLUE,
  color: 'rgba(255,255,255,0.85)',
  textAlign: 'center',
  fontSize: 12,
};

export default function EmaAppCreateWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EmaApplicationFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);

  const handleDataChange = useCallback((partial: Partial<EmaApplicationFormData>) => {
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
        type: formData.procedureType,
        drugName: formData.inn || formData.proposedInventedName,
        drugType: formData.pharmaceuticalForm || 'medicinal_product',
        specification: formData.strength || '',
        manufacturer: formData.applicantLegalName || formData.manufacturingSites?.[0]?.name || '',
        regulatorySystemId: 'ema',
        applicationCategory: formData.procedureType,
        genericName: formData.inn,
        tradeName: formData.proposedInventedName,
        dosageForm: formData.pharmaceuticalForm,
        indication: formData.therapeuticIndications,
        usageDosage: formData.posology,
        atcCode: formData.atcCode,
        isOverseas: formData.applicantCountry !== 'Netherlands',
        productionSite: formData.manufacturingSites?.[0]?.address || formData.applicantAddress,
        orphanDrug: formData.orphanDesignation,
        feePayer: formData.applicantLegalName,
      };

      const app = await applicationService.create(payload);
      const submitted = await applicationService.submit(app.id);
      message.success(`EMA application submitted successfully!`);
      navigate(`/ema/applications/${submitted.id}`);
    } catch {
      // errors handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <EmaStepProcedure formData={formData} onChange={handleDataChange} />;
      case 1:
        return <EmaStepApplicant formData={formData} onChange={handleDataChange} />;
      case 2:
        return <EmaStepProduct formData={formData} onChange={handleDataChange} />;
      case 3:
        return <EmaStepDocs formData={formData} onChange={handleDataChange} />;
      case 4:
        return <EmaStepReview formData={formData} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ margin: -24 }}>
      {/* ── EU Top Bar ── */}
      <div style={euTopBarStyle}>
        <Space size={4}>
          <span style={euFlagStars}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} style={{ transform: `rotate(${i * 30}deg)`, display: 'inline-block' }}>&#9733;</span>
            ))}
          </span>
          <span style={{ opacity: 0.85 }}>An agency of the European Union</span>
        </Space>
        <Space size={16}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Contact EMA</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Tel: +31 (0)88 781 6000</Text>
        </Space>
      </div>

      {/* ── Page Header with EMA Logo ── */}
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLogo}>
          <div style={emaLogoStyle}>
            <span style={{ fontSize: 14 }}>EMA</span>
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: EMA_BLUE, fontSize: 18, fontWeight: 700 }}>
              European Medicines Agency
            </Title>
            <Text style={{ fontSize: 12, color: '#666' }}>
              Science Medicines Health
            </Text>
          </div>
        </div>
        <Breadcrumb
          style={{ marginTop: 12 }}
          items={[
            { title: <><HomeOutlined style={{ color: EMA_BLUE }} /> Home</> },
            { title: 'Human Regulatory' },
            { title: 'Marketing Authorisation' },
            { title: <span style={{ color: EMA_BLUE, fontWeight: 600 }}>New Application</span> },
          ]}
        />
      </div>

      {/* ── Main Content Area ── */}
      <div style={contentBg}>
        <Card
          style={{ borderRadius: 2, border: '1px solid #E0E0E0' }}
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
              borderTop: '1px solid #E0E0E0',
            }}>
              <Button
                size="large"
                disabled={currentStep === 0}
                onClick={handlePrev}
              >
                Previous
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                style={{
                  background: EMA_BLUE,
                  borderColor: EMA_BLUE,
                  borderRadius: 2,
                }}
              >
                Next Step
              </Button>
            </div>
          )}
        </Card>

        {/* ── EMA Government Footer ── */}
        <div style={footerStyle}>
          <div>
            European Medicines Agency | Domenico Scarlattilaan 6 | 1083 HS Amsterdam | The Netherlands
          </div>
          <div style={{ marginTop: 4 }}>
            Telephone: +31 (0)88 781 6000 | Send a question: www.ema.europa.eu/contact
          </div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            Drug Registration Simulation System | This platform is for training and simulation purposes only.
            Not connected to actual EMA systems.
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={euFlagStars}>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} style={{ transform: `rotate(${i * 30}deg)`, display: 'inline-block', fontSize: 10 }}>&#9733;</span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
