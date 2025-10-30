"use client";
import React, { useState, useEffect, useMemo } from "react";
import HtmlViewer from "../General/HtmlViewer";
import { IoClose } from "react-icons/io5";
import { getInternalCampaignById } from "@/services/InternalMemberApis";
import { Loader } from "lucide-react";
import {
  replaceTemplateVariablesWithLogo,
  getSampleEmailData,
} from "@/utils/CampaignUtils";
import type { University } from "@/types/University";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string | null;
  body?: string;
  session: any;
  universityMetaData?: University | null;
  includeUniversityLogo?: boolean;
  colorScheme?: "university" | "default";
}

export default function PreviewModal({
  isOpen,
  onClose,
  templateId,
  body,
  session,
  universityMetaData = null,
  includeUniversityLogo = false,
  colorScheme = "default",
}: PreviewModalProps) {
  const [templateBody, setTemplateBody] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Get sample data for variable replacement
  const sampleData = useMemo(
    () => getSampleEmailData(session.user),
    [session.user]
  );

  // Replace template variables with sample data using enhanced function
  const replacedTemplateBody = useMemo(() => {
    if (!templateBody) return "";
    return replaceTemplateVariablesWithLogo(
      templateBody,
      sampleData,
      universityMetaData,
      includeUniversityLogo,
      colorScheme
    );
  }, [
    templateBody,
    sampleData,
    universityMetaData,
    includeUniversityLogo,
    colorScheme,
  ]);

  // Fetch template data when templateId changes
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!templateId) {
        setTemplateBody(body || "");
        return;
      }

      try {
        setLoading(true);
        const response = await getInternalCampaignById(templateId);

        if (response && response.length > 0) {
          setTemplateBody(response[0].email_body || "");
        } else {
          setTemplateBody("<p>Template not found</p>");
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        setTemplateBody("<p>Error loading template</p>");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTemplateData();
    }
  }, [templateId, body, isOpen]);

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
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center pt-12 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl min-h-[400px] max-h-[800px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-primary">Email Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6">
          <div className="h-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="w-6 h-6 animate-spin mr-2" />
                <span>Loading template...</span>
              </div>
            ) : (
              <>
                <HtmlViewer
                  htmlContent={
                    replacedTemplateBody || "<p>No content available</p>"
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
