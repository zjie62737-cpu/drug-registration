import { useMemo } from 'react';
import { Typography, Tag, Card, Alert, Button, Table, Space } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { NmpaApplicationFormData } from '../../../../types/regulatory';
import {
  NMPA_REGISTRATION_CLASSES,
  NMPA_APPLICATION_CATEGORIES,
  APPLICATION_TYPES,
  DOSAGE_FORMS,
} from '../../../../utils/constants';

const { Title, Text } = Typography;

interface StepReviewProps {
  formData: NmpaApplicationFormData;
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

function validate(formData: NmpaApplicationFormData): ValidationResult[] {
  const results: ValidationResult[] = [];
  let id = 0;

  const fail = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'fail' as const, message });
  };
  const warn = (step: string, field: string, message: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'warning' as const, message });
  };
  const pass = (step: string, field: string) => {
    results.push({ key: `v${id++}`, step, field, status: 'pass' as const, message: '已填写' });
  };

  // Step 1
  if (!formData.registrationType) fail('基本信息', '注册申请类型', '未选择注册申请类型');
  else pass('基本信息', '注册申请类型');

  if (!formData.applicationCategory) fail('基本信息', '申请事项', '未选择申请事项');
  else pass('基本信息', '申请事项');

  if (!formData.registrationClass) fail('基本信息', '注册分类', '未选择注册分类');
  else pass('基本信息', '注册分类');

  if (!formData.drugNameGeneric) fail('基本信息', '药品通用名称', '未填写药品通用名称');
  else pass('基本信息', '药品通用名称');

  if (!formData.drugType) fail('基本信息', '药品分类', '未选择药品分类');
  else pass('基本信息', '药品分类');

  if (!formData.dosageForm) fail('基本信息', '剂型', '未选择剂型');
  else pass('基本信息', '剂型');

  if (!formData.specification) fail('基本信息', '规格', '未填写规格');
  else pass('基本信息', '规格');

  if (!formData.indication) fail('基本信息', '适应症', '未填写适应症');
  else pass('基本信息', '适应症');

  if (!formData.usageAndDosage) warn('基本信息', '用法用量', '建议填写用法用量');
  else pass('基本信息', '用法用量');

  if (!formData.isOverseasProduced && !formData.productionSite)
    fail('基本信息', '生产地址', '境内生产需填写生产地址');
  else pass('基本信息', '生产地址');

  // Step 2
  const ent = formData.enterprise;
  if (!ent?.businessLicenseNo) fail('企业信息', '营业执照号', '未填写统一社会信用代码');
  else pass('企业信息', '营业执照号');

  if (!ent?.productionLicenseNo) warn('企业信息', '生产许可证号', '建议填写药品生产许可证编号');
  else pass('企业信息', '生产许可证号');

  if (!ent?.gmpCertificate) warn('企业信息', 'GMP证书号', '建议填写GMP证书编号');
  else pass('企业信息', 'GMP证书号');

  if (!ent?.legalRepresentative) fail('企业信息', '法定代表人', '未填写法定代表人');
  else pass('企业信息', '法定代表人');

  if (!ent?.contactPerson) fail('企业信息', '联系人', '未填写联系人');
  else pass('企业信息', '联系人');

  if (!ent?.contactPhone) fail('企业信息', '联系电话', '未填写联系电话');
  else pass('企业信息', '联系电话');

  if (!ent?.contactMobile) fail('企业信息', '手机', '未填写手机号码');
  else pass('企业信息', '手机');

  if (!ent?.contactEmail) fail('企业信息', '电子邮箱', '未填写电子邮箱');
  else pass('企业信息', '电子邮箱');

  if (!ent?.productionAddress) fail('企业信息', '生产地址', '未填写生产地址');
  else pass('企业信息', '生产地址');

  if (!ent?.mailingAddress) warn('企业信息', '通讯地址', '建议填写通讯地址');
  else pass('企业信息', '通讯地址');

  if (!ent?.qualityDirector) warn('企业信息', '质量负责人', '建议填写质量负责人');
  else pass('企业信息', '质量负责人');

  // Step 3
  if (!formData.nonInfringementDeclared)
    fail('专利与声明', '不侵权声明', '必须声明不侵犯他人专利权');
  else pass('专利与声明', '不侵权声明');

  if (!formData.feePayer) fail('专利与声明', '费用缴纳人', '未填写费用缴纳人');
  else pass('专利与声明', '费用缴纳人');

  // Step 4
  const docCount = Object.values(formData.ctdDocuments || {}).filter(
    (d) => d.status === 'uploaded'
  ).length;
  if (docCount === 0) {
    fail('CTD文档', '申报资料', '至少需上传一份申报资料文件');
  } else {
    pass('CTD文档', `已上传${docCount}份文件`);
  }

  return results;
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

