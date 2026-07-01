/**
 * Triggers a global system toast notification
 */
export function triggerToast(message: string, type: "success" | "warning" | "info" = "info") {
  window.dispatchEvent(
    new CustomEvent("system-toast", {
      detail: { message, type },
    })
  );
}
