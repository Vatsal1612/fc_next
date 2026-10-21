"use client";

import { useEffect, useState } from "react";
import { menuService } from "@/api";
import { WizardFooter } from "@/components/shared/WizardFooter";
import "./page.css";
import type { ChoiceOption, MenuChoice } from "@/api/services/menu.service";
import Swal from "sweetalert2";

export default function ChoicePage() {
  const [choices, setChoices] = useState<MenuChoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [choiceName, setChoiceName] = useState("");
  const [status, setStatus] = useState("1");
  const [optionValue, setOptionValue] = useState("");
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editChoiceId, setEditChoiceId] = useState<number | null>(null);
  const [editChoiceName, setEditChoiceName] = useState("");
  const [view, setView] = useState("list");
  const [editStatus, setEditStatus] = useState("1");
  const [editChoiceOptions, setEditChoiceOptions] = useState<ChoiceOption[]>(
    [],
  );
  const [newEditOption, setNewEditOption] = useState("");

  // ADD THESE NEW STATES FOR SEARCH AND VIEW MODE
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const response = await menuService.getChoices(3161);
        console.log(response);
        setChoices(response);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load choices");
      } finally {
        setLoading(false);
      }
    };

    fetchChoices();
  }, []);

  const addOption = () => {
    const value = optionValue.trim();

    if (!value) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please enter option.",
      });
      return;
    }

    const exists = choiceOptions.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (exists) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate",
        text: "Option already exists.",
      });
      return;
    }

    setChoiceOptions((prev) => [...prev, value]);
    setOptionValue("");
  };

  const saveChoice = async () => {
    try {
      setSaving(true);
      if (!choiceName.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Please enter choice name.",
        });
        return;
      }
      if (choiceOptions.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Please add at least one option.",
        });
        return;
      }

      const exists = choices.some(
        (item) =>
          item.preference_name.trim().toLowerCase() ===
          choiceName.trim().toLowerCase(),
      );

      if (exists) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate",
          text: "Choice already exists.",
        });
        return;
      }

      const payload = {
        shop_id: "3161",
        preference_name: choiceName.trim(),
        is_active: status,
        choice_options: choiceOptions.map((option) => ({
          option_name: option,
        })),
      };

      console.log("Payload", payload);

      await menuService.addChoice(payload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Choice Added Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setChoiceName("");
      setStatus("1");
      setChoiceOptions([]);
      setOptionValue("");

      const updatedChoices = await menuService.getChoices(3161);
      setChoices(updatedChoices);
      setView("list");
    } catch (error: any) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message ?? "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChoice = async (id: number) => {
    try {
      const response = await menuService.deleteChoice(id);
      console.log("Delete Success =>", response);
      setChoices((prev) =>
        prev.filter((choice) => choice.preference_id !== id),
      );
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Delete Failed",
      });
    }
  };

  const updateChoice = async () => {
    try {
      if (!editChoiceId) return;

      await menuService.updateChoice(editChoiceId, editChoiceName);
      await menuService.changeChoiceStatus(editChoiceId, Number(editStatus));

      const originalChoice = choices.find(
        (c) => c.preference_id === editChoiceId,
      );

      if (originalChoice) {
        for (const oldOption of originalChoice.choice_options_list) {
          const stillExists = editChoiceOptions.some(
            (o) => o.preference_option_id === oldOption.preference_option_id,
          );

          if (!stillExists) {
            await menuService.deleteChoiceOption(
              oldOption.preference_option_id,
            );
          }
        }
      }

      for (const option of editChoiceOptions) {
        if (String(option.preference_option_id).length >= 13) {
          await menuService.addChoiceOption(editChoiceId, option.option_name);
        }
      }

      const latest = await menuService.getChoices(3161);
      setChoices(latest);
      setView("list");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Choice updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Update failed.",
      });
    }
  };

  // FILTER CHOICES BASED ON SEARCH
  const filteredChoices = choices.filter((choice) =>
    choice.preference_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div id="pg-menu-choice">
      <div className="app-container">
        <main className="main-content">
          <div className="choice-panel-wrapper">
            <div className="layout">
              <div className="main">
                <div className="content-area">
                  <div className="content-card">
                    {view === "list" && (
                      <div id="choice-list-view">
                        <div className="page-header">
                          <div className="typ-page-heading page-title">
                            <h1 className="typ-page-heading" style={{ margin: 0, color: "var(--ink)" }}>Choices Management</h1>
                            <p>
                              Setup item attributes (e.g. Mild, Medium, Hot).
                            </p>
                          </div>
                          <div className="header-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => setView("add")}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Add New Choice
                            </button>
                            <button className="btn-help">
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                stroke="currentColor"
                                fill="none"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              Help
                            </button>
                          </div>
                        </div>

                        <div className="table-control-toolbar">
                          <div className="search-wrapper">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                              type="text"
                              id="choice-search-input"
                              className="search-input-field"
                              placeholder="Search choices..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>

                          <div className="view-toggle-group">
                            <button
                              className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                              id="toggle-list-mode"
                              title="Switch to List view layout"
                              onClick={() => setViewMode("list")}
                            >
                              <svg viewBox="0 0 24 24">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                              </svg>
                            </button>
                            <button
                              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                              id="toggle-grid-mode"
                              title="Switch to Grid view layout"
                              onClick={() => setViewMode("grid")}
                            >
                              <svg viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div
                          className={`list-container ${viewMode === "grid" ? "grid-mode" : ""}`}
                          id="choices-container-block"
                        >
                          <div className="list-header">
                            <div>Choices Option Name</div>
                            <div className="col-action">Action Controls</div>
                          </div>

                          {loading && (
                            <div className="list-row">
                              <div>Loading choices...</div>
                            </div>
                          )}

                          {error && (
                            <div className="list-row">
                              <div style={{ color: "red" }}>{error}</div>
                            </div>
                          )}

                          {!loading &&
                            !error &&
                            filteredChoices.length === 0 && (
                              <div
                                className="list-row"
                                style={{
                                  justifyContent: "center",
                                  textAlign: "center",
                                  padding: "40px",
                                  color: "#777",
                                  fontSize: "16px",
                                  fontWeight: 500,
                                }}
                              >
                                No Choices Available
                              </div>
                            )}

                          {!loading &&
                            !error &&
                            filteredChoices.length > 0 &&
                            filteredChoices.map((choice) => (
                              <div
                                className="list-row"
                                key={choice.preference_id}
                                data-id={choice.preference_id}
                              >
                                <div className="choice-title-text">
                                  {choice.preference_name}
                                </div>

                                <div className="row-actions">
                                  <button
                                    className="icon-btn edit"
                                    title="Edit Choice"
                                    onClick={() => {
                                      setEditChoiceId(choice.preference_id);
                                      setEditChoiceName(choice.preference_name);
                                      setEditChoiceOptions(
                                        choice.choice_options_list,
                                      );
                                      setEditStatus(String(choice.is_active));
                                      setView("edit");
                                    }}
                                  >
                                    <svg viewBox="0 0 24 24">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>

                                  <button
                                    className="icon-btn delete"
                                    title="Delete Choice"
                                    onClick={async () => {
                                      const result = await Swal.fire({
                                        title: "Are you sure?",
                                        text: "You won't be able to recover this choice.",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#d33",
                                        cancelButtonColor: "#3085d6",
                                        confirmButtonText: "Yes, Delete",
                                      });

                                      if (result.isConfirmed) {
                                        handleDeleteChoice(
                                          choice.preference_id,
                                        );
                                      }
                                    }}
                                  >
                                    <svg viewBox="0 0 24 24">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>

                                  <label className="toggle-switch">
                                    <input
                                      type="checkbox"
                                      checked={choice.is_active === 1}
                                      onChange={async (e) => {
                                        const newStatus = e.target.checked
                                          ? 1
                                          : 0;

                                        try {
                                          await menuService.changeChoiceStatus(
                                            choice.preference_id,
                                            newStatus,
                                          );

                                          const latestChoices =
                                            await menuService.getChoices(3161);

                                          setChoices(latestChoices);

                                          Swal.fire({
                                            icon: "success",
                                            title: "Updated",
                                            text: "Status updated successfully.",
                                            timer: 1200,
                                            showConfirmButton: false,
                                          });
                                        } catch (error) {
                                          console.error(error);
                                          Swal.fire({
                                            icon: "error",
                                            title: "Error",
                                            text: "Status update failed.",
                                          });
                                        }
                                      }}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {view === "add" && (
                      <div id="add-choice-form-view">
                        <div className="page-header">
                          <div className="page-title">
                            <h1>Add New Choice</h1>
                            <p>
                              Create a global selection modifier item group
                              template
                            </p>
                          </div>
                        </div>

                        <div className="form-container">
                          <div className="form-group">
                            <label>
                              Choices Name<span>*</span>
                            </label>

                            <input
                              type="text"
                              className="form-input-field"
                              placeholder="Enter choice name (e.g., Level of Spice)"
                              value={choiceName}
                              onChange={(e) => setChoiceName(e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Status<span>*</span>
                            </label>
                            <div className="radio-flex-row">
                              <label className="radio-custom-label">
                                <input
                                  type="radio"
                                  name="choice-status"
                                  checked={status === "1"}
                                  onChange={() => setStatus("1")}
                                />
                                Active
                              </label>

                              <label className="radio-custom-label">
                                <input
                                  type="radio"
                                  name="choice-status"
                                  checked={status === "0"}
                                  onChange={() => setStatus("0")}
                                />
                                De-Active
                              </label>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              Add Choice Option Value<span>*</span>
                            </label>

                            <div className="inline-input-group">
                              <input
                                type="text"
                                className="form-input-field"
                                placeholder="e.g. Extra Hot"
                                value={optionValue}
                                onChange={(e) => setOptionValue(e.target.value)}
                              />

                              <button
                                type="button"
                                className="btn-inline-add"
                                onClick={addOption}
                              >
                                + Add Option
                              </button>
                            </div>
                            {choiceOptions.length > 0 && (
                              <div className="options-display-container">
                                {choiceOptions.map((option, index) => (
                                  <div
                                    key={index}
                                    className="saved-option-item"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: "12px",
                                      gap: "10px",
                                    }}
                                  >
                                    <input
                                      type="text"
                                      className="form-input-field"
                                      value={option}
                                      readOnly
                                    />

                                    <button
                                      type="button"
                                      className="option-delete-btn"
                                      onClick={() =>
                                        setChoiceOptions(
                                          choiceOptions.filter(
                                            (_, i) => i !== index,
                                          ),
                                        )
                                      }
                                    >
                                      <svg viewBox="0 0 24 24">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="form-actions-row">
                            <button
                              className="btn btn-primary"
                              type="button"
                              onClick={saveChoice}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save Choice"}
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => setView("list")}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {view === "edit" && (
                      <div id="edit-choice-form-view">
                        <div className="page-header">
                          <div className="page-title">
                            <h1>Edit Choice Group</h1>
                            <p>
                              Modify and re-arrange specific options metrics
                            </p>
                          </div>
                        </div>

                        <div className="form-container">
                          <div className="form-group">
                            <label>
                              Choice Name<span>*</span>
                            </label>

                            <input
                              type="text"
                              className="form-input-field"
                              value={editChoiceName}
                              onChange={(e) =>
                                setEditChoiceName(e.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Status<span>*</span>
                            </label>
                            <div className="radio-flex-row">
                              <label className="radio-custom-label">
                                <input
                                  type="radio"
                                  name="edit-choice-status"
                                  checked={editStatus === "1"}
                                  onChange={() => setEditStatus("1")}
                                />
                                Active
                              </label>
                              <label className="radio-custom-label">
                                <input
                                  type="radio"
                                  name="edit-choice-status"
                                  checked={editStatus === "0"}
                                  onChange={() => setEditStatus("0")}
                                />
                                De-Active
                              </label>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>
                              Add Choice Option Values<span>*</span>
                            </label>
                            <div className="inline-input-group">
                              <input
                                type="text"
                                className="form-input-field"
                                placeholder="Add custom item option item"
                                value={newEditOption}
                                onChange={(e) =>
                                  setNewEditOption(e.target.value)
                                }
                              />

                              <button
                                type="button"
                                className="btn-inline-add"
                                onClick={() => {
                                  if (!newEditOption.trim()) return;

                                  setEditChoiceOptions((prev) => [
                                    ...prev,
                                    {
                                      preference_option_id: Date.now(),
                                      option_name: newEditOption,
                                      is_active: 1,
                                      sold_out_flag: 0,
                                    },
                                  ]);

                                  setNewEditOption("");
                                }}
                              >
                                + Add
                              </button>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Current Configured Options</label>
                            <div className="options-display-container">
                              <div className="options-display-container">
                                {editChoiceOptions.map((option) => (
                                  <div
                                    key={option.preference_option_id}
                                    className="saved-option-item"
                                  >
                                    <input
                                      type="text"
                                      className="form-input-field"
                                      value={option.option_name}
                                      readOnly
                                    />

                                    <button
                                      className="option-delete-btn"
                                      type="button"
                                      onClick={() => {
                                        setEditChoiceOptions((prev) =>
                                          prev.filter(
                                            (item) =>
                                              item.preference_option_id !==
                                              option.preference_option_id,
                                          ),
                                        );
                                      }}
                                    >
                                      <svg viewBox="0 0 24 24">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="form-actions-row">
                            <button
                              className="btn btn-primary"
                              type="button"
                              onClick={updateChoice}
                            >
                              Update &amp; Save
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => setView("list")}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <WizardFooter />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
