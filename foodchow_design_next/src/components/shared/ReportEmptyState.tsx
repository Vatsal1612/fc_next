"use client";

import React from "react";
import "./ReportEmptyState.css";

export interface ReportEmptyStateProps {
  message?: string;
  className?: string;
}

export const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({
  message = "No Records Found",
  className = "",
}) => {
  return (
    <div className={`report-empty-state ${className}`.trim()} role="status">
      <p className="report-empty-message">{message}</p>
    </div>
  );
};

export default ReportEmptyState;
