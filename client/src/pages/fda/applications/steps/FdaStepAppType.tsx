import { Input, Select, Typography } from 'antd';
import type { FdaApplicationFormData } from '../FdaAppCreateWizard';

const { TextArea } = Input;
const { Text } = Typography;

interface FdaStepAppTypeProps {
  formData: FdaApplicationFormData;
  onChange: (data: Partial<FdaApplicationFormData>) => void;
}

const FDA_NAVY = '#112E51';
const FDA_BLUE = '#0071BC';
const FDA_RED = '#E31C3D';

const sectionHeader: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: FDA_NAVY,
  borderLeft: `4px solid ${FDA_BLUE}`,
  paddingLeft: 12,
  marginBottom: 20,
  marginTop: 8,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: 24,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: '#212121',
  marginBottom: 4,
};

const requiredAsterisk: React.CSSProperties = {
  color: FDA_RED,
  marginLeft: 2,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  borderRadius: 2,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  borderRadius: 2,
};

const warningNote: React.CSSProperties = {
  fontSize: 13,
  color: FDA_RED,
  marginTop: 6,
  lineHeight: '18px',
  maxWidth: 640,
};

const stepBanner: React.CSSProperties = {
  background: '#E1F3F8',
  padding: '12px 16px',
  marginBottom: 24,
  border: '1px solid #B3E0F2',
  borderRadius: 2,
};

