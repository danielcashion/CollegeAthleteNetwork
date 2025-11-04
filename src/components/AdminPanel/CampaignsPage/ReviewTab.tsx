"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import HtmlViewer from "../General/HtmlViewer";
import toast from "react-hot-toast";
import { getEmailListByUniversityAndFilters } from "@/services/InternalMemberApis";
import { getInternalEmailTemplatesById } from "@/services/InternalMemberApis";
import { CampaignData } from "@/types/Campaign";
import Drawer from "@mui/material/Drawer";
import { Loader, Edit, Check, X } from "lucide-react";
import { IoArrowUp, IoArrowDown } from "react-icons/io5";
import CampaignEmailsList from "./CampaignEmailsList";
import StyledTooltip from "@/components/common/StyledTooltip";
import {
  replaceTemplateVariablesWithLogo,
  getSampleEmailData,
} from "@/utils/CampaignUtils";
import { EmailRecipientData } from "@/types/Campaign";
import type { University } from "@/types/University";

interface EmailData {
  id: string;
  athlete_name: string;
  max_roster_year: number;
  sport: string;
  gender_id: number;
  email_address: string;
}

type Props = {
  onNext?: () => void;
  onBack?: () => void;
  audience_size?: number;
  audience_emails?: number;
  campaign_name?: string;
  campaign_status?: string;
  sendTestEmailAction?: (email: string) => Promise<void> | void;
  campaign?: CampaignData;
  // Template ID to fetch template data
  templateId?: string | null;
  // University logo props
  universityMetaData?: University | null;
  includeUniversityLogo?: boolean;
  // Color scheme props
  colorScheme?: "university" | "default";
  // Campaign name editing props
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
  // Campaign filters passed directly from parent
  campaignFilters?: {
    gender: string | null;
    sports: string[];
    selectedYears: number[];
    universities: string[];
  };
};

