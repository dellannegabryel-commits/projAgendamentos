import { clsx } from 'clsx';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  {
                    'bg-primary-600 text-white': currentStep >= step.id,
                    'bg-zinc-100 text-zinc-400': currentStep < step.id,
                  }
                )}
              >
                {currentStep > step.id ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={clsx(
                  'mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300',
                  {
                    'text-primary-600': currentStep >= step.id,
                    'text-zinc-400': currentStep < step.id,
                  }
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-4 transition-colors duration-300',
                  {
                    'bg-primary-600': currentStep > step.id,
                    'bg-zinc-200': currentStep <= step.id,
                  }
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}