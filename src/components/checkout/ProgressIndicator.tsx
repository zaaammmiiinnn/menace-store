'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

const STEPS = [
  { step: 1, label: '01 // CART BAG' },
  { step: 2, label: '02 // SHIPPING SPEC' },
  { step: 3, label: '03 // PAYMENT RADAR' },
] as const;

export function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="w-full border-b border-[#1C1C1C] bg-[#0A0A0A] py-3.5 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Desktop Step Bar */}
        <div className="hidden sm:flex items-center gap-6 w-full">
          {STEPS.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  onClick={() => onStepClick?.(s.step as 1 | 2 | 3)}
                  disabled={!isCompleted && !isActive}
                  className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#C6FF00] font-bold'
                      : isCompleted
                      ? 'text-[#F5F1E8] hover:text-[#C6FF00]'
                      : 'text-[#4A4A4A] cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                      isActive
                        ? 'border-[#C6FF00] bg-[#C6FF00]/10 text-[#C6FF00]'
                        : isCompleted
                        ? 'border-[#F5F1E8] bg-[#141414] text-[#F5F1E8]'
                        : 'border-[#262626] text-[#4A4A4A]'
                    }`}
                  >
                    {isCompleted ? '✓' : s.step}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[1px] ${
                      currentStep > s.step ? 'bg-[#C6FF00]/40' : 'bg-[#1C1C1C]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="flex sm:hidden items-center justify-between w-full font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C6FF00] text-[#0A0A0A]">
              STEP {currentStep} OF 3
            </span>
            <span className="text-[#F5F1E8] tracking-wider uppercase">
              {STEPS[currentStep - 1]?.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  stepNum === currentStep
                    ? 'bg-[#C6FF00] ring-2 ring-[#C6FF00]/30'
                    : stepNum < currentStep
                    ? 'bg-[#F5F1E8]'
                    : 'bg-[#262626]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
