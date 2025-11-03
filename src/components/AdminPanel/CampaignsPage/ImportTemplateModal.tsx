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

  const renderTemplateCard = (
    template: InternalEmailTemplate,
    index: number
  ) => (
    <div
      key={`${template.campaign_template_id || index}`}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:bg-blue-50 hover:border-blue-300 hover:scale-[1.02] transition-all duration-200 bg-white cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {template.template_title || "Untitled Template"}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Subject:</strong> {template.email_subject || "No subject"}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            <strong>Sender:</strong>{" "}
            {template.email_from_name || "Unknown sender"}
          </p>
          {template.template_description && (
            <p className="text-sm text-gray-500 mb-2">
              {template.template_description}
            </p>
          )}
          <div className="text-xs text-gray-400">
            Created:{" "}
            {template.created_datetime
              ? new Date(template.created_datetime).toLocaleDateString()
              : "Unknown"}
          </div>
        </div>
        <button
          onClick={() => handleTemplateSelect(template)}
          className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-sky-700 transition-colors flex-shrink-0 ml-3"
          aria-label={`Select template: ${
            template.template_title || "Untitled Template"
          }`}
        >
          Select
        </button>
      </div>

      {template.email_body && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <div
            className="text-sm text-gray-600 max-h-16 overflow-hidden line-clamp-8"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
            dangerouslySetInnerHTML={{
              __html:
                template.email_body.substring(0, 150) +
                (template.email_body.length > 150 ? "..." : ""),
            }}
          />
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-6 items-center justify-center py-12">
          <Loader size={34} className="animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading templates...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllTemplates}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!templates || templates.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {templates.map(renderTemplateCard)}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center pt-12 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-template-title"
      aria-describedby="import-template-description"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2
            id="import-template-title"
            className="text-2xl font-semibold text-primary"
          >
            Import Email Template
          </h2>
          <p id="import-template-description" className="sr-only">
            Choose from available email templates to import into your campaign.
          </p>
          <button
            onClick={onCloseAction}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="Close import template dialog"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderTabContent()}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCloseAction}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
