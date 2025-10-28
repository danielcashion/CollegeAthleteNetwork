"use client";
import React, { useEffect, useState, useRef } from "react";
import Drawer from "@mui/material/Drawer";
import { IoClose } from "react-icons/io5";
import { CampaignData } from "@/types/Campaign";
import { FiUsers, FiMail, FiTag, FiMapPin } from "react-icons/fi";
import CampaignEmailsList from "./CampaignEmailsList";
import { getInternalEmailTemplatesById } from "@/services/InternalMemberApis";

interface ViewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignData | null;
}

export default function ViewCampaignModal({
  isOpen,
  onClose,
  campaign,
}: ViewCampaignModalProps) {
  const [showEmailsList, setShowEmailsList] = useState(false);
  const [templateData, setTemplateData] = useState<{
    email_body: string;
  } | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const startTrapRef = useRef<HTMLDivElement | null>(null);
  const endTrapRef = useRef<HTMLDivElement | null>(null);
  const previousAriaHidden: { el: Element; prev?: string | null }[] = [];

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch template data when campaign changes
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!campaign?.campaign_template_id) {
        setTemplateData(null);
        return;
      }

      try {
        setTemplateLoading(true);
        const response = await getInternalEmailTemplatesById(
          campaign.campaign_template_id
        );

        if (response && response.length > 0) {
          setTemplateData({
            email_body: response[0].email_body || "",
          });
        } else {
          setTemplateData(null);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        setTemplateData(null);
      } finally {
        setTemplateLoading(false);
      }
    };

    if (isOpen && campaign) {
      fetchTemplateData();
    }
  }, [campaign, isOpen]);

  // Focus the dialog when opened for accessibility
  useEffect(() => {
    if (isOpen) {
      // defer to next tick so element exists
      setTimeout(() => {
        // Try to focus the first actionable element (close button) otherwise focus dialog
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else {
          dialogRef.current?.focus();
        }
      }, 0);
      // Mark background nodes as aria-hidden for screen readers
      try {
        const overlay = dialogRef.current?.closest('[role="presentation"]');
        if (overlay && overlay.parentElement) {
          const bodyChildren = Array.from(document.body.children);
          bodyChildren.forEach((child) => {
            if (child === overlay) return;
            // don't modify elements that are part of modal/portal
            const prev = child.getAttribute("aria-hidden");
            previousAriaHidden.push({ el: child, prev });
            child.setAttribute("aria-hidden", "true");
          });
        }
      } catch (err) {
        // best-effort; don't break UI
        console.warn("Failed to set aria-hidden on background elements", err);
      }
    }
    return () => {
      // restore aria-hidden attributes
      try {
        previousAriaHidden.forEach(({ el, prev }) => {
          if (prev === null) el.removeAttribute("aria-hidden");
          else if (prev === undefined) el.removeAttribute("aria-hidden");
          else el.setAttribute("aria-hidden", prev);
        });
      } catch (err) {
        // noop
      }
    };
  }, [isOpen]);

  if (!isOpen || !campaign) return null;

  // Parse campaign filters
  let parsedFilters = null;
  try {
    parsedFilters = campaign.campaign_filters
      ? JSON.parse(campaign.campaign_filters)
      : null;
  } catch (error) {
    console.error("Error parsing campaign filters:", error);
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="presentation"
    >
      {/* focus trap sentinel - tabbing backwards from first focusable lands here */}
      <div
        ref={startTrapRef}
        tabIndex={0}
        onFocus={() => {
          // move focus to last focusable inside dialog
          const dlg = dialogRef.current;
          if (!dlg) return;
          const focusable = dlg.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const last = focusable[focusable.length - 1];
          if (last) {
            last.focus();
          } else {
            dlg.focus();
          }
        }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-campaign-title"
        aria-describedby="view-campaign-desc"
        tabIndex={-1}
        className="bg-white rounded-xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2
              id="view-campaign-title"
              className="text-3xl font-extrabold font-merriweather text-primary"
            >
              Campaign Details
            </h2>
            <p id="view-campaign-desc" className="text-gray-600 mt-1">
              View Campaign Configuration and Settings
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close campaign details"
            ref={closeButtonRef}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Campaign Overview */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 pt-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Campaign Name: {campaign.campaign_name}
              </h3>
              {campaign.campaign_desc && (
                <p className="text-gray-600 mb-4">
                  Description: {campaign.campaign_desc}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <p className="font-semibold text-black">Status: </p>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      campaign.campaign_status
                    )}`}
                  >
                    {campaign.campaign_status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-step Information */}
        <div className="space-y-6">
          {/* Step 1: Audience Configuration */}
          <div className="border border-gray-200 shadow-container rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Audience Configuration
                </h4>
                <p className="text-md text-gray-600">
                  Target audience and filtering criteria
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Audience Size</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.audience_size || "0"}
                </p>
              </div>

              <div className="bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiMail className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Email Addresses</span>
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {campaign.audience_emails || "0"}
                  </p>

                  <button
                    onClick={() => setShowEmailsList(true)}
                    className="text-white bg-primary rounded-md text-xs px-2 py-1"
                  >
                    View List
                  </button>
                </div>
              </div>

              <div className="bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiMapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">University</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.university_name || "Not specified"}
                </p>
              </div>

              <div className="bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiTag className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Campaign Type</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {campaign.campaign_type || "Not specified"}
                </p>
              </div>
            </div>

            {/* Filters */}
            {parsedFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-lg text-gray-900 mb-3">
                  Applied Filters:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {parsedFilters.gender && (
                    <div>
                      <span className="text-md font-medium text-gray-700">
                        Gender:
                      </span>
                      <p className="text-md text-gray-600">
                        {parsedFilters.gender === "M"
                          ? "Male"
                          : parsedFilters.gender === "F"
                          ? "Female"
                          : parsedFilters.gender}
                      </p>
                    </div>
                  )}

                  {parsedFilters.sports && parsedFilters.sports.length > 0 && (
                    <div>
                      <span className="text-md font-medium text-gray-700">
                        Sports:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedFilters.sports.map(
                          (sport: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {sport}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {parsedFilters.selectedYears &&
                    parsedFilters.selectedYears.length > 0 && (
                      <div>
                        <span className="text-md font-medium text-gray-700">
                          Graduation Years:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedFilters.selectedYears.map(
                            (year: number, index: number) => (
                              <span
                                key={index}
                                className="inline-flex px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                              >
                                {year}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Email Template */}
          <div className="border border-gray-200 shadow-container rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Email Template
                </h4>
                <p className="text-md text-gray-600">
                  Email configuration and content
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-md font-medium text-gray-700">
                  From Name:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.email_from_name || "Not configured"}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  From Address:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.email_from_address || "Not configured"}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Reply To:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.reply_to_address || "Not configured"}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Subject Line:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.email_subject || "Not configured"}
                </p>
              </div>
            </div>

            {campaign.email_pre_header_text && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700">
                  Pre-header Text:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.email_pre_header_text}
                </p>
              </div>
            )}

            {(templateData?.email_body || campaign.email_body) && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700">
                  Email Body Preview:
                </span>
                {templateLoading ? (
                  <div className="mt-2 border border-gray-200 rounded-lg p-4">
                    <div className="text-center text-gray-500">
                      Loading template...
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-white p-4 max-h-96 overflow-y-auto">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            templateData?.email_body ||
                            campaign.email_body ||
                            "",
                        }}
                        style={{
                          lineHeight: "1.6",
                          color: "#333333",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Schedule & Send */}
          <div className="border border-gray-200 shadow-container rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Schedule & Send
                </h4>
                <p className="text-md text-gray-600">
                  Scheduling and delivery information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-md font-medium text-gray-700">
                  Scheduled:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.is_scheduled_YN ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Scheduled Date:
                </span>
                <p className="text-md text-gray-600">
                  {formatDate(campaign.scheduled_datetime)}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Send Date:
                </span>
                <p className="text-md text-gray-600">
                  {formatDate(campaign.send_datetime)}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Status Message:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.status_message || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: Metadata */}
          <div className="border border-gray-200 shadow-container rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Metadata
                </h4>
                <p className="text-md text-gray-600">
                  Creation and update information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-md font-medium text-gray-700">
                  Created:
                </span>
                <p className="text-md text-gray-600">
                  {formatDate(campaign.created_datetime)}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Last Updated:
                </span>
                <p className="text-sm text-gray-600">
                  {formatDate(campaign.updated_datetime)}
                </p>
              </div>

              <div>
                <span className="text-md font-medium text-gray-700">
                  Member ID:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.member_id || "Unknown"}
                </p>
              </div>
            </div>

            {campaign.attachments_url && (
              <div className="mt-4">
                <span className="text-md font-medium text-gray-700">
                  Attachments:
                </span>
                <p className="text-md text-gray-600">
                  {campaign.attachments_url}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* focus trap sentinel - tabbing forward from last focusable lands here */}
      <div
        ref={endTrapRef}
        tabIndex={0}
        onFocus={() => {
          const dlg = dialogRef.current;
          if (!dlg) return;
          const focusable = dlg.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          if (first) {
            first.focus();
          } else {
            dlg.focus();
          }
        }}
      />

      <Drawer
        anchor="right"
        open={showEmailsList}
        onClose={() => setShowEmailsList(false)}
        PaperProps={{
          "aria-label": "Campaign emails list",
          tabIndex: -1,
        }}
      >
        <div className="w-[900px]">
          <CampaignEmailsList
            campaign={campaign}
            onClose={() => setShowEmailsList(false)}
          />
        </div>
      </Drawer>
    </div>
  );
}
