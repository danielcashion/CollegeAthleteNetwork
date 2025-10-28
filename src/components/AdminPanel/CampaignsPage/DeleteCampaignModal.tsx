"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { deleteInternalCampaign } from "@/services/InternalMemberApis";
import { CampaignData } from "@/types/Campaign";
import toast from "react-hot-toast";
import { TriangleAlert } from "lucide-react";

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  campaign: CampaignData | null;
  onDeleteSuccessAction: () => void;
}

export default function DeleteCampaignModal({
  isOpen,
  onCloseAction,
  campaign,
  onDeleteSuccessAction,
}: DeleteCampaignModalProps) {
  const [deleting, setDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Add event listeners for modal close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onCloseAction();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onCloseAction();
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
  }, [isOpen, onCloseAction]);

  if (!isOpen || !campaign) return null;

  const handleDelete = async () => {
    if (!campaign.campaign_id) {
      toast.error("Missing required information for deletion");
      return;
    }

    setDeleting(true);
    try {
      await deleteInternalCampaign(campaign.campaign_id);
      toast.success("Campaign deleted successfully!");
      onDeleteSuccessAction();
      onCloseAction();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error(error.message || "Failed to delete campaign");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onCloseAction();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-red-600" />
            Delete Campaign
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={deleting}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the campaign{" "}
            <span className="font-semibold">
              &quot;{campaign.campaign_name}&quot;
            </span>
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-bold">
              This action cannot be undone
            </p>
            <p className="text-red-700 text-sm mt-1">
              All campaign data, including filters and configurations, will be
              permanently removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {deleting ? "Deleting..." : "Delete Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
