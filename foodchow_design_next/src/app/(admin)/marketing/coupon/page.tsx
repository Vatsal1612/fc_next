"use client";

import { useEffect } from "react";
import { WizardFooter } from "@/components/shared/WizardFooter";
import Swal from "sweetalert2";
import "./page.css";
import { marketingService, AddCouponPayload } from "@/api/services/marketing.service";
/**
 * marketing/coupon.html → React.
 * Same markup/design as before. This version wires the list to the real
 * Add / Update / Delete / Status APIs and uses SweetAlert2 for confirm and
 * success/error feedback instead of the old native confirm + toast.
 *
 * Fields not present on the form (expires, availability, specific, is_online,
 * items) are sent with sensible defaults since the UI has no inputs for them.
 */


interface Coupon {
  id: number;
  type: string;
  desc: string;
  applyOn: string;
  code: string;
  discountIn: string;
  minOrder: number;
  discount: number;
  autoApply: string;
  status: string;
  orderMethod: string[];
}

// applyon numeric <-> label mapping used by the API
const APPLY_ON_MAP: Record<string, number> = {
  "Only once per Client": 1,
  "Only Returning Client": 2,
  "Only New Client": 3,
  "Any Client, New or Returning": 4,
};
const APPLY_ON_REVERSE: Record<number, string> = {
  1: "Only once per Client",
  2: "Only Returning Client",
  3: "Only New Client",
  4: "Any Client, New or Returning",
};

// order method label -> bitmask code used by Add/Update payload
const ORDER_METHOD_CODE: Record<string, number> = {
  Dinein: 1,
  TakeAway: 2,
  HomeDelivery: 4,
};

