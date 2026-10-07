import React from "react";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "calc(100vh - 80px)",
      width: "100%",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: "2.5rem", color: "#00a896" }}></i>
      <p style={{ color: "#666", fontWeight: 500, fontSize: "16px" }}>Loading Report...</p>
    </div>
  );
}
