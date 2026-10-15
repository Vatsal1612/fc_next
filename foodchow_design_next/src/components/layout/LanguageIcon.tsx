import React from "react";

export function LanguageIcon({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* Back card */}
      <rect
        x="6"
        y="5"
        width="15"
        height="15.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="var(--sidebar-bg, #ffffff)"
      />
      {/* Back card symbol (文) */}
      <text
        x="15.8"
        y="16.2"
        fill="currentColor"
        fontSize="8"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        文
      </text>

      {/* Front card with A */}
      <rect
        x="2.5"
        y="2.5"
        width="15"
        height="15.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="var(--sidebar-bg, #ffffff)"
      />
      <text
        x="10"
        y="14"
        fill="currentColor"
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        A
      </text>
    </svg>
  );
}
