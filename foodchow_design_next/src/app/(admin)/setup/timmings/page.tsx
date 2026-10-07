"use client";

import { useEffect, useState, useRef } from "react";
import { setupService } from "@/api/services/setup.service";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";

/**
 * setup/timmings.html → React.
 *
 * The original built the 7 day-rows with innerHTML in a DOMContentLoaded script.
 * To avoid hydration mismatch we render those rows statically here (identical
 * markup to what the script produced — "Timing" radio checked by default), then
 * port the behaviour (toggleInputs, apply-all copy, UPDATE toast) into one
 * useEffect using addEventListener.
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function TimmingsPage() {
  const [shopTimings, setShopTimings] = useState<any[]>([]);
  const shopTimingsRef = useRef<any[]>([]);
  const handleUpdate = async () => {
  try {
    const shopId = sessionStorage.getItem("shop_id");

    if (!shopId) {
      console.error("Shop ID not found");
      return;
    }

    const timings = DAYS.map((day) => {
      const row = document.getElementById(`row_${day}`);

      if (!row) {
        throw new Error(`Row not found for ${day}`);
      }

      const checkedRadio = row.querySelector<HTMLInputElement>(
        'input[type="radio"]:checked'
      );

      const inputs = row.querySelectorAll<HTMLInputElement>(".time-input");

      const existingTiming = shopTimingsRef.current.find(
        (item) => item.days_name === day
      );

      return {
        id: existingTiming?.id,
        shop_id: Number(shopId),
        days_name: day,

        open_time1: inputs[0]?.value ?? "",
        close_time1: inputs[1]?.value ?? "",

        open_time2: inputs[2]?.value ?? "",
        close_time2: inputs[3]?.value ?? "",

        open_time3: inputs[4]?.value ?? "",
        close_time3: inputs[5]?.value ?? "",

        close_day: checkedRadio?.value === "close" ? 1 : 0,

        Hrs_Day: checkedRadio?.value === "24hrs" ? 1 : 0,

        timings: checkedRadio?.value === "timings",
      };
    });

    const payload = {
      shop_id: Number(shopId),
      partner_id: 456,
      lstShopTimings: timings,
    };

    console.log("UPDATE SHOP TIMINGS PAYLOAD:", payload);

    const response = await setupService.updateShopTimings(payload);

    console.log("UPDATE SHOP TIMINGS RESPONSE:", response);

    const toast = document.getElementById("successToast");

    toast?.classList.add("show");

    setTimeout(() => {
      toast?.classList.remove("show");
    }, 2000);

  } catch (error) {
    console.error("UPDATE SHOP TIMINGS ERROR:", error);
  }
};
  useEffect(() => {
    const fetchShopTimings = async () => {
      try {
        const shopId = sessionStorage.getItem("shop_id");
        const response = await setupService.getShopTimings(Number(shopId));

        console.log("SHOP TIMINGS RESPONSE:", response);

        setShopTimings(response.data);
shopTimingsRef.current = response.data;
      } catch (error) {
        console.error("ERROR FETCHING SHOP TIMINGS:", error);
      }
    };

    fetchShopTimings();

    const days = [...DAYS];

    const toggleInputs = (day: string, enabled: boolean): void => {
      document
        .querySelectorAll<HTMLInputElement>("#pg-setup-timmings ." + day + "-time")
        .forEach((input) => {
          input.disabled = !enabled;
        });
    };

    // Wire each row's mode radios (replaces inline onchange).
    const radios = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        '#pg-setup-timmings .radio-group input[type="radio"]',
      ),
    );
    const onRadioChange = (e: Event): void => {
      const target = e.target as HTMLInputElement;
      const day = target.name.replace("mode_", "");
      toggleInputs(day, target.value === "timings");
    };
    radios.forEach((r) => r.addEventListener("change", onRadioChange));

    // Apply All checkboxes.
    const applyAlls = Array.from(
      document.querySelectorAll<HTMLInputElement>("#pg-setup-timmings .apply-all"),
    );
    const onApplyAll = function (this: HTMLInputElement): void {
      if (this.checked) {
        applyAlls.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });
        const sourceDay = this.getAttribute("data-day");
        const sourceRow = document.getElementById("row_" + sourceDay);
        if (!sourceRow) return;
        const checkedRadio = sourceRow.querySelector<HTMLInputElement>(
          'input[type="radio"]:checked',
        );
        const sourceMode = checkedRadio?.value ?? "timings";
        const sourceInputs = Array.from(
          sourceRow.querySelectorAll<HTMLInputElement>(".time-input"),
        ).map((i) => i.value);

        days.forEach((day) => {
          const targetRow = document.getElementById("row_" + day);
          if (!targetRow) return;
          const modeRadio = targetRow.querySelector<HTMLInputElement>(
            'input[value="' + sourceMode + '"]',
          );
          if (modeRadio) modeRadio.checked = true;
          toggleInputs(day, sourceMode === "timings");
          const targetInputs =
            targetRow.querySelectorAll<HTMLInputElement>(".time-input");
          targetInputs.forEach((input, index) => {
            input.value = sourceInputs[index] ?? "";
          });
        });
      }
    };
    applyAlls.forEach((cb) => cb.addEventListener("change", onApplyAll));

    
    return () => {
      radios.forEach((r) => r.removeEventListener("change", onRadioChange));
      applyAlls.forEach((cb) => cb.removeEventListener("change", onApplyAll));
    
    };
  }, []);

  return (
    <div id="pg-setup-timmings">
      <div className="app-container">
        <main className="main-content">
          <div className="container">
            <div className="page-header">
              <div className="typ-page-heading page-title">
                <h1 className="typ-page-heading" style={{ margin: 0 }}>Restaurant Timings</h1>
              </div>
              <div className="header-actions">
                <button className="btn-help">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2.5"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  HELP
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="timing-table">
                <thead>
                  <tr className="table-header">
                    <th style={{ textAlign: "left" }}>Day</th>
                    <th>Options</th>
                    <th>Open 1</th>
                    <th>Close 1</th>
                    <th>Open 2</th>
                    <th>Close 2</th>
                    <th>Open 3</th>
                    <th>Close 3</th>
                    <th>Apply All</th>
                  </tr>
                </thead>
                <tbody id="table-body">
                  {DAYS.map((day) => {
                    const timing = shopTimings.find(
                      (item) => item.days_name === day
                    );

                    return (
                      <tr
                        className="row"
                        id={"row_" + day}
                        key={day}
                      >
                        <td className="day-label">{day}</td>
                        <td data-label="Options">
                          <div className="radio-group">
                            <label className="radio-label">
                              <input type="radio" name={"mode_" + day} value="close" />{" "}
                              Close
                            </label>
                            <label className="radio-label">
                              <input type="radio" name={"mode_" + day} value="24hrs" />{" "}
                              24hr
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                name={"mode_" + day}
                                value="timings"
                                defaultChecked
                              />{" "}
                              Timing
                            </label>
                          </div>
                        </td>
                        <td data-label="Open 1">
                          <input
  type="text"
  className={"time-input " + day + "-time"}
  placeholder="00:00"
  defaultValue={timing?.open_time1 ?? ""}
/>
                        </td>
                        <td data-label="Close 1">
                          <input
  type="text"
  className={"time-input " + day + "-time"}
  placeholder="00:00"
  defaultValue={timing?.close_time1 ?? ""}
/>
                        </td>
                        <td data-label="Open 2">
                          <input
                            type="text"
                            className={"time-input " + day + "-time"}
                            placeholder="00:00"
                            defaultValue={timing?.open_time2 ?? ""}
                          />
                        </td>
                        <td data-label="Close 2">
                          <input
                            type="text"
                            className={"time-input " + day + "-time"}
                            placeholder="00:00"
                            defaultValue={timing?.close_time2 ?? ""}
                          />
                        </td>
                        <td data-label="Open 3">
                          <input
                            type="text"
                            className={"time-input " + day + "-time"}
                            placeholder="00:00"
                            defaultValue={timing?.open_time3 ?? ""}
                          />
                        </td>
                        <td data-label="Close 3">
                          <input
                            type="text"
                            className={"time-input " + day + "-time"}
                            placeholder="00:00"
                            defaultValue={timing?.close_time3 ?? ""}
                          />
                        </td>
                        <td data-label="Apply All">
                          <input
                            type="checkbox"
                            className="apply-all"
                            data-day={day}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
  type="button"
  className="update-btn"
  onClick={handleUpdate}
>
  UPDATE
</button>
          </div>
          <WizardFooter />
        </main>
      </div>

      <div id="successToast" className="toast-alert">
        <svg viewBox="0 0 24 24">
          <polyline points="22 4 12 14.01 9 11.01" />
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        </svg>
        <span>Timing Updated successfully!</span>
      </div>
    </div>
  );
}