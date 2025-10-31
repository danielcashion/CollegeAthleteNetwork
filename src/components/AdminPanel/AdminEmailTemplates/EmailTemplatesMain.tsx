"use client";
import { useState, useEffect } from "react";
import { getInternalEmailTemplates, deleteInternalEmailTemplate } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { Eye, Edit, Trash2, Plus, Mail, Loader2, AlertTriangle, X } from "lucide-react";
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
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<InternalEmailTemplate | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    setTemplateToDelete(template);
    setShowDeleteModal(true);
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete || deleteConfirmText.toLowerCase() !== "delete") {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInternalEmailTemplate(templateToDelete.campaign_template_id);
      await fetchTemplates(); // Refresh the templates list
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting template:", error);
      // You could add a toast notification here for error handling
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
    setDeleteConfirmText("");
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
                          <div className="max-w-xs">
                            <p
                              title={template.template_description}
                              className="text-sm text-gray-600 truncate hover:text-gray-900 cursor-help transition-colors"
                            >
                              {template.template_description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center max-w-32">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0">
                              {template.template_creator?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span 
                              className="text-sm text-gray-900 truncate"
                              title={template.template_creator}
                            >
                              {template.template_creator && template.template_creator.length > 12
                                ? `${template.template_creator.substring(0, 12)}...`
                                : template.template_creator}
                            </span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && templateToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Email Template</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the template{" "}
                  <span className="font-semibold text-gray-900">
                    &ldquo;{templateToDelete.template_title}&rdquo;
                  </span>
                  ?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Warning:</strong> This will permanently delete the template and all its associated data.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">delete</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Type 'delete' to confirm"
                  disabled={isDeleting}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText.toLowerCase() !== "delete" || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
