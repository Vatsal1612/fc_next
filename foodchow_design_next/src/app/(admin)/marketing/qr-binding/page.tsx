"use client";

import { useState, useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

// ── types ──────────────────────────────────────────────────────────────────
interface QrEntry {
  id: string;
  url: string;
}

// ── constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "qr_binding_entries";

const DEFAULT_ENTRIES: QrEntry[] = [
  { id: "Y4AVX0", url: "https://workspaceco.foodchow.com/" },
  { id: "CWBAX39", url: "https://www.foodchow.com/maharajarestaurar" },
];

// ── helpers ────────────────────────────────────────────────────────────────
function readStorage(): QrEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENTRIES;
    const parsed = JSON.parse(raw) as QrEntry[];
    // Validate it's a non-empty array of objects with id+url
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) return parsed;
    return DEFAULT_ENTRIES;
  } catch {
    return DEFAULT_ENTRIES;
  }
}

function writeStorage(entries: QrEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota exceeded – ignore */
  }
}

/** Generate a random 6-8 char uppercase alphanumeric ID. */
function generateQrId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const len = 6 + Math.floor(Math.random() * 3);
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ── component ──────────────────────────────────────────────────────────────
export default function QrBindingPage() {
  // null = not yet hydrated (prevents flash of empty table)
  const [entries, setEntries] = useState<QrEntry[] | null>(null);

  // Single effect: load from localStorage once on mount, never write here.
  useEffect(() => {
    setEntries(readStorage());
  }, []);

  // ── generate form ──────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [genError, setGenError] = useState("");

  const handleGenerate = () => {
    if (!targetUrl.trim()) {
      setGenError("Please enter a Target Redirect URL.");
      return;
    }
    setGenError("");
    const newEntry: QrEntry = { id: generateQrId(), url: targetUrl.trim() };
    const updated = [newEntry, ...(entries ?? [])];
    // Write to localStorage FIRST, then update state.
    writeStorage(updated);
    setEntries(updated);
    setTitle("");
    setTargetUrl("");
  };

  // ── update modal ───────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalId, setModalId] = useState("");
  const [modalUrl, setModalUrl] = useState("");

  const openModal = (entry: QrEntry) => {
    setModalId(entry.id);
    setModalUrl(entry.url);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const saveModal = () => {
    if (!modalUrl.trim() || !entries) return;
    const updated = entries.map((e) =>
      e.id === modalId ? { ...e, url: modalUrl.trim() } : e
    );
    // Write to localStorage FIRST, then update state.
    writeStorage(updated);
    setEntries(updated);
    closeModal();
  };

  // Don't render table until hydrated to avoid flicker
  const rows = entries ?? [];

  return (
    <div id="pg-marketing-qr-binding">
      <div className="layout">
        <div className="main">
          <div className="content-area">

            {/* ── generate card ──────────────────────────────────────── */}
            <div className="card">
              <div className="report-header">
                <h1 className="typ-page-heading report-title">QR Binding</h1>
                <div className="report-header-actions">
                  <button className="btn-help">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    HELP
                  </button>
                </div>
              </div>
              <div className="card-sub">
                Generate and bind dynamic QR codes to specific URLs for your marketing campaigns.
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">QR Identifier / Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Table 1, Front Door, Flyer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Redirect URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://workspaceco.foodchow.com/"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                  />
                  {genError && (
                    <span style={{ color: "red", fontSize: "12px" }}>{genError}</span>
                  )}
                </div>
              </div>

              <button className="btn-primary" onClick={handleGenerate}>
                <i className="fas fa-qrcode" /> GENERATE QR CODE
              </button>
            </div>

            {/* ── table card ─────────────────────────────────────────── */}
            <div className="card" style={{ paddingTop: "32px", minHeight: "300px" }}>
              <h2 style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "24px",
                color: "var(--text-dark)",
                fontFamily: "var(--font)",
              }}>
                Dynamic QR Binding
              </h2>

              <div className="table-responsive-box">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>QR Id</th>
                      <th>QR Link</th>
                      <th>Action</th>
                      <th>Redirect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries === null ? (
                      // Still loading from localStorage
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                          Loading…
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                          No QR codes yet. Generate one above.
                        </td>
                      </tr>
                    ) : (
                      rows.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.id}</td>
                          <td>
                            <div className="scrollable-link" title={entry.url}>
                              {entry.url}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-update"
                              onClick={() => openModal(entry)}
                            >
                              <i className="far fa-edit" /> UPDATE
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-open"
                              onClick={() => window.open(entry.url, "_blank", "noopener")}
                            >
                              <i className="fas fa-external-link-alt" /> OPEN
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>

      {/* ── update modal ───────────────────────────────────────────────── */}
      <div
        className={`modal-overlay${modalOpen ? " show" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      >
        <div className="modal-container">
          <div className="modal-header">
            <div className="modal-title">Update QR URL</div>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            <label className="modal-label">QR ID:</label>
            <input type="text" className="modal-input" value={modalId} readOnly />
            <label className="modal-label">New URL:</label>
            <input
              type="text"
              className="modal-input"
              value={modalUrl}
              onChange={(e) => setModalUrl(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-cancel" onClick={closeModal}>CANCEL</button>
            <button className="btn btn-update" onClick={saveModal}>UPDATE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
