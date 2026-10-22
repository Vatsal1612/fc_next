"use client";

import ReportPagination from "./ReportPagination";
import PageSizeDropup from "./PageSizeDropup";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "./pagination.constants";
import "./ReportTableFooter.css";

export { DEFAULT_PAGE_SIZE_OPTIONS } from "./pagination.constants";
export { PageSizeDropup } from "./PageSizeDropup";

export interface ReportTableFooterProps {
  /** Current page (1-indexed). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of records (used for "Showing X to Y of Z" text). */
  totalRecords: number;
  /** Records per page. */
  pageSize: number;
  /** Called when user clicks a page button or Back/Next. */
  onPageChange: (page: number) => void;
  /** Called when user changes the "Show N entries" dropdown. Also resets page to 1. */
  onPageSizeChange: (size: number) => void;
  /** When true, pagination buttons are disabled (e.g. while loading). */
  disabled?: boolean;
  /** Extra class applied to the root element. */
  className?: string;
  /** Options for entries per page. Defaults to [10, 20, 50]. */
  pageSizeOptions?: number[];
}

/**
 * Standardised table footer used across ALL report pages.
 *
 * Layout:
 *   [Show 10 ▾ entries]   Showing X to Y of Z entries   [< Back  1  Next >]
 *
 * Rules:
 * - Hidden entirely when totalRecords === 0 (no data / not yet loaded).
 * - "Show entries" is on the LEFT.
 * - "Showing X to Y of Z" is centred.
 * - ReportPagination is on the RIGHT.
 */
export const ReportTableFooter: React.FC<ReportTableFooterProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  className = "",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}) => {
  if (totalRecords === 0) return null;

  const validOptions = Array.from(new Set([...pageSizeOptions, pageSize])).sort((a, b) => a - b);

  return (
    <div className={`report-table-footer ${className}`.trim()}>
      <div className="rtf-left">
        <div className="rtf-show-entries">
          <span className="rtf-label">Show</span>
          <PageSizeDropup
            value={pageSize}
            options={validOptions}
            onChange={onPageSizeChange}
            disabled={disabled}
          />
          <span className="rtf-label">entries</span>
        </div>
      </div>

      <ReportPagination
        currentPage={currentPage}
        totalPages={Math.max(1, totalPages)}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        disabled={disabled}
        className="rtf-pagination"
      />
    </div>
  );
};

export default ReportTableFooter;
