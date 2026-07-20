import { Input, Typography } from 'antd';
import type { FdaApplicationFormData } from '../FdaAppCreateWizard';

const { TextArea } = Input;
const { Text } = Typography;

interface FdaStepProductProps {
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

export default function FdaStepProduct({ formData, onChange }: FdaStepProductProps) {
  const update = (key: keyof FdaApplicationFormData, val: string) => {
    onChange({ [key]: val });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 15 }}>
          Step 3: Product / CMC Information — Chemistry, Manufacturing &amp; Controls
        </span>
        <div style={{ fontSize: 12, color: FDA_NAVY, marginTop: 2 }}>
          Per 21 CFR 314.50(d)(1) and ICH M4Q — Complete CMC data package for Module 3 of the eCTD.
        </div>
      </div>

      {/* ── Manufacturing Facilities ── */}
      <div style={sectionHeader}>Manufacturing Facilities</div>

      {/* Drug Substance Manufacturer */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Drug Substance Manufacturer<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={2}
          placeholder="Full name and address of drug substance manufacturing facility"
          value={formData.drugSubstanceManufacturer}
          onChange={(e) => update('drugSubstanceManufacturer', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Include full name and address of each facility involved in manufacturing the drug substance. All facilities must
          be registered with FDA and have valid FEI numbers.
        </div>
      </div>

      {/* Drug Product Manufacturer */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Drug Product Manufacturer<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={2}
          placeholder="Full name and address of drug product manufacturing facility"
          value={formData.drugProductManufacturer}
          onChange={(e) => update('drugProductManufacturer', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Include all facilities involved in manufacturing, packaging, labeling, testing, and storage. Each facility must
          be FDA-registered.
        </div>
      </div>

      {/* ── Manufacturing & Controls ── */}
      <div style={sectionHeader}>Manufacturing &amp; Controls</div>

      {/* Manufacturing Process Summary */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Manufacturing Process Summary<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={4}
          placeholder="Describe the manufacturing process including critical steps, in-process controls, and process parameters"
          value={formData.manufacturingProcessSummary}
          onChange={(e) => update('manufacturingProcessSummary', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Describe the manufacturing process in sufficient detail. Include flow diagram showing all steps from starting
          materials to final product. Identify critical process parameters and in-process controls.
        </div>
      </div>

      {/* Specifications */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Specifications (Acceptance Criteria)<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={4}
          placeholder="Proposed specifications for drug substance and drug product including tests, methods, and acceptance criteria"
          value={formData.specifications}
          onChange={(e) => update('specifications', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Provide proposed acceptance criteria for drug substance and drug product. Must include tests for identity,
          strength, purity, potency, and quality. Reference USP/NF monographs where applicable.
        </div>
      </div>

      {/* Container/Closure System */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Container / Closure System<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={3}
          placeholder="Describe all packaging components and container closure system"
          value={formData.containerClosureSystem}
          onChange={(e) => update('containerClosureSystem', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Describe all packaging components. For injectable products, include detailed information on container-closure
          integrity testing. Reference FDA Guidance for Industry: Container Closure Systems for Packaging Human Drugs and Biologics.
        </div>
      </div>

      {/* ── Stability & Sterility ── */}
      <div style={sectionHeader}>Stability &amp; Sterility Assurance</div>

      {/* Stability Data */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Stability Data Summary<span style={requiredAsterisk}>*</span>
        </label>
        <TextArea
          rows={3}
          placeholder="Summarize stability protocol, storage conditions, and available data"
          value={formData.stabilityData}
          onChange={(e) => update('stabilityData', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Submit stability data per ICH Q1A(R2) guidelines. Include long-term (25C/60%RH or 30C/65%RH), intermediate
          (30C/65%RH), and accelerated (40C/75%RH) conditions. At least 12 months of long-term data recommended for NDA
          at time of submission.
        </div>
      </div>

      {/* Sterility Assurance */}
      <div style={fieldGroup}>
        <label style={labelStyle}>Sterility Assurance (if sterile product)</label>
        <TextArea
          rows={3}
          placeholder="Describe sterilization method, validation, and sterility assurance level (if applicable)"
          value={formData.sterilityAssurance}
          onChange={(e) => update('sterilityAssurance', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          For sterile products: Submit complete sterilization validation data, media fill results, and environmental
          monitoring data. Refer to FDA Guidance for Industry: Sterile Drug Products Produced by Aseptic Processing —
          Current Good Manufacturing Practice.
        </div>
      </div>
    </div>
  );
}
