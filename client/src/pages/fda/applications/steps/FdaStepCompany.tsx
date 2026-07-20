import { Input, Typography } from 'antd';
import type { FdaApplicationFormData } from '../FdaAppCreateWizard';

const { Text } = Typography;

interface FdaStepCompanyProps {
  formData: FdaApplicationFormData;
  onChange: (data: Partial<FdaApplicationFormData>) => void;
}

// ── FDA US Government Standard Form Styles ──
// Labels on TOP of fields (US standard, unlike Chinese left-side labels)

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

export default function FdaStepCompany({ formData, onChange }: FdaStepCompanyProps) {
  const update = (key: keyof FdaApplicationFormData, val: string) => {
    onChange({ [key]: val });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: FDA_NAVY, fontWeight: 600, fontSize: 15 }}>
          Step 1: Company Information — Applicant, Facility &amp; U.S. Agent Details
        </span>
        <div style={{ fontSize: 12, color: FDA_NAVY, marginTop: 2 }}>
          Per 21 CFR Part 207 and 21 CFR Part 314.50 — All registration and listing information must be accurate and complete.
        </div>
      </div>

      {/* ── FDA Identifiers ── */}
      <div style={sectionHeader}>FDA Registration Identifiers</div>

      {/* DUNS Number */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          DUNS Number<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="9-digit DUNS number (e.g., 123456789)"
          maxLength={9}
          value={formData.dunsNumber}
          onChange={(e) => update('dunsNumber', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          A Data Universal Numbering System (DUNS) number is a unique 9-digit identifier. Required for all FDA submissions.
          Obtained from Dun &amp; Bradstreet (dnb.com). If you do not have a DUNS number, apply at least 2-4 weeks before
          your planned submission.
        </div>
      </div>

      {/* FEI Number */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          FEI Number<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="10-digit FEI number (e.g., 3001234567)"
          maxLength={10}
          value={formData.feiNumber}
          onChange={(e) => update('feiNumber', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          The Facility Establishment Identifier (FEI) is a unique 10-digit number assigned by FDA to identify facilities.
          Required for manufacturing sites. If not assigned, FDA will assign one during review.
        </div>
      </div>

      {/* ESG Account */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          ESG Account ID<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="ESG account identifier"
          value={formData.esgAccount}
          onChange={(e) => update('esgAccount', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          The Electronic Submission Gateway (ESG) account is required for electronic submissions to FDA. Register at
          fda.gov/esg. Test account must be validated before production use. Allow 2-4 weeks for setup.
        </div>
      </div>

      {/* NDC Number */}
      <div style={fieldGroup}>
        <label style={labelStyle}>NDC Number (if applicable)</label>
        <Input
          placeholder="10-digit NDC number (e.g., 12345-678-90)"
          maxLength={14}
          value={formData.ndcNumber}
          onChange={(e) => update('ndcNumber', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          The National Drug Code (NDC) is a unique product identifier. Request NDC from FDA prior to submission if not
          already assigned.
        </div>
      </div>

      {/* Pre-assigned BLA Number */}
      <div style={fieldGroup}>
        <label style={labelStyle}>Pre-assigned BLA Number (if applicable)</label>
        <Input
          placeholder="6-digit BLA number (e.g., 761234)"
          maxLength={6}
          value={formData.preAssignedBlaNumber}
          onChange={(e) => update('preAssignedBlaNumber', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Request from FDA by email to the appropriate review division at least 30 days before planned submission.
        </div>
      </div>

      {/* ── U.S. Agent Information ── */}
      <div style={sectionHeader}>U.S. Agent Information (Required for Foreign Applicants)</div>

      {/* U.S. Agent Name */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          U.S. Agent Name<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Full legal name of the U.S. Agent"
          value={formData.usAgentName}
          onChange={(e) => update('usAgentName', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Foreign applicants MUST designate a U.S. Agent who resides or maintains a place of business in the United States.
          The U.S. Agent acts as the authorized representative for FDA communications.
        </div>
      </div>

      {/* U.S. Agent Address */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          U.S. Agent Address<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Street address, City, State, ZIP Code"
          value={formData.usAgentAddress}
          onChange={(e) => update('usAgentAddress', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must be a valid U.S. address. The U.S. Agent will receive all official FDA correspondence.
        </div>
      </div>

      {/* U.S. Agent Phone */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          U.S. Agent Phone<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="U.S. phone number (e.g., +1-301-555-0123)"
          value={formData.usAgentPhone}
          onChange={(e) => update('usAgentPhone', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must be a valid U.S. phone number. The U.S. Agent will receive all official FDA correspondence.
        </div>
      </div>

      {/* U.S. Agent Email */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          U.S. Agent Email<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="agent@example.com"
          type="email"
          value={formData.usAgentEmail}
          onChange={(e) => update('usAgentEmail', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must be a valid email address. The U.S. Agent will receive all official FDA correspondence.
        </div>
      </div>

      {/* ── Company Information ── */}
      <div style={sectionHeader}>Company Details</div>

      {/* Company Legal Name */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Company Legal Name<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Full legal name of the applicant company"
          value={formData.companyLegalName}
          onChange={(e) => update('companyLegalName', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must match exactly with the name registered in the DUNS system and FDA establishment registration.
        </div>
      </div>

      {/* Company Address */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Company Address<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Physical address of the company"
          value={formData.companyAddress}
          onChange={(e) => update('companyAddress', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Must be the physical location of the company. P.O. Box is not acceptable for manufacturing facilities.
        </div>
      </div>

      {/* Company Phone */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Company Phone<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Company phone number"
          value={formData.companyPhone}
          onChange={(e) => update('companyPhone', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Company Email */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Company Email<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="company@example.com"
          type="email"
          value={formData.companyEmail}
          onChange={(e) => update('companyEmail', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ── Product Identification ── */}
      <div style={sectionHeader}>Product Identification</div>

      {/* Proprietary Name */}
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Proposed Proprietary (Brand) Name<span style={requiredAsterisk}>*</span>
        </label>
        <Input
          placeholder="Proposed brand/trade name"
          value={formData.proprietaryName}
          onChange={(e) => update('proprietaryName', e.target.value)}
          style={inputStyle}
        />
        <div style={warningNote}>
          Submit proposed proprietary (brand) name for FDA review. Name must not be confusingly similar to existing products.
          FDA will evaluate for medication error potential, promotional implications, and trademark concerns.
        </div>
      </div>
    </div>
  );
}
