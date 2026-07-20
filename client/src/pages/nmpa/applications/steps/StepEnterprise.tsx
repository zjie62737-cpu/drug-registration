import { Form, Input, Button, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { NmpaApplicationFormData, EnterpriseInfo, CROInfo } from '../../../../types/regulatory';

const { Text } = Typography;

interface StepEnterpriseProps {
  formData: NmpaApplicationFormData;
  onChange: (data: Partial<NmpaApplicationFormData>) => void;
}

const DEFAULT_ENTERPRISE: EnterpriseInfo = {
  businessLicenseNo: '',
  productionLicenseNo: '',
  gmpCertificate: '',
  legalRepresentative: '',
  contactPerson: '',
  contactPhone: '',
  contactMobile: '',
  contactEmail: '',
  contactFax: '',
  productionAddress: '',
  productionPostalCode: '',
  mailingAddress: '',
  mailingPostalCode: '',
  qualityDirector: '',
  qualityDirectorTitle: '',
};

const DEFAULT_CRO: CROInfo = {
  id: '',
  organizationName: '',
  responsiblePerson: '',
  contactInfo: '',
};

let croCounter = 0;
function nextCroId() {
  return `cro_${++croCounter}_${Date.now()}`;
}

// ── Shared styles ──
const labelStyle: React.CSSProperties = {
  width: 180,
  textAlign: 'right',
  paddingRight: 12,
  fontSize: 14,
  color: '#333',
  flexShrink: 0,
  lineHeight: '32px',
};

const requiredMark: React.CSSProperties = {
  color: '#E54545',
  marginRight: 2,
};

const fieldWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: 20,
};

const inputWrapper: React.CSSProperties = {
  flex: 1,
  maxWidth: 560,
};

const warningText: React.CSSProperties = {
  fontSize: 12,
  color: '#E54545',
  marginTop: 4,
  lineHeight: '18px',
};

const sectionHeader: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1A5C9E',
  borderLeft: '3px solid #1A5C9E',
  paddingLeft: 12,
  marginBottom: 16,
  marginTop: 8,
};

