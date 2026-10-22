"use client";

import React, { useState, useRef, useEffect } from "react";
import "./ReportTableFooter.css";

export interface PageSizeDropupProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
  disabled?: boolean;
}

/**
 * Custom Dropup for selecting entries per page.
 * Opens UPWARDS so it never overlaps buttons or bottom UI controls below the table.
 */
export const PageSizeDropup: React.FC<PageSizeDropupProps> = ({
  value,
  options,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (opt: number) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="rtf-dropup-container" ref={containerRef}>
      <button
        type="button"
        className={`rtf-dropup-btn ${isOpen ? "open" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <svg
          className={`rtf-dropup-caret ${isOpen ? "open" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className="rtf-dropup-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSelected}
                className={`rtf-dropup-item ${isSelected ? "active" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PageSizeDropup;
