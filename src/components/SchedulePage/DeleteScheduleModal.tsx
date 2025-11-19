"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    id: string;
    campaign_name: string;
    scheduled_at: string;
  } | null;
  onDeleteSuccess: () => void;
}

export default function DeleteScheduleModal({
  isOpen,
  onClose,
  schedule,
  onDeleteSuccess,
}: DeleteScheduleModalProps) {
  const [deleting, setDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !schedule) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/campaign-schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Scheduled campaign deleted successfully!");
        onDeleteSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("An error occurred while deleting the schedule");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-red-600" />
            Delete Scheduled Campaign
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={deleting}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the scheduled campaign{" "}
            <span className="font-semibold">
              &quot;{schedule.campaign_name || "Untitled Campaign"}&quot;
            </span>
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-bold">
              This action cannot be undone
            </p>
            <p className="text-red-700 text-sm mt-1">
              The scheduled campaign will be permanently removed from your schedule.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {deleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {deleting ? "Deleting..." : "Delete Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

