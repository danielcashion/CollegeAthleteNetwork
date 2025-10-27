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
    template_name: "",
    template_description: "",
    template_creator: "",
    template_task: "",
    template_params: "",
    template_html: "",
    is_active_YN: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template && mode === "edit") {
      setFormData(template);
    } else {
      // Reset form for create mode
      setFormData({
        template_name: "",
        template_description: "",
        template_creator: "",
        template_task: "",
        template_params: "",
        template_html: "",
        is_active_YN: 1,
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
      [name]: name === "is_active_YN" ? parseInt(value) : value,
    }));
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      template_html: value || "",
    }));
  };

  const validateForm = () => {
    if (!formData.template_name?.trim()) {
      setError("Template name is required");
      return false;
    }
    if (!formData.template_html?.trim()) {
      setError("Template HTML is required");
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
      if (mode === "edit" && template?.template_id) {
        await updateInternalEmailTemplate({
          ...formData,
          template_id: template.template_id,
          updated_by: formData.template_creator || "",
          updated_datetime: new Date().toISOString(),
        } as InternalEmailTemplate);
      } else {
        await createInternalEmailTemplate({
          ...formData,
          template_id: getVarcharEight(),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[1500px] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "edit" ? "Edit Email Template" : "Create Email Template"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Form Fields and HTML Editor */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="template_name"
                    value={formData.template_name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                    required
                  />
                </div>

                {/* Template Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Description
                  </label>
                  <textarea
                    name="template_description"
                    value={formData.template_description || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter template description"
                  />
                </div>

                {/* Template Creator */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Creator
                  </label>
                  <input
                    type="text"
                    name="template_creator"
                    value={formData.template_creator || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter creator name"
                  />
                </div>

                {/* Template Task */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Task
                  </label>
                  <input
                    type="text"
                    name="template_task"
                    value={formData.template_task || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template task"
                  />
                </div>

                {/* Template Parameters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Parameters
                  </label>
                  <textarea
                    name="template_params"
                    value={formData.template_params || ""}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter template parameters (e.g., JSON format)"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="is_active_YN"
                    value={formData.is_active_YN}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                {/* HTML Editor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template HTML <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="600px"
                      defaultLanguage="html"
                      value={formData.template_html || ""}
                      onChange={handleEditorChange}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="w-1/2 overflow-hidden p-6 bg-gray-50 flex flex-col">
              <div className="sticky top-0 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Preview of your email template
                </p>
              </div>
              <div className="max-h-[65vh]">
                {formData.template_html ? (
                  <HtmlViewer htmlContent={formData.template_html} />
                ) : (
                  <p className="text-gray-500 mt-10">
                    No HTML content to preview. Type something in the Template
                    HTML * to preview it
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blueMain text-white rounded-lg hover:bg-blueMain/80 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
