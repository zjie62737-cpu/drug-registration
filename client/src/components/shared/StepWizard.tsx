import { Steps } from 'antd';

export interface StepWizardStep {
  title: string;
  description?: string;
}

interface StepWizardProps {
  steps: StepWizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export default function StepWizard({ steps, currentStep, onStepClick, children }: StepWizardProps) {
  const items = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    status: index < currentStep ? 'finish' as const
      : index === currentStep ? 'process' as const
      : 'wait' as const,
  }));

  return (
    <div>
      <Steps
        current={currentStep}
        items={items}
        onChange={onStepClick}
        size="small"
        style={{ marginBottom: 32, padding: '0 8px' }}
      />
      <div>{children}</div>
    </div>
  );
}
