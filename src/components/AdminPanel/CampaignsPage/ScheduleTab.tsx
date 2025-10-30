"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import toast from "react-hot-toast";
import {
  getEmailListByUniversityAndFilters,
  updateInternalCampaign,
} from "@/services/InternalMemberApis";
import type { CampaignData } from "@/types/Campaign";
import type { University } from "@/types/University";
import { TriangleAlert } from "lucide-react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

type Props = {
  onBack?: () => void;
  onSendNow?: () => void; // send immediately
  onScheduleSend?: (scheduledAt: string) => void; // ISO string
  emailBody?: string; // raw HTML body without variable replacement
  templateId?: string | null; // campaign template ID for S3 key
  // Campaign and session data for SQS integration
  campaign?: CampaignData | null;
  session?: any;
  // Filter criteria for fetching recipients
  campaignFilters?: {
    gender: string | null;
    sports: string[];
    selectedYears: number[];
  };
  // University logo props
  universityMetaData?: University | null;
  includeUniversityLogo?: boolean;
  colorScheme?: "university" | "default";
  // Campaign name editing props
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
};

export default function ScheduleTab({
  onBack,
  onSendNow,
  onScheduleSend,
  emailBody,
  templateId,
  campaign,
  session,
  campaignFilters,
  universityMetaData = null,
  includeUniversityLogo = false,
  colorScheme = "default",
  campaignName,
  onCampaignNameUpdate,
}: Props) {
  const [sendOption, setSendOption] = useState<"now" | "schedule">("now");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmSendModalOpen, setConfirmSendModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const confirmationInputRef = React.useRef<HTMLInputElement>(null);

  // Campaign name editing state
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");

  // Handle Escape key for confirmation modal
  useEffect(() => {
    if (!confirmSendModalOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmSendModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [confirmSendModalOpen]);

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (!confirmSendModalOpen) {
      setConfirmationText("");
    } else {
      // Focus the input when modal opens
      setTimeout(() => {
        confirmationInputRef.current?.focus();
        confirmationInputRef.current?.select();
      }, 100);
    }
  }, [confirmSendModalOpen]);

  // Round a Dayjs instance up to the next 15-minute increment
  const roundUpToNextQuarter = (d: Dayjs) => {
    const m = d.minute();
    const remainder = m % 15;
    if (remainder === 0) return d.second(0).millisecond(0);
    return d
      .add(15 - remainder, "minute")
      .second(0)
      .millisecond(0);
  };

  // When user chooses to schedule, default the time to the next 15-minute increment if not set
  React.useEffect(() => {
    if (sendOption === "schedule") {
      if (!selectedTime) {
        setSelectedTime(roundUpToNextQuarter(dayjs()));
      } else {
        setSelectedTime((t) =>
          t ? roundUpToNextQuarter(t) : roundUpToNextQuarter(dayjs())
        );
      }
    }
  }, [sendOption]);

  const handleSend = async () => {
    if (!campaign || !session || !campaignFilters) {
      toast.error("Missing campaign, session, or filter data");
      return;
    }

    setUploading(true);

    try {
      // Handle scheduled send - update campaign with scheduling info instead of sending emails
      if (sendOption === "schedule") {
        // Validate date and time are selected
        if (!selectedDate) {
          setCalendarOpen(true);
          setUploading(false);
          return;
        }

        if (!selectedTime) {
          setTimeOpen(true);
          setUploading(false);
          return;
        }

        // Combine date and time into UTC ISO string
        const combined = selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute())
          .second(0)
          .millisecond(0);

        const utcIso = combined.toDate().toISOString();

        // Update campaign with scheduling information
        try {
          await updateInternalCampaign(campaign.campaign_id, {
            ...campaign,
            campaign_status: "Scheduled",
            is_scheduled_YN: 1,
            scheduled_datetime: utcIso,
          });
          console.log("Campaign scheduled for:", utcIso);
          toast.success(
            `Campaign scheduled successfully for ${combined.format(
              "MMM D, YYYY h:mm A"
            )}`
          );
        } catch (updateError) {
          console.error("Failed to schedule campaign:", updateError);
          toast.error("Failed to schedule campaign");
          setUploading(false);
          return;
        }

        // Call the scheduling callback if provided
        if (onScheduleSend) {
          onScheduleSend(utcIso);
        }
        return;
      }

      // Handle immediate send - existing logic
      // Process the email body to handle university logo
      let processedEmailBody = emailBody || "";

      if (processedEmailBody) {
        // Replace university logo URL placeholder
        const universityLogoUrl =
          includeUniversityLogo && universityMetaData?.logo_url
            ? universityMetaData.logo_url
            : "";

        processedEmailBody = processedEmailBody.replace(
          /\{\{university_logo\}\}/g,
          universityLogoUrl
        );

        // Remove university logo img tag if logo should not be included
        if (!includeUniversityLogo) {
          processedEmailBody = processedEmailBody.replace(
            /<img[^>]*id\s*=\s*["']university_logo["'][^>]*>/gi,
            ""
          );
        }
      }

      // First, upload the HTML template to S3 if we have the necessary data
      if (processedEmailBody && templateId) {
        const response = await fetch("/api/upload-html-template", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            htmlContent: processedEmailBody,
            templateId: templateId,
          }),
        });

        const uploadResult = await response.json();

        if (!uploadResult.success) {
          toast.error(`Failed to upload email template: ${uploadResult.error}`);
          setUploading(false);
          return;
        }
        toast.success("Email template uploaded successfully");
      }

      // Fetch recipients using the campaign filters
      const genderMap: { [key: string]: number } = {
        M: 1,
        F: 2,
      };

      const gender_id = campaignFilters.gender
        ? [genderMap[campaignFilters.gender]]
        : undefined;
      const max_roster_year = campaignFilters.selectedYears || undefined;
      const sports = campaignFilters.sports || undefined;

      console.log("Fetching recipients with filters:", {
        university_name:
          session.user?.university_affiliation || campaign.university_name,
        gender_id,
        max_roster_year,
        sports,
      });

      const emailListResponse = await getEmailListByUniversityAndFilters({
        university_name:
          session.user?.university_affiliation || campaign.university_name,
        gender_id,
        max_roster_year,
        sports,
      });

      // The API returns [data, metadata], so we take the first element
      const recipientsData =
        Array.isArray(emailListResponse) && emailListResponse.length > 0
          ? emailListResponse[0]
          : [];

      if (!recipientsData || recipientsData.length === 0) {
        toast.error("No recipients found for the selected criteria");
        setUploading(false);
        return;
      }

      // Transform recipients for SQS format
      const recipients = recipientsData
        .filter((recipient: any) => {
          // Validate required fields
          const hasRequiredFields =
            recipient.correlation_id &&
            recipient.email_address &&
            recipient.email_address.includes("@"); // Basic email validation

          // Check if email is in excluded list
          let isExcluded = false;
          if (campaign?.campaign_filters) {
            try {
              const filters = JSON.parse(campaign.campaign_filters);
              if (
                filters.excludedEmails &&
                Array.isArray(filters.excludedEmails)
              ) {
                isExcluded = filters.excludedEmails.includes(
                  recipient.email_address
                );
              }
            } catch (error) {
              console.error(
                "Error parsing campaign filters for excluded emails:",
                error
              );
            }
          }

          return hasRequiredFields && !isExcluded;
        })
        .map((recipient: any) => ({
          recipient_id: recipient.correlation_id,
          email: recipient.email_address,
          university: recipient.university_name || "",
          segment: recipient.sport || "",
          vars: {
            athlete_name: recipient.athlete_name || "",
            max_roster_year: (recipient.max_roster_year || "").toString(),
            sport: recipient.sport || "",
            gender_id: (recipient.gender_id || "").toString(),
            university_name: recipient.university_name || "",
          },
        }));

      if (recipients.length === 0) {
        toast.error(
          "No valid recipients found (missing email addresses, correlation IDs, or all emails excluded)"
        );
        setUploading(false);
        return;
      }

      if (recipients.length < recipientsData.length) {
        const filteredCount = recipientsData.length - recipients.length;
        console.warn(
          `Filtered out ${filteredCount} recipients (invalid data or excluded emails)`
        );
        console.log(
          `Sending to ${recipients.length} recipients after filtering`
        );
      }

      // Prepare SQS payload
      // Sanitize subject: remove CR/LF and trim whitespace to avoid accidental newlines
      const sanitizedSubject = (
        (campaign.email_subject as string) || "Email Campaign"
      )
        .replace(/\r?\n/g, " ")
        .trim();

      // Extract correlation_id from first recipient (all have the same correlation_id)
      const emailListCorrelationId = recipientsData[0].correlation_id;

      const sqsPayload = {
        campaign_id: campaign.campaign_id,
        correlation_id: emailListCorrelationId, // Using correlation_id from email list
        subject: sanitizedSubject,
        template_key: templateId || campaign.campaign_template_id || "",
        from_name: campaign.email_from_name || "College Athlete Network",
        from_address:
          campaign.email_from_address || "admin@collegeathletenetwork.org",
        reply_to_address:
          campaign.reply_to_address ||
          campaign.email_from_address ||
          "admin@collegeathletenetwork.org",
        recipients,
      };

      console.log("Sending to SQS:", {
        ...sqsPayload,
        recipients: `${recipients.length} recipients`,
      });

      // Send to SQS
      const sqsResponse = await fetch("/api/notifications/enqueue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sqsPayload),
      });

      const sqsResult = await sqsResponse.json();

      if (!sqsResponse.ok) {
        console.error("SQS enqueue failed:", sqsResult);
        toast.error(
          `Failed to enqueue emails: ${sqsResult.error || "Unknown error"}`
        );
        setUploading(false);
        return;
      }

      toast.success(
        `Successfully queued ${sqsResult.enqueued} emails in ${
          sqsResult.batches
        } batches${
          recipients.length < recipientsData.length
            ? ` (${
                recipientsData.length - recipients.length
              } emails excluded/filtered)`
            : ""
        }`
      );

      // Update campaign status to "Sent"
      try {
        await updateInternalCampaign(campaign.campaign_id, {
          ...campaign,
          campaign_status: "Sent",
          send_datetime: new Date().toISOString(),
        });
        console.log("Campaign status updated to 'Sent'");
      } catch (updateError) {
        console.error("Failed to update campaign status:", updateError);
        toast.error("Campaign sent but failed to update status");
      }

      // Call the immediate send callback if provided
      if (onSendNow) {
        onSendNow();
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      toast.error(
        `Failed to send campaign: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
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

  const handleCampaignNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveCampaignName();
    } else if (e.key === "Escape") {
      cancelEditingCampaignName();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="bg-white p-6 rounded-lg shadow min-h-[70vh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              Schedule & Send
            </h2>
            <p className="text-sm text-gray-500">
              Choose when you&apos;d like to send this communication.
            </p>
          </div>
          <div className="text-right text-xl font-bold text-primary">
            Campaign Name:{" "}
            {isEditingCampaignName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempCampaignName}
                  onChange={(e) => setTempCampaignName(e.target.value)}
                  onKeyDown={handleCampaignNameKeyPress}
                  className="px-2 py-1 border border-gray-300 rounded text-sm font-normal"
                  placeholder="Enter campaign name"
                  autoFocus
                />
                <button
                  onClick={saveCampaignName}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Save campaign name"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={cancelEditingCampaignName}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Cancel editing"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={startEditingCampaignName}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Edit campaign name"
                >
                  <FiEdit2 size={16} />
                </button>
                {campaignName ? (
                  <div className="font-normal hover:text-green-600">
                    {campaignName}
                  </div>
                ) : (
                  <div className="italic text-gray-400">Unnamed Campaign</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                className="text-sm text-gray-700 mb-2"
              >
                Send
              </FormLabel>
              <RadioGroup
                aria-label="send-option"
                name="send-option"
                value={sendOption}
                onChange={(e) => setSendOption(e.target.value as any)}
              >
                <FormControlLabel
                  value="now"
                  control={<Radio />}
                  label="Send now"
                />
                <div className="ml-6 mt-2 mb-2 text-sm text-gray-600">
                  Send immediately to the selected recipients.
                </div>
                <div className="flex items-center gap-3">
                  <FormControlLabel
                    value="schedule"
                    control={<Radio />}
                    label="Schedule for later"
                  />
                </div>
                <div className="ml-6 mt-2 text-sm text-gray-600">
                  Pick a date and time to send this communication.
                </div>
              </RadioGroup>
            </FormControl>

            {sendOption === "schedule" && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <TextField
                    label="Selected Date"
                    value={selectedDate ? selectedDate.format("M/D/YYYY") : ""}
                    onClick={() => setCalendarOpen(true)}
                    inputProps={{
                      readOnly: true,
                      style: { textAlign: "center" },
                    }}
                    size="small"
                  />

                  <TextField
                    label="Selected Time"
                    value={selectedTime ? selectedTime.format("h:mm A") : ""}
                    onClick={() => setTimeOpen(true)}
                    inputProps={{
                      readOnly: true,
                      style: { textAlign: "center" },
                    }}
                    size="small"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Tip: If you don&apos;t pick a time it will default to the
                  current time.
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-medium text-gray-700">
                  Scheduled For:
                </div>
              </div>
              <div
                className="border-t border-gray-600 my-3"
                aria-hidden="true"
              />
              <div className="text-sm text-gray-600">
                {(sendOption === "now" ||
                  (sendOption === "schedule" &&
                    selectedDate &&
                    selectedTime)) &&
                  (() => {
                    // Determine the Date object to display: now, or the combined selected date/time
                    const dateObj =
                      sendOption === "now"
                        ? new Date()
                        : selectedDate!
                            .hour(selectedTime!.hour())
                            .minute(selectedTime!.minute())
                            .second(0)
                            .millisecond(0)
                            .toDate();

                    const formatOpts: Intl.DateTimeFormatOptions = {
                      timeZone: userTZ,
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    };

                    const localStr = new Intl.DateTimeFormat(
                      undefined,
                      formatOpts
                    ).format(dateObj);
                    const utcStr = new Intl.DateTimeFormat(undefined, {
                      ...formatOpts,
                      timeZone: "UTC",
                    }).format(dateObj);

                    // Try to get a short timezone abbreviation (e.g., "EDT") for display.
                    let tzAbbr = "";
                    try {
                      const parts = new Intl.DateTimeFormat(undefined, {
                        timeZone: userTZ,
                        timeZoneName: "short",
                      }).formatToParts(dateObj);
                      tzAbbr =
                        parts.find((p) => p.type === "timeZoneName")?.value ||
                        "";
                    } catch (e) {
                      tzAbbr = "";
                    }

                    return (
                      <div className="space-y-1">
                        <div className="text-md font-semibold text-gray-800">
                          Browser Detected Timezone:
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {userTZ}
                        </div>

                        <div className="font-semibold text-gray-800">{`Scheduled Local:`}</div>
                        <div className="mt-2 text-sm text-gray-500">
                          {localStr} {tzAbbr}
                        </div>

                        <div className="font-semibold text-gray-800">
                          Scheduled in UTC:
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {utcStr} UTC
                        </div>
                      </div>
                    );
                  })()}

                {sendOption === "schedule" &&
                  !(selectedDate && selectedTime) && (
                    <div className="text-xs">
                      Pick a date and time to preview the scheduled send.
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            className="bg-gray-100 px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
            onClick={onBack}
            disabled={uploading}
          >
            Back
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setConfirmSendModalOpen(true)}
            disabled={uploading}
          >
            {uploading ? "Processing Campaign..." : "Send/Schedule Campaign"}
          </button>
        </div>

        {/* Calendar dialog */}
        <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
          <DialogTitle>Select Date</DialogTitle>
          <DialogContent>
            <DatePicker
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
              disablePast
              slotProps={{
                textField: {
                  size: "small",
                  inputProps: { style: { textAlign: "center" } },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setCalendarOpen(false);
                setTimeOpen(true);
              }}
            >
              Next: Time
            </Button>
          </DialogActions>
        </Dialog>

        {/* Time dialog */}
        <Dialog open={timeOpen} onClose={() => setTimeOpen(false)}>
          <DialogTitle>Select Time</DialogTitle>
          <DialogContent>
            <TimePicker
              value={selectedTime}
              onChange={(t) => setSelectedTime(t)}
              slotProps={{
                textField: {
                  size: "small",
                  inputProps: { style: { textAlign: "center" } },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimeOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setTimeOpen(false);
              }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>

        {/* Send Confirmation Modal */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start pt-12 justify-center z-50 ${
            confirmSendModalOpen ? "" : "hidden"
          }`}
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmSendModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <TriangleAlert className="h-5 w-5 text-primary" />
                {sendOption === "schedule" ? "Schedule" : "Send"} Campaign
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to{" "}
                {sendOption === "schedule" ? "schedule" : "send"} this email
                campaign to{" "}
                {campaign?.audience_emails || "the selected recipients"}{" "}
                recipients
                {sendOption === "schedule" ? " at the specified time" : ""}.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm font-bold">
                  Warning: This action cannot be undone
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  {sendOption === "schedule"
                    ? "Once a campaign is scheduled, it will be sent automatically at the specified time and cannot be stopped."
                    : "Once emails are sent, they cannot be recalled or stopped."}
                  Please ensure all campaign details are correct before
                  proceeding.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type &quot;Send It&quot; to confirm
              </label>
              <input
                ref={confirmationInputRef}
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Send It"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmSendModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmSendModalOpen(false);
                  handleSend();
                }}
                disabled={confirmationText.toLowerCase() !== "send it"}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                Confirm {sendOption === "schedule" ? "Schedule" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}
