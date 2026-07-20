import { Input, Select, Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { EmaApplicationFormData, EmaManufacturingSite } from '../EmaAppCreateWizard';

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

const EU_EEA_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
];

let siteIdCounter = 0;

export default function EmaStepApplicant({ formData, onChange }: Props) {
  const update = (key: keyof EmaApplicationFormData, val: unknown) => {
    onChange({ [key]: val });
  };

  const addSite = () => {
    const newSite: EmaManufacturingSite = {
      id: `site_${++siteIdCounter}`,
      name: '',
      address: '',
      gmpCertificate: '',
    };
    onChange({ manufacturingSites: [...formData.manufacturingSites, newSite] });
  };

  const updateSite = (id: string, field: keyof EmaManufacturingSite, val: string) => {
    onChange({
      manufacturingSites: formData.manufacturingSites.map((s) =>
        s.id === id ? { ...s, [field]: val } : s
      ),
    });
  };

  const removeSite = (id: string) => {
    onChange({
      manufacturingSites: formData.manufacturingSites.filter((s) => s.id !== id),
    });
  };

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: EMA_BLUE, fontWeight: 600, fontSize: 15 }}>
          Step 2: Applicant Information &mdash; Marketing Authorisation Holder and contact details
        </span>
      </div>

      {/* ── Applicant Details ── */}
      <div style={sectionHeader}>Marketing Authorisation Holder (Applicant)</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Applicant Legal Name
        </label>
        <Input
          placeholder="Full legal name of the MAH entity"
          value={formData.applicantLegalName}
          onChange={(e) => update('applicantLegalName', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Must be the legal entity that will hold the Marketing Authorisation. Must be established in the European Union
          (EU) / European Economic Area (EEA). For non-EU companies, designate an EU-based subsidiary or representative.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Applicant Country
        </label>
        <Select
          showSearch
          placeholder="Select EU/EEA country"
          value={formData.applicantCountry || undefined}
          onChange={(v) => update('applicantCountry', v)}
          options={EU_EEA_COUNTRIES.map((c) => ({ value: c, label: c }))}
          style={{ width: '100%', maxWidth: 600 }}
        />
        <div style={warningText}>
          The applicant must be established in an EU/EEA Member State. This is a legal requirement under EU pharmaceutical
          legislation.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Applicant Registered Address
        </label>
        <TextArea
          rows={3}
          placeholder="Full registered address within the EU/EEA"
          value={formData.applicantAddress}
          onChange={(e) => update('applicantAddress', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Must be a valid address within the EU/EEA. This address will appear on all product labelling and the European
          Public Assessment Report (EPAR).
        </div>
      </div>

      {/* ── Contact Information ── */}
      <div style={sectionHeader}>Contact Information</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Contact Person
        </label>
        <Input
          placeholder="Full name of the person responsible for communication with EMA"
          value={formData.contactPerson}
          onChange={(e) => update('contactPerson', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          The person responsible for all communication with EMA during the procedure. Must be available throughout the
          entire 210-day assessment period.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Contact Phone
        </label>
        <Input
          placeholder="+XX XXX XXX XXXX"
          value={formData.contactPhone}
          onChange={(e) => update('contactPhone', e.target.value)}
          style={{ maxWidth: 600 }}
        />
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Technical Contact Email
        </label>
        <Input
          type="email"
          placeholder="email@company.eu"
          value={formData.technicalContactEmail}
          onChange={(e) => update('technicalContactEmail', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Will receive Day 0 validation queries, Day 120 List of Questions, Day 180 Joint Assessment Report, and CHMP
          Opinion notification.
        </div>
      </div>

      {/* ── Manufacturing Sites ── */}
      <div style={sectionHeader}>Manufacturing Site(s)</div>

      {formData.manufacturingSites.length === 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#FFFBE6',
          borderRadius: 2,
          border: '1px solid #FFE58F',
          marginBottom: 12,
          fontSize: 13,
          color: '#8C6E00',
        }}>
          <EnvironmentOutlined /> No manufacturing sites added yet. Click &quot;Add Manufacturing Site&quot; below.
        </div>
      )}

      {formData.manufacturingSites.map((site, index) => (
        <Card
          key={site.id}
          size="small"
          title={<span style={{ fontSize: 13, color: EMA_BLUE }}>Site #{index + 1}</span>}
          extra={
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeSite(site.id)}
            >
              Remove
            </Button>
          }
          style={{ marginBottom: 12, borderRadius: 2, border: '1px solid #E0E0E0', maxWidth: 640 }}
        >
          <div style={formGroup}>
            <label style={labelStyle}>Site Name</label>
            <Input
              placeholder="Manufacturing site name"
              value={site.name}
              onChange={(e) => updateSite(site.id, 'name', e.target.value)}
            />
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Site Address</label>
            <Input
              placeholder="Full address of the manufacturing site"
              value={site.address}
              onChange={(e) => updateSite(site.id, 'address', e.target.value)}
            />
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>EU GMP Certificate Number</label>
            <Input
              placeholder="GMP certificate reference"
              value={site.gmpCertificate}
              onChange={(e) => updateSite(site.id, 'gmpCertificate', e.target.value)}
            />
          </div>
        </Card>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addSite}
        style={{ marginBottom: 8, borderRadius: 2 }}
      >
        Add Manufacturing Site
      </Button>

      <div style={warningText}>
        List all manufacturing sites including quality control testing sites. Each site must have valid EU GMP
        certificate. Sites outside EU must be named in the marketing authorisation and are subject to GMP inspection
        by EU authorities.
      </div>

      {/* ── Qualified Person ── */}
      <div style={{ ...sectionHeader, marginTop: 24 }}>Qualified Person for Pharmacovigilance (QPPV)</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>QPPV Name
        </label>
        <Input
          placeholder="Full name of the QPPV"
          value={formData.qppvName}
          onChange={(e) => update('qppvName', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          The Qualified Person for Pharmacovigilance (QPPV) must reside in the EU. The QPPV is responsible for the
          pharmacovigilance system and must be registered with EMA via Article 57 database.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>QPPV Email
        </label>
        <Input
          type="email"
          placeholder="qppv@company.eu"
          value={formData.qppvEmail}
          onChange={(e) => update('qppvEmail', e.target.value)}
          style={{ maxWidth: 600 }}
        />
      </div>

      {/* ── Product Naming ── */}
      <div style={sectionHeader}>Product Naming &amp; Classification</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Proposed (Invented) Name
        </label>
        <Input
          placeholder="Trade name to be reviewed by CHMP"
          value={formData.proposedInventedName}
          onChange={(e) => update('proposedInventedName', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Submit proposed trade name for review by CHMP. Name must not be misleading, must not conflict with existing
          product names in EU Member States, and must not imply efficacy claims. EMA&apos;s Name Review Group (NRG) will assess
          the proposed name.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>ATC Code
        </label>
        <Input
          placeholder="e.g. L01XC07"
          value={formData.atcCode}
          onChange={(e) => update('atcCode', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          Provide proposed WHO Anatomical Therapeutic Chemical classification. Determines which CHMP rapporteur/
          co-rapporteur teams are eligible.
        </div>
      </div>
    </div>
  );
}
