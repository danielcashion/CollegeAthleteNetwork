"use client";
import { useState, useEffect } from "react";
import { getInternalEmailTemplates } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { Eye, Edit, Trash2 } from "lucide-react";
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
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blueMain  font-bold text-white rounded-lg hover:bg-blueMain/80 transition-colors"
        >
          + Create Email Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-200 text-gray-800 text-lg font-semibold">
              <tr>
                <th className="px-6 py-4">Template ID</th>
                <th className="px-6 py-4">Template Title</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Database Task</th>
                {/* <th className="px-6 py-4">Status</th> */}
                <th className="px-6 py-4">Created Datetime</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, idx) => (
                <tr
                  key={template.campaign_template_id}
                  className={`cursor-pointer ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-4 text-md font-medium text-gray-900">
                    {template.campaign_template_id}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-900">
                    {template.template_title}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500 max-w-xs truncate">
                    <span
                      title={template.template_description}
                      className="cursor-help"
                    >
                      {template.template_description}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500">
                    {template.template_creator}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500">
                    {template.template_task}
                  </td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.is_active_YN === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {template.is_active_YN === 1 ? "Active" : "Inactive"}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 text-md text-gray-500">
                    <span
                      title={template.created_datetime}
                      className="text-md text-gray-700"
                    >
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
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500">
                    <div className="flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(template);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No email templates found.
            </div>
          )}
        </div>
      )}

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
