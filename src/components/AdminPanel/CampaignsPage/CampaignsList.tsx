"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Mail, RefreshCw, X, User } from "lucide-react";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import { Plus, Loader } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEye, FiEdit2, FiTrash2, FiAtSign } from "react-icons/fi";
import { GrDuplicate } from "react-icons/gr";
import {
  getInternalCampaigns,
  createInternalCampaign,
} from "@/services/InternalMemberApis";
import { CampaignData } from "@/types/Campaign";
import DeleteCampaignModal from "./DeleteCampaignModal";
import ViewCampaignModal from "./ViewCampaignModal";
import Drawer from "@mui/material/Drawer";
import StyledTooltip from "@/components/common/StyledTooltip";
import CampaignEmailsList from "./CampaignEmailsList";
import toast from "react-hot-toast";
import { getVarcharEight } from "@/helpers/getVarCharId";

interface ECommsListProps {
  createCampaignAction: (campaign: CampaignData) => void;
  editCampaignAction: (campaign: CampaignData) => void;
}

// Actions dropdown component
const ActionsDropdown = ({
  campaign,
  onDeleteClick,
  onViewClick,
  onEmailListClick,
  onEditClick,
  onDuplicateClick,
}: {
  campaign: CampaignData;
  onDeleteClick: (campaign: CampaignData) => void;
  onViewClick: (campaign: CampaignData) => void;
  onEmailListClick: (campaign: CampaignData) => void;
  onEditClick: (campaign: CampaignData) => void;
  onDuplicateClick: (campaign: CampaignData) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
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
      const dropdownHeight = 280; // Approximate height of dropdown
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

  const handleView = () => {
    setIsOpen(false);
    onViewClick(campaign);
  };

  const handleEmailList = () => {
    // console.log("View emails list for campaign:", campaign.campaign_name);
    setIsOpen(false);
    onEmailListClick(campaign);
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEditClick(campaign);
  };

  const handleDuplicate = () => {
    setIsOpen(false);
    onDuplicateClick(campaign);
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
          className={`absolute right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-1 ${
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          <button
            onClick={handleEdit}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            <FiEdit2 className="h-4 w-4 text-blue-500" />
            <span>Edit Campaign</span>
          </button>
          <button
            onClick={handleView}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            <FiEye className="h-4 w-4 text-green-500" />
            <span>Review Details</span>
          </button>
          <button
            onClick={handleEmailList}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            <FiAtSign className="h-4 w-4 text-purple-500" />
            <span>View Recipients</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            <GrDuplicate className="h-4 w-4 text-orange-500" />
            <span>Duplicate</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => onDeleteClick(campaign)}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <FiTrash2 className="h-4 w-4" />
            <span>Delete Campaign</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function CampaignsList({
  createCampaignAction,
  editCampaignAction,
}: ECommsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof CampaignData | null>(
    "created_datetime"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignData | null>(
    null
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [campaignToView, setCampaignToView] = useState<CampaignData | null>(
    null
  );
  const [showEmailsList, setShowEmailsList] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(
    null
  );
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [campaignToDuplicate, setCampaignToDuplicate] =
    useState<CampaignData | null>(null);
  const [duplicateCampaignName, setDuplicateCampaignName] = useState("");
  const [duplicateCampaignDesc, setDuplicateCampaignDesc] = useState("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showPreCreateModal, setShowPreCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [preCreateError, setPreCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const duplicateModalRef = useRef<HTMLDivElement>(null);

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getInternalCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (campaign: CampaignData) => {
    setCampaignToDelete(campaign);
    setDeleteModalOpen(true);
  };

  const handleViewClick = (campaign: CampaignData) => {
    setCampaignToView(campaign);
    setViewModalOpen(true);
  };

  const handleEmailListClick = (campaign: CampaignData) => {
    setSelectedCampaign(campaign);
    setShowEmailsList(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setCampaignToDelete(null);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setCampaignToView(null);
  };

  const handleDeleteSuccess = () => {
    // Refresh campaigns after successful deletion
    fetchCampaigns();
  };

  const handleDuplicateClick = (campaign: CampaignData) => {
    setCampaignToDuplicate(campaign);
    setDuplicateCampaignName(`${campaign.campaign_name} Copy`);
    setDuplicateCampaignDesc("");
    setDuplicateError(null);
    setShowDuplicateModal(true);
  };

  const handleDuplicateCampaign = async () => {
    if (!duplicateCampaignName.trim() || !duplicateCampaignDesc.trim()) {
      setDuplicateError("Both name and description are required.");
      return;
    }

    if (!campaignToDuplicate) {
      setDuplicateError("Missing campaign data");
      return;
    }

    setIsDuplicating(true);
    try {
      const duplicatedCampaignData: CampaignData = {
        ...campaignToDuplicate,
        campaign_id: getVarcharEight(),
        campaign_name: duplicateCampaignName.trim(),
        campaign_desc: duplicateCampaignDesc.trim(),
        campaign_status: "draft", // Reset to draft
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
      };

      await createInternalCampaign(duplicatedCampaignData);
      toast.success("Campaign duplicated successfully!");

      // Reset form and close modal
      setDuplicateCampaignName("");
      setDuplicateCampaignDesc("");
      setDuplicateError(null);
      setShowDuplicateModal(false);
      setCampaignToDuplicate(null);

      // Refresh campaigns list
      fetchCampaigns();

      // Call the editCampaignAction to open the campaign builder for the duplicated campaign
      editCampaignAction(duplicatedCampaignData);
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast.error("Failed to duplicate campaign");
      setDuplicateError("Failed to duplicate campaign. Please try again.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleCreateCampaignDraft = async () => {
    if (!newCampaignName.trim() || !newCampaignDesc.trim()) {
      setPreCreateError("Both name and description are required.");
      return;
    }

    setIsCreating(true);
    try {
      const campaignData: CampaignData = {
        campaign_id: getVarcharEight(),
        campaign_name: newCampaignName.trim(),
        campaign_desc: newCampaignDesc.trim(),
        campaign_type: "email", // Default type
        aws_configuration_set: "CollegeAthleteNetworkEventbridge",
        campaign_status: "draft",
        audience_size: "0",
        audience_emails: "0",
        include_logo_YN: 0,
        university_colors_YN: 0,
        is_active_YN: 1,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
      };

      await createInternalCampaign(campaignData);
      toast.success("Campaign created successfully!");

      // Reset form and close modal
      setNewCampaignName("");
      setNewCampaignDesc("");
      setPreCreateError(null);
      setShowPreCreateModal(false);

      // Refresh campaigns list
      fetchCampaigns();

      // Call the createCampaignAction to open the campaign builder with the created campaign
      createCampaignAction(campaignData);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
      setPreCreateError("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSort = (column: keyof CampaignData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get unique campaign types from campaigns
  const campaignTypes = Array.from(
    new Set(
      campaigns
        .map((c) => c.campaign_type)
        .filter((type): type is string => type != null && type.trim() !== "")
    )
  ).sort();

  const filteredCampaigns = campaigns.filter((campaign) => {
    // Tab filter
    const matchesTab = 
      selectedTab === "all" ||
      (selectedTab === "uncategorized" 
        ? (!campaign.campaign_type || campaign.campaign_type.trim() === "")
        : campaign.campaign_type === selectedTab);

    // Search term filter
    const matchesSearchTerm =
      campaign.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaign_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaign_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.campaign_status?.toLowerCase().includes(searchTerm.toLowerCase());

    // University filter
    const matchesUniversityFilter = !universityFilter || (() => {
      if (!campaign.university_names) return false;
      
      try {
        // Parse the university_names JSON array
        const universities = JSON.parse(campaign.university_names);
        if (Array.isArray(universities)) {
          return universities.some(university => 
            university.toLowerCase().includes(universityFilter.toLowerCase())
          );
        }
      } catch {
        // If parsing fails, treat it as a string and search directly
        return campaign.university_names.toLowerCase().includes(universityFilter.toLowerCase());
      }
      
      return false;
    })();

    return matchesTab && matchesSearchTerm && matchesUniversityFilter;
  });

  const sortedCampaigns = sortColumn
    ? [...filteredCampaigns].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (
          sortColumn === "audience_size" ||
          sortColumn === "audience_emails"
        ) {
          const aNum = parseInt(aValue as string, 10) || 0;
          const bNum = parseInt(bValue as string, 10) || 0;
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Special handling for scheduled_datetime (Sent/Scheduled column)
        if (sortColumn === "scheduled_datetime") {
          // Get the display date for each campaign (same logic as in the table cell)
          const getDisplayDate = (campaign: CampaignData) => {
            const scheduledDate = campaign.scheduled_datetime
              ? new Date(campaign.scheduled_datetime)
              : null;
            const sentDate = campaign.send_datetime
              ? new Date(campaign.send_datetime)
              : null;

            return scheduledDate && sentDate
              ? scheduledDate > sentDate
                ? scheduledDate
                : sentDate
              : scheduledDate || sentDate;
          };

          const aDate = getDisplayDate(a);
          const bDate = getDisplayDate(b);

          // Handle null dates (put them at the end)
          if (!aDate && !bDate) return 0;
          if (!aDate) return sortDirection === "asc" ? 1 : -1;
          if (!bDate) return sortDirection === "asc" ? -1 : 1;

          return sortDirection === "asc" 
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      })
    : filteredCampaigns;

  const getSortIcon = (column: keyof CampaignData) => {
    if (sortColumn !== column) return <div className="w-4" />;
    return sortDirection === "asc" ? (
      <IoArrowUp className="h-4 w-4" />
    ) : (
      <IoArrowDown className="h-4 w-4" />
    );
  };

  // Add event listeners for modal close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showPreCreateModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowPreCreateModal(false);
        setNewCampaignName("");
        setNewCampaignDesc("");
        setPreCreateError(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (showPreCreateModal && event.key === "Escape") {
        setShowPreCreateModal(false);
        setNewCampaignName("");
        setNewCampaignDesc("");
        setPreCreateError(null);
      }
    };

    if (showPreCreateModal) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showPreCreateModal]);

  // Add event listeners for duplicate modal close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showDuplicateModal &&
        duplicateModalRef.current &&
        !duplicateModalRef.current.contains(event.target as Node)
      ) {
        setShowDuplicateModal(false);
        setDuplicateCampaignName("");
        setDuplicateCampaignDesc("");
        setDuplicateError(null);
        setCampaignToDuplicate(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (showDuplicateModal && event.key === "Escape") {
        setShowDuplicateModal(false);
        setDuplicateCampaignName("");
        setDuplicateCampaignDesc("");
        setDuplicateError(null);
        setCampaignToDuplicate(null);
      }
    };

    if (showDuplicateModal) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showDuplicateModal]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col gap-4 items-center justify-center h-64">
          <Loader className="h-10 w-10 animate-spin text-primary" />
          <div className="text-gray-500">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[700px] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white rounded-lg shadow-xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  The College Athlete Network
                </h1>
                <h1 className="text-2xl font-bold tracking-tight">
                  Client Engagement Campaigns
                </h1>
                <p className="text-blue-100 mt-1">
                  Manage our email & future SMS communications to effectively
                  engage our audience
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
                  placeholder="Search campaigns..."
                />
              </div>
              <button
                onClick={() => {
                  setShowPreCreateModal(true);
                  setNewCampaignName("");
                  setNewCampaignDesc("");
                  setPreCreateError(null);
                }}
                className="flex items-center space-x-3 px-8 py-3.5 bg-gradient-to-r from-blueMain to-redMain text-white rounded-xl hover:opacity-90 hover:shadow-3xl transition-all duration-200 font-semibold shadow-3xl transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blueMain"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="w-10 h-10" />
                </div>
                <span>Create New Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-16 h-16 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Loading campaigns...
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Please wait while we fetch your campaigns
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Campaigns
            </h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tabs */}
            {campaigns.length > 0 && (
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex space-x-1 px-6 pt-4 overflow-x-auto">
                  {campaignTypes.map((type) => {
                    const count = campaigns.filter(
                      (c) => c.campaign_type === type
                    ).length;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedTab(type)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                          selectedTab === type
                            ? "bg-white text-[#1C315F] border-t-2 border-x-2 border-[#1C315F] shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {type} ({count})
                      </button>
                    );
                  })}
                  {campaigns.some(
                    (c) => !c.campaign_type || c.campaign_type.trim() === ""
                  ) && (
                    <button
                      onClick={() => setSelectedTab("uncategorized")}
                      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                        selectedTab === "uncategorized"
                          ? "bg-white text-[#1C315F] border-t-2 border-x-2 border-[#1C315F] shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Uncategorized (
                      {
                        campaigns.filter(
                          (c) =>
                            !c.campaign_type || c.campaign_type.trim() === ""
                        ).length
                      }
                      )
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTab("all")}
                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                      selectedTab === "all"
                        ? "bg-white text-[#1C315F] border-t-2 border-x-2 border-[#1C315F] shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    All ({campaigns.length})
                  </button>
                </div>
              </div>
            )}

            {/* Refresh Button Section */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{sortedCampaigns.length}</span>{" "}
                  campaign{sortedCampaigns.length !== 1 ? "s" : ""} found
                </div>
                <div className="flex items-center space-x-4">
                  {/* University Filter */}
                  <div className="relative">
                    <input
                      type="text"
                      value={universityFilter}
                      onChange={(e) => setUniversityFilter(e.target.value)}
                      className="w-64 px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 text-sm"
                      placeholder="Filter by university..."
                    />
                    {universityFilter && (
                      <button
                        onClick={() => setUniversityFilter("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        aria-label="Clear university filter"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={fetchCampaigns}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {sortedCampaigns.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedTab !== "all"
                    ? "No Campaigns in This Category"
                    : "No Campaigns Found"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? `No campaigns match your search for "${searchTerm}". Try adjusting your search terms.`
                    : selectedTab !== "all"
                    ? "There are no campaigns in the selected category. Try selecting a different tab or create a new campaign."
                    : "Get started by creating your first email campaign to engage your audience effectively."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setShowPreCreateModal(true);
                      setNewCampaignName("");
                      setNewCampaignDesc("");
                      setPreCreateError(null);
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Campaign</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-x-auto max-h-[75vh] overflow-y-auto pb-20">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                            onClick={() => handleSort("campaign_name")}
                          >
                            <span>Campaign</span>
                            {getSortIcon("campaign_name")}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                            onClick={() => handleSort("campaign_status")}
                          >
                            <span>Status</span>
                            {getSortIcon("campaign_status")}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                            onClick={() => handleSort("university_names")}
                          >
                            <span>Target</span>
                            {getSortIcon("university_names")}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <div className="flex justify-center">
                            <button
                              className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                              onClick={() => handleSort("audience_size")}
                            >
                              <span>Audience/# Emails</span>
                              {getSortIcon("audience_size")}
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                            onClick={() => handleSort("scheduled_datetime")}
                          >
                            <span>Sent/Scheduled</span>
                            {getSortIcon("scheduled_datetime")}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1 hover:text-[#1C315F] transition-colors"
                            onClick={() => handleSort("created_datetime")}
                          >
                            <span>Created</span>
                            {getSortIcon("created_datetime")}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedCampaigns.map((campaign, index) => (
                        <tr
                          key={campaign.campaign_id || index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <StyledTooltip
                                title={
                                  <div className="space-y-3 p-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                                    <div>
                                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Campaign Name</div>
                                      <div className="text-sm font-medium" style={{ color: '#1C315F' }}>{campaign.campaign_name}</div>
                                    </div>
                                    {campaign.campaign_desc && (
                                      <div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</div>
                                        <div className="text-sm" style={{ color: '#1C315F' }}>{campaign.campaign_desc}</div>
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</div>
                                      <div className="text-sm capitalize" style={{ color: '#1C315F' }}>{campaign.campaign_type || "Email"}</div>
                                    </div>
                                    {campaign.updated_datetime && (
                                      <div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</div>
                                        <div className="text-sm" style={{ color: '#1C315F' }}>{new Date(campaign.updated_datetime).toLocaleDateString()}</div>
                                      </div>
                                    )}
                                  </div>
                                }
                                arrow
                                placement="right"
                                enterDelay={500}
                                leaveDelay={200}
                              >
                                <button
                                  onClick={() => editCampaignAction(campaign)}
                                  className="text-left font-semibold text-gray-900 hover:text-[#1C315F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1C315F]/20 rounded"
                                >
                                  {campaign.campaign_name}
                                </button>
                              </StyledTooltip>
                              {campaign.campaign_desc && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {campaign.campaign_desc.length > 80 
                                    ? `${campaign.campaign_desc.substring(0, 80)}...` 
                                    : campaign.campaign_desc}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                campaign.campaign_status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : campaign.campaign_status === "sent"
                                  ? "bg-blue-100 text-blue-800"
                                  : campaign.campaign_status === "scheduled"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : campaign.campaign_status === "processing"
                                  ? "bg-orange-100 text-orange-800"
                                  : campaign.campaign_status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : campaign.campaign_status === "draft"
                                  ? "bg-gray-200 text-gray-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {campaign.campaign_status || "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={(() => {
                              if (!campaign.university_names) return "No universities selected";
                              try {
                                const universities = JSON.parse(campaign.university_names);
                                return Array.isArray(universities) ? universities.join(", ") : campaign.university_names;
                              } catch {
                                return campaign.university_names;
                              }
                            })()}>
                              {(() => {
                                if (!campaign.university_names) return (
                                  <span className="text-gray-400 italic">No universities</span>
                                );
                                try {
                                  const universities = JSON.parse(campaign.university_names);
                                  if (Array.isArray(universities)) {
                                    return universities.length > 2 
                                      ? `${universities.slice(0, 2).join(", ")} +${universities.length - 2} more`
                                      : universities.join(", ");
                                  }
                                  return campaign.university_names;
                                } catch {
                                  return campaign.university_names;
                                }
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span>
                                {campaign.audience_size
                                  ? Number(campaign.audience_size).toLocaleString()
                                  : "0"}
                                {" / "}
                              </span>
                              <Mail className="w-4 h-4 text-gray-400 mr-1 ml-1" />
                              <span>
                                {campaign.audience_emails
                                  ? Number(campaign.audience_emails).toLocaleString()
                                  : "0"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(() => {
                              const scheduledDate = campaign.scheduled_datetime
                                ? new Date(campaign.scheduled_datetime)
                                : null;
                              const sentDate = campaign.send_datetime
                                ? new Date(campaign.send_datetime)
                                : null;

                              const displayDate =
                                scheduledDate && sentDate
                                  ? scheduledDate > sentDate
                                    ? scheduledDate
                                    : sentDate
                                  : scheduledDate || sentDate;

                              if (!displayDate)
                                return <span className="text-gray-400">—</span>;

                              const month = (displayDate.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const day = displayDate
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                              const year = displayDate.getFullYear();
                              const hours24 = displayDate.getHours();
                              const hours12 = hours24 % 12 || 12;
                              const minutes = displayDate
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              const ampm = hours24 >= 12 ? "PM" : "AM";

                              return (
                                <div>
                                  <div className="font-medium">{`${month}/${day}/${year}`}</div>
                                  <div className="text-xs text-gray-500">{`${hours12}:${minutes} ${ampm}`}</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(() => {
                              if (!campaign.created_datetime) {
                                return <span className="text-gray-400">—</span>;
                              }

                              const createdDate = new Date(campaign.created_datetime);
                              const month = (createdDate.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const day = createdDate
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                              const year = createdDate.getFullYear();
                              const hours24 = createdDate.getHours();
                              const hours12 = hours24 % 12 || 12;
                              const minutes = createdDate
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              const ampm = hours24 >= 12 ? "PM" : "AM";

                              return (
                                <div>
                                  <div className="font-medium">{`${month}/${day}/${year}`}</div>
                                  <div className="text-xs text-gray-500">{`${hours12}:${minutes} ${ampm}`}</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <ActionsDropdown
                              campaign={campaign}
                              onDeleteClick={handleDeleteClick}
                              onViewClick={handleViewClick}
                              onEmailListClick={handleEmailListClick}
                              onEditClick={editCampaignAction}
                              onDuplicateClick={handleDuplicateClick}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteCampaignModal
        isOpen={deleteModalOpen}
        onCloseAction={handleDeleteModalClose}
        campaign={campaignToDelete}
        onDeleteSuccessAction={handleDeleteSuccess}
      />

      <ViewCampaignModal
        isOpen={viewModalOpen}
        onClose={handleViewModalClose}
        campaign={campaignToView}
      />

      <Drawer
        anchor="right"
        open={showEmailsList}
        onClose={() => setShowEmailsList(false)}
      >
        <div className="w-[900px]">
          {selectedCampaign && (
            <CampaignEmailsList
              campaign={selectedCampaign}
              onClose={() => setShowEmailsList(false)}
              onCampaignUpdated={(updatedCampaign: CampaignData) => {
                setSelectedCampaign(updatedCampaign);
                setCampaigns((prevCampaigns) =>
                  prevCampaigns.map((campaign) =>
                    campaign.campaign_id === updatedCampaign.campaign_id
                      ? updatedCampaign
                      : campaign
                  )
                );
              }}
            />
          )}
        </div>
      </Drawer>

      {/* Pre-Create Modal */}
      {showPreCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative transform transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Campaign
                </h2>
                <p className="text-sm text-gray-500">
                  Get started with your campaign setup
                </p>
              </div>
            </div>

            {preCreateError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">
                  {preCreateError}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  maxLength={120}
                  disabled={isCreating}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., Fall Alumni Update"
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-2 text-right">
                  {newCampaignName.length}/120 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  rows={4}
                  maxLength={300}
                  disabled={isCreating}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Brief summary of your campaign's purpose and goals..."
                />
                <div className="text-xs text-gray-400 mt-2 text-right">
                  {newCampaignDesc.length}/300 characters
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPreCreateModal(false);
                  setNewCampaignName("");
                  setNewCampaignDesc("");
                  setPreCreateError(null);
                }}
                disabled={isCreating}
                className="px-6 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:transform-none"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaignDraft}
                disabled={
                  isCreating ||
                  !newCampaignName.trim() ||
                  !newCampaignDesc.trim()
                }
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blueMain to-redMain text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blueMain disabled:transform-none"
              >
                {isCreating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>{isCreating ? "Creating..." : "Create Campaign"}</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!isCreating) {
                  setShowPreCreateModal(false);
                  setNewCampaignName("");
                  setNewCampaignDesc("");
                  setPreCreateError(null);
                }
              }}
              disabled={isCreating}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={duplicateModalRef}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative transform transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <GrDuplicate className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Duplicate Campaign
                </h2>
                <p className="text-sm text-gray-500">
                  Create a copy of &quot;{campaignToDuplicate?.campaign_name}
                  &quot;
                </p>
              </div>
            </div>

            {duplicateError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">
                  {duplicateError}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={duplicateCampaignName}
                  onChange={(e) => setDuplicateCampaignName(e.target.value)}
                  maxLength={120}
                  disabled={isDuplicating}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., Fall Alumni Update Copy"
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-2 text-right">
                  {duplicateCampaignName.length}/120 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={duplicateCampaignDesc}
                  onChange={(e) => setDuplicateCampaignDesc(e.target.value)}
                  rows={4}
                  maxLength={300}
                  disabled={isDuplicating}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Brief summary of your duplicated campaign..."
                />
                <div className="text-xs text-gray-400 mt-2 text-right">
                  {duplicateCampaignDesc.length}/300 characters
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateCampaignName("");
                  setDuplicateCampaignDesc("");
                  setDuplicateError(null);
                  setCampaignToDuplicate(null);
                }}
                disabled={isDuplicating}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateCampaign}
                disabled={
                  isDuplicating ||
                  !duplicateCampaignName.trim() ||
                  !duplicateCampaignDesc.trim()
                }
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDuplicating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>
                  {isDuplicating ? "Duplicating..." : "Duplicate Campaign"}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!isDuplicating) {
                  setShowDuplicateModal(false);
                  setDuplicateCampaignName("");
                  setDuplicateCampaignDesc("");
                  setDuplicateError(null);
                  setCampaignToDuplicate(null);
                }
              }}
              disabled={isDuplicating}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
