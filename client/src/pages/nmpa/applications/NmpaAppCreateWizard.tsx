import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Button, Breadcrumb, Space, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import StepWizard from '../../../components/shared/StepWizard';
import StepBasicInfo from './steps/StepBasicInfo';
import StepEnterprise from './steps/StepEnterprise';
import StepPatent from './steps/StepPatent';
import StepCTDDocs from './steps/StepCTDDocs';
import StepReview from './steps/StepReview';
import { applicationService } from '../../../services/applicationService';
import type { NmpaApplicationFormData, EnterpriseInfo } from '../../../types/regulatory';

const { Title, Text } = Typography;

const STEPS = [
  { title: '基本信息', description: '药品注册基本信息' },
  { title: '企业信息', description: '申请人企业信息' },
  { title: '专利与声明', description: '专利信息及合规声明' },
  { title: 'CTD资料', description: 'CTD申报资料上传' },
  { title: '审核提交', description: '信息汇总与提交' },
];

const INITIAL_DATA: NmpaApplicationFormData = {
  registrationType: '',
  applicationCategory: 'marketing_auth',
  registrationClass: '' as NmpaApplicationFormData['registrationClass'],
  drugNameGeneric: '',
  drugNameTrade: '',
  drugType: '',
  dosageForm: '',
  specification: '',
  indication: '',
  usageAndDosage: '',
  atcCode: '',
  isOverseasProduced: false,
  productionSite: '',
  rld: '',
  apiDmfReference: '',
  enterprise: {} as EnterpriseInfo,
  croList: [],
  patentList: [],
  nonInfringementDeclared: false,
  isControlledSubstance: false,
  isPriorityReview: false,
  isBreakthroughTherapy: false,
  isOrphanDrug: false,
  isSmallEnterprise: false,
  feePayer: '',
  ctdDocuments: {},
};

// ── Government portal styles ──
const govHeaderStyle: React.CSSProperties = {
  background: '#1A3A6B',
  color: '#fff',
  padding: '8px 24px',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const pageHeaderStyle: React.CSSProperties = {
  background: '#fff',
  padding: '16px 24px',
  borderBottom: '1px solid #E8E8E8',
};

const footerStyle: React.CSSProperties = {
  marginTop: 32,
  padding: '16px 24px',
  background: '#FAFBFC',
  borderTop: '1px solid #E8E8E8',
  textAlign: 'center',
  fontSize: 12,
  color: '#999',
};

export default function NmpaAppCreateWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialData = useMemo(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['IND', 'NDA', 'ANDA'].includes(typeParam)) {
      return { ...INITIAL_DATA, registrationType: typeParam };
    }
    return INITIAL_DATA;
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NmpaApplicationFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleDataChange = useCallback((partial: Partial<NmpaApplicationFormData>) => {
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
        type: formData.registrationType,
        drugName: formData.drugNameGeneric,
        drugType: formData.drugType,
        specification: formData.specification,
        manufacturer: formData.enterprise?.legalRepresentative
          ? `${formData.enterprise.businessLicenseNo?.substring(0, 8) || ''} - 生产`
          : formData.productionSite || '',
        regulatorySystemId: 'nmpa',
        applicationCategory: formData.applicationCategory,
        registrationClass: formData.registrationClass,
        genericName: formData.drugNameGeneric,
        tradeName: formData.drugNameTrade,
        dosageForm: formData.dosageForm,
        indication: formData.indication,
        usageDosage: formData.usageAndDosage,
        atcCode: formData.atcCode,
        isOverseas: formData.isOverseasProduced,
        productionSite: formData.productionSite,
        priorityReview: formData.isPriorityReview,
        breakthroughTherapy: formData.isBreakthroughTherapy,
        orphanDrug: formData.isOrphanDrug,
        emergencyUse: formData.isControlledSubstance,
        isSmallEnterprise: formData.isSmallEnterprise,
        feePayer: formData.feePayer,
      };

      const app = await applicationService.create(payload);
      const submitted = await applicationService.submit(app.id);
      message.success(`药品注册申请已成功提交！受理号: ${submitted.applicationNo}`);
      navigate(`/nmpa/applications/${submitted.id}`);
    } catch {
      // errors handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasicInfo formData={formData} onChange={handleDataChange} />;
      case 1:
        return <StepEnterprise formData={formData} onChange={handleDataChange} />;
      case 2:
        return <StepPatent formData={formData} onChange={handleDataChange} />;
      case 3:
        return <StepCTDDocs formData={formData} onChange={handleDataChange} />;
      case 4:
        return <StepReview formData={formData} onSubmit={handleSubmit} submitting={submitting} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ margin: -24 }}>
      {/* ── Top government banner ── */}
      <div style={govHeaderStyle}>
        <Space size={4}>
          <span style={{ opacity: 0.8 }}>国家药品监督管理局</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>网上办事大厅</span>
        </Space>
        <Space size={16}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>服务热线：010-88330000</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>政务服务大厅</Text>
        </Space>
      </div>

      {/* ── Page header with breadcrumb ── */}
      <div style={pageHeaderStyle}>
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> 首页</> },
            { title: '药品注册申请' },
            { title: <span style={{ color: '#1A5C9E' }}>新建申请</span> },
          ]}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/nmpa')}
            size="small"
          >
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0, color: '#1A3A6B', fontSize: 18 }}>
            药品注册申请 — 国家药品监督管理局药品审评中心
          </Title>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
          请按照步骤依次填写药品注册申请信息，带 <span style={{ color: '#E54545' }}>*</span> 的为必填项。
        </div>
      </div>

      {/* ── Main content area ── */}
      <div style={{ padding: 24, background: '#F0F2F5' }}>
        <Card
          style={{ borderRadius: 2, border: '1px solid #E8E8E8' }}
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
              borderTop: '1px solid #F0F0F0',
            }}>
              <Button
                size="large"
                disabled={currentStep === 0}
                onClick={handlePrev}
              >
                上一步
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                style={{
                  background: '#1A5C9E',
                  borderColor: '#1A5C9E',
                  borderRadius: 4,
                }}
              >
                下一步
              </Button>
            </div>
          )}
        </Card>

        {/* ── Government footer ── */}
        <div style={footerStyle}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              国家药品监督管理局药品审评中心 | 地址：北京市经济技术开发区广德大街22号院二区 | 邮编：100076
            </Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              联系方式：010-68585566 | 传真：010-68586666 | 电子邮箱：cde@cde.org.cn
            </Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              药品注册模拟系统 | 本平台仅用于教学培训模拟，不涉及任何真实药品注册数据
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
