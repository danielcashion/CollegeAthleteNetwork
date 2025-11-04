"use client";
import React, { useState, useEffect, useCallback } from "react";
import { getInternalEmailTemplates } from "@/services/InternalMemberApis";
import type { InternalEmailTemplate } from "@/types/InternalMember";
import { Loader } from "lucide-react";

interface ImportTemplateModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onTemplateSelectAction: (template: {
    senderName: string;
    senderEmail: string;
    subject: string;
    body: string;
    replyToAddress?: string;
    templateId?: string;
  }) => void;
}

export default function ImportTemplateModal({
  isOpen,
  onCloseAction,
  onTemplateSelectAction,
}: ImportTemplateModalProps) {
  const [templates, setTemplates] = useState<InternalEmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const fetchAllTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const emailTemplates = await getInternalEmailTemplates();
      setTemplates(emailTemplates || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAction();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCloseAction]);

  useEffect(() => {
    if (isOpen) {
      fetchAllTemplates();
    }
  }, [isOpen, fetchAllTemplates]);

  const handleTemplateSelect = (template: InternalEmailTemplate) => {
    onTemplateSelectAction({
      senderName: template.email_from_name || "",
      senderEmail: template.email_from_address || "",
      subject: template.email_subject || "",
      body: template.email_body || "",
      replyToAddress: template.reply_to_address || "",
      templateId: template.campaign_template_id || "",
    });
    onCloseAction();
  };

  const toggleExpanded = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  const renderTemplateCard = (
    template: InternalEmailTemplate,
    index: number
  ) => {
    const templateId = template.campaign_template_id || `template-${index}`;
    const isExpanded = expandedTemplate === templateId;

    return (
      <div
        key={templateId}
        className="bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:border-[#1C315F]/30"
      >
        {/* Compact Header */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h4 className="font-bold text-gray-900 text-base truncate">
                  {template.template_title || "Untitled Template"}
                </h4>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                  {template.created_datetime
                    ? new Date(template.created_datetime).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 truncate">
                <span className="font-medium">Subject:</span> {template.email_subject || "No subject"}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => toggleExpanded(templateId)}
                className="text-gray-400 hover:text-[#1C315F] transition-colors duration-200 p-2 hover:bg-gray-50 rounded-lg"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleTemplateSelect(template)}
                className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm"
                aria-label={`Select template: ${template.template_title || "Untitled Template"}`}
              >
                Select
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Sender</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                    {template.email_from_name || "Unknown sender"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Email Address</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg break-all">
                    {template.email_from_address || "No email"}
                  </p>
                </div>
              </div>
              
              {template.template_description && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {template.template_description}
                  </p>
                </div>
              )}

              {template.email_body && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Email Preview</span>
                  </p>
                  <div className="bg-gray-50 border rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div
                      className="text-sm text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: template.email_body.substring(0, 300) + 
                        (template.email_body.length > 300 ? "..." : ""),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-6 items-center justify-center py-16">
          <div className="w-12 h-12 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-xl flex items-center justify-center">
            <Loader size={24} className="animate-spin text-white" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold">Loading templates...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your templates</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold mb-2">Failed to load templates</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAllTemplates}
            className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!templates || templates.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold mb-2">No templates found</p>
          <p className="text-gray-500">Create your first email template to get started</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {templates.map(renderTemplateCard)}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-8 pb-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-template-title"
      aria-describedby="import-template-description"
      onClick={onCloseAction}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl mx-4 my-auto transform transition-all duration-300 min-h-fit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2
                  id="import-template-title"
                  className="text-xl font-bold text-white"
                >
                  Import Email Template
                </h2>
                <p className="text-white/80 text-sm">
                  Choose from our available email templates to import
                </p>
              </div>
            </div>
            <button
              onClick={onCloseAction}
              className="text-white/70 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close import template dialog"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p id="import-template-description" className="sr-only">
            Choose from available email templates to import into your campaign.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50/30">{renderTabContent()}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-white">
          <button
            onClick={onCloseAction}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
