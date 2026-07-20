import { Form, Input, Select, Upload, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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

const infoText: React.CSSProperties = {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
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
  border: `1px solid #B8C9E0`,
  borderRadius: 2,
};

const procedureBox: React.CSSProperties = {
  padding: '12px 16px',
  background: '#FFFBE6',
  borderRadius: 2,
  border: '1px solid #FFE58F',
  marginBottom: 12,
  fontSize: 12,
  color: '#8C6E00',
  lineHeight: '18px',
};

const EU_MEMBER_STATES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
];

const CMS_OPTIONS = EU_MEMBER_STATES.map((s) => ({ value: s, label: s }));

export default function EmaStepProcedure({ formData, onChange }: Props) {
  const update = (key: keyof EmaApplicationFormData, val: unknown) => {
    onChange({ [key]: val });
  };

  const isDcpMrp = formData.procedureType === 'DCP' || formData.procedureType === 'MRP';
  const isCP = formData.procedureType === 'CP';

  const filteredCmsOptions = CMS_OPTIONS.filter(
    (opt) => opt.value !== formData.rms && !formData.cmsList.includes(opt.value)
  );

  return (
    <div>
      {/* Step banner */}
      <div style={stepBanner}>
        <span style={{ color: EMA_BLUE, fontWeight: 600, fontSize: 15 }}>
          Step 1: Procedure Selection &mdash; Select the marketing authorisation procedure type
        </span>
      </div>

      {/* ── Procedure Type ── */}
      <div style={sectionHeader}>Marketing Authorisation Procedure Type</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          <span style={requiredMark}>*</span>Procedure Type
        </label>
        <Select
          placeholder="Select Procedure Type"
          value={formData.procedureType || undefined}
          onChange={(v) => {
            update('procedureType', v);
            if (v !== 'DCP' && v !== 'MRP') {
              update('rms', '');
              update('cmsList', []);
            }
          }}
          options={[
            { value: 'CP', label: 'CP — Centralised Procedure' },
            { value: 'DCP', label: 'DCP — Decentralised Procedure' },
            { value: 'MRP', label: 'MRP — Mutual Recognition Procedure' },
            { value: 'INP', label: 'INP — Independent National Procedure' },
          ]}
          style={{ width: '100%', maxWidth: 600 }}
        />
        {formData.procedureType === 'CP' ? (
          <div style={warningText}>
            Centralised Procedure (CP): Mandatory for all biotechnology products, orphan medicines, and advanced therapy
            medicines. Also mandatory for new active substances for certain therapeutic indications (cancer, diabetes,
            neurodegenerative diseases, auto-immune diseases, viral diseases). Results in single marketing authorisation
            valid in all EU/EEA Member States.
          </div>
        ) : formData.procedureType === 'DCP' ? (
          <div style={warningText}>
            Decentralised Procedure (DCP): For products not yet authorised in any Member State. The Reference Member State
            (RMS) leads the scientific assessment. Applications are submitted simultaneously to RMS and all CMSs. After
            assessment, RMS provides its assessment report to CMSs for their decision.
          </div>
        ) : formData.procedureType === 'MRP' ? (
          <div style={warningText}>
            Mutual Recognition Procedure (MRP): For products already authorised in one Member State (RMS). The RMS
            assessment is mutually recognised by all Concerned Member States (CMS). The RMS must issue an updated
            assessment report within 90 days.
          </div>
        ) : formData.procedureType === 'INP' ? (
          <div style={warningText}>
            Independent National Procedure (INP): For marketing authorisation in a single Member State only. Assessment
            is conducted solely by the national competent authority of that Member State. Not applicable if the product
            is within the mandatory scope of the Centralised Procedure.
          </div>
        ) : (
          <div style={infoText}>
            Select the appropriate EU marketing authorisation procedure type for your product.
          </div>
        )}
      </div>

      {/* ── RMS / CMS Selection ── */}
      {isDcpMrp && (
        <>
          <div style={sectionHeader}>Reference Member State (RMS) &amp; Concerned Member States (CMS)</div>

          <div style={formGroup}>
            <label style={labelStyle}>
              <span style={requiredMark}>*</span>Reference Member State (RMS)
            </label>
            <Select
              showSearch
              placeholder="Select Reference Member State"
              value={formData.rms || undefined}
              onChange={(v) => {
                update('rms', v);
                update('cmsList', formData.cmsList.filter((c) => c !== v));
              }}
              options={CMS_OPTIONS}
              style={{ width: '100%', maxWidth: 600 }}
            />
            <div style={warningText}>
              The Reference Member State leads the scientific assessment. Choose RMS based on their expertise with
              similar products. Discuss RMS selection with potential Member States before submission. RMS must agree to
              act as reference before you submit.
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>
              <span style={requiredMark}>*</span>Concerned Member States (CMS)
            </label>
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Concerned Member States"
              value={formData.cmsList}
              onChange={(v) => update('cmsList', v)}
              options={filteredCmsOptions}
              style={{ width: '100%', maxWidth: 600 }}
            />
            <div style={warningText}>
              Select all Member States where you intend to market the product. Each CMS will either accept or contest the
              RMS assessment. Minimum 1 CMS required, maximum 29 (all other EU/EEA states).
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>
              <span style={requiredMark}>*</span>RMS Confirmation Letter
            </label>
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                update('rmsConfirmationLetter', { fileName: file.name, status: 'uploaded' });
                return false;
              }}
              onRemove={() => update('rmsConfirmationLetter', null)}
              fileList={
                formData.rmsConfirmationLetter
                  ? [{ uid: '-1', name: formData.rmsConfirmationLetter.fileName, status: 'done' as const }]
                  : []
              }
            >
              <button style={{
                border: '1px solid #D9D9D9',
                borderRadius: 2,
                padding: '6px 16px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}>
                <UploadOutlined /> Upload RMS Confirmation Letter
              </button>
            </Upload>
            <div style={warningText}>
              Written confirmation from RMS that they agree to act as reference. Must be obtained BEFORE submission.
              Without this letter, the application cannot be validated.
            </div>
          </div>
        </>
      )}

      {/* ── Prerequisites and Designations ── */}
      <div style={sectionHeader}>Regulatory Prerequisites &amp; Designations</div>

      <div style={formGroup}>
        <label style={labelStyle}>
          Orphan Drug Designation
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <Switch
            checked={formData.orphanDesignation}
            onChange={(v) => update('orphanDesignation', v)}
          />
          <span style={{ fontSize: 13, color: '#666' }}>
            {formData.orphanDesignation ? 'Product has EU orphan designation' : 'Not an orphan drug'}
          </span>
        </div>
        {formData.orphanDesignation && (
          <Input
            placeholder="EU orphan designation number (e.g. EU/3/XX/XXXX)"
            value={formData.orphanDesignationNumber}
            onChange={(e) => update('orphanDesignationNumber', e.target.value)}
            style={{ maxWidth: 600 }}
          />
        )}
        <div style={warningText}>
          If applicable, provide EU orphan designation number (EU/3/XX/XXXX). Orphan designation must be granted before
          MAA submission. Orphan drugs benefit from 10-year market exclusivity, protocol assistance, and fee reductions.
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          Paediatric Investigation Plan (PIP)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: '#666' }}>PIP required:</span>
          <Switch
            checked={!formData.pipExempt}
            onChange={(v) => update('pipExempt', !v)}
          />
          <span style={{ fontSize: 13, color: '#666' }}>
            {formData.pipExempt ? 'Product is exempt (e.g., adult-only condition)' : 'PIP is required'}
          </span>
        </div>
        {!formData.pipExempt && (
          <Input
            placeholder="PIP decision number (e.g. P/XXXX/XXXX)"
            value={formData.pipDecisionNumber}
            onChange={(e) => update('pipDecisionNumber', e.target.value)}
            style={{ maxWidth: 600 }}
          />
        )}
        <div style={warningText}>
          Mandatory for all new marketing authorisation applications unless product is exempt (e.g., for adult-only
          conditions). PIP must be agreed with EMA Paediatric Committee (PDCO) before MAA submission. Include PIP
          decision number (P/XXXX/XXXX).
        </div>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>
          Scientific Advice (SA) Number(s)
        </label>
        <Input
          placeholder="e.g. SA/XXXX/XXXX, SA/YYYY/YYYY"
          value={formData.scientificAdviceNumbers}
          onChange={(e) => update('scientificAdviceNumbers', e.target.value)}
          style={{ maxWidth: 600 }}
        />
        <div style={warningText}>
          If you received scientific advice from EMA during development, provide the SA procedure number(s). Scientific
          advice is not binding but should be followed or justified. SA numbers help EMA track previous interactions with
          your product.
        </div>
      </div>

      {/* CP info box */}
      {isCP && (
        <div style={procedureBox}>
          <strong>Centralised Procedure &mdash; Important Notes</strong><br />
          The CP is mandatory for: biotechnology products, orphan medicines, advanced therapy medicinal products (ATMPs),
          and new active substances for cancer, diabetes, neurodegenerative diseases, auto-immune diseases, and viral
          diseases.<br />
          Fee range: &euro;278,600 &ndash; &euro;310,600 (full application, standard fee).
          Reduced fees apply for SMEs and orphan drugs.
        </div>
      )}
    </div>
  );
}
