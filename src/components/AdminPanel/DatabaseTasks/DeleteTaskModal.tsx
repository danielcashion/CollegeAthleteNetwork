"use client";
import React, { useState, useRef, useEffect } from "react";
import { DatabaseTask } from "@/types/InternalMember";
import { deleteInternalCampaignTask } from "@/services/InternalMemberApis";
import { X, Trash2, TriangleAlert, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
  task: DatabaseTask | null;
}

export default function DeleteTaskModal({
  isOpen,
  onClose,
  onDeleteSuccess,
  task,
}: DeleteTaskModalProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDeleteConfirmText("");
    }
  }, [isOpen]);

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

  const handleDelete = async () => {
    if (!task || !task.task_id) {
      toast.error("Invalid task data");
      return;
    }

    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInternalCampaignTask(task.task_id);
      toast.success("Task deleted successfully!");
      onDeleteSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const isDeleteEnabled = deleteConfirmText.toLowerCase() === "delete" && !isDeleting;

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TriangleAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Database Task</h2>
                <p className="text-red-100 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="text-white/80 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the task{" "}
              <span className="font-semibold text-gray-900">
                &quot;{task.task_name}&quot;
              </span>
              ?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <TriangleAlert className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">Critical Warning</h4>
                  <p className="text-red-700 text-sm mt-1">
                    This will permanently remove the database task and may affect:
                  </p>
                  <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                    <li>Active campaigns using this task</li>
                    <li>Stored procedure configurations</li>
                    <li>Historical task execution data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Task Details:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> {task.task_id}</p>
              <p><span className="font-medium">Stored Procedure:</span> {task.sproc_name}</p>
              <p><span className="font-medium">Status:</span> {task.is_active_YN === 1 ? "Active" : "Inactive"}</p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">
                delete
              </span>{" "}
              to confirm:
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isDeleteEnabled}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}