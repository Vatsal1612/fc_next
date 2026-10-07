"use client";

import { useEffect, useState } from "react";
import { setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/facility.html → React.
 * Inline onclick handlers (showFormPanel / showListPanel) ported into one
 * useEffect that wires the two cards' show/hide via addEventListener.
 * The external sidebar-loader.js is dropped — the shell renders the sidebar.
 */
export default function FacilityPage() {
  const shopId =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("shop_id"))
      : 0;

  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<number[]>([]);

  const [facilityRequest, setFacilityRequest] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const handleFacilityChange = async (
    facilityId: number,
    checked: boolean
  ) => {
    try {
      if (checked) {
        // Add facility
        await setupService.addShopFacilities(shopId, facilityId);

        setSelectedFacilityIds((prev) => {
          if (prev.includes(facilityId)) return prev;
          return [...prev, facilityId];
        });

        console.log("Facility added:", facilityId);
      } else {
        // Delete facility
        await setupService.deleteShopFacilities(shopId, facilityId);

        setSelectedFacilityIds((prev) =>
          prev.filter((id) => id !== facilityId)
        );

        console.log("Facility deleted:", facilityId);
      }
    } catch (error) {
      console.error("Failed to update facility:", error);
    }
  };

  const handleFacilityRequest = async () => {
    if (!facilityRequest.trim()) {
      setRequestMessage("Please enter facility name.");
      return;
    }

    try {
      const response = await setupService.addShopFacilitiesRequest(
        shopId,
        facilityRequest.trim()
      );

      console.log("FACILITY REQUEST RESPONSE:", response);

      setRequestMessage(
        "We have received your request to add a new facility. Thank You!"
      );

      setFacilityRequest("");
    } catch (error) {
      console.error("Failed to request new facility:", error);

      setRequestMessage(
        "Failed to send facility request. Please try again."
      );
    }
  };

  useEffect(() => {
    const listPanel = document.getElementById("facilityListPanel");
    const requestPanel = document.getElementById("requestFacilityPanel");

    const showFormPanel = (): void => {
      if (listPanel) listPanel.style.display = "none";
      if (requestPanel) requestPanel.style.display = "block";
    };
    const showListPanel = (): void => {
      if (requestPanel) requestPanel.style.display = "none";
      if (listPanel) listPanel.style.display = "block";
    };

    const requestBtn = document.getElementById("requestNewFacilityBtn");
    const cancelBtn = document.getElementById("requestCancelBtn");

    requestBtn?.addEventListener("click", showFormPanel);
    cancelBtn?.addEventListener("click", showListPanel);

    return () => {
      requestBtn?.removeEventListener("click", showFormPanel);
      cancelBtn?.removeEventListener("click", showListPanel);
    };
  }, []);
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const facilityResponse = await setupService.getFacilityList();

        console.log("FACILITY LIST RESPONSE:", facilityResponse);

        const allFacilities = facilityResponse?.result?.table1 ?? [];

        setFacilities(allFacilities);

        const selectedResponse = await setupService.getShopFacilities(shopId);

        console.log("SELECTED SHOP FACILITIES RESPONSE:", selectedResponse);

        const selectedFacilities = selectedResponse?.data ?? [];

        // 3. Store only their IDs
        const selectedIds = selectedFacilities.map(
          (facility: any) => facility.facilityId
        );

        setSelectedFacilityIds(selectedIds);
      } catch (error) {
        console.error("Failed to load facilities:", error);
      }
    };

    loadFacilities();
  }, [shopId]);
  return (
    <div id="pg-setup-facility">
      <div className="app-container">
        {/* ═══ MAIN CONTENT ═══ */}
        <div className="main">
          <div className="page-content">
            {/* Facility List Card */}
            <div className="page-card" id="facilityListPanel">
              <div className="card-title-row">
                <div className="typ-page-heading card-title">Facility List</div>
                <div className="action-group">
                  <button
                    className="action-btn action-btn-teal"
                    id="requestNewFacilityBtn"
                  >
                    <svg viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    REQUEST NEW FACILITY
                  </button>
                  <button className="action-btn action-btn-help">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    HELP
                  </button>
                </div>
              </div>

              <table className="facility-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Facilities</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr className="facility-row" key={facility.facilityId}>
                      <td>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedFacilityIds.includes(facility.facilityId)}
                          onChange={(e) =>
                            handleFacilityChange(
                              facility.facilityId,
                              e.target.checked
                            )
                          }
                        />
                      </td>

                      <td>{facility.facilityName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Request New Facility Card */}
            <div className="page-card" id="requestFacilityPanel" style={{ display: "none" }}>
              <div className="card-title-row">
                <div className="card-title">Request New Facility</div>
              </div>
              <div className="form-body">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter facility name..."
                  value={facilityRequest}
                  onChange={(e) => {
                    setFacilityRequest(e.target.value);
                    setRequestMessage("");
                  }}
                />
                {requestMessage && (
                  <div
                    className={`request-message ${requestMessage.includes("Failed") ||
                        requestMessage.includes("Please")
                        ? "request-error"
                        : "request-success"
                      }`}
                  >
                    {requestMessage}
                  </div>
                )}
                <div className="form-actions">
                  <button
                    className="action-btn btn-send"
                    id="requestSendBtn"
                    onClick={handleFacilityRequest}
                  >
                    SEND
                  </button>
                  <button className="action-btn btn-cancel" id="requestCancelBtn">
                    CANCEL
                  </button>
                </div>
              </div>
            </div>

            <WizardFooter />
          </div>
        </div>
      </div>
    </div>
  );
}