export default function StepReview({ formData, onSubmit, submitting }: StepReviewProps) {
  const validations = useMemo(() => validate(formData), [formData]);
  const failCount = validations.filter((v) => v.status === 'fail').length;
  const warnCount = validations.filter((v) => v.status === 'warning').length;
  const passCount = validations.filter((v) => v.status === 'pass').length;
  const allValid = failCount === 0;

  const renderValue = (val: unknown, map?: Record<string, string>): string => {
    if (val === undefined || val === null || val === '') return '-';
    if (map && typeof val === 'string' && map[val]) return map[val];
    if (typeof val === 'boolean') return val ? '是' : '否';
    return String(val);
  };

  const validationColumns = [
    {
      title: '核查步骤',
      dataIndex: 'step',
      key: 'step',
      width: 120,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: '核查项',
      dataIndex: 'field',
      key: 'field',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        switch (status) {
          case 'pass': return <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag>;
          case 'fail': return <Tag color="error" icon={<CloseCircleOutlined />}>未通过</Tag>;
          case 'warning': return <Tag color="warning" icon={<ExclamationCircleOutlined />}>待完善</Tag>;
          default: return null;
        }
      },
    },
    {
      title: '说明',
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
                ? '所有必填项已填写完整，可以进行提交'
                : `仍有 ${failCount} 项必须补全，${warnCount} 项建议完善`
              }
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              共核查 {validations.length} 项：<Tag color="success" style={{ marginLeft: 4 }}>{passCount} 通过</Tag>
              {failCount > 0 && <Tag color="error">{failCount} 未通过</Tag>}
              {warnCount > 0 && <Tag color="warning">{warnCount} 待完善</Tag>}
            </div>
          </div>
        </div>
      </div>

      {/* Validation table */}
      <div style={sectionHeader}>申报资料完整性核查</div>
      <Table
        dataSource={validations}
        columns={validationColumns}
        pagination={false}
        size="small"
        style={{ marginBottom: 24 }}
        rowClassName={(record) =>
          record.status === 'fail' ? 'review-row-fail' : ''
        }
        locale={{ emptyText: '暂无核查结果' }}
      />

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
                  <Text strong>[{v.step}]</Text> {v.field}：{v.message}
                </span>
              }
              style={{ marginBottom: 4, borderRadius: 2 }}
            />
          ))}
        </div>
      )}

      {/* Step 1 Summary Card */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: '#1A5C9E' }}>基本信息汇总</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: '注册申请类型', value: renderValue(formData.registrationType, APPLICATION_TYPES) },
            { key: '申请事项', value: renderValue(formData.applicationCategory, NMPA_APPLICATION_CATEGORIES) },
            { key: '注册分类', value: renderValue(formData.registrationClass, NMPA_REGISTRATION_CLASSES) },
            { key: '药品通用名称', value: formData.drugNameGeneric || '-' },
            { key: '商品名', value: formData.drugNameTrade || '-' },
            { key: '药品分类', value: formData.drugType || '-' },
            { key: '剂型', value: formData.dosageForm || '-' },
            { key: '规格', value: formData.specification || '-' },
            { key: '适应症', value: formData.indication || '-' },
            { key: '用法用量', value: formData.usageAndDosage || '-' },
            { key: 'ATC编码', value: formData.atcCode || '-' },
            { key: '境外生产', value: renderValue(formData.isOverseasProduced) },
            { key: '生产场地', value: formData.productionSite || '-' },
          ]}
          columns={[
            { title: '项目', dataIndex: 'key', key: 'key', width: 160, render: (v: string) => <Text strong>{v}</Text> },
            { title: '内容', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Step 2 Summary Card */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: '#1A5C9E' }}>企业信息汇总</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        {formData.enterprise ? (
          <Table
            dataSource={[
              { key: '营业执照号', value: formData.enterprise.businessLicenseNo || '-' },
              { key: '生产许可证号', value: formData.enterprise.productionLicenseNo || '-' },
              { key: 'GMP证书号', value: formData.enterprise.gmpCertificate || '-' },
              { key: '法定代表人', value: formData.enterprise.legalRepresentative || '-' },
              { key: '联系人', value: formData.enterprise.contactPerson || '-' },
              { key: '联系电话', value: formData.enterprise.contactPhone || '-' },
              { key: '手机', value: formData.enterprise.contactMobile || '-' },
              { key: '电子邮箱', value: formData.enterprise.contactEmail || '-' },
              { key: '生产地址', value: formData.enterprise.productionAddress || '-' },
              { key: '通讯地址', value: formData.enterprise.mailingAddress || '-' },
              { key: '质量负责人', value: formData.enterprise.qualityDirector || '-' },
              { key: 'CRO数量', value: `${(formData.croList || []).length} 家` },
            ]}
            columns={[
              { title: '项目', dataIndex: 'key', key: 'key', width: 160, render: (v: string) => <Text strong>{v}</Text> },
              { title: '内容', dataIndex: 'value', key: 'value' },
            ]}
            pagination={false}
            size="small"
            showHeader={false}
          />
        ) : (
          <Text type="secondary">企业信息未填写</Text>
        )}
      </Card>

      {/* Step 3 Summary Card */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: '#1A5C9E' }}>专利与声明汇总</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: '专利数量', value: (formData.patentList || []).length > 0 ? `${(formData.patentList || []).length} 项` : '不涉及专利' },
            { key: '不侵权声明', value: formData.nonInfringementDeclared ? '已声明' : '未声明', status: formData.nonInfringementDeclared ? 'pass' : 'fail' },
            { key: '特殊管理药品', value: renderValue(formData.isControlledSubstance) },
            { key: '优先审评', value: renderValue(formData.isPriorityReview) },
            { key: '突破性治疗', value: renderValue(formData.isBreakthroughTherapy) },
            { key: '孤儿药', value: renderValue(formData.isOrphanDrug) },
            { key: '小微企业', value: renderValue(formData.isSmallEnterprise) },
            { key: '费用缴纳人', value: formData.feePayer || '-' },
          ]}
          columns={[
            { title: '项目', dataIndex: 'key', key: 'key', width: 160, render: (v: string) => <Text strong>{v}</Text> },
            {
              title: '内容', dataIndex: 'value', key: 'value',
              render: (v: string, record: { status?: string }) => {
                if (record.status === 'fail') return <Text type="danger">{v}</Text>;
                return v;
              },
            },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
      </Card>

      {/* Step 4 Summary Card */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600, color: '#1A5C9E' }}>CTD申报资料汇总</span>}
        size="small"
        style={{ marginBottom: 24, borderRadius: 2 }}
      >
        <Table
          dataSource={[
            { key: '已上传文件数', value: `${Object.values(formData.ctdDocuments || {}).filter(d => d.status === 'uploaded').length} 份` },
          ]}
          columns={[
            { title: '项目', dataIndex: 'key', key: 'key', width: 160, render: (v: string) => <Text strong>{v}</Text> },
            { title: '内容', dataIndex: 'value', key: 'value' },
          ]}
          pagination={false}
          size="small"
          showHeader={false}
        />
        {Object.values(formData.ctdDocuments || {}).filter(d => d.status === 'uploaded').length === 0 && (
          <Alert
            type="warning"
            showIcon
            message="尚未上传任何CTD申报资料文件。请返回第4步上传资料后再提交。"
            style={{ marginTop: 12, borderRadius: 2 }}
          />
        )}
      </Card>

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
            borderRadius: 4,
            background: allValid ? '#1A5C9E' : undefined,
            borderColor: allValid ? '#1A5C9E' : undefined,
          }}
        >
          提交药品注册申请
        </Button>
        {!allValid && (
          <div style={{ marginTop: 12 }}>
            <Text type="danger">
              <WarningOutlined /> 请先补全上述 {failCount} 项缺失信息后再提交
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
