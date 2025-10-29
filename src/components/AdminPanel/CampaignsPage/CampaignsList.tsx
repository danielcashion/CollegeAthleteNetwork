"use client";
import { useState, useRef, useEffect } from "react";
import InputField from "@/components/MUI/InputTextField";
import { Search } from "lucide-react";
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
  createCampaignAction: (name: string, desc: string) => void;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleView = () => {
    console.log("View campaign:", campaign.campaign_name);
    setIsOpen(false);
    onViewClick(campaign);
  };

  const handleEmailList = () => {
    // console.log("View emails list for campaign:", campaign.campaign_name);
    setIsOpen(false);
    onEmailListClick(campaign);
  };

  const handleEdit = () => {
    console.log("Edit campaign:", campaign.campaign_name);
    setIsOpen(false);
    onEditClick(campaign);
  };

  const handleDuplicate = () => {
    console.log("Duplicate campaign:", campaign.campaign_name);
    setIsOpen(false);
    onDuplicateClick(campaign);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <BsThreeDotsVertical className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Campaign
            </button>
            <button
              onClick={handleView}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiEye className="h-4 w-4" />
              Review Details
            </button>
            <button
              onClick={handleEmailList}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiAtSign className="h-4 w-4" />
              View Recipients
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <GrDuplicate className="h-4 w-4" />
              Duplicate
            </button>
            <button
              onClick={() => onDeleteClick(campaign)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 className="h-4 w-4" />
              Delete Campaign
            </button>
          </div>
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
  const [sortColumn, setSortColumn] = useState<keyof CampaignData | null>(
    "created_datetime"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      console.log("Duplicating campaign with data:", duplicatedCampaignData);

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
        university_name: "",
        member_id: "",
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

      console.log("Creating campaign with data:", campaignData);

      await createInternalCampaign(campaignData);
      toast.success("Campaign created successfully!");

      // Reset form and close modal
      setNewCampaignName("");
      setNewCampaignDesc("");
      setPreCreateError(null);
      setShowPreCreateModal(false);

      // Refresh campaigns list
      fetchCampaigns();

      // Call the createCampaignAction to open the campaign builder
      createCampaignAction(newCampaignName.trim(), newCampaignDesc.trim());
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

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.campaign_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      campaign.campaign_desc
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      campaign.campaign_type
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      campaign.campaign_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold font-merriweather text-primary">
              Campaigns
            </h1>
            <p className="text-primary mt-1">
              Manage your email and SMS communications to effectively engage
              your audience.
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="relative w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
              <InputField
                label="Campaign Search"
                value={searchTerm}
                setValue={setSearchTerm}
                clearEnabled={true}
              />
            </div>
            <button
              onClick={() => {
                setShowPreCreateModal(true);
                setNewCampaignName("");
                setNewCampaignDesc("");
                setPreCreateError(null);
              }}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto h-[70vh]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-primary text-white shadow-sm rounded-xl w-full">
              <tr>
                <th className="px-4 py-3 text-left font-semibold rounded-l-xl w-1/3">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("campaign_name")}
                  >
                    Campaign Name & Description {getSortIcon("campaign_name")}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("campaign_type")}
                  >
                    Type {getSortIcon("campaign_type")}
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("campaign_status")}
                  >
                    Status {getSortIcon("campaign_status")}
                  </button>
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("audience_size")}
                  >
                    Audience Size {getSortIcon("audience_size")}
                  </button>
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("audience_emails")}
                  >
                    Targeted Emails {getSortIcon("audience_emails")}
                  </button>
                </th>

                <th className="px-4 py-3 text-center font-semibold">
                  Sent/Scheduled Date
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("created_datetime")}
                  >
                    Created On {getSortIcon("created_datetime")}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort("updated_datetime")}
                  >
                    Last Update {getSortIcon("updated_datetime")}
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold rounded-r-xl">
                  <div className="flex items-center justify-end gap-1">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((campaign, index) => (
                <tr
                  key={campaign.campaign_id || index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-left w-1/3">
                    <StyledTooltip
                      title={`Click to Edit ${campaign.campaign_name} Campaign Details`}
                      arrow
                      placement="top"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => editCampaignAction(campaign)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            editCampaignAction(campaign);
                        }}
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label={`Edit campaign ${campaign.campaign_name}`}
                      >
                        {campaign.campaign_name}
                      </div>
                    </StyledTooltip>
                    {campaign.campaign_desc && (
                      <div className="text-sm text-gray-600 overflow-hidden line-clamp-1">
                        {campaign.campaign_desc}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <span className="capitalize">
                      {campaign.campaign_type || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      {campaign.campaign_status || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {campaign.audience_size
                      ? Number(campaign.audience_size).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {campaign.audience_emails
                      ? Number(campaign.audience_emails).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const scheduledDate = campaign.scheduled_datetime
                        ? new Date(campaign.scheduled_datetime)
                        : null;
                      const sentDate = campaign.send_datetime
                        ? new Date(campaign.send_datetime)
                        : null;

                      // Get the greater of the two dates
                      const displayDate =
                        scheduledDate && sentDate
                          ? scheduledDate > sentDate
                            ? scheduledDate
                            : sentDate
                          : scheduledDate || sentDate;

                      if (!displayDate) return "-";

                      // Format as MM/DD/YYYY HH:MM AM/PM
                      const month = (displayDate.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                      const day = displayDate
                        .getDate()
                        .toString()
                        .padStart(2, "0");
                      const year = displayDate.getFullYear();
                      const hours24 = displayDate.getHours();
                      const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
                      const minutes = displayDate
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const ampm = hours24 >= 12 ? "PM" : "AM";

                      return `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`;
                    })()}
                  </td>

                  <td className="px-4 py-3 text-left">
                    {campaign.created_datetime
                      ? new Date(campaign.created_datetime).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {campaign.updated_datetime
                      ? new Date(campaign.updated_datetime).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ActionsDropdown
                        campaign={campaign}
                        onDeleteClick={handleDeleteClick}
                        onViewClick={handleViewClick}
                        onEmailListClick={handleEmailListClick}
                        onEditClick={editCampaignAction}
                        onDuplicateClick={handleDuplicateClick}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {sortedCampaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Campaign Modal */}
      <DeleteCampaignModal
        isOpen={deleteModalOpen}
        onCloseAction={handleDeleteModalClose}
        campaign={campaignToDelete}
        onDeleteSuccessAction={handleDeleteSuccess}
      />

      {/* View Campaign Modal */}
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
                // Update the selected campaign to reflect changes
                setSelectedCampaign(updatedCampaign);

                // Update the campaign in the campaigns list without refetching
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
      {showPreCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative"
          >
            <h2 className="text-xl font-semibold text-primary mb-1">
              Create New Campaign
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Provide a campaign name and a short description to get started.
              You can refine everything else in the builder workflow.
            </p>
            {preCreateError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {preCreateError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  maxLength={120}
                  disabled={isCreating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. Fall Alumni Update"
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {newCampaignName.length}/120
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  rows={3}
                  maxLength={300}
                  disabled={isCreating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Short internal summary of purpose..."
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {newCampaignDesc.length}/300
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreCreateModal(false);
                  setNewCampaignName("");
                  setNewCampaignDesc("");
                  setPreCreateError(null);
                }}
                disabled={isCreating}
                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCampaignName.trim() || !newCampaignDesc.trim()) {
                    setPreCreateError(
                      "Both name and description are required."
                    );
                    return;
                  }
                  handleCreateCampaignDraft();
                }}
                disabled={
                  isCreating ||
                  !newCampaignName.trim() ||
                  !newCampaignDesc.trim()
                }
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {isCreating ? "Creating..." : "Continue"}
              </button>
            </div>
            <button
              onClick={() => {
                if (!isCreating) {
                  setShowPreCreateModal(false);
                  setPreCreateError(null);
                }
              }}
              disabled={isCreating}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={duplicateModalRef}
            className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative"
          >
            <h2 className="text-xl font-semibold text-primary mb-1">
              Duplicate Campaign
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Create a copy of &quot;{campaignToDuplicate?.campaign_name}&quot;.
              You can modify the name and description below.
            </p>
            {duplicateError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {duplicateError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={duplicateCampaignName}
                  onChange={(e) => setDuplicateCampaignName(e.target.value)}
                  maxLength={120}
                  disabled={isDuplicating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. Fall Alumni Update Copy"
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {duplicateCampaignName.length}/120
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={duplicateCampaignDesc}
                  onChange={(e) => setDuplicateCampaignDesc(e.target.value)}
                  rows={3}
                  maxLength={300}
                  disabled={isDuplicating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Short internal summary of purpose..."
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {duplicateCampaignDesc.length}/300
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateCampaignName("");
                  setDuplicateCampaignDesc("");
                  setDuplicateError(null);
                  setCampaignToDuplicate(null);
                }}
                disabled={isDuplicating}
                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    !duplicateCampaignName.trim() ||
                    !duplicateCampaignDesc.trim()
                  ) {
                    setDuplicateError(
                      "Both name and description are required."
                    );
                    return;
                  }
                  handleDuplicateCampaign();
                }}
                disabled={
                  isDuplicating ||
                  !duplicateCampaignName.trim() ||
                  !duplicateCampaignDesc.trim()
                }
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDuplicating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {isDuplicating ? "Duplicating..." : "Duplicate Campaign"}
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
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
