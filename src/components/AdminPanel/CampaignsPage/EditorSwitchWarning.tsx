"use client";
import React from "react";
import { IoClose } from "react-icons/io5";
import { TriangleAlert } from "lucide-react";

interface EditorSwitchWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EditorSwitchWarningModal({
  isOpen,
  onClose,
  onConfirm,
}: EditorSwitchWarningModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start pt-12 justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-primary" />
            Switch to Rich Text Editor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            You are about to switch from the HTML Editor to the Rich Text
            Editor.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm font-bold">
              Warning: HTML styling may be lost
            </p>
            <p className="text-amber-700 text-sm mt-1">
              Custom HTML formatting, advanced styling, and complex layouts will
              be simplified or removed when switching to the Rich Text Editor.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-amber-700"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
