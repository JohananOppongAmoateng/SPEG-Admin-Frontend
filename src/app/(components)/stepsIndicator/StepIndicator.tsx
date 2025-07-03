import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: {
    label: string;
    status?: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
  }[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Processing Order</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {step.status === 'processing' && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                {step.status === 'error' && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                    !
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className={`font-medium ${step.status === 'error' ? 'text-red-500' : 'text-gray-700'}`}>
                  {step.label}
                </p>
                {step.status === 'error' && step.error && (
                  <p className="text-sm text-red-500 mt-1">{step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;