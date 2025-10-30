"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { createInternalEmailTemplate } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember.d";
import { getVarcharEight } from "@/helpers/getVarCharId";
import toast from "react-hot-toast";
import InputField from "@/components/MUI/InputTextField";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  templateData: {
    senderName: string;
    senderEmail: string;
    replyTo: string;
    subject: string;
    body: string;
    editorType?: string;
  };
  onSaved?: (templateId: string) => void;
}

export default function SaveTemplateModal({
  isOpen,
  onClose,
  session,
  templateData,
  onSaved,
}: SaveTemplateModalProps) {
  const [templateTitle, setTemplateTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareAcrossUniversity, setShareAcrossUniversity] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!templateTitle.trim()) {
      toast.error("Template title is required");
      return;
    }

    setSaving(true);
    try {
      const emailTemplate: InternalEmailTemplate = {
        campaign_template_id: getVarcharEight(),
        campaign_type: "email",
        template_title: templateTitle.trim(),
        template_description: undefined,
        template_creator: session?.user?.name || session?.user?.email || "",
        template_task: undefined,
        template_params: undefined,
        email_body: templateData.body,
        email_from_name: templateData.senderName,
        email_from_address: templateData.senderEmail,
        reply_to_address: templateData.replyTo || null,
        email_subject: templateData.subject,
        reponse_type: null,
        reponse_options: null,
        is_systemwide_YN: shareAcrossUniversity ? 1 : 0,
        is_active_YN: 1,
        created_by: session?.user?.name || session?.user?.email || "",
        created_datetime: new Date().toISOString(),
      };

      const result = await createInternalEmailTemplate(emailTemplate);

      toast.success("Template saved successfully!");

      if (onSaved) {
        onSaved(emailTemplate.campaign_template_id);
      }

      setTemplateTitle("");
      setShareAcrossUniversity(false);
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setTemplateTitle("");
      setShareAcrossUniversity(false);
      onClose();
    }
  };

  return (
    <div className="fixed top-0 inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Save as a Template</h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>
        <h2 className="text-sm font-semibold">
          Save this so you can reuse it later:
        </h2>

        <div className="space-y-4">
          <InputField
            label="Template Title"
            placeholder="Enter a name for this template"
            value={templateTitle}
            setValue={setTemplateTitle}
            required
            disabled={saving}
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="shareAcrossUniversity"
              checked={shareAcrossUniversity}
              onChange={(e) => setShareAcrossUniversity(e.target.checked)}
              disabled={saving}
              className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="shareAcrossUniversity"
              className="text-sm font-medium text-gray-700"
            >
              Share this Template Across all Users at my University
            </label>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">
              Template Preview:
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Subject:</strong> {templateData.subject || "No subject"}
              </p>
              <p>
                <strong>Sender:</strong> {templateData.senderName} &lt;
                {templateData.senderEmail}&gt;
              </p>
              {templateData.replyTo && (
                <p>
                  <strong>Reply To:</strong> {templateData.replyTo}
                </p>
              )}
              <p>
                <strong>Content:</strong>{" "}
                {templateData.body ? "Email content included" : "No content"}
              </p>
            </div>
          </div>
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
            disabled={saving || !templateTitle.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
