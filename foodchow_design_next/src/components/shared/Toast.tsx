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
  timerProgressBar: false,
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
  success: (title: string, text?: string, options?: SweetAlertOptions) => {
    if (!text) {
      return Toast.fire({
        icon: "success",
        title: "Success",
        text: title,
        ...options,
      });
    }
    return Toast.fire({
      icon: "success",
      title,
      text,
      ...options,
    });
  },
  error: (title: string, text?: string, options?: SweetAlertOptions) => {
    if (!text) {
      return Toast.fire({
        icon: "error",
        title: "Error",
        text: title,
        ...options,
      });
    }
    return Toast.fire({
      icon: "error",
      title,
      text,
      ...options,
    });
  },
  warning: (title: string, text?: string, options?: SweetAlertOptions) => {
    if (!text) {
      return Toast.fire({
        icon: "warning",
        title: "Warning",
        text: title,
        ...options,
      });
    }
    return Toast.fire({
      icon: "warning",
      title,
      text,
      ...options,
    });
  },
  info: (title: string, text?: string, options?: SweetAlertOptions) => {
    if (!text) {
      return Toast.fire({
        icon: "info",
        title: "Information",
        text: title,
        ...options,
      });
    }
    return Toast.fire({
      icon: "info",
      title,
      text,
      ...options,
    });
  },
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
  const firstLower = first ? first.toLowerCase() : "";

  // Style 1: showToast("success", "Message") or showToast("success", "Title", "Text")
  if (ICON_TYPES.includes(firstLower)) {
    const icon = firstLower as SweetAlertIcon;
    const defaultTitle = icon.charAt(0).toUpperCase() + icon.slice(1);
    if (!third) {
      return Toast.fire({
        icon,
        title: defaultTitle,
        text: second || "",
        ...options,
      });
    }
    return Toast.fire({
      icon,
      title: second || defaultTitle,
      text: third,
      ...options,
    });
  }

  // Style 2: showToast("Title", "success", "Text")
  if (second && ICON_TYPES.includes(second.toLowerCase())) {
    return Toast.fire({
      icon: second.toLowerCase() as SweetAlertIcon,
      title: first,
      text: third,
      ...options,
    });
  }

  // Style 3: showToast("Title", "Text description")
  if (second) {
    const combined = `${first} ${second}`;
    const isErr = /fail|error|invalid|wrong|cannot|can't|unable|not found|not allowed|exceed|greater than|less than/i.test(combined);
    const isWarn = /warning|required|please|must|at least|choose|select/i.test(combined);
    const isSuccess = /success|updated|saved|created|deleted|added|reordered|mapped|uploaded/i.test(combined);
    const icon: SweetAlertIcon = isErr ? "error" : isWarn ? "warning" : isSuccess ? "success" : "info";

    return Toast.fire({
      icon,
      title: first,
      text: second,
      ...options,
    });
  }

  // Style 4: showToast("Simple message")
  const isErr = /fail|error|invalid|wrong|cannot|can't|unable|not found|not allowed|exceed|greater than|less than/i.test(first);
  const isWarn = /warning|required|please|must|at least|choose|select/i.test(first);
  const isSuccess = /success|updated|saved|created|deleted|added|reordered|mapped|uploaded/i.test(first);

  const icon: SweetAlertIcon = isErr ? "error" : isWarn ? "warning" : isSuccess ? "success" : "info";
  const defaultTitle = isErr ? "Error" : isWarn ? "Warning" : isSuccess ? "Success" : "Notice";

  return Toast.fire({
    icon,
    title: defaultTitle,
    text: first,
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
