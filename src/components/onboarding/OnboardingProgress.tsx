import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function OnboardingProgress({ currentStep, totalSteps, steps }: OnboardingProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStep
                    ? 'bg-[#d4a574] border-[#d4a574] text-white'
                    : index === currentStep
                    ? 'border-[#d4a574] text-[#d4a574]'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-xs mt-2 text-center max-w-[80px]">{step}</span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  index < currentStep ? 'bg-[#d4a574]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
