"use client";
import { useState, useEffect } from "react";
import { InternalEmailTemplate, DatabaseTask } from "@/types/InternalMember";
import {
  createInternalEmailTemplate,
  updateInternalEmailTemplate,
  getInternalCampaignTasks,
} from "@/services/InternalMemberApis";
import {
  X,
  Save,
  Loader2,
  Edit,
  Eye,
  Code,
  Mail,
  Settings,
  Info,
  AlertCircle,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import HtmlViewer from "../General/HtmlViewer";
import { getVarcharEight } from "@/helpers/getVarCharId";

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
  const [campaignTasks, setCampaignTasks] = useState<DatabaseTask[]>([]);

  // Fetch campaign tasks on initial render
  useEffect(() => {
    const fetchCampaignTasks = async () => {
      try {
        const tasks = await getInternalCampaignTasks();
        setCampaignTasks(tasks);
      } catch (error) {
        console.error("Error fetching campaign tasks:", error);
      }
    };

    fetchCampaignTasks();
  }, []);

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, loading]);

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

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
        await updateInternalEmailTemplate(template.campaign_template_id, {
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[1600px] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white">
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {mode === "edit" ? (
                    <Edit className="w-6 h-6 text-white" />
                  ) : (
                    <Mail className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {mode === "edit"
                      ? "Edit Email Template"
                      : "Create Email Template"}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {mode === "edit"
                      ? "Modify your existing email template"
                      : "Build a new email template for your campaigns"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                disabled={loading}
                aria-label="Close editor"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl flex items-start space-x-3 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
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
                {/* Enhanced Basic Information Section */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                      General template details and metadata
                    </p>
                  </div>

                  {/* Enhanced Template Title */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="template_title"
                      value={formData.template_title || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                      placeholder="e.g., Welcome Email, Newsletter Template"
                      required
                    />
                  </div>

                  {/* Enhanced Template Description */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Description
                    </label>
                    <textarea
                      name="template_description"
                      value={formData.template_description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 resize-none group-hover:border-gray-400 bg-white shadow-sm"
                      placeholder="Describe the purpose and target audience for this template"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Enhanced Template Creator */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Creator
                      </label>
                      <input
                        type="text"
                        name="template_creator"
                        value={formData.template_creator || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                        placeholder="Creator name"
                      />
                    </div>

                    {/* Enhanced Status */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="is_active_YN"
                        value={formData.is_active_YN ?? 1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                      >
                        <option value={1}>✅ Active</option>
                        <option value={0}>⏸️ Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Enhanced Technical Configuration Section */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      Technical Configuration
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                      Advanced settings for template processing
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Enhanced Campaign Type */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Campaign Type
                      </label>
                      <input
                        type="text"
                        name="campaign_type"
                        value={formData.campaign_type || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                        placeholder="e.g., promotional, informational"
                      />
                    </div>

                    {/* Enhanced System-wide */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        System-wide Template
                      </label>
                      <select
                        name="is_systemwide_YN"
                        value={formData.is_systemwide_YN ?? 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                      >
                        <option value={1}>✅ Yes</option>
                        <option value={0}>❌ No</option>
                      </select>
                    </div>
                  </div>

                  {/* Enhanced Template Task */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Task
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (API Integration)
                      </span>
                    </label>
                    <select
                      name="template_task"
                      value={formData.template_task || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                    >
                      <option value="">Select a task...</option>
                      {campaignTasks.map((task) => (
                        <option key={task.task_id} value={task.task_name}>
                          {task.task_name}; {task.task_description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Enhanced Template Parameters */}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 resize-none group-hover:border-gray-400 bg-white shadow-sm"
                      placeholder="e.g., user_name, university_name, course_title"
                    />
                  </div>
                </div>

                {/* Enhanced Email Settings Section */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      Email Settings
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                      Configure email headers and metadata
                    </p>
                  </div>

                  {/* Enhanced Email Subject */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      name="email_subject"
                      value={formData.email_subject || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                      placeholder="e.g., Welcome to College Athlete Network!"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Enhanced Email From Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        name="email_from_name"
                        value={formData.email_from_name || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                        placeholder="e.g., CAN Team"
                      />
                    </div>

                    {/* Enhanced Email From Address */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Address
                      </label>
                      <input
                        type="email"
                        name="email_from_address"
                        value={formData.email_from_address || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                        placeholder="e.g., noreply@example.com"
                      />
                    </div>
                  </div>

                  {/* Enhanced Reply To Address */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reply To Address
                    </label>
                    <input
                      type="email"
                      name="reply_to_address"
                      value={formData.reply_to_address || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 group-hover:border-gray-400 bg-white shadow-sm"
                      placeholder="e.g., support@example.com"
                    />
                  </div>
                </div>

                {/* Enhanced HTML Editor Section */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <Code className="w-4 h-4 text-white" />
                      </div>
                      Email Body <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                      Write your email template HTML with live preview
                    </p>
                  </div>

                  <div className="border border-gray-300 rounded-xl overflow-hidden shadow-lg bg-white">
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
                        wordWrap: "off",
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        selectOnLineNumbers: true,
                        smoothScrolling: true,
                        // Disable autocomplete suggestions
                        quickSuggestions: false,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        wordBasedSuggestions: "off",
                        parameterHints: { enabled: true },
                        autoClosingBrackets: "never",
                        autoClosingQuotes: "never",
                        autoSurround: "never",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Right Side - Live Preview */}
            <div className="w-1/2 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
              <div className="px-8 py-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      Live Preview
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                      Real-time preview of your email template
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">Live</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  {formData.email_body ? (
                    <div className="p-6">
                      <HtmlViewer htmlContent={formData.email_body} />
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Code className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
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

        {/* Enhanced Footer */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center mr-3">
                <Info className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                {mode === "edit"
                  ? "Modifying existing template"
                  : "Creating new template"}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] focus:bg-[#243a66] transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1C315F] focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {mode === "edit" ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
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
    </div>
  );
}
