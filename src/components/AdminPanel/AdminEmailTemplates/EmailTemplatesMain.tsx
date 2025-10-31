"use client";
import { useState, useEffect } from "react";
import { getInternalEmailTemplates } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { Eye, Edit, Trash2, Plus, Mail, Loader2 } from "lucide-react";
import EmailTemplateEditor from "./EmailTemplateEditor";
import EmailTemplateViewer from "./EmailTemplateViewer";

export default function EmailTemplatesMain() {
  const [templates, setTemplates] = useState<InternalEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<InternalEmailTemplate | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [templateToEdit, setTemplateToEdit] =
    useState<InternalEmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getInternalEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (template: InternalEmailTemplate) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleEdit = (template: InternalEmailTemplate) => {
    setTemplateToEdit(template);
    setEditorMode("edit");
    setShowEditorModal(true);
  };

  const handleCreate = () => {
    setTemplateToEdit(null);
    setEditorMode("create");
    setShowEditorModal(true);
  };

  const handleEditorClose = () => {
    setShowEditorModal(false);
    setTemplateToEdit(null);
  };

  const handleEditorSave = () => {
    fetchTemplates(); // Refresh the templates list
  };

  const handleDelete = (template: InternalEmailTemplate) => {
    // Functionality to be implemented later
    console.log("Delete template:", template.campaign_template_id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Templates Library</h1>
                <p className="text-blue-100 mt-1">Managing & organizing our email campaign templates</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-[#1C315F] rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Create Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-16 h-16 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading templates...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your email templates</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {templates.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Email Templates Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by creating your first email template. Templates help you maintain consistent messaging across campaigns.
                </p>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Template</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Template Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Database Task</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {templates.map((template) => (
                      <tr
                        key={template.campaign_template_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1C315F] transition-colors">
                            {template.template_title}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="max-w-sm">
                            <p
                              title={template.template_description}
                              className="text-sm text-gray-600 truncate hover:text-gray-900 cursor-help transition-colors"
                            >
                              {template.template_description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                              {template.template_creator?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="text-sm text-gray-900">{template.template_creator}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {template.template_task}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600">
                            {template.created_datetime
                              ? new Date(template.created_datetime).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(template);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn"
                              title="View Template"
                            >
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200 group/btn"
                              title="Edit Template"
                            >
                              <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group/btn"
                              title="Delete Template"
                            >
                              <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      <EmailTemplateViewer
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        template={selectedTemplate}
      />

      {/* Email Template Editor Modal */}
      <EmailTemplateEditor
        isOpen={showEditorModal}
        onClose={handleEditorClose}
        onSave={handleEditorSave}
        template={templateToEdit}
        mode={editorMode}
      />
    </div>
  );
}
