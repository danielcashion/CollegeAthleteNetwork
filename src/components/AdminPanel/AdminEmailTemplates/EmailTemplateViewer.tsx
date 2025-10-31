"use client";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { X, Eye, Calendar, User, Settings, Mail, FileText } from "lucide-react";
import { useEffect } from "react";
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
  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white">
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {template.template_title}
                  </h2>
                  <p className="text-blue-100 mt-1">Email Template Details & Preview</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Template Details */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template ID */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template ID</p>
                <p className="text-sm font-semibold text-gray-900">#{template.campaign_template_id}</p>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</p>
                <p className="text-sm font-semibold text-gray-900">{template.template_creator || "—"}</p>
              </div>
            </div>

            {/* Task */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Database Task</p>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {template.template_task || "—"}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                template.is_active_YN === 1 
                  ? "bg-gradient-to-r from-green-400 to-green-500" 
                  : "bg-gradient-to-r from-red-400 to-red-500"
              }`}>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                  template.is_active_YN === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {template.is_active_YN === 1 ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</p>
                <p className="text-sm font-semibold text-gray-900">
                  {template.created_datetime
                    ? new Date(template.created_datetime).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {/* System-wide */}
            {template.is_systemwide_YN !== null && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System-wide</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {template.is_systemwide_YN === 1 ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details Section */}
          {(template.template_description || template.campaign_type || template.template_params) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#1C315F]" />
                Additional Information
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {template.template_description && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-gray-700">{template.template_description}</p>
                  </div>
                )}
                
                {template.campaign_type && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Campaign Type</p>
                    <p className="text-sm text-gray-700">{template.campaign_type}</p>
                  </div>
                )}

                {template.template_params && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Template Parameters</p>
                    <code className="text-xs text-gray-700 bg-gray-100 p-2 rounded-lg block overflow-x-auto">
                      {template.template_params}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Configuration Section */}
          {(template.email_subject || template.email_from_name || template.email_from_address || template.reply_to_address) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#1C315F]" />
                Email Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.email_subject && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject Line</p>
                    <p className="text-sm text-gray-700 font-medium">{template.email_subject}</p>
                  </div>
                )}

                {template.email_from_name && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From Name</p>
                    <p className="text-sm text-gray-700">{template.email_from_name}</p>
                  </div>
                )}

                {template.email_from_address && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From Address</p>
                    <p className="text-sm text-gray-700 font-mono">{template.email_from_address}</p>
                  </div>
                )}

                {template.reply_to_address && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reply To</p>
                    <p className="text-sm text-gray-700 font-mono">{template.reply_to_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Updated Date */}
          {template.updated_datetime && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(template.updated_datetime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Template Preview */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-[#1C315F]" />
                Template Preview
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Live Email Content
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <HtmlViewer htmlContent={template.email_body} />
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Template ID:</span> #{template.campaign_template_id}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
