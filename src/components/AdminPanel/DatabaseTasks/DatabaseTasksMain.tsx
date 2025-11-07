"use client";
import { useState, useEffect, useRef } from "react";
import { getInternalCampaignTasks } from "@/services/InternalMemberApis";
import { DatabaseTask } from "@/types/InternalMember";
import { Database, Search, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SkeletonTable } from "@/components/common/Skeleton";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";

// Actions dropdown component
const ActionsDropdown = ({
  task,
  onEditClick,
  onDeleteClick,
}: {
  task: DatabaseTask;
  onEditClick: (task: DatabaseTask) => void;
  onDeleteClick: (task: DatabaseTask) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Check dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 120; // Approximate height of dropdown
      const buffer = 20; // Add buffer for better spacing

      // Check if there's enough space below the button
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Position above if there's not enough space below, but enough space above
      if (
        spaceBelow < dropdownHeight + buffer &&
        spaceAbove >= dropdownHeight + buffer
      ) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen]);

  const handleEdit = () => {
    setIsOpen(false);
    onEditClick(task);
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDeleteClick(task);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1C315F]/20"
      >
        <BsThreeDotsVertical className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-1 ${
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <button
            onClick={handleEdit}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            <FiEdit2 className="h-4 w-4 text-blue-500" />
            <span>Edit</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <FiTrash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function DatabaseTasksMain() {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DatabaseTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getInternalCampaignTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching database tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Modal handlers
  const handleEditClick = (task: DatabaseTask) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteClick = (task: DatabaseTask) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const handleEditSave = () => {
    fetchTasks(); // Refresh the list after edit
  };

  const handleDeleteSuccess = () => {
    fetchTasks(); // Refresh the list after delete
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(
    (task) =>
      task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.sproc_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (isActive: number) => {
    return isActive === 1 ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusText = (isActive: number) => {
    return isActive === 1 ? "Active" : "Inactive";
  };

  const getStatusBadgeColor = (isActive: number) => {
    return isActive === 1
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  The College Athlete Network
                </h1>
                <h1 className="text-2xl font-bold tracking-tight">
                  Database Tasks Management
                </h1>
                <p className="text-blue-100 mt-1">
                  Monitor and manage stored procedures and database operations
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-80">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 bg-white/90 backdrop-blur-sm text-[#1C315F]"
                  placeholder="Search tasks..."
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-[#1C315F] rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Database Tasks</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <SkeletonTable />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Task Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stored Procedure
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.task_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="font-semibold text-gray-900">
                            {task.task_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {task.task_description}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {task.task_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {task.sproc_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {task.req_params && (
                            <div className="text-sm">
                              <span className="font-medium text-red-700">Required:</span>
                              <div className="font-mono text-xs bg-red-50 px-2 py-1 rounded mt-1">
                                {task.req_params}
                              </div>
                            </div>
                          )}
                          {task.optional_params && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-700">Optional:</span>
                              <div className="font-mono text-xs bg-blue-50 px-2 py-1 rounded mt-1">
                                {task.optional_params}
                              </div>
                            </div>
                          )}
                          {!task.req_params && !task.optional_params && (
                            <span className="text-gray-400 text-sm">No parameters</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.is_active_YN)}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                              task.is_active_YN
                            )}`}
                          >
                            {getStatusText(task.is_active_YN)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(task.created_datetime)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            by {task.created_by}
                          </div>
                          {task.updated_datetime && (
                            <div className="text-gray-400 text-xs mt-1">
                              Updated: {formatDate(task.updated_datetime)}
                              {task.updated_by && ` by ${task.updated_by}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ActionsDropdown
                          task={task}
                          onEditClick={handleEditClick}
                          onDeleteClick={handleDeleteClick}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTasks.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "No database tasks are currently available"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSave={handleEditSave}
        task={selectedTask}
      />

      {/* Delete Modal */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onDeleteSuccess={handleDeleteSuccess}
        task={selectedTask}
      />
    </div>
  );
}