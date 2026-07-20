import { Form, Input, Select, Switch } from 'antd';
import type { NmpaApplicationFormData } from '../../../../types/regulatory';
import { NMPA_REGISTRATION_TYPES_OPTIONS, NMPA_REG_CLASS_OPTIONS, DOSAGE_FORMS, DRUG_TYPES } from '../../../../utils/constants';

const { TextArea } = Input;

interface StepBasicInfoProps {
  formData: NmpaApplicationFormData;
  onChange: (data: Partial<NmpaApplicationFormData>) => void;
}

// Horizontal form layout styles — Chinese government standard
const labelStyle: React.CSSProperties = {
  width: 160,
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

export default function StepBasicInfo({ formData, onChange }: StepBasicInfoProps) {
  const update = (key: keyof NmpaApplicationFormData, val: unknown) => {
    onChange({ [key]: val });
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
          第1步：基本信息 — 填写药品注册申请的基本信息
        </span>
      </div>

      {/* ── 注册类型信息 ── */}
      <div style={sectionHeader}>注册类型信息</div>

      {/* 注册申请类型 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>注册申请类型：
        </label>
        <div style={inputWrapper}>
          <Select
            placeholder="选择注册类型"
            value={formData.registrationType || undefined}
            onChange={(v) => update('registrationType', v)}
            options={NMPA_REGISTRATION_TYPES_OPTIONS}
            style={{ width: '100%' }}
          />
          <div style={warningText}>
            请根据拟申报药品的实际情况选择对应的注册申请类型。临床试验申请(IND)适用于尚未在中国境内外上市的创新药；上市许可申请(NDA)适用于完成临床试验后申请上市。
          </div>
        </div>
      </div>

      {/* 申请事项 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>申请事项：
        </label>
        <div style={inputWrapper}>
          <Select
            placeholder="选择申请事项"
            value={formData.applicationCategory || undefined}
            onChange={(v) => update('applicationCategory', v)}
            options={[
              { value: 'clinical_trial', label: '临床试验申请' },
              { value: 'marketing_auth', label: '上市许可申请' },
              { value: 'supplementary', label: '补充申请' },
              { value: 'renewal', label: '再注册' },
              { value: 'change', label: '变更申请' },
            ]}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* 注册分类 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>注册分类：
        </label>
        <div style={inputWrapper}>
          <Select
            placeholder="选择注册分类"
            value={formData.registrationClass || undefined}
            onChange={(v) => update('registrationClass', v)}
            showSearch
            optionFilterProp="label"
            options={NMPA_REG_CLASS_OPTIONS}
            style={{ width: '100%' }}
          />
          <div style={warningText}>
            请参照《药品注册管理办法》及配套文件选择正确的注册分类。化药1类指境内外均未上市的创新药，2类指境内外均未上市的改良型新药。
          </div>
        </div>
      </div>

      {/* ── 药品基本信息 ── */}
      <div style={sectionHeader}>药品基本信息</div>

      {/* 药品通用名称 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>药品通用名称：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：盐酸莫西沙星"
            value={formData.drugNameGeneric}
            onChange={(e) => update('drugNameGeneric', e.target.value)}
          />
          <div style={warningText}>
            请填写与国家药典或国家药品标准一致的药品通用名称。如尚未收载，请使用国际非专利药品名称(INN)。
          </div>
        </div>
      </div>

      {/* 商品名称 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>商品名/品牌名：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：拜复乐"
            value={formData.drugNameTrade}
            onChange={(e) => update('drugNameTrade', e.target.value)}
          />
          <div style={warningText}>
            如已确定商品名，请填写。商品名不得暗示疗效、不得使用绝对化用语、不得与他人已注册商品名相同或相似。
          </div>
        </div>
      </div>

      {/* 药品分类 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>药品分类：
        </label>
        <div style={inputWrapper}>
          <Select
            placeholder="选择药品分类"
            value={formData.drugType || undefined}
            onChange={(v) => update('drugType', v)}
            options={DRUG_TYPES.map((t) => ({ value: t, label: t }))}
            style={{ width: '100%' }}
          />
          <div style={warningText}>
            请选择化学药品、生物制品或中药。不同类型对应不同的注册分类体系和申报资料要求。
          </div>
        </div>
      </div>

      {/* 剂型 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>剂型：
        </label>
        <div style={inputWrapper}>
          <Select
            placeholder="选择剂型"
            value={formData.dosageForm || undefined}
            onChange={(v) => update('dosageForm', v)}
            showSearch
            options={DOSAGE_FORMS.map((d) => ({ value: d, label: d }))}
            style={{ width: '100%' }}
          />
          <div style={warningText}>
            请填写拟申请的剂型，如片剂、胶囊剂、注射剂等。应与生产工艺和质量标准中剂型一致。
          </div>
        </div>
      </div>

      {/* 规格 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>规格：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：0.4g/片, 每盒3片"
            value={formData.specification}
            onChange={(e) => update('specification', e.target.value)}
          />
          <div style={warningText}>
            请填写拟申请的所有规格。规格表述应与质量标准一致，如"0.4g"、"10mg"等。如有多个规格，用逗号分隔。
          </div>
        </div>
      </div>

      {/* 适应症 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>适应症：
        </label>
        <div style={inputWrapper}>
          <TextArea
            rows={3}
            placeholder="描述药品的适应症/功能主治"
            value={formData.indication}
            onChange={(e) => update('indication', e.target.value)}
          />
          <div style={warningText}>
            请参照说明书格式，准确描述拟申请的适应症范围。适应症将作为审评和批准范围的重要依据。
          </div>
        </div>
      </div>

      {/* 用法用量 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>用法用量：</label>
        <div style={inputWrapper}>
          <TextArea
            rows={2}
            placeholder="描述用法用量，包括给药途径、剂量、频次、疗程等"
            value={formData.usageAndDosage}
            onChange={(e) => update('usageAndDosage', e.target.value)}
          />
          <div style={warningText}>
            请描述拟定的用法用量，包括给药途径、剂量、频次、疗程等关键信息。
          </div>
        </div>
      </div>

      {/* ATC编码 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>ATC分类代码：</label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：J01MA14"
            maxLength={7}
            value={formData.atcCode}
            onChange={(e) => update('atcCode', e.target.value)}
          />
          <div style={warningText}>
            选填。如已知WHO解剖治疗化学分类代码，请填写。ATC代码用于药品分类和统计分析。
          </div>
        </div>
      </div>

      {/* ── 生产信息 ── */}
      <div style={sectionHeader}>生产信息</div>

      {/* 是否境外生产 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>是否境外生产：
        </label>
        <div style={inputWrapper}>
          <Switch
            checked={formData.isOverseasProduced}
            onChange={(v) => update('isOverseasProduced', v)}
          />
          <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>
            {formData.isOverseasProduced ? '境外生产' : '境内生产'}
          </span>
          <div style={warningText}>
            境内生产指生产场地在中国境内（不包括港澳台地区），境外生产指生产场地在中国境外或港澳台地区。境外生产药品需额外提交境外药品生产企业资质证明文件。
          </div>
        </div>
      </div>

      {/* 生产地址 */}
      <div style={fieldWrapper}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>生产地址：
        </label>
        <div style={inputWrapper}>
          <Input
            placeholder="如：北京市朝阳区XX路XX号"
            value={formData.productionSite}
            onChange={(e) => update('productionSite', e.target.value)}
          />
          <div style={warningText}>
            请填写药品实际生产场地的详细地址，应与药品生产许可证记载地址一致。
          </div>
        </div>
      </div>

      {/* ── ANDA / 仿制药专用信息 ── */}
      {(formData.registrationType === 'ANDA' || formData.applicationCategory === 'marketing_auth') && (
        <>
          <div style={sectionHeader}>仿制药专用信息</div>

          {/* RLD 参比制剂 */}
          <div style={fieldWrapper}>
            <label style={labelStyle}>
              {formData.registrationType === 'ANDA' && <span style={requiredMark}>*</span>}
              参比制剂 (RLD)：
            </label>
            <div style={inputWrapper}>
              <Input
                placeholder="参比制剂通用名称/商品名，如：盐酸莫西沙星片（拜复乐）"
                value={formData.rld}
                onChange={(e) => update('rld', e.target.value)}
              />
              <div style={warningText}>
                {formData.registrationType === 'ANDA'
                  ? '仿制药申请(ANDA)必须明确参比制剂(RLD)信息。请填写国家药监局已公布的参比制剂目录中的品种名称。'
                  : '如涉及仿制药质量和疗效一致性评价，请填写参比制剂信息。参比制剂应为国家药监局已公布的参比制剂目录收录品种。'}
              </div>
            </div>
          </div>

          {/* API/DMF 原料药备案号 */}
          <div style={fieldWrapper}>
            <label style={labelStyle}>
              {formData.registrationType === 'ANDA' && <span style={requiredMark}>*</span>}
              原料药备案号 (DMF)：
            </label>
            <div style={inputWrapper}>
              <Input
                placeholder="如：Y20230001234（原料药登记号）"
                value={formData.apiDmfReference}
                onChange={(e) => update('apiDmfReference', e.target.value)}
              />
              <div style={warningText}>
                {formData.registrationType === 'ANDA'
                  ? '请填写所用原料药的CDE原料药登记号(Y+年份+序号)或DMF备案号。仿制药申请须关联已激活的原料药登记号。'
                  : '如适用，请填写所用原料药的CDE登记号或DMF备案号。新药可填"自研"或"未备案"。'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
