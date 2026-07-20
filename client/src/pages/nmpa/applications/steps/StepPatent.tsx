import { Input, Switch, Checkbox, Button, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { NmpaApplicationFormData, PatentDeclaration } from '../../../../types/regulatory';

const { Text } = Typography;

interface StepPatentProps {
  formData: NmpaApplicationFormData;
  onChange: (data: Partial<NmpaApplicationFormData>) => void;
}

const DEFAULT_PATENT: PatentDeclaration = {
  id: '',
  patentNumber: '',
  patentOwner: '',
  grantDate: '',
  isForeignPatent: false,
};

let patentCounter = 0;
function nextPatentId() {
  return `patent_${++patentCounter}_${Date.now()}`;
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

export default function StepPatent({ formData, onChange }: StepPatentProps) {
  const patentList = formData.patentList || [];

  const updateForm = (key: keyof NmpaApplicationFormData, val: unknown) => {
    onChange({ [key]: val });
  };

  const addPatent = () => {
    onChange({
      patentList: [...patentList, { ...DEFAULT_PATENT, id: nextPatentId() }],
    });
  };

  const removePatent = (id: string) => {
    onChange({
      patentList: patentList.filter((p) => p.id !== id),
    });
  };

  const updatePatent = (id: string, key: keyof PatentDeclaration, val: unknown) => {
    onChange({
      patentList: patentList.map((p) => (p.id === id ? { ...p, [key]: val } : p)),
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
          第3步：专利与声明 — 填写专利信息和合规声明
        </span>
      </div>

      {/* ── 专利信息 ── */}
      <div style={{ ...sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>专利信息</span>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addPatent}>
          添加专利
        </Button>
      </div>

      <div style={warningText}>
        请填写与申报药品相关的已授权中国专利号。如涉及多项专利请逐一列出。如有外国专利请勾选对应选项。
      </div>

      {patentList.length === 0 && (
        <div style={{ color: '#999', textAlign: 'center', padding: 24, background: '#FAFBFC', borderRadius: 2, border: '1px solid #F0F0F0', marginBottom: 16 }}>
          如不涉及专利，可跳过此项
        </div>
      )}

      {patentList.map((patent, idx) => (
        <div key={patent.id} style={{
          marginBottom: 16,
          marginTop: 8,
          padding: 16,
          background: '#FAFBFC',
          borderRadius: 2,
          border: '1px solid #E8E8E8',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text strong style={{ color: '#1A5C9E' }}>专利 #{idx + 1}</Text>
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removePatent(patent.id)}
            >
              删除
            </Button>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>专利号：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="中国专利号: CNXXXXXXXX.X"
                value={patent.patentNumber}
                onChange={(e) => updatePatent(patent.id, 'patentNumber', e.target.value)}
              />
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>专利权人：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="专利权人/专利权属人"
                value={patent.patentOwner}
                onChange={(e) => updatePatent(patent.id, 'patentOwner', e.target.value)}
              />
              <div style={warningText}>
                请填写专利证书记载的专利权人全称。
              </div>
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>授权日期：</label>
            <div style={inputWrapper}>
              <Input
                placeholder="如 2023-06-15"
                value={patent.grantDate}
                onChange={(e) => updatePatent(patent.id, 'grantDate', e.target.value)}
              />
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>是否为境外专利：</label>
            <div style={inputWrapper}>
              <Switch
                checked={patent.isForeignPatent}
                onChange={(v) => updatePatent(patent.id, 'isForeignPatent', v)}
              />
              <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>
                {patent.isForeignPatent ? '境外专利' : '中国专利'}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* ── 声明与承诺 ── */}
      <div style={sectionHeader}>声明与承诺</div>

      {/* 专利权属声明 */}
      <div style={{
        padding: 16,
        background: '#FFFBE6',
        borderRadius: 2,
        border: '1px solid #FFE58F',
        marginBottom: 20,
      }}>
        <Checkbox
          checked={formData.nonInfringementDeclared}
          onChange={(e) => updateForm('nonInfringementDeclared', e.target.checked)}
        >
          <Text style={{ color: '#D48806', fontSize: 14 }}>
            本人/本单位声明：所申请注册的药品未侵犯他人专利权，如有不实，愿承担由此产生的一切法律责任。
          </Text>
        </Checkbox>
        <div style={{ ...warningText, marginLeft: 0, marginTop: 8 }}>
          我们声明：本申报对他人专利不构成侵权。请如实勾选，虚假声明将承担法律责任。
        </div>
      </div>

      {/* 是否涉及特殊管理药品 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>是否涉及特殊管理药品：</label>
        <div style={inputWrapper}>
          <Switch
            checked={formData.isControlledSubstance}
            onChange={(v) => updateForm('isControlledSubstance', v)}
          />
          <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>
            {formData.isControlledSubstance ? '是' : '否'}
          </span>
          <div style={warningText}>
            特殊管理药品指麻醉药品、精神药品、医疗用毒性药品、放射性药品等。如涉及请务必勾选，并按要求提交相应证明文件。
          </div>
        </div>
      </div>

      {/* ── 优先审评条件 ── */}
      <div style={sectionHeader}>优先审评条件</div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>优先审评：</label>
        <div style={inputWrapper}>
          <Checkbox
            checked={formData.isPriorityReview}
            onChange={(e) => updateForm('isPriorityReview', e.target.checked)}
          >
            临床急需/重大创新/罕见病用药等
          </Checkbox>
          <div style={warningText}>
            请参照《药品上市许可优先审评审批工作程序》评估是否符合优先审评条件。
          </div>
        </div>
      </div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>突破性治疗：</label>
        <div style={inputWrapper}>
          <Checkbox
            checked={formData.isBreakthroughTherapy}
            onChange={(e) => updateForm('isBreakthroughTherapy', e.target.checked)}
          >
            具有突破性疗效的创新药
          </Checkbox>
        </div>
      </div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>孤儿药认定：</label>
        <div style={inputWrapper}>
          <Checkbox
            checked={formData.isOrphanDrug}
            onChange={(e) => updateForm('isOrphanDrug', e.target.checked)}
          >
            用于治疗罕见病的药物
          </Checkbox>
        </div>
      </div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>小微企业：</label>
        <div style={inputWrapper}>
          <Checkbox
            checked={formData.isSmallEnterprise}
            onChange={(e) => updateForm('isSmallEnterprise', e.target.checked)}
          >
            符合小微企业标准，可申请费用减免
          </Checkbox>
          <div style={warningText}>
            符合《中小企业划型标准规定》的小型/微型企业可申请费用减免。需提交小微企业证明文件。
          </div>
        </div>
      </div>

      {/* ── 费用缴纳 ── */}
      <div style={sectionHeader}>费用缴纳</div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>费用缴纳人：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="费用承担主体（企业/个人）名称"
            value={formData.feePayer || ''}
            onChange={(e) => updateForm('feePayer', e.target.value)}
          />
          <div style={warningText}>
            请选择本机构是否负责缴费。如选择"否"，需明确缴费责任方并提供相关信息。
          </div>
        </div>
      </div>
    </div>
  );
}
