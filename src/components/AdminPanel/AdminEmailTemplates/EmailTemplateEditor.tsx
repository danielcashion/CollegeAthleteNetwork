"use client";
import { useState, useEffect } from "react";
import { InternalEmailTemplate } from "@/types/InternalMember";
import {
  createInternalEmailTemplate,
  updateInternalEmailTemplate,
} from "@/services/InternalMemberApis";
import { X, Save, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import HtmlViewer from "../General/HtmlViewer";

const getVarcharEight = () => {
  const CHARSET = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

  const randomArray = new Uint8Array(8);
  crypto.getRandomValues(randomArray);

  return Array.from(randomArray, (num) =>
    CHARSET.charAt(num % CHARSET.length)
  ).join("");
};

interface EmailTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  template?: InternalEmailTemplate | null;
  mode: "create" | "edit";
}

export default function EmailTemplateEditor({
  isOpen,
  onClose,
  onSave,
  template,
  mode,
}: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState<Partial<InternalEmailTemplate>>({
    template_title: "",
    template_description: "",
    template_creator: "",
    template_task: "",
    template_params: "",
    email_body: "",
    email_subject: "",
    email_from_name: "",
    email_from_address: "",
    reply_to_address: "",
    campaign_type: "",
    is_active_YN: 1,
    is_systemwide_YN: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template && mode === "edit") {
      setFormData(template);
    } else {
      // Reset form for create mode
      setFormData({
        template_title: "",
        template_description: "",
        template_creator: "",
        template_task: "",
        template_params: "",
        email_body: "",
        email_subject: "",
        email_from_name: "",
        email_from_address: "",
        reply_to_address: "",
        campaign_type: "",
        is_active_YN: 1,
        is_systemwide_YN: 0,
      });
    }
  }, [template, mode]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "is_active_YN" || name === "is_systemwide_YN"
          ? parseInt(value)
          : value,
    }));
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      email_body: value || "",
    }));
  };

  const validateForm = () => {
    if (!formData.template_title?.trim()) {
      setError("Template title is required");
      return false;
    }
    if (!formData.email_body?.trim()) {
      setError("Email body is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && template?.campaign_template_id) {
        await updateInternalEmailTemplate({
          ...formData,
          campaign_template_id: template.campaign_template_id,
          updated_by: formData.template_creator || "",
          updated_datetime: new Date().toISOString(),
        } as InternalEmailTemplate);
      } else {
        await createInternalEmailTemplate({
          ...formData,
          campaign_template_id: getVarcharEight(),
          created_by: formData.template_creator || "",
          created_datetime: new Date().toISOString(),
        } as InternalEmailTemplate);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving template:", err);
      setError(
        mode === "edit"
          ? "Failed to update template. Please try again."
          : "Failed to create template. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-[1600px] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {mode === "edit"
                ? "Edit Email Template"
                : "Create Email Template"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === "edit"
                ? "Modify your existing email template"
                : "Build a new email template for your campaigns"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
            disabled={loading}
            aria-label="Close editor"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Form Fields and HTML Editor */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      General template details and metadata
                    </p>
                  </div>

                  {/* Template Title */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="template_title"
                      value={formData.template_title || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      placeholder="e.g., Welcome Email, Newsletter Template"
                      required
                    />
                  </div>

                  {/* Template Description */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Description
                    </label>
                    <textarea
                      name="template_description"
                      value={formData.template_description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none group-hover:border-gray-400"
                      placeholder="Describe the purpose and target audience for this template"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Template Creator */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Creator
                      </label>
                      <input
                        type="text"
                        name="template_creator"
                        value={formData.template_creator || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                        placeholder="Creator name"
                      />
                    </div>

                    {/* Status */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="is_active_YN"
                        value={formData.is_active_YN ?? 1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      >
                        <option value={1}>✅ Active</option>
                        <option value={0}>⏸️ Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Technical Configuration Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-purple-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Technical Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Advanced settings for template processing
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Campaign Type */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Campaign Type
                      </label>
                      <input
                        type="text"
                        name="campaign_type"
                        value={formData.campaign_type || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                        placeholder="e.g., promotional, informational"
                      />
                    </div>

                    {/* System-wide */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        System-wide Template
                      </label>
                      <select
                        name="is_systemwide_YN"
                        value={formData.is_systemwide_YN ?? 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      >
                        <option value={1}>✅ Yes</option>
                        <option value={0}>❌ No</option>
                      </select>
                    </div>
                  </div>

                  {/* Template Task */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Task
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (API Integration)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="template_task"
                      value={formData.template_task || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      placeholder="Must align with Database Task from /messages endpoint"
                    />
                  </div>

                  {/* Template Parameters */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Parameters
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (Comma-separated)
                      </span>
                    </label>
                    <textarea
                      name="template_params"
                      value={formData.template_params || ""}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none group-hover:border-gray-400"
                      placeholder="e.g., user_name, university_name, course_title"
                    />
                  </div>
                </div>

                {/* Email Settings Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email Settings
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure email headers and metadata
                    </p>
                  </div>

                  {/* Email Subject */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      name="email_subject"
                      value={formData.email_subject || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      placeholder="e.g., Welcome to College Athlete Network!"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Email From Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        name="email_from_name"
                        value={formData.email_from_name || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                        placeholder="e.g., CAN Team"
                      />
                    </div>

                    {/* Email From Address */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Address
                      </label>
                      <input
                        type="email"
                        name="email_from_address"
                        value={formData.email_from_address || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                        placeholder="e.g., noreply@example.com"
                      />
                    </div>
                  </div>

                  {/* Reply To Address */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reply To Address
                    </label>
                    <input
                      type="email"
                      name="reply_to_address"
                      value={formData.reply_to_address || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors group-hover:border-gray-400"
                      placeholder="e.g., support@example.com"
                    />
                  </div>
                </div>

                {/* HTML Editor Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      Email Body <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Write your email template HTML with live preview
                    </p>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <Editor
                      height="500px"
                      defaultLanguage="html"
                      value={formData.email_body || ""}
                      onChange={handleEditorChange}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        selectOnLineNumbers: true,
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="w-1/2 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
              <div className="px-8 py-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Live Preview
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Real-time preview of your email template
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  {formData.email_body ? (
                    <div className="p-6">
                      <HtmlViewer htmlContent={formData.email_body} />
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Content Yet
                      </h4>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Start typing HTML in the editor to see a live preview of
                        your email template here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {mode === "edit"
              ? "Modifying existing template"
              : "Creating new template"}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-blueMain text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>
                    {mode === "edit" ? "Update Template" : "Create Template"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
