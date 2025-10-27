"use client";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { X } from "lucide-react";
import HtmlViewer from "../General/HtmlViewer";

interface EmailTemplateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  template: InternalEmailTemplate | null;
}

export default function EmailTemplateViewer({
  isOpen,
  onClose,
  template,
}: EmailTemplateViewerProps) {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {template.template_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Template Details */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Template ID:</span>
              <span className="ml-2 text-gray-600">{template.template_id}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Creator:</span>
              <span className="ml-2 text-gray-600">
                {template.template_creator || "—"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Task:</span>
              <span className="ml-2 text-gray-600">
                {template.template_task || "—"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Status:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  template.is_active_YN === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {template.is_active_YN === 1 ? "Active" : "Inactive"}
              </span>
            </div>
            {template.template_description && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">
                  Description:
                </span>
                <span className="ml-2 text-gray-600">
                  {template.template_description}
                </span>
              </div>
            )}
            {template.template_params && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Parameters:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">
                  {template.template_params}
                </span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {template.created_datetime
                  ? new Date(template.created_datetime).toLocaleString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )
                  : "—"}
              </span>
            </div>
            {template.updated_datetime && (
              <div>
                <span className="font-semibold text-gray-700">
                  Last Updated:
                </span>
                <span className="ml-2 text-gray-600">
                  {new Date(template.updated_datetime).toLocaleString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Template Preview */}
        <div className="flex-1 overflow-auto p-6">
          <h3 className="text-md font-semibold mb-3 text-gray-900">
            Template Preview
          </h3>
          <HtmlViewer htmlContent={template.template_html} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
