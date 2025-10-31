"use client";
import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { createInternalCampaign } from "@/services/InternalMemberApis";
import type { CampaignData } from "@/types/Campaign";
import toast from "react-hot-toast";
import InputField from "@/components/MUI/InputTextField";
import TextAreaField from "@/components/MUI/TextAreaField";
import { getVarcharEight } from "@/helpers/getVarCharId";
import { cleanEmailField } from "@/services/InternalMemberApis";

interface SaveDraftCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignFilters: {
    gender: string | null;
    sports: string[];
    selectedYears: number[];
    universities: string[];
  };
  selectedUniversities: string[];
  audienceData: {
    athletes: number;
    emails: number;
  };
  // optional callback invoked after a successful save with created campaign info
  onSaved?: (created: {
    campaign_id: string;
    campaign_name: string;
    campaign_desc?: string;
  }) => void;
  initialCampaignName?: string;
  initialCampaignDesc?: string;
  // Email template data
  emailData?: {
    senderName: string;
    senderEmail: string;
    replyTo: string;
    subject: string;
    body: string;
    editorType?: string; // Add editor type to email data
  };
  // Template options
  colorScheme?: "university" | "default";
  includeUniversityLogo?: boolean;
}

export default function SaveDraftCampaignModal({
  isOpen,
  onClose,
  campaignFilters,
  selectedUniversities,
  audienceData,
  onSaved,
  initialCampaignName,
  initialCampaignDesc,
  emailData,
  colorScheme = "default",
  includeUniversityLogo = false,
}: SaveDraftCampaignModalProps) {
  const [campaignName, setCampaignName] = useState(initialCampaignName ?? "");
  const [campaignDesc, setCampaignDesc] = useState(initialCampaignDesc ?? "");
  const [saving, setSaving] = useState(false);

  const handleClose = useCallback(() => {
    if (!saving) {
      setCampaignName("");
      setCampaignDesc("");
      onClose();
    }
  }, [saving, onClose]);

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, saving, handleClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!campaignName.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    setSaving(true);
    try {
      const campaignData: CampaignData = {
        campaign_id: getVarcharEight(),
        campaign_name: campaignName.trim(),
        campaign_desc: campaignDesc.trim() || undefined,
        campaign_type: "email",
        aws_configuration_set: "CollegeAthleteNetworkEventbridge",
        campaign_filters: JSON.stringify(campaignFilters),
        university_names: JSON.stringify(selectedUniversities),
        audience_size: audienceData.athletes.toString(),
        audience_emails: audienceData.emails.toString(),
        campaign_status: "draft",
        is_active_YN: 1,
        include_logo_YN: includeUniversityLogo ? 1 : 0,
        university_colors_YN: colorScheme === "university" ? 1 : 0,
        created_datetime: new Date().toISOString(),
        // Keep basic email info for backward compatibility
        email_from_name: emailData?.senderName || undefined,
        email_from_address: emailData?.senderEmail || undefined,
        reply_to_address: emailData?.replyTo || undefined,
        email_subject: emailData?.subject
          ? cleanEmailField(emailData.subject)
          : undefined,
        editor_type: emailData?.editorType || "html",
      };

      console.log("Creating campaign with data:", campaignData);

      await createInternalCampaign(campaignData);
      toast.success("Campaign draft saved successfully!");

      // notify parent that a campaign draft was created
      if (typeof onSaved === "function") {
        onSaved({
          campaign_id: campaignData.campaign_id,
          campaign_name: campaignData.campaign_name,
          campaign_desc: campaignData.campaign_desc,
        });
      }
      // Reset form and close modal
      setCampaignName("");
      setCampaignDesc("");
      onClose();
    } catch (error) {
      console.error("Error saving campaign draft:", error);
      toast.error("Failed to save campaign draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">
            Step 1: Let&apos;s Name the Campaign
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={saving}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <InputField
            label="Campaign Name"
            value={campaignName}
            setValue={setCampaignName}
            placeholder="Enter campaign name"
            required
            disabled={saving}
          />
          <TextAreaField
            label="Campaign Description"
            value={campaignDesc}
            setValue={setCampaignDesc}
            disabled={saving}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !campaignName.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {saving ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
