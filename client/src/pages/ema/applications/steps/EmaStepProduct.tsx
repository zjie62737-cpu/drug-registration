import { useState } from 'react';
import { Input, Select, Tag, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { EmaApplicationFormData } from '../EmaAppCreateWizard';

const { TextArea } = Input;

interface Props {
  formData: EmaApplicationFormData;
  onChange: (data: Partial<EmaApplicationFormData>) => void;
}

// ── EU standard form styles ──
const EMA_BLUE = '#003399';
const EMA_RED = '#DA2131';

const formGroup: React.CSSProperties = {
  marginBottom: 24,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
  marginBottom: 6,
};

const requiredMark: React.CSSProperties = {
  color: EMA_RED,
  marginRight: 1,
};

const warningText: React.CSSProperties = {
  fontSize: 12,
  color: EMA_RED,
  marginTop: 6,
  lineHeight: '18px',
};

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

const stepBanner: React.CSSProperties = {
  background: '#E6EEF5',
  padding: '12px 16px',
  marginBottom: 24,
  border: '1px solid #B8C9E0',
  borderRadius: 2,
};

const PHARMACEUTICAL_FORMS = [
  'Tablet', 'Capsule, hard', 'Capsule, soft', 'Granules', 'Powder for oral solution',
  'Solution for injection', 'Powder for solution for injection', 'Suspension for injection',
  'Concentrate for solution for infusion', 'Cream', 'Ointment', 'Gel',
  'Eye drops, solution', 'Nasal spray, solution', 'Inhalation powder', 'Pressurised inhalation, solution',
  'Suppository', 'Transdermal patch', 'Oral solution', 'Oral suspension', 'Syrup',
  'Lyophilisate for solution for injection', 'Emulsion for injection', 'Implant',
];

const LEGAL_STATUS_OPTIONS = [
  { value: 'Rx', label: 'Prescription Only (Rx)' },
  { value: 'OTC', label: 'Over-The-Counter (OTC)' },
  { value: 'restrictedRx', label: 'Restricted Prescription (e.g., hospital-only)' },
  { value: 'pharmacyOnly', label: 'Pharmacy Only' },
];

export default function EmaStepProduct({ formData, onChange }: Props) {
  const update = (key: keyof EmaApplicationFormData, val: unknown) => {
    onChange({ [key]: val });
  };

  const [newPackSize, setNewPackSize] = useState('');

  const addPackSize = () => {
    const trimmed = newPackSize.trim();
    if (trimmed && !formData.packageSizes.includes(trimmed)) {
      onChange({ packageSizes: [...formData.packageSizes, trimmed] });
    }
    setNewPackSize('');
  };

  const removePackSize = (size: string) => {
    onChange({ packageSizes: formData.packageSizes.filter((s) => s !== size) });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: EMA_BLUE, fontWeight: 600, fontSize: 15 }}>
          Step 3: Product Details &mdash; Pharmaceutical product information per Ph. Eur. standards
        </span>
      </div>

      {/* ── Product Identification ── */}
      <div style={sectionHeader}>Product Identification</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>International Nonproprietary Name (INN)
        </label>
        <Input
          placeholder="WHO-assigned INN (e.g. bevacizumab)"
          value={formData.inn}
          onChange={(e) => update('inn', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          WHO-assigned INN. Required for all medicinal products. If INN not yet assigned, request from WHO INN Programme
          before MAA submission.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Pharmaceutical Form
        </label>
        <Select
          showSearch
          placeholder="Select from Ph. Eur. standard terms"
          value={formData.pharmaceuticalForm || undefined}
          onChange={(v) => update('pharmaceuticalForm', v)}
          options={PHARMACEUTICAL_FORMS.map((f) => ({ value: f, label: f }))}
          style={{ width: '100%', maxWidth: 600 }}
        />
        <div style={warningText}>
          Use the European Pharmacopoeia (Ph. Eur.) standard term for pharmaceutical form. Refer to Standard Terms
          database published by EDQM (European Directorate for the Quality of Medicines).
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Strength
        </label>
        <Input
          placeholder="e.g. 25 mg/mL, 400 mg per tablet"
          value={formData.strength}
          onChange={(e) => update('strength', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Express strength per dosage unit or volume using SI units. For combination products, list each active
          substance strength separately.
        </div>
      </div>

      {/* ── Therapeutic Information ── */}
      <div style={sectionHeader}>Therapeutic Information</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Therapeutic Indications
        </label>
        <TextArea
          rows={4}
          placeholder="Describe the proposed therapeutic indications in detail"
          value={formData.therapeuticIndications}
          onChange={(e) => update('therapeuticIndications', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Must be clearly defined and supported by clinical evidence. The approved indication will appear in Section 4.1 of
          the Summary of Product Characteristics (SmPC). CHMP may narrow the proposed indication based on efficacy/safety
          assessment.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Posology &amp; Method of Administration
        </label>
        <TextArea
          rows={4}
          placeholder="Specify dose, dosing interval, treatment duration, route of administration, and special population adjustments"
          value={formData.posology}
          onChange={(e) => update('posology', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Must specify dose, dosing interval, treatment duration, and route. For special populations (elderly, renal/
          hepatic impairment, paediatrics), provide specific dosing guidance with supporting data.
        </div>
      </div>

      {/* ── Pharmaceutical Details ── */}
      <div style={sectionHeader}>Pharmaceutical Details</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Package Sizes
        </label>
        <div style={{ marginBottom: 8 }}>
          {formData.packageSizes.map((size) => (
            <Tag
              key={size}
              closable
              onClose={() => removePackSize(size)}
              style={{ marginBottom: 4, borderRadius: 2 }}
            >
              {size}
            </Tag>
          ))}
          {formData.packageSizes.length === 0 && (
            <span style={{ fontSize: 13, color: '#999' }}>No package sizes added yet</span>
          )}
        </div>
        <Space style={{ maxWidth: 600, width: '100%' }}>
          <Input
            placeholder="e.g. 30 tablets, 90 tablets"
            value={newPackSize}
            onChange={(e) => setNewPackSize(e.target.value)}
            onPressEnter={addPackSize}
            style={{ flex: 1 }}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={addPackSize}
            type="primary"
            ghost
            style={{ borderColor: EMA_BLUE, color: EMA_BLUE, borderRadius: 2 }}
          >
            Add
          </Button>
        </Space>
        <div style={warningText}>
          List all proposed pack sizes. Must include justification for each pack size. Certain Member States have specific
          requirements for maximum pack sizes.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Shelf Life
        </label>
        <Input
          placeholder="e.g. 36 months (unopened)"
          value={formData.shelfLife}
          onChange={(e) => update('shelfLife', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Proposed shelf life supported by stability data per ICH Q1 guidelines. Include in-use stability data for
          multi-dose products. Storage condition statements must use Ph. Eur. terminology.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Storage Conditions
        </label>
        <Input
          placeholder="e.g. Store below 25°C. Do not freeze."
          value={formData.storageConditions}
          onChange={(e) => update('storageConditions', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Specify storage conditions using Ph. Eur. terminology (e.g., refrigerated 2-8°C, store below 25°C). Must
          be consistent with stability data.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Legal Status
        </label>
        <Select
          placeholder="Select legal classification"
          value={formData.legalStatus || undefined}
          onChange={(v) => update('legalStatus', v)}
          options={LEGAL_STATUS_OPTIONS}
          style={{ width: '100%', maxWidth: 600 }}
        />
        <div style={warningText}>
          Rx-only is the default for new active substances. OTC status requires robust evidence of safety in
          self-medication setting. Certain Member States may have additional national restrictions.
        </div>
      </div>
    </div>
  );
}
