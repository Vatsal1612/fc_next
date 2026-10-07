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
}

export const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
}) => {
  if (totalPages <= 0) return null;

  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Generates only the current page number for the minimal pagination style
  const getPageNumbers = (): (number | string)[] => {
    return [validCurrentPage];
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
    <nav
      className={`report-pagination-container ${className}`.trim()}
      aria-label="Report table pagination"
    >
      <button
        type="button"
        className="report-pagination-btn prev-btn"
        disabled={validCurrentPage <= 1 || disabled}
        onClick={handlePrev}
      >
        <span style={{ marginRight: "4px", fontSize: "14px", fontWeight: "600" }}>&lt;</span>
        Back
      </button>

      {pageNumbers.map((item, index) => {
        if (typeof item === "string") {
          return (
            <span key={`ellipsis-${index}`} className="report-pagination-ellipsis">
              &hellip;
            </span>
          );
        }

        const isSelected = item === validCurrentPage;
        return (
          <button
            key={`page-${item}`}
            type="button"
            className={`report-pagination-btn ${isSelected ? "active" : ""}`}
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

      <button
        type="button"
        className="report-pagination-btn next-btn"
        disabled={validCurrentPage >= totalPages || disabled}
        onClick={handleNext}
      >
        Next
        <span style={{ marginLeft: "4px", fontSize: "14px", fontWeight: "600" }}>&gt;</span>
      </button>
    </nav>
  );
};

export default ReportPagination;
