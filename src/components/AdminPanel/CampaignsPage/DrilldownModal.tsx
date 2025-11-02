"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  title?: string;
  body?: React.ReactNode;
};

export default function DrilldownModal({
  open,
  onCloseAction,
  title,
  body,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "drilldown-dialog-title";
  const bodyId = "drilldown-dialog-body";

  useEffect(() => {
    if (open) {
      // Save previously focused element
      const prev = document.activeElement as HTMLElement | null;
      // Focus close button
      closeRef.current?.focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCloseAction();
        }
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("keydown", handleKey);
        prev?.focus();
      };
    }
  }, [open, onCloseAction]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="bg-white rounded p-4 w-full max-w-lg transform transition-all duration-200 scale-95 opacity-0 animate-in"
        style={{ animation: "modal-in 220ms ease-out forwards" }}
      >
        <style>{`@keyframes modal-in { from { transform: translateY(8px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }`}</style>
        <div className="flex justify-between items-center mb-3">
          <h3 id={titleId} className="text-lg font-semibold">
            {title ?? "Details"}
          </h3>
          <button
            ref={closeRef}
            onClick={onCloseAction}
            className="text-sm text-gray-600"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
        <div id={bodyId}>{body}</div>
      </div>
    </div>
  );
}
