"use client";
import React, { useState, useEffect, useRef } from "react";
import { DatabaseTask } from "@/types/InternalMember";
import { updateInternalCampaignTask } from "@/services/InternalMemberApis";
import { X, Save, Loader2, Edit, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  task: DatabaseTask | null;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onSave,
  task,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState<Partial<DatabaseTask>>({
    task_name: "",
    task_description: "",
    sproc_name: "",
    req_params: "",
    optional_params: "",
    is_active_YN: 1,
  });
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        task_name: task.task_name || "",
        task_description: task.task_description || "",
        sproc_name: task.sproc_name || "",
        req_params: task.req_params || "",
        optional_params: task.optional_params || "",
        is_active_YN: task.is_active_YN,
      });
    }
  }, [task, isOpen]);

  // Handle outside click and escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field: keyof DatabaseTask, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!task || !task.task_id) {
      toast.error("Invalid task data");
      return;
    }

    if (!formData.task_name?.trim()) {
      toast.error("Task name is required");
      return;
    }

    if (!formData.task_description?.trim()) {
      toast.error("Task description is required");
      return;
    }

    if (!formData.sproc_name?.trim()) {
      toast.error("Stored procedure name is required");
      return;
    }

    setSaving(true);
    try {
      await updateInternalCampaignTask(task.task_id, formData);
      toast.success("Task updated successfully!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(error.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Database Task</h2>
                <p className="text-blue-100 text-sm">Update task configuration and parameters</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-white/80 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.task_name}
                onChange={(e) => handleInputChange("task_name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200"
                placeholder="Enter task name"
                disabled={saving}
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Description *
              </label>
              <textarea
                value={formData.task_description}
                onChange={(e) => handleInputChange("task_description", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 resize-none"
                placeholder="Enter task description"
                disabled={saving}
              />
            </div>

            {/* Stored Procedure Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stored Procedure Name *
              </label>
              <input
                type="text"
                value={formData.sproc_name}
                onChange={(e) => handleInputChange("sproc_name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 font-mono"
                placeholder="Enter stored procedure name"
                disabled={saving}
              />
            </div>

            {/* Parameters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Parameters */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Parameters
                </label>
                <textarea
                  value={formData.req_params || ""}
                  onChange={(e) => handleInputChange("req_params", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 font-mono text-sm resize-none"
                  placeholder="[parameter1, parameter2]"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">JSON array format</p>
              </div>

              {/* Optional Parameters */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optional Parameters
                </label>
                <textarea
                  value={formData.optional_params || ""}
                  onChange={(e) => handleInputChange("optional_params", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm resize-none"
                  placeholder="[optional1, optional2]"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">JSON array format</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active_YN"
                    value={1}
                    checked={formData.is_active_YN === 1}
                    onChange={(e) => handleInputChange("is_active_YN", parseInt(e.target.value))}
                    className="h-4 w-4 text-[#1C315F] focus:ring-[#1C315F] border-gray-300"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active_YN"
                    value={0}
                    checked={formData.is_active_YN === 0}
                    onChange={(e) => handleInputChange("is_active_YN", parseInt(e.target.value))}
                    className="h-4 w-4 text-[#1C315F] focus:ring-[#1C315F] border-gray-300"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>

            {/* Warning Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Important</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Modifying stored procedure names or parameters may affect existing campaigns and integrations.
                    Please ensure compatibility before saving changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}