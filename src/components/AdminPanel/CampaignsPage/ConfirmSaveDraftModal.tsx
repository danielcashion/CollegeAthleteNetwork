"use client";
import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmSaveDraftModal({
  isOpen,
  onClose,
  campaignName,
  onConfirm,
  loading = false,
}: Props) {
  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Save Draft</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={20} />
          </button>
        </div>

        <p className="mb-6">
          Are you sure you want to save a draft of Campaign &quot;
          <span className="font-medium">{campaignName}</span>&quot;?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