export default function FdaStepAppType({ formData, onChange }: FdaStepAppTypeProps) {
  const update = (key: keyof FdaApplicationFormData, val: string) => {
    onChange({ [key]: val });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 15 }}>
          Step 2: Application Type — Select Submission Type &amp; Drug Information
        </span>
        <div style={{ fontSize: 12, color: FDA_NAVY, marginTop: 2 }}>
          Per 21 CFR 314.50, 21 CFR 312.23, and 21 CFR 601.2 — Choose the correct application type and form.
        </div>
      </div>

      {/* ── Application Form & Type ── */}
      <div style={sectionHeader}>Application Form &amp; Type</div>

      {/* Application Form Type */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Application Form Type<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select FDA form type"
          value={formData.applicationFormType || undefined}
          onChange={(v) => update('applicationFormType', v)}
          style={selectStyle}
          options={[
            { value: '356h_NDA', label: 'Form FDA 356h — NDA' },
            { value: '356h_BLA', label: 'Form FDA 356h — BLA' },
            { value: '356h_ANDA', label: 'Form FDA 356h — ANDA' },
            { value: '1571_IND', label: 'Form FDA 1571 — IND' },
          ]}
        />
        <div style={warningNote}>
          Form FDA 356h is used for NDA, BLA, and ANDA submissions. Form FDA 1571 is used for IND submissions.
          Ensure you use the correct and most current version of the form.
        </div>
      </div>

      {/* Application Type */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Application Type<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select application type"
          value={formData.applicationType || undefined}
          onChange={(v) => update('applicationType', v)}
          style={selectStyle}
          options={[
            { value: 'IND', label: 'IND — Investigational New Drug' },
            { value: 'NDA', label: 'NDA — New Drug Application (505(b)(1))' },
            { value: 'NDA_505b2', label: 'NDA — 505(b)(2) Application' },
            { value: 'BLA', label: 'BLA — Biologics License Application (351(a))' },
            { value: 'BLA_351k', label: 'BLA — Biosimilar (351(k))' },
            { value: 'ANDA', label: 'ANDA — Abbreviated New Drug Application' },
          ]}
        />
        <div style={warningNote}>
          IND (Investigational New Drug): For requesting authorization to administer an investigational drug to humans.
          NDA (New Drug Application): For requesting approval to market a new drug. BLA (Biologics License Application):
          For biological products. ANDA (Abbreviated NDA): For generic drugs.
        </div>
      </div>

      {/* Regulatory Pathway */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Regulatory Pathway<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select regulatory pathway"
          value={formData.regulatoryPathway || undefined}
          onChange={(v) => update('regulatoryPathway', v)}
          style={selectStyle}
          options={[
            { value: '505b1', label: '505(b)(1) — Stand-alone NDA (full reports)' },
            { value: '505b2', label: '505(b)(2) — NDA relying on studies not by applicant' },
            { value: '505j', label: '505(j) — ANDA (generic, references listed drug)' },
            { value: '351a', label: '351(a) — Stand-alone BLA' },
            { value: '351k', label: '351(k) — Biosimilar BLA' },
          ]}
        />
        <div style={warningNote}>
          505(b)(1): Stand-alone NDA with full reports. 505(b)(2): NDA relying on studies not conducted by the applicant.
          505(j): ANDA for generic drugs referencing a listed drug.
        </div>
      </div>

      {/* ── Drug Substance Information ── */}
      <div style={sectionHeader}>Drug Substance &amp; Product Information</div>

      {/* Drug Substance Name (USAN/INN) */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Drug Substance Name (USAN/INN)<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="e.g., Ibuprofen (USAN)"
          value={formData.drugSubstanceName}
          onChange={(e) => update('drugSubstanceName', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Use United States Adopted Name (USAN) if available. Otherwise use International Nonproprietary Name (INN).
          Chemical name alone is not sufficient.
        </div>
      </div>

      {/* Proposed Indication */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Proposed Indication(s)<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={3}
          placeholder="Describe the proposed therapeutic indication(s)"
          value={formData.proposedIndication}
          onChange={(e) => update('proposedIndication', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must be specific and supported by clinical data. FDA will evaluate whether the proposed indication is appropriate
          based on the evidence submitted.
        </div>
      </div>

      {/* Dosage Form */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Dosage Form<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select dosage form"
          value={formData.dosageForm || undefined}
          onChange={(v) => update('dosageForm', v)}
          style={selectStyle}
          showSearch
          options={[
            { value: 'tablet', label: 'Tablet' },
            { value: 'tablet_film_coated', label: 'Tablet, Film Coated' },
            { value: 'tablet_extended_release', label: 'Tablet, Extended Release' },
            { value: 'capsule', label: 'Capsule' },
            { value: 'capsule_extended_release', label: 'Capsule, Extended Release' },
            { value: 'injection', label: 'Injection, Solution' },
            { value: 'injection_lyophilized', label: 'Injection, Powder, Lyophilized, For Solution' },
            { value: 'injection_suspension', label: 'Injection, Suspension' },
            { value: 'oral_solution', label: 'Solution, Oral' },
            { value: 'oral_suspension', label: 'Suspension, Oral' },
            { value: 'cream', label: 'Cream' },
            { value: 'ointment', label: 'Ointment' },
            { value: 'gel', label: 'Gel' },
            { value: 'inhalation', label: 'Inhalation, Powder' },
            { value: 'nasal_spray', label: 'Spray, Nasal' },
            { value: 'ophthalmic_solution', label: 'Solution, Ophthalmic' },
            { value: 'patch', label: 'Patch, Transdermal' },
            { value: 'suppository', label: 'Suppository' },
          ]}
        />
        <div style={warningNote}>
          Must be described using standard FDA terminology. Refer to FDA's Dosage Form nomenclature in the Orange Book.
        </div>
      </div>

      {/* Strength */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Strength<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="e.g., 500 mg, 10 mg/mL"
          value={formData.strength}
          onChange={(e) => update('strength', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          List all proposed strengths using standard units. For combination products, list each active ingredient separately.
        </div>
      </div>

      {/* Route of Administration */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Route of Administration<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select route of administration"
          value={formData.routeOfAdministration || undefined}
          onChange={(v) => update('routeOfAdministration', v)}
          style={selectStyle}
          options={[
            { value: 'oral', label: 'ORAL' },
            { value: 'intravenous', label: 'INTRAVENOUS' },
            { value: 'intramuscular', label: 'INTRAMUSCULAR' },
            { value: 'subcutaneous', label: 'SUBCUTANEOUS' },
            { value: 'topical', label: 'TOPICAL' },
            { value: 'transdermal', label: 'TRANSDERMAL' },
            { value: 'inhalation', label: 'INHALATION' },
            { value: 'nasal', label: 'NASAL' },
            { value: 'ophthalmic', label: 'OPHTHALMIC' },
            { value: 'otic', label: 'OTIC' },
            { value: 'rectal', label: 'RECTAL' },
            { value: 'vaginal', label: 'VAGINAL' },
            { value: 'intrathecal', label: 'INTRATHECAL' },
            { value: 'sublingual', label: 'SUBLINGUAL' },
            { value: 'buccal', label: 'BUCCAL' },
          ]}
        />
        <div style={warningNote}>
          Must be FDA-recognized route. Refer to FDA's Structured Product Labeling (SPL) terminology.
        </div>
      </div>

      {/* Rx/OTC Status */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Proposed Rx/OTC Status<span style={requiredAsterisk}>*</span>
        </label>
        <Select
          placeholder="Select prescription status"
          value={formData.rxOtcStatus || undefined}
          onChange={(v) => update('rxOtcStatus', v)}
          style={selectStyle}
          options={[
            { value: 'Rx', label: 'Prescription (Rx) Only' },
            { value: 'OTC', label: 'Over-the-Counter (OTC)' },
            { value: 'Rx_to_OTC_switch', label: 'Rx-to-OTC Switch' },
          ]}
        />
        <div style={warningNote}>
          Prescription (Rx) vs Over-the-Counter (OTC) status determination. Include justification if seeking OTC status
          for a new chemical entity.
        </div>
      </div>
    </div>
  );
}