export default function StepEnterprise({ formData, onChange }: StepEnterpriseProps) {
  const enterprise = formData.enterprise || DEFAULT_ENTERPRISE;
  const croList = formData.croList || [];

  const updateEnterprise = (key: keyof EnterpriseInfo, val: string) => {
    onChange({ enterprise: { ...enterprise, [key]: val } });
  };

  const addCRO = () => {
    onChange({
      croList: [...croList, { ...DEFAULT_CRO, id: nextCroId() }],
    });
  };

  const removeCRO = (id: string) => {
    onChange({
      croList: croList.filter((c) => c.id !== id),
    });
  };

  const updateCRO = (id: string, key: keyof CROInfo, val: string) => {
    onChange({
      croList: croList.map((c) => (c.id === id ? { ...c, [key]: val } : c)),
    });
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
          第2步：企业信息 — 填写申请人企业及联系信息
        </span>
      </div>

      {/* ── 证照信息 ── */}
      <div style={sectionHeader}>证照信息</div>

      {/* 营业执照号/统一社会信用代码 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>营业执照号/统一社会信用代码：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：91110000XXXXXXXXXX (18位)"
            maxLength={18}
            value={enterprise.businessLicenseNo}
            onChange={(e) => updateEnterprise('businessLicenseNo', e.target.value)}
          />
          <div style={warningText}>
            请填写申请人/生产企业的统一社会信用代码（18位），应与营业执照完全一致。
          </div>
        </div>
      </div>

      {/* 药品生产许可证编号 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>药品生产许可证编号：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：京20160001"
            value={enterprise.productionLicenseNo}
            onChange={(e) => updateEnterprise('productionLicenseNo', e.target.value)}
          />
          <div style={warningText}>
            请填写有效期内的《药品生产许可证》编号。如为上市许可持有人委托生产，还需提供受托方生产许可证。
          </div>
        </div>
      </div>

      {/* GMP证书编号 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>GMP证书编号：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：CN20160001"
            value={enterprise.gmpCertificate}
            onChange={(e) => updateEnterprise('gmpCertificate', e.target.value)}
          />
          <div style={warningText}>
            请填写现行有效的GMP符合性检查通过告知书编号或GMP证书编号。境外生产药品请提供符合药品生产质量管理规范的证明文件。
          </div>
        </div>
      </div>

      {/* ── 人员信息 ── */}
      <div style={sectionHeader}>人员信息</div>

      {/* 法定代表人 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>法定代表人：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="法定代表人姓名"
            value={enterprise.legalRepresentative}
            onChange={(e) => updateEnterprise('legalRepresentative', e.target.value)}
          />
          <div style={warningText}>
            请填写营业执照记载的法定代表人姓名。
          </div>
        </div>
      </div>

      {/* 联系人 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>联系人：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="联系人姓名"
            value={enterprise.contactPerson}
            onChange={(e) => updateEnterprise('contactPerson', e.target.value)}
          />
          <div style={warningText}>
            请务必填写真实有效的联系人信息。手机号和邮箱用于接收电子缴款通知书和电子发票，填写错误将导致无法及时缴费。请申请人尽量填写公共邮箱地址，单位自行开发的邮箱与财政部非税收入收缴管理系统适配性较低，可能收不到电子发票。
          </div>
        </div>
      </div>

      {/* 联系电话 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>联系电话：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="固定电话，如 010-XXXXXXXX"
            value={enterprise.contactPhone}
            onChange={(e) => updateEnterprise('contactPhone', e.target.value)}
          />
          <div style={warningText}>
            请填写联系人的有效联系电话，确保审评期间能够及时联系。
          </div>
        </div>
      </div>

      {/* 手机 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>手机：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="11位手机号码"
            maxLength={11}
            value={enterprise.contactMobile}
            onChange={(e) => updateEnterprise('contactMobile', e.target.value)}
          />
        </div>
      </div>

      {/* 电子邮箱 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>电子邮箱：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="company@example.com"
            type="email"
            value={enterprise.contactEmail}
            onChange={(e) => updateEnterprise('contactEmail', e.target.value)}
          />
          <div style={warningText}>
            用于接收电子缴款通知书和电子发票。建议使用公共邮箱（如163、QQ邮箱），单位自建邮箱系统可能无法接收。
          </div>
        </div>
      </div>

      {/* 传真 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>传真：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="传真号码"
            value={enterprise.contactFax}
            onChange={(e) => updateEnterprise('contactFax', e.target.value)}
          />
        </div>
      </div>

      {/* 质量负责人 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>质量负责人：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="质量负责人姓名"
            value={enterprise.qualityDirector}
            onChange={(e) => updateEnterprise('qualityDirector', e.target.value)}
          />
          <div style={warningText}>
            请填写生产企业质量受权人或质量负责人信息。
          </div>
        </div>
      </div>

      {/* 质量负责人职位 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>质量负责人职位：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：质量副总/质量总监"
            value={enterprise.qualityDirectorTitle}
            onChange={(e) => updateEnterprise('qualityDirectorTitle', e.target.value)}
          />
        </div>
      </div>

      {/* ── 地址信息 ── */}
      <div style={sectionHeader}>地址信息</div>

      {/* 生产地址 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>生产地址：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="详细地址"
            value={enterprise.productionAddress}
            onChange={(e) => updateEnterprise('productionAddress', e.target.value)}
          />
          <div style={warningText}>
            请填写《药品生产许可证》记载的生产地址，应与实际生产场地一致。
          </div>
        </div>
      </div>

      {/* 生产地址邮政编码 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>生产地址邮编：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="6位邮政编码"
            maxLength={6}
            value={enterprise.productionPostalCode}
            onChange={(e) => updateEnterprise('productionPostalCode', e.target.value)}
          />
        </div>
      </div>

      {/* 通讯地址 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>通讯地址：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="通讯/邮寄地址"
            value={enterprise.mailingAddress}
            onChange={(e) => updateEnterprise('mailingAddress', e.target.value)}
          />
          <div style={warningText}>
            请填写能接收正式公文的通讯地址。如与生产地址不一致请分别填写。
          </div>
        </div>
      </div>

      {/* 通讯地址邮政编码 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>通讯地址邮编：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="6位邮政编码"
            maxLength={6}
            value={enterprise.mailingPostalCode}
            onChange={(e) => updateEnterprise('mailingPostalCode', e.target.value)}
          />
        </div>
      </div>

      {/* ── CRO信息 ── */}
      <div style={{ ...sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>委托研究机构 (CRO)</span>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addCRO} style={{ marginRight: 0 }}>
          添加CRO
        </Button>
      </div>

      <div style={warningText}>
        如有委托研究机构开展药学研究、非临床研究或临床研究，请逐条填写机构名称、研究负责人、研究内容等信息。
      </div>

      {croList.length === 0 && (
        <div style={{ color: '#999', textAlign: 'center', padding: 24, background: '#FAFBFC', borderRadius: 2, border: '1px solid #F0F0F0' }}>
          如不涉及CRO，可跳过此项
        </div>
      )}

      {croList.map((cro, idx) => (
        <div key={cro.id} style={{
          marginBottom: 16,
          marginTop: 8,
          padding: 16,
          background: '#FAFBFC',
          borderRadius: 2,
          border: '1px solid #E8E8E8',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text strong style={{ color: '#1A5C9E' }}>CRO #{idx + 1}</Text>
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeCRO(cro.id)}
            >
              删除
            </Button>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>CRO名称：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="CRO公司名称"
                value={cro.organizationName}
                onChange={(e) => updateCRO(cro.id, 'organizationName', e.target.value)}
              />
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>负责人：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="CRO项目负责人"
                value={cro.responsiblePerson}
                onChange={(e) => updateCRO(cro.id, 'responsiblePerson', e.target.value)}
              />
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>联系方式：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="电话/邮箱"
                value={cro.contactInfo}
                onChange={(e) => updateCRO(cro.id, 'contactInfo', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