function defaultExpiry(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 23);
}
// order_method comes back from the API as a bitmask number string (e.g. "5" = Dinein+HomeDelivery)
function decodeOrderMethod(raw: string): string[] {
  const code = Number(raw) || 0;
  const result: string[] = [];
  if (code & 1) result.push("Dinein");
  if (code & 2) result.push("TakeAway");
  if (code & 4) result.push("HomeDelivery");
  return result;
}
export default function CouponPage() {
  useEffect(() => {
    const shopIdStr = sessionStorage.getItem("shop_id");
    const SHOP_ID = shopIdStr ? Number(shopIdStr) : 0;

    const $ = (id: string) => document.getElementById(id);
    let coupons: Coupon[] = [];
    let editingId: number | null = null;

    const inputVal = (id: string): string => ($(id) as HTMLInputElement | null)?.value ?? "";
    const setVal = (id: string, v: string): void => {
      const el = $(id) as HTMLInputElement | null;
      if (el) el.value = v;
    };
    const setText = (id: string, v: string): void => {
      const el = $(id);
      if (el) el.textContent = v;
    };

    function showList(): void {
      $("viewList")?.classList.add("active");
      $("viewForm")?.classList.remove("active");
      const mc = document.querySelector(".main-content") as HTMLElement | null;
      if (mc) mc.scrollTop = 0;
      updateStats();
    }
    function showFormView(): void {
      $("viewList")?.classList.remove("active");
      $("viewForm")?.classList.add("active");
      const mc = document.querySelector(".main-content") as HTMLElement | null;
      if (mc) mc.scrollTop = 0;
    }
    function showAddForm(): void {
      editingId = null;
      resetForm();
      setText("formTitle", "Add New Coupon");
      setText("formSubtitle", "Fill in the details below to create a promotional coupon");
      setText("formSubmitBtn", "SAVE COUPON");
      setText("formSubmitBtn2", "SAVE COUPON");
      showFormView();
      updatePreview();
    }
    function showEditForm(id: number): void {
      const c = coupons.find((x) => x.id === id);
      if (!c) return;
      editingId = id;
      resetForm();
      setText("formTitle", "Edit Coupon");
      setText("formSubtitle", "Update the coupon details below");
      setText("formSubmitBtn", "UPDATE COUPON");
      setText("formSubmitBtn2", "UPDATE COUPON");
      setVal("fType", c.type);
      setVal("fDesc", c.desc);
      setVal("fCode", c.code);
      setVal("fMinOrder", String(c.minOrder));
      setVal("fDiscount", String(c.discount));
      document.querySelectorAll<HTMLInputElement>('input[name="applyOn"]').forEach((r) => { r.checked = r.value === c.applyOn; });
      document.querySelectorAll<HTMLInputElement>('input[name="discountIn"]').forEach((r) => { r.checked = r.value === c.discountIn; });
      document.querySelectorAll<HTMLInputElement>('input[name="autoApply"]').forEach((r) => { r.checked = r.value === c.autoApply; });
      document.querySelectorAll<HTMLInputElement>('input[name="status"]').forEach((r) => { r.checked = r.value === c.status; });
      document.querySelectorAll<HTMLInputElement>('input[name="orderMethod"]').forEach((cb) => { cb.checked = c.orderMethod.includes(cb.value); });
      showFormView();
      updatePreview();
    }
    function updatePreview(): void {
      const type = inputVal("fType") || "Coupon Type";
      const code = inputVal("fCode") || "YOURCODE";
      const minOrder = inputVal("fMinOrder");
      const discount = inputVal("fDiscount");
      const discIn = document.querySelector<HTMLInputElement>('input[name="discountIn"]:checked')?.value;
      const methods = [...document.querySelectorAll<HTMLInputElement>('input[name="orderMethod"]:checked')].map((cb) => cb.value);
      const applyOn = document.querySelector<HTMLInputElement>('input[name="applyOn"]:checked')?.value;
      setText("pvType", type.toUpperCase());
      setText("pvCode", code.toUpperCase());
      let discText = "— discount —";
      if (discount && discIn) discText = discIn === "%" ? `${discount}% OFF` : `Rs. ${discount} OFF`;
      setText("pvDiscount", discText);
      setText("pvMinOrder", minOrder ? `Min. order: Rs. ${minOrder}` : "Min. order: —");
      const tagsEl = $("pvTags");
      if (tagsEl) {
        tagsEl.innerHTML = "";
        methods.forEach((m) => {
          const t = document.createElement("span");
          t.className = "cv-tag";
          t.textContent = m === "Dinein" ? "Dine In" : m === "TakeAway" ? "Take Away" : "Delivery";
          tagsEl.appendChild(t);
        });
        if (applyOn) {
          const t = document.createElement("span");
          t.className = "cv-tag";
          t.style.background = "#5d6b78";
          t.textContent = applyOn.length > 20 ? applyOn.substring(0, 18) + "…" : applyOn;
          tagsEl.appendChild(t);
        }
      }
    }
    function generateCode(): void {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
      setVal("fCode", code);
      updatePreview();
    }
    function h(s: string | number): string {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function renderTable(data?: Coupon[]): void {
      const list = data || coupons;
      const tbody = $("couponTbody");
      const empty = $("emptyState");
      if (!tbody || !empty) return;
      if (!list.length) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
      }
      empty.style.display = "none";
      tbody.innerHTML = list
        .map((c) => {
          const disc = c.discountIn === "%" ? `${c.discount}%` : `Rs. ${c.discount}`;
          return `<tr><td class="type-col">${h(c.type)}</td><td>${h(c.applyOn)}</td><td><span class="coupon-code-pill">${h(c.code)}</span></td><td>${disc}</td><td>Rs. ${c.minOrder}</td><td><span class="badge-${c.autoApply === "Yes" ? "yes" : "no"}">${c.autoApply}</span></td><td><label class="toggle-switch" title="Active / Deactive"><input type="checkbox" ${c.status === "Active" ? "checked" : ""} data-toggle-id="${c.id}"><span class="slider"></span></label></td><td><div class="act-btns"><button class="icon-btn edit-btn" title="Edit" data-edit-id="${c.id}"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="icon-btn delete-btn" title="Delete" data-delete-id="${c.id}"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></td></tr>`;
        })
        .join("");
    }
    function filterTable(): void {
      const q = inputVal("searchInput").toLowerCase();
      const filtered = q
        ? coupons.filter((c) => c.type.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
        : coupons;
      renderTable(filtered);
    }
    function updateStats(): void {
      setText("statTotal", String(coupons.length));
      setText("statActive", String(coupons.filter((c) => c.status === "Active").length));
      setText("statInactive", String(coupons.filter((c) => c.status !== "Active").length));
      setText("statAutoApply", String(coupons.filter((c) => c.autoApply === "Yes").length));
    }

    // ── STATUS TOGGLE (API) ──
    const pendingStatusUpdates = new Set<number>();

    async function toggleStatus(id: number, checked: boolean): Promise<void> {
      if (!id || !SHOP_ID) {
        Swal.fire({ icon: "error", title: "Error", text: "Invalid Shop ID or Coupon ID." });
        renderTable(); // revert UI toggle
        return;
      }

      if (pendingStatusUpdates.has(id)) return;
      pendingStatusUpdates.add(id);

      const newStatus = checked ? 0 : 1; // 0 = Active, 1 = DeActive

      try {
        const response = await marketingService.updateCouponStatus(id, SHOP_ID, newStatus);

        // Inspect actual response fields
        if (response && response.response_code !== undefined && String(response.response_code) !== "1") {
          throw new Error(response.message || "Failed to update coupon status.");
        }

        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: checked ? "Coupon activated" : "Coupon deactivated",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refetch the coupon list after a successful status update
        await loadCoupons();
      } catch (err: any) {
        console.error(err);
        renderTable(); // revert UI toggle to actual state
        Swal.fire({ icon: "error", title: "Status update failed", text: err.message || "Please try again." });
      } finally {
        pendingStatusUpdates.delete(id);
      }
    }

    function validate(): boolean {
      let ok = true;
      ([["fType", "eType"], ["fDesc", "eDesc"], ["fCode", "eCode"], ["fMinOrder", "eMinOrder"], ["fDiscount", "eDiscount"]] as Array<[string, string]>).forEach(([fid, eid]) => {
        const el = $(fid) as HTMLInputElement | null;
        const em = $(eid);
        if (el && !el.value.trim()) {
          el.classList.add("error");
          em?.classList.add("show");
          ok = false;
        } else {
          el?.classList.remove("error");
          em?.classList.remove("show");
        }
      });
      ([
        [document.querySelector('input[name="applyOn"]:checked'), "eApplyOn"],
        [document.querySelector('input[name="discountIn"]:checked'), "eDiscountIn"],
        [document.querySelector('input[name="status"]:checked'), "eStatus"],
      ] as Array<[Element | null, string]>).forEach(([val, eid]) => {
        const em = $(eid);
        if (!val) {
          em?.classList.add("show");
          ok = false;
        } else {
          em?.classList.remove("show");
        }
      });
      const methods = document.querySelectorAll('input[name="orderMethod"]:checked');
      const eOM = $("eOrderMethod");
      if (!methods.length) {
        eOM?.classList.add("show");
        ok = false;
      } else {
        eOM?.classList.remove("show");
      }
      return ok;
    }

    // ── ADD / UPDATE (API) ──
    async function submitForm(): Promise<void> {
      if (!validate()) return;

      const applyOnVal = document.querySelector<HTMLInputElement>('input[name="applyOn"]:checked')!.value;
      const discountInVal = document.querySelector<HTMLInputElement>('input[name="discountIn"]:checked')!.value;
      const statusVal = document.querySelector<HTMLInputElement>('input[name="status"]:checked')!.value;
      const autoApplyVal = document.querySelector<HTMLInputElement>('input[name="autoApply"]:checked')?.value || "No";
      const methods = [...document.querySelectorAll<HTMLInputElement>('input[name="orderMethod"]:checked')].map((cb) => cb.value);
      const orderMethodCode = methods.reduce((sum, m) => sum + (ORDER_METHOD_CODE[m] || 0), 0);

      const payload: AddCouponPayload = {
        id: editingId ?? 0,
        shop_id: String(SHOP_ID),
        type: inputVal("fType").trim(),
        description: inputVal("fDesc").trim(),
        applyon: APPLY_ON_MAP[applyOnVal] || 0,
        couponcode: inputVal("fCode").trim().toUpperCase(),
        expires: defaultExpiry(),
        discount_in: discountInVal === "%" ? 1 : 0,
        discount: inputVal("fDiscount").trim(),
        availability: 0,
        status: statusVal === "Active" ? 0 : 1,
        min_order_amount: inputVal("fMinOrder").trim(),
        auto_apply: autoApplyVal === "Yes" ? 1 : 0,
        specific: 3,
        is_online: 1,
        order_method: String(orderMethodCode || 0),
        items: null,
      };

      try {
        if (editingId !== null) {
          if (!editingId || !SHOP_ID) {
            Swal.fire({ icon: "error", title: "Error", text: "Invalid Coupon ID or Shop ID." });
            return;
          }

          const res = await marketingService.updateCoupon(payload);

          // Check if response indicates success:
          const isSuccess = Boolean(
            res && (
              String(res.response_code) === "1" ||
              (typeof res.message === "string" && (
                res.message.toLowerCase().includes("updated") ||
                res.message.toLowerCase().includes("success") ||
                res.message.toLowerCase().includes("successfully")
              ))
            )
          );

          if (!isSuccess) {
            const errorMsg = res?.message || "Failed to update coupon.";
            Swal.fire({
              icon: "error",
              title: "Failed to Update Coupon",
              text: errorMsg,
            });
            // Do NOT close/reset form, do NOT refetch
            return;
          }

          await Swal.fire({
            icon: "success",
            title: res.message || "Coupon updated successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          const res = await marketingService.addCoupon(payload);

          // AddCouponWDForPos uses response_code "0" for BOTH success and failure.
          // Check the message string for success condition:
          const isSuccess = Boolean(
            res &&
            typeof res.message === "string" &&
            res.message.toLowerCase().includes("successfully")
          );

          if (!isSuccess) {
            const errorMsg = res?.message || "Failed to add coupon.";
            Swal.fire({
              icon: "error",
              title: "Failed to Add Coupon",
              text: errorMsg,
            });
            // Do NOT close/reset form, do NOT refetch
            return;
          }

          await Swal.fire({
            icon: "success",
            title: res.message || "Your Coupon has been added successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        }
        await loadCoupons();
        showList();
      } catch (err: any) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Action Failed", text: err.message || "Something went wrong. Please try again." });
      }
    }

    function resetForm(): void {
      ["fType", "fDesc", "fCode", "fMinOrder", "fDiscount"].forEach((id) => {
        const el = $(id) as HTMLInputElement | null;
        if (el) {
          el.value = "";
          el.classList.remove("error");
        }
      });
      ["eType", "eDesc", "eCode", "eMinOrder", "eDiscount", "eApplyOn", "eDiscountIn", "eStatus", "eOrderMethod"].forEach((id) => {
        $(id)?.classList.remove("show");
      });
      document.querySelectorAll<HTMLInputElement>('input[name="applyOn"],input[name="discountIn"],input[name="status"]').forEach((r) => { r.checked = false; });
      document.querySelectorAll<HTMLInputElement>('input[name="autoApply"]').forEach((r) => { r.checked = r.value === "No"; });
      document.querySelectorAll<HTMLInputElement>('input[name="orderMethod"]').forEach((cb) => { cb.checked = false; });
    }

    // ── DELETE (API + SweetAlert confirm) ──
    const pendingDeletes = new Set<number>();

    function askDelete(id: number): void {
      if (!id || !SHOP_ID) {
        Swal.fire({ icon: "error", title: "Error", text: "Invalid Shop ID or Coupon ID." });
        return;
      }
      if (pendingDeletes.has(id)) return;

      Swal.fire({
        icon: "warning",
        title: "Delete Coupon?",
        text: "Are you sure you want to delete this coupon? This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          pendingDeletes.add(id);
          try {
            const response = await marketingService.deleteCoupon(SHOP_ID, id);
            // Inspect actual response fields
            if (response && response.response_code !== undefined && String(response.response_code) !== "1") {
              throw new Error(response.message || "Failed to delete coupon.");
            }
            return true;
          } catch (err: any) {
            Swal.showValidationMessage(err.message || "Delete failed. Please try again.");
            return false;
          } finally {
            pendingDeletes.delete(id);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({ icon: "success", title: "Coupon deleted", timer: 1500, showConfirmButton: false });
          loadCoupons(); // Refetch the list dynamically
        }
      });
    }

    // ── Step nav ──
    let currentStep = 1;
    const totalSteps = 5;
    const prevBtn = $("prevBtn");
    const nextBtn = $("nextBtn");
    const onPrev = () => {
      if (currentStep > 1) {
        currentStep--;
        setText("stepValue", currentStep + "/" + totalSteps);
      }
    };
    const onNext = () => {
      if (currentStep < totalSteps) {
        currentStep++;
        setText("stepValue", currentStep + "/" + totalSteps);
      }
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    // ── Wire static on* handlers ──
    const addNewBtn = document.querySelector(".list-header-btns .btn-primary") as HTMLElement | null;
    addNewBtn?.addEventListener("click", showAddForm);

    const searchInput = $("searchInput") as HTMLInputElement | null;
    searchInput?.addEventListener("input", filterTable);

    const discardBtns: Array<[HTMLElement | null, () => void]> = [];
    document.querySelectorAll<HTMLButtonElement>(".form-topbar-actions .btn-cancel2, .form-actions-bar .btn-cancel2, .back-btn").forEach((b) => {
      const fn = () => showList();
      b.addEventListener("click", fn);
      discardBtns.push([b, fn]);
    });
    const submitBtns: Array<[HTMLElement | null, () => void]> = [];
    [$("formSubmitBtn"), $("formSubmitBtn2")].forEach((b) => {
      const fn = () => { submitForm(); };
      b?.addEventListener("click", fn);
      submitBtns.push([b, fn]);
    });

    const genBtn = document.querySelector(".btn-gen") as HTMLElement | null;
    const onGen = () => generateCode();
    genBtn?.addEventListener("click", onGen);

    // ── Live-preview wiring ──
    const fCode = $("fCode") as HTMLInputElement | null;
    const onFCodeInput = function (this: HTMLInputElement) {
      this.value = this.value.toUpperCase();
      updatePreview();
    };
    fCode?.addEventListener("input", onFCodeInput);

    const previewInputIds = ["fType", "fDesc", "fMinOrder", "fDiscount"];
    const previewInputListeners: Array<[HTMLElement | null, () => void]> = [];
    previewInputIds.forEach((id) => {
      const el = $(id);
      const fn = () => updatePreview();
      el?.addEventListener("input", fn);
      previewInputListeners.push([el, fn]);
    });

    const radioCbs = document.querySelectorAll<HTMLInputElement>('input[name="discountIn"],input[name="applyOn"],input[name="orderMethod"],input[name="status"],input[name="autoApply"]');
    const onRadioChange = () => updatePreview();
    radioCbs.forEach((el) => el.addEventListener("change", onRadioChange));

    const clearErrPairs: Array<[string, string]> = [["fType", "eType"], ["fDesc", "eDesc"], ["fCode", "eCode"], ["fMinOrder", "eMinOrder"], ["fDiscount", "eDiscount"]];
    const clearErrListeners: Array<[HTMLElement | null, () => void]> = [];
    clearErrPairs.forEach(([fid, eid]) => {
      const el = $(fid);
      const fn = function (this: HTMLElement) {
        this.classList.remove("error");
        $(eid)?.classList.remove("show");
      };
      el?.addEventListener("input", fn);
      clearErrListeners.push([el, fn]);
    });

    // ── Event delegation for dynamically rendered table rows ──
    const tbody = $("couponTbody");
    const onTbodyClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest<HTMLElement>("[data-edit-id]");
      if (editBtn) {
        showEditForm(Number(editBtn.dataset.editId));
        return;
      }
      const deleteBtn = target.closest<HTMLElement>("[data-delete-id]");
      if (deleteBtn) {
        askDelete(Number(deleteBtn.dataset.deleteId));
      }
    };
    const onTbodyChange = (e: Event) => {
      const target = e.target as HTMLElement;
      const toggle = target.closest<HTMLInputElement>("[data-toggle-id]");
      if (toggle) {
        toggleStatus(Number(toggle.dataset.toggleId), toggle.checked);
      }
    };
    tbody?.addEventListener("click", onTbodyClick);
    tbody?.addEventListener("change", onTbodyChange);

    // ── Load from API ──
    async function loadCoupons() {
      if (!SHOP_ID) {
        console.error("Invalid or missing Shop_Id");
        Swal.fire({ icon: "error", title: "Error", text: "Missing Shop ID. Please log in again." });
        renderTable([]);
        return;
      }

      const tbody = $("couponTbody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;">Loading coupons...</td></tr>`;
      }

      try {
        const result = await marketingService.getCoupons(SHOP_ID);
        coupons = result.map((item) => ({
          id: item.id,
          type: item.type,
          desc: item.description,
          applyOn: APPLY_ON_REVERSE[item.applyon] || String(item.applyon),
          code: item.couponcode,
          discountIn: item.discount_in === 0 ? "Rs." : "%",
          minOrder: Number(item.min_order_amount),
          discount: item.discount,
          autoApply: item.auto_apply === 1 ? "Yes" : "No",
          status: item.status === 0 ? "Active" : "DeActive",
          orderMethod: decodeOrderMethod(item.order_method),
        }));
        renderTable();
        updateStats();
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Failed to load coupons", text: "Please try again later." });
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:red;">Failed to load coupons.</td></tr>`;
        }
      }
    };
    loadCoupons();

    return () => {
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      addNewBtn?.removeEventListener("click", showAddForm);
      searchInput?.removeEventListener("input", filterTable);
      discardBtns.forEach(([b, fn]) => b?.removeEventListener("click", fn));
      submitBtns.forEach(([b, fn]) => b?.removeEventListener("click", fn));
      genBtn?.removeEventListener("click", onGen);
      fCode?.removeEventListener("input", onFCodeInput);
      previewInputListeners.forEach(([el, fn]) => el?.removeEventListener("input", fn));
      radioCbs.forEach((el) => el.removeEventListener("change", onRadioChange));
      clearErrListeners.forEach(([el, fn]) => el?.removeEventListener("input", fn));
      tbody?.removeEventListener("click", onTbodyClick);
      tbody?.removeEventListener("change", onTbodyChange);
    };
  }, []);

  return (
    <div id="pg-marketing-coupon">
      <div className="app-container">
        <div className="main-content">
          <div className="content-area">
            <div className="view active" id="viewList">
              <div className="pg-card">
                <div className="pg-card-header">
                  <div className="list-header-left">
                    <h2 className="typ-page-heading">Promocode / Coupon</h2>
                    <p>Manage discount coupons and promotional codes for your restaurant</p>
                  </div>
                  <div className="list-header-btns">
                    <button className="btn-primary">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      ADD NEW COUPON
                    </button>
                    <button className="btn-help-hdr">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      HELP
                    </button>
                  </div>
                </div>
                <hr className="pg-divider" />
                <div className="table-card" style={{ border: "none", borderRadius: 0 }}>
                  <div className="table-card-header">
                    <span>All Coupons</span>
                    <div className="search-box">
                      <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input type="text" id="searchInput" placeholder="Search coupons…" />
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table id="couponTable">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Apply On</th>
                          <th>Coupon Code</th>
                          <th>Discount</th>
                          <th>Min. Order</th>
                          <th>Auto Apply</th>
                          <th>Status</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="couponTbody" />
                    </table>
                    <div id="emptyState" className="empty-state" style={{ display: "none" }}>
                      <svg viewBox="0 0 24 24">
                        <path d="M20 12V22H4V12" />
                        <path d="M22 7H2v5h20V7z" />
                        <path d="M12 22V7" />
                      </svg>
                      <p>No coupons yet — click &quot;Add New Coupon&quot; to create one</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="view" id="viewForm">
              <div className="form-topbar">
                <div className="form-topbar-left">
                  <button className="back-btn">
                    <svg viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                  </button>
                  <div className="form-title-block">
                    <h2 id="formTitle">Add New Coupon</h2>
                    <p id="formSubtitle">Fill in the details below to create a promotional coupon</p>
                  </div>
                </div>
                <div className="form-topbar-actions">
                  <button className="btn-cancel2">DISCARD</button>
                  <button className="btn-submit" id="formSubmitBtn">SAVE COUPON</button>
                </div>
              </div>
              <div className="form-layout">
                <div>
                  <div className="section-card">
                    <div className="section-card-head">
                      <div className="section-num">1</div>
                      <div>
                        <h3>Basic Information</h3>
                        <p>Name and describe this coupon</p>
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="form-group">
                        <label className="form-label">Coupon Type <span className="req">*</span></label>
                        <input type="text" className="form-control" id="fType" placeholder="e.g. Diwali offer, Weekend Special" />
                        <div className="err-msg" id="eType">Please enter coupon type.</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description <span className="req">*</span></label>
                        <input type="text" className="form-control" id="fDesc" placeholder="Short description shown to customers" />
                        <div className="err-msg" id="eDesc">Please enter a description.</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Coupon Code <span className="req">*</span></label>
                        <div className="code-input-wrap">
                          <input type="text" className="form-control" id="fCode" placeholder="e.g. DIWALI20" style={{ textTransform: "uppercase" }} />
                          <button className="btn-gen">✦ Generate</button>
                        </div>
                        <div className="err-msg" id="eCode">Please enter a coupon code.</div>
                      </div>
                    </div>
                  </div>
                  <div className="section-card">
                    <div className="section-card-head">
                      <div className="section-num">2</div>
                      <div>
                        <h3>Target Audience</h3>
                        <p>Choose who can redeem this coupon</p>
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="form-group">
                        <label className="form-label">Apply On <span className="req">*</span></label>
                        <div className="chip-group">
                          <label className="chip-label"><input type="radio" name="applyOn" value="Only once per Client" /><span>Only once per Client</span></label>
                          <label className="chip-label"><input type="radio" name="applyOn" value="Only Returning Client" /><span>Only Returning Client</span></label>
                          <label className="chip-label"><input type="radio" name="applyOn" value="Only New Client" /><span>Only New Client</span></label>
                          <label className="chip-label"><input type="radio" name="applyOn" value="Any Client, New or Returning" /><span>Any Client, New or Returning</span></label>
                        </div>
                        <div className="err-msg" id="eApplyOn">Please select an option.</div>
                      </div>
                    </div>
                  </div>
                  <div className="section-card">
                    <div className="section-card-head">
                      <div className="section-num">3</div>
                      <div>
                        <h3>Discount Details</h3>
                        <p>Set discount type and value</p>
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="form-group">
                        <label className="form-label">Discount In <span className="req">*</span></label>
                        <div className="chip-group">
                          <label className="chip-label"><input type="radio" name="discountIn" value="Rs." /><span>₹ In Rupees</span></label>
                          <label className="chip-label"><input type="radio" name="discountIn" value="%" /><span>% In Percentage</span></label>
                        </div>
                        <div className="err-msg" id="eDiscountIn">Please select discount type.</div>
                      </div>
                      <div className="amount-row">
                        <div className="form-group">
                          <label className="form-label">Minimum Order Amount <span className="req">*</span></label>
                          <input type="number" className="form-control" id="fMinOrder" placeholder="0" min="0" />
                          <div className="err-msg" id="eMinOrder">Please enter minimum order amount.</div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Discount Value <span className="req">*</span></label>
                          <input type="number" className="form-control" id="fDiscount" placeholder="0" min="0" />
                          <div className="err-msg" id="eDiscount">Please enter discount value.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="section-card">
                    <div className="section-card-head">
                      <div className="section-num">4</div>
                      <div>
                        <h3>Settings &amp; Order Methods</h3>
                        <p>Configure auto-apply, status and order types</p>
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="form-group">
                        <label className="form-label">Auto Apply at Checkout?</label>
                        <div className="chip-group">
                          <label className="chip-label"><input type="radio" name="autoApply" value="Yes" /><span>Yes — Apply automatically</span></label>
                          <label className="chip-label"><input type="radio" name="autoApply" value="No" defaultChecked /><span>No — Customer enters manually</span></label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status <span className="req">*</span></label>
                        <div className="chip-group">
                          <label className="chip-label"><input type="radio" name="status" value="Active" /><span>Active</span></label>
                          <label className="chip-label"><input type="radio" name="status" value="DeActive" /><span>Inactive</span></label>
                        </div>
                        <div className="err-msg" id="eStatus">Please select status.</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Order Method Type <span className="req">*</span></label>
                        <div className="checkbox-chips">
                          <label className="cbchip-label"><input type="checkbox" name="orderMethod" value="Dinein" /><span><svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>Dine In</span></label>
                          <label className="cbchip-label"><input type="checkbox" name="orderMethod" value="TakeAway" /><span><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>Take Away</span></label>
                          <label className="cbchip-label"><input type="checkbox" name="orderMethod" value="HomeDelivery" /><span><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>Home Delivery</span></label>
                        </div>
                        <div className="err-msg" id="eOrderMethod">Please select at least one order method.</div>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions-bar">
                    <button className="btn-submit" id="formSubmitBtn2">SAVE COUPON</button>
                    <button className="btn-cancel2">DISCARD CHANGES</button>
                  </div>
                </div>
                <div>
                  <div className="preview-card">
                    <div className="preview-card-head">
                      <h3>Coupon Preview</h3>
                      <p>Updates live as you type</p>
                    </div>
                    <div className="coupon-visual">
                      <div className="cv-type" id="pvType">COUPON TYPE</div>
                      <div className="cv-code" id="pvCode">YOURCODE</div>
                      <div className="cv-discount" id="pvDiscount">— discount —</div>
                      <div className="cv-minorder" id="pvMinOrder">Min. order: —</div>
                      <div className="cv-tags" id="pvTags" />
                    </div>
                  </div>
                  <div className="tips-card">
                    <div className="tips-card-head">
                      <h3>
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                        Coupon Tips
                      </h3>
                    </div>
                    <div className="tips-list">
                      <div className="tip-item">
                        <div className="tip-dot" />
                        <p>Keep codes short and memorable — e.g. <strong>SAVE20</strong> or <strong>DIWALI50</strong></p>
                      </div>
                      <div className="tip-item">
                        <div className="tip-dot" />
                        <p>Use &quot;Only New Client&quot; to attract first-time customers</p>
                      </div>
                      <div className="tip-item">
                        <div className="tip-dot" />
                        <p>Auto-apply coupons can increase conversion at checkout</p>
                      </div>
                      <div className="tip-item">
                        <div className="tip-dot" />
                        <p>Set a minimum order amount to protect your margins</p>
                      </div>
                      <div className="tip-item">
                        <div className="tip-dot" />
                        <p>Deactivate coupons instead of deleting to keep history</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <WizardFooter />
          </div>
        </div>
      </div>
      <div className="toast" id="toast" />
    </div>
  );
}
