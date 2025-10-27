"use client";
import { useState, useEffect } from "react";
import { getInternalEmailTemplates } from "@/services/InternalMemberApis";
import { InternalEmailTemplate } from "@/types/InternalMember";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import HtmlViewer from "../General/HtmlViewer";

export default function EmailTemplatesMain() {
  const [templates, setTemplates] = useState<InternalEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<InternalEmailTemplate | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

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
    // Functionality to be implemented later
    console.log("Edit template:", template.template_id);
  };

  const handleDelete = (template: InternalEmailTemplate) => {
    // Functionality to be implemented later
    console.log("Delete template:", template.template_id);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Link
          href="#"
          className="px-4 py-2 bg-blueMain text-white rounded-lg hover:bg-blueMain/80 transition-colors"
        >
          Create Email Template
        </Link>
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
                <th className="px-6 py-4">Template Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, idx) => (
                <tr
                  key={template.template_id}
                  className={`cursor-pointer ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-4 text-md font-medium text-gray-900">
                    {template.template_id}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-900">
                    {template.template_name}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500 max-w-xs truncate">
                    {template.template_description}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500">
                    {template.template_creator}
                  </td>
                  <td className="px-6 py-4 text-md text-gray-500">
                    {template.template_task}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.is_active_YN === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {template.is_active_YN === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
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
                    <div className="flex space-x-2">
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
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTemplate.template_name}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    Template ID:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {selectedTemplate.template_id}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Creator:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedTemplate.template_creator}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Task:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedTemplate.template_task}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedTemplate.is_active_YN === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedTemplate.is_active_YN === 1
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">
                    Description:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {selectedTemplate.template_description}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <h3 className="text-md font-semibold mb-3 text-gray-900">
                Template Preview
              </h3>
              <HtmlViewer htmlContent={selectedTemplate.template_html} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
