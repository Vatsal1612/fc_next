"use client";

import React from "react";
import "./ReportLoadingSkeleton.css";

export interface ReportLoadingSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const ReportLoadingSkeleton: React.FC<ReportLoadingSkeletonProps> = ({
  rows = 6,
  columns = 5,
  className = "",
}) => {
  const colCount = Math.max(2, columns);
  const rowCount = Math.max(3, rows);

  return (
    <div className={`report-loading-skeleton ${className}`.trim()} role="status" aria-live="polite">
      <div className="rls-spinner-row">
        <span className="rls-spinner" aria-hidden="true" />
        <span>Loading report…</span>
      </div>
      <div className="rls-table" aria-hidden="true">
        <div className="rls-header">
          {Array.from({ length: colCount }).map((_, i) => (
            <span key={`h-${i}`} className="rls-bar rls-bar-header" />
          ))}
        </div>
        {Array.from({ length: rowCount }).map((_, r) => (
          <div className="rls-row" key={`r-${r}`}>
            {Array.from({ length: colCount }).map((_, c) => (
              <span key={`c-${r}-${c}`} className="rls-bar" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportLoadingSkeleton;