export default function ReviewScheduleTab({
  onNext,
  onBack,
  audience_size,
  audience_emails,
  campaign,
  campaign_name,
  campaign_status,
  templateId,
  universityMetaData = null,
  includeUniversityLogo = false,
  colorScheme = "default",
  campaignName,
  onCampaignNameUpdate,
  campaignFilters,
}: Props) {
  console.log("campaignfileters prop:", campaignFilters);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [showEmailsList, setShowEmailsList] = useState(false);
  const [excludedEmails, setExcludedEmails] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof EmailData | "gender">(
    "athlete_name"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isValid = emailRegex.test(testEmail.trim());

  // Template data state
  const [templateData, setTemplateData] = useState<{
    senderName: string;
    senderEmail: string;
    replyTo: string;
    subject: string;
    body: string;
    editorType: "text-editor" | "html";
  } | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Campaign name editing state
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");

  // Extract only the API-relevant filter criteria
  const apiFilterCriteria = useMemo(() => {
    // console.log("=== Computing apiFilterCriteria ===");
    // console.log("campaignFilters prop:", campaignFilters);
    // console.log("campaign:", campaign);
    // console.log("campaign?.campaign_filters:", campaign?.campaign_filters);

    // First, try to use the campaignFilters prop if available
    if (campaignFilters) {
      // console.log("Using campaignFilters prop");
      return campaignFilters;
    }

    // Fall back to parsing from campaign if no prop provided
    if (!campaign?.campaign_filters) {
      console.log("No campaign filters found, returning null");
      return null;
    }

    try {
      const filters = JSON.parse(campaign.campaign_filters);
      console.log("Parsed filters:", filters);

      const criteria = {
        gender: filters.gender,
        sports: filters.sports,
        selectedYears: filters.selectedYears,
        universities: filters.universities || [],
      };

      // console.log("Computed apiFilterCriteria:", criteria);
      return criteria;
    } catch (err) {
      console.error("Error parsing campaign filters:", err);
      return null;
    }
  }, [campaign, campaignFilters]);

  // Sorted list of first 5 emails, excluding excluded emails
  const sortedEmails = useMemo(() => {
    // First filter out excluded emails
    const filteredEmails = emails.filter(
      (email) => !excludedEmails.includes(email.email_address)
    );

    const arr = [...filteredEmails];
    arr.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortBy === "gender") {
        av = a.gender_id === 1 ? "Male" : "Female";
        bv = b.gender_id === 1 ? "Male" : "Female";
      } else {
        av = (a as any)[sortBy] ?? "";
        bv = (b as any)[sortBy] ?? "";
      }

      if (typeof av === "number" && typeof bv === "number") {
        return av - bv;
      }
      return String(av).localeCompare(String(bv));
    });
    if (sortDirection === "desc") arr.reverse();
    return arr.slice(0, 5); // Only show first 5
  }, [emails, sortBy, sortDirection, excludedEmails]);

  // Get replacement data for preview - use first email or sample data
  const replacementData = useMemo(() => {
    if (emails.length > 0) {
      // Use the first email from the full list for replacement
      const firstEmail = emails[0];
      return {
        athlete_name: firstEmail.athlete_name,
        max_roster_year: firstEmail.max_roster_year,
        sport: firstEmail.sport,
        gender_id: firstEmail.gender_id,
        email_address: firstEmail.email_address,
        correlation_id: "", // Not needed for replacement
        university_name:
          campaignFilters?.universities?.[0] ||
          apiFilterCriteria?.universities?.[0],
      } as EmailRecipientData;
    }
    // Fallback to sample data if no emails loaded yet
    return getSampleEmailData();
  }, [emails, campaignFilters, apiFilterCriteria]);

  // Template data with variables replaced
  const replacedTemplateData = useMemo(() => {
    if (!templateData) return null;

    return {
      ...templateData,
      senderName: replaceTemplateVariablesWithLogo(
        templateData.senderName,
        replacementData,
        universityMetaData,
        includeUniversityLogo,
        colorScheme
      ),
      senderEmail: replaceTemplateVariablesWithLogo(
        templateData.senderEmail,
        replacementData,
        universityMetaData,
        includeUniversityLogo,
        colorScheme
      ),
      subject: replaceTemplateVariablesWithLogo(
        templateData.subject,
        replacementData,
        universityMetaData,
        includeUniversityLogo,
        colorScheme
      ),
      body: replaceTemplateVariablesWithLogo(
        templateData.body,
        replacementData,
        universityMetaData,
        includeUniversityLogo,
        colorScheme
      ),
    };
  }, [
    templateData,
    replacementData,
    universityMetaData,
    includeUniversityLogo,
    colorScheme,
  ]);

  // Create a campaign object for the emails list drawer with current filter state
  const campaignForDrawer = useMemo(() => {
    // If we have campaignFilters prop, use it to create a fresh campaign object
    if (campaignFilters) {
      return {
        campaign_id: campaign?.campaign_id,
        campaign_name: campaignName || "Filtered Audience",
        audience_size: audience_size,
        audience_emails: audience_emails,
        campaign_filters: JSON.stringify(campaignFilters),
      };
    }
    // Otherwise, fall back to the campaign prop
    return campaign;
  }, [campaign, campaignFilters, campaignName, audience_size, audience_emails]);

  const toggleSort = (col: keyof EmailData | "gender") => {
    if (sortBy === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDirection("asc");
    }
  };

  // Fetch emails when component mounts and campaign filters change
  const fetchEmails = useCallback(async () => {
    // console.log("=== fetchEmails called ===");
    // console.log("apiFilterCriteria:", apiFilterCriteria);
    // console.log("campaign:", campaign);

    if (!apiFilterCriteria || !campaign) {
      console.log("Missing required data - apiFilterCriteria or campaign");
      setEmailsLoading(false);
      return;
    }

    // Check if universities are selected
    if (
      !apiFilterCriteria.universities ||
      apiFilterCriteria.universities.length === 0
    ) {
      console.log("No universities selected");
      setEmails([]);
      setEmailsLoading(false);
      return;
    }

    try {
      setEmailsLoading(true);
      setEmailsError(null);

      // Map gender string to gender_id array
      const genderMap: { [key: string]: number } = {
        M: 1,
        F: 2,
      };

      const gender_id = apiFilterCriteria.gender
        ? [genderMap[apiFilterCriteria.gender]]
        : undefined;
      const max_roster_year = apiFilterCriteria.selectedYears || undefined;
      const sports = apiFilterCriteria.sports || undefined;

      // Fetch emails for all selected universities using the array format
      const response = await getEmailListByUniversityAndFilters({
        university_name: apiFilterCriteria.universities,
        gender_id,
        max_roster_year,
        sports,
      });

      // console.log("API Response:", response); // Debug: Log the actual API response

      // The API returns [data, metadata], so we take the first element
      if (Array.isArray(response) && response.length > 0) {
        // console.log("First row of data:", response[0][0]); // Debug: Log first row to see field names

        // Map and add stable ids for selection handling
        const mapped = response[0].map((e: any, idx: number) => ({
          id: `${e.email_address ?? "row"}_${idx}`,
          athlete_name: e.athlete_name,
          max_roster_year: e.max_roster_year,
          sport: e.sport,
          gender_id: e.gender_id,
          email_address: e.email_address,
        }));
        // console.log("Mapped emails:", mapped.slice(0, 3)); // Debug: Log first 3 mapped rows
        // console.log("Total mapped records:", mapped.length);
        setEmails(mapped);
      } else {
        // console.log("No emails found in response");
        setEmails([]);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setEmailsError("Failed to fetch emails. Please try again.");
    } finally {
      setEmailsLoading(false);
    }
  }, [apiFilterCriteria, campaign]);

  useEffect(() => {
    // console.log("=== useEffect for fetchEmails triggered ===");
    // console.log("apiFilterCriteria:", apiFilterCriteria);
    // console.log("campaign:", campaign);

    if (apiFilterCriteria) {
      // console.log("Calling fetchEmails...");
      fetchEmails();
    } else {
      console.log(
        "apiFilterCriteria is null/undefined, not calling fetchEmails"
      );
    }
  }, [apiFilterCriteria, fetchEmails, campaign]);

  // Initialize excluded emails from campaign filters - updates when campaign filters change
  useEffect(() => {
    try {
      if (campaign?.campaign_filters) {
        const filters = JSON.parse(campaign.campaign_filters);
        if (filters.excludedEmails && Array.isArray(filters.excludedEmails)) {
          setExcludedEmails(filters.excludedEmails);
        } else {
          setExcludedEmails([]);
        }
      }
    } catch (err) {
      console.error("Error parsing campaign filters:", err);
      setExcludedEmails([]);
    }
  }, [campaign?.campaign_filters]);

  // Fetch template data when templateId changes
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!templateId) {
        setTemplateData(null);
        return;
      }

      try {
        setTemplateLoading(true);
        const response = await getInternalEmailTemplatesById(templateId);

        if (response && response.length > 0) {
          const template = response[0];
          setTemplateData({
            senderName: template.email_from_name || "",
            senderEmail:
              template.email_from_address || "admin@collegeathletenetwork.org",
            replyTo: template.reply_to_address || "",
            subject: template.email_subject || "",
            body: template.email_body || "",
            editorType:
              template.editor_type === "html" ? "html" : "text-editor",
          });
        } else {
          setTemplateData(null);
          toast.error("Template not found");
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        setTemplateData(null);
        toast.error("Failed to fetch template data");
      } finally {
        setTemplateLoading(false);
      }
    };

    fetchTemplateData();
  }, [templateId]);

  useEffect(() => {
    if (testModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [testModalOpen]);

  const closeModal = () => {
    setTestModalOpen(false);
    setTestEmail("");
    setSubmitted(false);
    setSending(false);
  };

  const sendTestEmail = async (email: string) => {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: `${replacedTemplateData?.subject?.trim() || "Sample Email"}`,
        body: replacedTemplateData?.body || "<p>No content available</p>",
        isHtml: true,
        fromName: replacedTemplateData?.senderName || "The College Athlete Network",
        fromAddress: replacedTemplateData?.senderEmail || "admin@collegeathletenetwork.org",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send test email");
    }

    return response.json();
  };

  const handleSend = async () => {
    setSubmitted(true);
    if (!isValid) return;

    setSending(true);
    try {
      // Use the API endpoint instead of the optional sendTestEmailAction
      await sendTestEmail(testEmail.trim());
      toast.success(`Test email sent successfully to ${testEmail.trim()}`);
      // console.log("Test email sent to:", testEmail.trim());
      closeModal();
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  // Campaign name editing functions
  const startEditingCampaignName = () => {
    setTempCampaignName(campaignName || "");
    setIsEditingCampaignName(true);
  };

  const cancelEditingCampaignName = () => {
    setTempCampaignName("");
    setIsEditingCampaignName(false);
  };

  const saveCampaignName = () => {
    if (tempCampaignName.trim() && onCampaignNameUpdate) {
      onCampaignNameUpdate(tempCampaignName.trim());
      setIsEditingCampaignName(false);
      setTempCampaignName("");
      toast.success("Campaign name updated successfully");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Review & Schedule</h2>
          <div className="text-sm text-gray-500">
            Confirm settings and choose send window.
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Campaign Name Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Campaign Name:</span>
            {isEditingCampaignName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempCampaignName}
                  onChange={(e) => setTempCampaignName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCampaignName();
                    if (e.key === "Escape") cancelEditingCampaignName();
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={saveCampaignName}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEditingCampaignName}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900">
                  {campaignName || "Untitled Campaign"}
                </span>
                <button
                  onClick={startEditingCampaignName}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Edit campaign name"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <StyledTooltip
            title="Send a test email to sanity check content"
            placement="top"
            arrow
          >
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:font-bold transition-all duration-200"
              onClick={() => setTestModalOpen(true)}
            >
              Send Test Email
            </button>
          </StyledTooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-gray-500"># Athletes / # of Emails</div>
          <div
            className="font-bold text-xl"
            aria-label={
              audience_size !== undefined
                ? `Audience size ${audience_size}`
                : "Audience size unknown"
            }
          >
            {audience_size !== undefined ? audience_size.toLocaleString() : "—"}{" "}
            /{" "}
            {audience_emails !== undefined
              ? (audience_emails - excludedEmails.length).toLocaleString()
              : "—"}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-gray-500">Campaign Name</div>
          <div
            className="font-bold text-xl"
            aria-label={
              campaign_name
                ? `Campaign name ${campaign_name}`
                : "Campaign name not set"
            }
          >
            {campaign_name || "—"}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-gray-500">Campaign Status</div>
          <div
            className={`font-bold text-xl ${
              campaign_status === "Sent" ? "text-green-600" : ""
            }`}
            aria-label={
              campaign_status
                ? `Campaign status ${campaign_status}`
                : "Campaign status unknown"
            }
          >
            {campaign_status
              ? campaign_status.replace(
                  /\w\S*/g,
                  (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                )
              : "—"}
          </div>
        </div>
      </div>

      {/* Email List Preview Section */}
      <section aria-labelledby="email-list-heading" className="mb-6">
        <div className="flex items-center text-primary justify-between mb-4">
          <h4 id="email-list-heading" className="font-medium">
            Audience Preview; First {sortedEmails.length} recipients
          </h4>
          {emails.length > 0 ? (
            <StyledTooltip
              title="View the full list of recipient emails"
              placement="top"
              arrow
            >
              <button
                onClick={() => setShowEmailsList(true)}
                className="bg-primary text-white px-3 py-2 rounded-lg shadow-lg hover:font-bold transition-all duration-200"
              >
                View All Recipients
              </button>
            </StyledTooltip>
          ) : null}
        </div>

        <div className="rounded border shadow bg-white overflow-hidden">
          {emailsLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="text-gray-500">Loading audience...</span>
            </div>
          ) : emailsError ? (
            <div className="p-4 text-center text-red-600">{emailsError}</div>
          ) : emails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No recipients found for the selected criteria.
            </div>
          ) : sortedEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              All recipients have been excluded from this campaign.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-4 py-2 text-left font-semibold">
                      <button
                        onClick={() => toggleSort("athlete_name")}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                      >
                        Athlete Name
                        {sortBy === "athlete_name" ? (
                          sortDirection === "asc" ? (
                            <IoArrowUp className="h-4 w-4" />
                          ) : (
                            <IoArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      <button
                        onClick={() => toggleSort("email_address")}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                      >
                        Email
                        {sortBy === "email_address" ? (
                          sortDirection === "asc" ? (
                            <IoArrowUp className="h-4 w-4" />
                          ) : (
                            <IoArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      <button
                        onClick={() => toggleSort("sport")}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                      >
                        Sport
                        {sortBy === "sport" ? (
                          sortDirection === "asc" ? (
                            <IoArrowUp className="h-4 w-4" />
                          ) : (
                            <IoArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      <button
                        onClick={() => toggleSort("max_roster_year")}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                      >
                        Grad Year
                        {sortBy === "max_roster_year" ? (
                          sortDirection === "asc" ? (
                            <IoArrowUp className="h-4 w-4" />
                          ) : (
                            <IoArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      <button
                        onClick={() => toggleSort("gender")}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                      >
                        Gender
                        {sortBy === "gender" ? (
                          sortDirection === "asc" ? (
                            <IoArrowUp className="h-4 w-4" />
                          ) : (
                            <IoArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEmails.map((email, index) => (
                    <tr
                      key={email.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {email.athlete_name}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {email.email_address}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{email.sport}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {email.max_roster_year || "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {email.gender_id === 1 ? "Male" : "Female"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <StyledTooltip
                title="This is just to sanity check the data. View All using the above button to see all."
                arrow
                placement="top"
              >
                <div>
                  {sortedEmails.length >= 5 &&
                  emails.length > sortedEmails.length ? (
                    <div className="px-4 py-2 bg-gray-50 border-t text-center text-sm text-gray-600">
                      Showing first 5 of{" "}
                      {(emails.length - excludedEmails.length).toLocaleString()}{" "}
                      recipients
                      {excludedEmails.length > 0
                        ? ` (${excludedEmails.length.toLocaleString()} excluded)`
                        : ""}
                    </div>
                  ) : null}
                </div>
              </StyledTooltip>
            </div>
          )}
        </div>
      </section>

      {/* Email Preview Mock (Mac style window) */}
      <section aria-labelledby="email-preview-heading" className="mb-6">
        <h4
          id="email-preview-heading"
          className="font-medium text-primary mb-2"
        >
          Email Preview
        </h4>
        <div className="rounded border shadow bg-white overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 relative">
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"
                aria-hidden="true"
              />
              <span
                className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#e0a225]"
                aria-hidden="true"
              />
              <span
                className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1fa830]"
                aria-hidden="true"
              />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-500 select-none">
              Draft Email Preview
            </div>
          </div>

          {templateLoading ? (
            <div className="px-4 py-8 text-center">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading template...</p>
            </div>
          ) : (
            <>
              {/* Header metadata */}
              <div className="px-4 py-3 text-sm space-y-2 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span className="font-semibold w-24 inline-block">From:</span>
                  <span className="text-gray-700">
                    {replacedTemplateData?.senderName ||
                      "The College Athlete Network"}
                    &lt;
                    {templateData?.senderEmail ||
                      "no-reply@collegeathletenetwork.com"}
                    &gt;
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span className="font-semibold w-24 inline-block">
                    Reply-To:
                  </span>
                  <span className="text-gray-700">
                    {templateData?.replyTo ||
                      "support@collegeathletenetwork.com"}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span className="font-semibold w-24 inline-block">
                    Subject:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {replacedTemplateData?.subject || "No subject"}
                  </span>
                </div>
              </div>

              {/* Preview note */}
              <div className="px-4 py-2 bg-blue-50 border-b text-xs text-blue-700">
                <span className="font-medium">📧 Preview Note:</span> Template
                variables have been replaced with data from{" "}
                {replacementData.athlete_name} (
                {replacementData.university_name}) for preview purposes.
              </div>
              {/* Body */}
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                <div className="min-h-0">
                  <HtmlViewer
                    htmlContent={
                      replacedTemplateData?.body ||
                      "<p>No content available for preview</p>"
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="flex gap-3 justify-end">
        <button
          className="bg-gray-100 px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200 "
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="bg-primary text-white px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
          onClick={onNext}
        >
          Next: Scheduling/Sending
        </button>
      </div>
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative transform transition-all duration-300 mx-4"
            style={{ animation: "fadeIn 140ms ease-out" }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Send Test Email
                </h3>
                <p className="text-sm text-gray-500">
                  Preview your campaign before sending
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="test-email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Test Email Address <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputRef}
                id="test-email"
                type="email"
                disabled={sending}
                className={`w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1C315F] focus:border-[#1C315F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  submitted && !isValid
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !sending) {
                    e.preventDefault();
                    handleSend();
                  }
                  if (e.key === "Escape" && !sending) {
                    e.preventDefault();
                    closeModal();
                  }
                }}
                aria-invalid={submitted && !isValid ? "true" : "false"}
                aria-describedby={
                  !isValid && submitted ? "test-email-error" : undefined
                }
                autoFocus
              />
              {submitted && !isValid && (
                <p
                  id="test-email-error"
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  Please enter a valid email address.
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                The test email will include all template variables replaced with
                sample data for preview.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={sending}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || (!isValid && submitted)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>{sending ? "Sending..." : "Send Test Email"}</span>
              </button>
            </div>

            <button
              onClick={closeModal}
              disabled={sending}
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

      {/* Email List Drawer */}
      <Drawer
        anchor="right"
        open={showEmailsList}
        onClose={() => setShowEmailsList(false)}
      >
        <div className="w-[900px]">
          {campaignForDrawer && (
            <CampaignEmailsList
              campaign={campaignForDrawer}
              onClose={() => setShowEmailsList(false)}
              onCampaignUpdated={() => {
                // Optionally handle campaign updates here
                // console.log("Campaign updated:", updatedCampaign);
              }}
            />
          )}
        </div>
      </Drawer>
    </div>
  );
}
