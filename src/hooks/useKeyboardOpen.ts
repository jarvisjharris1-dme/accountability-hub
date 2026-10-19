import { useEffect, useState } from "react";

export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let restingHeight = Math.max(window.innerHeight, viewport.height);
    const update = () => {
      const editing = document.activeElement?.matches(
        'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]',
      );
      if (!editing)
        restingHeight = Math.max(window.innerHeight, viewport.height);
      const isOpen = Boolean(
        editing &&
          viewport.scale === 1 &&
          Math.max(restingHeight, window.innerHeight) - viewport.height > 150,
      );
      setOpen(isOpen);
      document.documentElement.classList.toggle("app-keyboard-open", isOpen);
      document.documentElement.style.setProperty("--app-visual-top", `${viewport.offsetTop}px`);
      document.documentElement.style.setProperty(
        "--app-visual-height",
        `${viewport.height}px`,
      );
      document.documentElement.style.setProperty(
        "--app-dialog-center",
        `${viewport.offsetTop + viewport.height / 2}px`,
      );
    };
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.documentElement.classList.remove("app-keyboard-open");
      document.documentElement.style.removeProperty("--app-visual-height");
      document.documentElement.style.removeProperty("--app-visual-top");
      document.documentElement.style.removeProperty("--app-dialog-center");
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);
  return open;
}
