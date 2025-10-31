"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { createInternalEmailTemplate } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember.d";
import { getVarcharEight } from "@/helpers/getVarCharId";
import toast from "react-hot-toast";

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
  const [templateDescription, setTemplateDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareAcrossUniversity, setShareAcrossUniversity] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!templateTitle.trim()) {
      toast.error("Template title is required");
      return;
    }

    if (templateTitle.length > 100) {
      toast.error("Template title must be 100 characters or less");
      return;
    }

    if (!templateDescription.trim()) {
      toast.error("Template description is required");
      return;
    }

    if (templateDescription.length > 300) {
      toast.error("Template description must be 300 characters or less");
      return;
    }

    setSaving(true);
    try {
      const emailTemplate: InternalEmailTemplate = {
        campaign_template_id: getVarcharEight(),
        campaign_type: "email",
        template_title: templateTitle.trim(),
        template_description: templateDescription.trim(),
        template_creator: session?.user?.name || session?.user?.email || "",
        template_task: undefined,
        template_params: undefined,
        email_body: templateData.body,
        email_from_name: templateData.senderName,
        email_from_address: templateData.senderEmail,
        reply_to_address: templateData.replyTo || null,
        email_subject: templateData.subject,
        response_type: null,
        response_options: null,
        is_systemwide_YN: shareAcrossUniversity ? 1 : 0,
        is_active_YN: 1,
        created_by: session?.user?.name || session?.user?.email || "",
        created_datetime: new Date().toISOString(),
      };

      await createInternalEmailTemplate(emailTemplate);

      toast.success("Template saved successfully!");

      if (onSaved) {
        onSaved(emailTemplate.campaign_template_id);
      }

      setTemplateTitle("");
      setTemplateDescription("");
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
      setTemplateDescription("");
      setShareAcrossUniversity(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-200 scale-100 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Save as Template</h2>
              <p className="text-blue-100 text-sm">Create a reusable email template</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Template Title with Character Counter */}
            <div>
              <label htmlFor="templateTitle" className="block text-sm font-semibold text-gray-900 mb-2">
                Template Title <span className="text-red-500">*</span>
              </label>
              <input
                id="templateTitle"
                type="text"
                placeholder="Enter a descriptive name for this template"
                value={templateTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setTemplateTitle(e.target.value);
                  }
                }}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 transition-all duration-200"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Required field
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  templateTitle.length >= 90 ? 'text-red-700 bg-red-100' : 
                  templateTitle.length >= 75 ? 'text-yellow-700 bg-yellow-100' : 
                  'text-gray-600 bg-gray-100'
                }`}>
                  {templateTitle.length}/100
                </span>
              </div>
            </div>

            {/* Template Description with Character Counter */}
            <div>
              <label htmlFor="templateDescription" className="block text-sm font-semibold text-gray-900 mb-2">
                Template Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="templateDescription"
                placeholder="Provide a detailed description of when and how to use this template"
                value={templateDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setTemplateDescription(e.target.value);
                  }
                }}
                disabled={saving}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-gray-900 placeholder-gray-500 transition-all duration-200"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Required field
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  templateDescription.length >= 270 ? 'text-red-700 bg-red-100' : 
                  templateDescription.length >= 225 ? 'text-yellow-700 bg-yellow-100' : 
                  'text-gray-600 bg-gray-100'
                }`}>
                  {templateDescription.length}/300
                </span>
              </div>
            </div>

            {/* Sharing Option */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="shareAcrossUniversity"
                  checked={shareAcrossUniversity}
                  onChange={(e) => setShareAcrossUniversity(e.target.checked)}
                  disabled={saving}
                  className="mt-1 w-4 h-4 text-[#1C315F] bg-gray-100 border-gray-300 rounded focus:ring-[#1C315F] focus:ring-2 disabled:opacity-50"
                />
                <div className="flex-1">
                  <label
                    htmlFor="shareAcrossUniversity"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Share With Other Users
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Make this template available to all users
                  </p>
                </div>
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Template Preview
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-600 min-w-[70px]">Subject:</span>
                  <span className="text-gray-900">{templateData.subject || "No subject"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-600 min-w-[70px]">From:</span>
                  <span className="text-gray-900">{templateData.senderName} &lt;{templateData.senderEmail}&gt;</span>
                </div>
                {templateData.replyTo && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-600 min-w-[70px]">Reply To:</span>
                    <span className="text-gray-900">{templateData.replyTo}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-600 min-w-[70px]">Content:</span>
                  <span className="text-gray-900">
                    {templateData.body ? "Email content included" : "No content"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
          <div className="text-sm text-gray-600">
            {templateTitle.trim() && templateDescription.trim() ? (
              <span className="text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ready to save
              </span>
            ) : (
              <span className="text-gray-500">Fill required fields to continue</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={saving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !templateTitle.trim() || !templateDescription.trim()}
              className="px-6 py-2.5 bg-[#1C315F] text-white rounded-lg hover:bg-[#243a66] focus:bg-[#243a66] transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1C315F] focus:ring-offset-2 shadow-sm"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving Template...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
