"use client";

import Swal, { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";

export type ToastType = "success" | "error" | "warning" | "info" | "question";

/**
 * Common SweetAlert2 Toast Mixin.
 * Displays notifications in the top-right corner matching the Menu module style.
 */
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "fc-swal-toast",
    title: "fc-swal-toast-title",
    htmlContainer: "fc-swal-toast-desc",
  },
  didOpen: (toastEl) => {
    toastEl.onmouseenter = Swal.stopTimer;
    toastEl.onmouseleave = Swal.resumeTimer;
  },
});

/**
 * Standard toast notification object with helper methods:
 * toast.success("Position Updated", "Category position reordered successfully.")
 * toast.error("Error", "Failed to save changes.")
 * toast.warning("Warning", "Please fill required fields.")
 * toast.info("Note", "...")
 */
export const toast = {
  success: (title: string, text?: string, options?: SweetAlertOptions) =>
    Toast.fire({
      icon: "success",
      title,
      text,
      ...options,
    }),
  error: (title: string, text?: string, options?: SweetAlertOptions) =>
    Toast.fire({
      icon: "error",
      title,
      text,
      ...options,
    }),
  warning: (title: string, text?: string, options?: SweetAlertOptions) =>
    Toast.fire({
      icon: "warning",
      title,
      text,
      ...options,
    }),
  info: (title: string, text?: string, options?: SweetAlertOptions) =>
    Toast.fire({
      icon: "info",
      title,
      text,
      ...options,
    }),
  fire: (options: SweetAlertOptions) => Toast.fire(options),
};

const ICON_TYPES: readonly string[] = ["success", "error", "warning", "info", "question"];

/**
 * Flexible unified showToast function compatible with all calling styles:
 * 1. showToast("Saved successfully")
 * 2. showToast("success", "Category updated successfully")
 * 3. showToast("Position Updated", "Category position reordered successfully.")
 * 4. showToast("Error", "error", "Something went wrong")
 */
export function showToast(
  first: string,
  second?: string,
  third?: string,
  options?: SweetAlertOptions
) {
  // Style 1: showToast("success", "Title", "Text")
  if (ICON_TYPES.includes(first)) {
    return Toast.fire({
      icon: first as SweetAlertIcon,
      title: second || "",
      text: third,
      ...options,
    });
  }

  // Style 2: showToast("Title", "success", "Text")
  if (second && ICON_TYPES.includes(second)) {
    return Toast.fire({
      icon: second as SweetAlertIcon,
      title: first,
      text: third,
      ...options,
    });
  }

  // Style 3: showToast("Title", "Text description")
  if (second) {
    return Toast.fire({
      icon: "success",
      title: first,
      text: second,
      ...options,
    });
  }

  // Style 4: showToast("Simple message")
  return Toast.fire({
    icon: "success",
    title: first,
    ...options,
  });
}

/**
 * Backwards compatibility component (SweetAlert2 manages DOM automatically).
 */
export function ToastContainer() {
  return null;
}

export default toast;
