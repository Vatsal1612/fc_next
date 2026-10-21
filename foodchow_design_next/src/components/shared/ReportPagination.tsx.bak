"use client";

import React from "react";
import "./ReportPagination.css";

export interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  totalRecords?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
  totalRecords,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  // If there are no records, or only 1 page and no size change needed, we might still want to show "Show 10 entries" if implemented.
  // But generally hide if no pages and no totalRecords.
  if (totalPages <= 1 && !totalRecords) return null;

  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Generates page numbers array with sliding window
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 9) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const maxVisible = 7;
    let start = Math.max(1, validCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      } else if (start === 1 && i === 1) {
        pages.push(1);
      } else if (end === totalPages && i === totalPages) {
        pages.push(totalPages);
      }
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return Array.from(new Set(pages));
  };

  const handlePrev = () => {
    if (validCurrentPage > 1 && !disabled) {
      onPageChange(validCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (validCurrentPage < totalPages && !disabled) {
      onPageChange(validCurrentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`report-pagination-wrapper ${className}`.trim()}>
      <div className="report-pagination-left">
        {onPageSizeChange && pageSize ? (
          <>
            Show 
            <select
              className="report-pagination-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            entries
          </>
        ) : (
          totalRecords && pageSize ? (
            <span>Showing {Math.min((validCurrentPage - 1) * pageSize + 1, totalRecords)} to {Math.min(validCurrentPage * pageSize, totalRecords)} of {totalRecords} entries</span>
          ) : null
        )}
      </div>

      {totalPages > 1 && (
        <div className="report-pagination-right">
          <button
            type="button"
            className="report-nav-text-btn"
            disabled={validCurrentPage <= 1 || disabled}
            onClick={handlePrev}
          >
            &lt; Back
          </button>

          <div className="report-page-numbers">
            {pageNumbers.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <span key={`ellipsis-${index}`} className="report-ellipsis">
                    &hellip;
                  </span>
                );
              }

              const isSelected = item === validCurrentPage;
              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  className={`report-num-btn ${isSelected ? "active" : ""}`}
                  disabled={disabled}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => {
                    if (item !== validCurrentPage && !disabled) {
                      onPageChange(item);
                    }
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="report-nav-text-btn"
            disabled={validCurrentPage >= totalPages || disabled}
            onClick={handleNext}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportPagination;
