"use client";

import React, { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStepInfo, WizardModuleKey } from "@/constants/wizard";
import "./WizardFooter.css";

export interface WizardFooterProps {
  module?: WizardModuleKey;
  currentStepOverride?: number;
  totalStepsOverride?: number;
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  module,
  currentStepOverride,
  totalStepsOverride,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  className = "",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const stepInfo = getStepInfo(pathname, currentStepOverride, totalStepsOverride, module);

  const stepNumber = currentStepOverride ?? stepInfo.stepNumber;
  const totalSteps = totalStepsOverride ?? stepInfo.totalSteps;

  const isFirstStep = stepNumber <= 1 || prevDisabled || (!stepInfo.prevStep && !onPrev);
  const isLastStep = stepNumber >= totalSteps || nextDisabled || (!stepInfo.nextStep && !onNext);

  // Preserve restaurant subdomain if present (e.g. /foodchowdemoindia/setup/...)
  const subdomain = stepInfo.subdomain;
  const resolvePath = React.useCallback(
    (p: string) => (subdomain ? `/${subdomain}${p}` : p),
    [subdomain]
  );

  // Automatically prefetch adjacent routes for instant transitions
  useEffect(() => {
    if (stepInfo.prevStep?.path) {
      router.prefetch(resolvePath(stepInfo.prevStep.path));
    }
    if (stepInfo.nextStep?.path) {
      router.prefetch(resolvePath(stepInfo.nextStep.path));
    }
  }, [stepInfo.prevStep?.path, stepInfo.nextStep?.path, router, resolvePath]);

  const handlePrev = () => {
    if (isFirstStep || isPending) return;
    if (onPrev) {
      onPrev();
    } else if (stepInfo.prevStep) {
      startTransition(() => {
        router.push(resolvePath(stepInfo.prevStep!.path));
      });
    }
  };

  const handleNext = () => {
    if (isLastStep || isPending) return;
    if (onNext) {
      onNext();
    } else if (stepInfo.nextStep) {
      startTransition(() => {
        router.push(resolvePath(stepInfo.nextStep!.path));
      });
    }
  };

  return (
    <div className={`wizard-footer-root step-footer wizard-footer-container ${className}`.trim()}>
      <button
        type="button"
        className="btn-prev"
        id="prevBtn"
        disabled={isFirstStep || isPending}
        onClick={handlePrev}
      >
        <svg
          className="footer-btn-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>PREVIOUS</span>
      </button>

      <div className="step-indicator">
        <span className="step-label">STEP</span>
        <span className="step-value" id="stepValue">
          {stepNumber}/{totalSteps}
        </span>
      </div>

      <button
        type="button"
        className="btn-next"
        id="nextBtn"
        disabled={isLastStep || isPending}
        onClick={handleNext}
      >
        <span>NEXT</span>
        <svg
          className="footer-btn-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default WizardFooter;
