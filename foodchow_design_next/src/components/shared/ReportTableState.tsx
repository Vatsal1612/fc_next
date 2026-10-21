"use client";

import React from "react";
import ReportLoadingSkeleton from "./ReportLoadingSkeleton";

export interface ReportTableStateProps {
  loading: boolean;
  hasData?: boolean;
  children: React.ReactNode;
  emptyMessage?: string;
  columns?: number;
  rows?: number;
}

/**
 * Shared empty/loading gate for report tables.
 */
export const ReportTableState: React.FC<ReportTableStateProps> = ({
  loading,
  children,
  columns = 5,
  rows = 6,
}) => {
  if (loading) {
    return <ReportLoadingSkeleton columns={columns} rows={rows} />;
  }

  return <>{children}</>;
};

export default ReportTableState;
