"use client";

import React, { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getReportStepInfo } from "@/constants/reports";
import "./ReportStepFooter.css";

export interface ReportStepFooterProps {
  currentStepOverride?: number;
  totalStepsOverride?: number;
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export const ReportStepFooter: React.FC<ReportStepFooterProps> = ({
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

  const stepInfo = getReportStepInfo(pathname, currentStepOverride, totalStepsOverride);

  const stepNumber = currentStepOverride ?? stepInfo.stepNumber;
  const totalSteps = totalStepsOverride ?? stepInfo.totalSteps;

  const isFirstStep = stepNumber <= 1 || prevDisabled || (!stepInfo.prevStep && !onPrev);
  const isLastStep = stepNumber >= totalSteps || nextDisabled || (!stepInfo.nextStep && !onNext);

  // Preserve restaurant subdomain if present (e.g. /foodchowdemoindia/reports/...)
  const parts = (pathname || "").split("/").filter(Boolean);
  const adminModules = ["reports", "orders", "marketing", "menu", "setup"];
  const subdomain = parts.length > 0 && !adminModules.includes(parts[0].toLowerCase()) ? parts[0] : "";

  const resolvePath = React.useCallback(
    (p: string) => (subdomain ? `/${subdomain}${p}` : p),
    [subdomain]
  );

  // Prefetch adjacent routes for instant transitions
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
    <div className={`report-step-footer step-footer ${className}`.trim()}>
      <button
        type="button"
        className="btn-prev"
        id="prevBtn"
        disabled={isFirstStep || isPending}
        onClick={handlePrev}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "4px" }}
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
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: "4px" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default ReportStepFooter;
