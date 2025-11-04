"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import {
  IoArrowUp,
  IoArrowDown,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import {
  updateInternalCampaign,
  getEmailListByUniversityAndFilters,
} from "@/services/InternalMemberApis";
import { CampaignData } from "@/types/Campaign";
import { Loader } from "lucide-react";

interface CampaignEmailsListProps {
  campaign: any;
  onClose?: () => void;
  onCampaignUpdated?: (campaign: CampaignData) => void;
}

interface EmailData {
  id: string;
  athlete_name: string;
  max_roster_year: number;
  sport: string;
  gender_id: number;
  email_address: string;
}

export default function CampaignEmailsList({
  campaign,
  onClose,
  onCampaignUpdated,
}: CampaignEmailsListProps) {
  // console.log(campaign);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [excludedEmails, setExcludedEmails] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof EmailData | "gender">(
    "athlete_name"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExcludedDropdown, setShowExcludedDropdown] = useState(false);

  // Extract only the API-relevant filter criteria (excludes excludedEmails)
  const apiFilterCriteria = useMemo(() => {
    if (!campaign.campaign_filters) return null;

    try {
      const filters = JSON.parse(campaign.campaign_filters);
      return {
        gender: filters.gender,
        sports: filters.sports,
        selectedYears: filters.selectedYears,
        universities: filters.universities || [],
      };
    } catch (err) {
      console.error("Error parsing campaign filters:", err);
      return null;
    }
  }, [campaign.campaign_filters]);

  // Sorted list derived from emails and sort state, excluding excluded emails
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
        av = a.gender_id === 1 ? "Mens" : "Womens";
        bv = b.gender_id === 1 ? "Mens" : "Womens";
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
    return arr;
  }, [emails, sortBy, sortDirection, excludedEmails]);

  const toggleSort = (col: keyof EmailData | "gender") => {
    if (sortBy === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDirection("asc");
    }
  };

  // Fetch emails only on initial render
  const fetchInitialEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API filter criteria exists and is valid
      if (!apiFilterCriteria) {
        setError("No campaign filters found.");
        return;
      }

      // Check if universities are selected
      if (
        !apiFilterCriteria.universities ||
        apiFilterCriteria.universities.length === 0
      ) {
        setError("No universities selected for this campaign.");
        return;
      }

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

      // Fetch emails for all selected universities
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
        // console.log(
        //   "All field names in first row:",
        //   Object.keys(response[0][0] || {})
        // ); // Debug: Log all available fields
        // console.log(
        //   "Total number of fields:",
        //   Object.keys(response[0][0] || {}).length
        // ); // Debug: Count fields

        // Map and add stable ids for selection handling
        const mapped = response[0].map((e: any, idx: number) => {
          // Log all fields for first few rows to understand the data structure
          if (idx < 3) {
            console.log(`Row ${idx} fields:`, Object.keys(e));
            console.log(`Row ${idx} data:`, e);
          }

          return {
            id: `${e.email_address || e.email || `row_${idx}`}_${idx}`,
            // Map API fields to expected interface fields - try multiple possible field names
            athlete_name:
              e.athlete_name ||
              e.name ||
              e.full_name ||
              e.first_name + " " + e.last_name ||
              "Unknown",
            max_roster_year:
              e.max_roster_year ||
              e.graduation_year ||
              e.year ||
              e.roster_year ||
              e.grad_year ||
              0,
            sport: e.sport || e.sport_name || e.team_sport || "Unknown",
            gender_id:
              e.gender_id ||
              e.gender ||
              (e.gender_name === "M" ? 1 : e.gender_name === "W" ? 2 : 1),
            email_address:
              e.email_address || e.email || e.email_addr || "No email",
          };
        });

        console.log("Mapped data sample:", mapped.slice(0, 3)); // Debug: Log first 3 mapped rows
        console.log("Total mapped records:", mapped.length);

        // Set emails as returned; sorting for the UI is handled by `sortedEmails`
        setEmails(mapped);
      } else {
        console.log("No data returned from API or unexpected response format");
        console.log(
          "Response structure:",
          typeof response,
          Array.isArray(response),
          response?.length
        );
        setEmails([]);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError("Failed to fetch emails. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [apiFilterCriteria]); // Add apiFilterCriteria as dependency

  // Restore persisted sort state for this campaign (if any) - only runs once per campaign
  useEffect(() => {
    try {
      const key = `campaign_emails_sort_${campaign.campaign_id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.sortBy) setSortBy(parsed.sortBy);
        if (parsed?.sortDirection) setSortDirection(parsed.sortDirection);
      }
    } catch {
      // ignore localStorage read errors
    }
  }, [campaign.campaign_id]);

  // Initialize excluded emails from campaign filters - updates when campaign filters change
  useEffect(() => {
    try {
      if (campaign.campaign_filters) {
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
  }, [campaign.campaign_filters]);

  // Fetch emails only when API-relevant criteria change (excludes excludedEmails)
  useEffect(() => {
    if (apiFilterCriteria) {
      fetchInitialEmails();
    }
  }, [apiFilterCriteria, fetchInitialEmails]);

  // Persist sort state when it changes
  useEffect(() => {
    try {
      const key = `campaign_emails_sort_${campaign.campaign_id}`;
      const payload = JSON.stringify({ sortBy, sortDirection });
      localStorage.setItem(key, payload);
    } catch {
      // ignore localStorage write errors
    }
  }, [campaign.campaign_id, sortBy, sortDirection]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Emails List for Campaign: {campaign.campaign_name}
        </h2>
        <div className="flex flex-col gap-6 justify-center items-center py-8">
          <Loader className="animate-spin text-primary" size={35} />
          <span className="ml-2">Loading emails...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-extrabold font-merriweather text-primary">
          Emails Details for Campaign: {campaign.campaign_name}
        </h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-extrabold font-merriweather text-primary">
          Emails Details for Campaign: {campaign.campaign_name}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
          >
            <IoClose size={20} />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-md text-gray-600">
          Total Number of Emails: {sortedEmails.length.toLocaleString()}
          {excludedEmails.length > 0 && (
            <span className="text-red-600 ml-2">
              ({excludedEmails.length.toLocaleString()} excluded)
            </span>
          )}
        </p>
      </div>

      {/* Compute sorted list according to sort state */}
      {/* Use memo to avoid recomputing on unrelated renders */}

      {sortedEmails.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {emails.length === 0
            ? "No emails found for the selected criteria."
            : "All emails have been excluded from this campaign."}
        </div>
      ) : (
        <div>
          {/* Show excluded emails section if there are excluded emails */}
          {excludedEmails.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowExcludedDropdown(!showExcludedDropdown)}
                  className="flex items-center gap-2 text-sm text-yellow-800 hover:text-yellow-900 transition-colors"
                >
                  <span>View {excludedEmails.length} excluded email(s)</span>
                  <span className="transform transition-transform duration-200 text-lg">
                    {showExcludedDropdown ? (
                      <IoChevronUp size={15} />
                    ) : (
                      <IoChevronDown size={15} />
                    )}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    const loadingToastId = toast.loading(
                      "Restoring excluded emails..."
                    );

                    try {
                      // Clear excluded emails state
                      setExcludedEmails([]);
                      setShowExcludedDropdown(false);

                      // Update campaign filters to remove excluded emails
                      const currentFilters = campaign.campaign_filters
                        ? JSON.parse(campaign.campaign_filters)
                        : {};
                      const updatedFilters = {
                        ...currentFilters,
                        excludedEmails: [],
                      };

                      // Calculate new audience size (all emails)
                      const newAudienceSize = emails.length;

                      const updatedCampaign: CampaignData = {
                        ...campaign,
                        campaign_filters: JSON.stringify(updatedFilters),
                        audience_emails: String(newAudienceSize),
                        audience_size: String(newAudienceSize),
                      };

                      await updateInternalCampaign(
                        campaign.campaign_id,
                        updatedCampaign
                      );

                      toast.success(
                        "All excluded emails have been restored to the campaign",
                        { id: loadingToastId }
                      );

                      // Notify parent that the campaign was updated
                      if (typeof onCampaignUpdated === "function") {
                        try {
                          onCampaignUpdated(updatedCampaign);
                        } catch (e) {
                          console.error("onCampaignUpdated callback error", e);
                        }
                      }
                    } catch (err: any) {
                      console.error("Error restoring excluded emails:", err);
                      toast.error(
                        err?.message || "Failed to restore excluded emails",
                        { id: loadingToastId }
                      );
                    }
                  }}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Restore All Excluded
                </button>
              </div>

              {/* Excluded emails dropdown */}
              {showExcludedDropdown && (
                <div className="mt-3 max-h-48 overflow-y-auto border border-yellow-300 rounded-md bg-white">
                  {excludedEmails.map((excludedEmail, index) => {
                    // Find the email data for this excluded email
                    const emailData = emails.find(
                      (e) => e.email_address === excludedEmail
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border-b border-yellow-200 last:border-b-0 hover:bg-yellow-25"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {emailData?.athlete_name || "Unknown Athlete"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {excludedEmail}
                          </div>
                          {emailData && (
                            <div className="text-xs text-gray-500">
                              {emailData.sport} • {emailData.max_roster_year} •{" "}
                              {emailData.gender_id === 1 ? "Mens" : "Womens"}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            const loadingToastId =
                              toast.loading("Restoring email...");

                            try {
                              // Remove this email from excluded list
                              const newExcludedEmails = excludedEmails.filter(
                                (email) => email !== excludedEmail
                              );
                              setExcludedEmails(newExcludedEmails);

                              // Close dropdown if no more excluded emails
                              if (newExcludedEmails.length === 0) {
                                setShowExcludedDropdown(false);
                              }

                              // Update campaign filters
                              const currentFilters = campaign.campaign_filters
                                ? JSON.parse(campaign.campaign_filters)
                                : {};
                              const updatedFilters = {
                                ...currentFilters,
                                excludedEmails: newExcludedEmails,
                              };

                              // Calculate new audience size
                              const newAudienceSize =
                                emails.length - newExcludedEmails.length;

                              const updatedCampaign: CampaignData = {
                                ...campaign,
                                campaign_filters:
                                  JSON.stringify(updatedFilters),
                                audience_emails: String(newAudienceSize),
                                audience_size: String(newAudienceSize),
                              };

                              await updateInternalCampaign(
                                campaign.campaign_id,
                                updatedCampaign
                              );

                              toast.success("Email restored to campaign", {
                                id: loadingToastId,
                              });

                              // Notify parent that the campaign was updated
                              if (typeof onCampaignUpdated === "function") {
                                try {
                                  onCampaignUpdated(updatedCampaign);
                                } catch (e) {
                                  console.error(
                                    "onCampaignUpdated callback error",
                                    e
                                  );
                                }
                              }
                            } catch (err: any) {
                              console.error("Error restoring email:", err);
                              toast.error(
                                err?.message || "Failed to restore email",
                                { id: loadingToastId }
                              );
                            }
                          }}
                          className="ml-3 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                          title="Remove from excluded list"
                        >
                          <span className="text-sm">Add Back</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end mb-2 gap-2">
            <button
              onClick={async () => {
                // Get selected email addresses to exclude
                const selectedEmailAddresses = sortedEmails
                  .filter((email) => selectedIds.has(email.id))
                  .map((email) => email.email_address);

                if (selectedEmailAddresses.length === 0) {
                  toast.error("No emails selected to exclude");
                  return;
                }

                // Filter out emails that are already excluded
                const newEmailsToExclude = selectedEmailAddresses.filter(
                  (email) => !excludedEmails.includes(email)
                );

                if (newEmailsToExclude.length === 0) {
                  toast.error("Selected emails are already excluded");
                  return;
                }

                const loadingToastId = toast.loading(
                  "Excluding selected emails..."
                );

                try {
                  // Update excluded emails state
                  const newExcludedEmails = [
                    ...excludedEmails,
                    ...newEmailsToExclude,
                  ];
                  setExcludedEmails(newExcludedEmails);

                  // Update campaign filters with excluded emails
                  const currentFilters = campaign.campaign_filters
                    ? JSON.parse(campaign.campaign_filters)
                    : {};
                  const updatedFilters = {
                    ...currentFilters,
                    excludedEmails: newExcludedEmails,
                  };

                  // Calculate new audience size (total emails minus excluded)
                  const newAudienceSize =
                    emails.length - newExcludedEmails.length;

                  const updatedCampaign: CampaignData = {
                    ...campaign,
                    campaign_filters: JSON.stringify(updatedFilters),
                    audience_emails: String(newAudienceSize),
                    audience_size: String(newAudienceSize),
                  };

                  await updateInternalCampaign(
                    campaign.campaign_id,
                    updatedCampaign
                  );

                  // Clear selection
                  setSelectedIds(new Set());

                  toast.success(
                    `Excluded ${newEmailsToExclude.length} email(s) from campaign`,
                    { id: loadingToastId }
                  );

                  // Notify parent that the campaign was updated
                  if (typeof onCampaignUpdated === "function") {
                    try {
                      onCampaignUpdated(updatedCampaign);
                    } catch (e) {
                      console.error("onCampaignUpdated callback error", e);
                    }
                  }
                } catch (err: any) {
                  console.error("Error excluding emails:", err);
                  toast.error(
                    err?.message || "Failed to exclude emails from campaign",
                    { id: loadingToastId }
                  );
                }
              }}
              disabled={selectedIds.size === 0}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                selectedIds.size === 0
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              Exclude Selected
            </button>
            <button
              onClick={() => {
                // Build CSV: headers + rows from sortedEmails
                const headers = [
                  "Athlete Name",
                  "Email",
                  "Sport",
                  "Graduation Year",
                  "Gender",
                ];
                const rows = sortedEmails.map((e) => [
                  e.athlete_name,
                  e.email_address,
                  e.sport,
                  String(e.max_roster_year ?? ""),
                  e.gender_id === 1 ? "Mens" : "Womens",
                ]);
                const csvContent = [headers, ...rows]
                  .map((r) =>
                    r
                      .map((cell) => {
                        if (cell == null) return "";
                        // Escape quotes
                        const val = String(cell).replace(/"/g, '""');
                        // Wrap fields that contain commas/newlines/quotes
                        return /[",\n]/.test(val) ? `"${val}"` : val;
                      })
                      .join(",")
                  )
                  .join("\n");

                // Prepend UTF-8 BOM to help Excel on Windows detect UTF-8
                const BOM = "\uFEFF";
                const blob = new Blob([BOM + csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const loadingToastId = toast.loading("Preparing download...");
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const filename = `${campaign.campaign_name.replace(
                  /[^a-z0-9_-]/gi,
                  "_"
                )}_emails.csv`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("Download started", { id: loadingToastId });
              }}
              className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Download to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-white rounded-t-lg">
                  <th className="px-3 py-2 text-left font-semibold rounded-tl-lg">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      className="appearance-none bg-white shrink-0 w-4 h-4 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      checked={
                        selectedIds.size === sortedEmails.length &&
                        sortedEmails.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(
                            new Set(sortedEmails.map((em) => em.id))
                          );
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    <button
                      onClick={() => toggleSort("athlete_name")}
                      className="flex items-center gap-2"
                    >
                      Athlete Name
                      {sortBy === "athlete_name" &&
                        (sortDirection === "asc" ? (
                          <IoArrowUp />
                        ) : (
                          <IoArrowDown />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    <button
                      onClick={() => toggleSort("email_address")}
                      className="flex items-center gap-2"
                    >
                      Email
                      {sortBy === "email_address" &&
                        (sortDirection === "asc" ? (
                          <IoArrowUp />
                        ) : (
                          <IoArrowDown />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    <button
                      onClick={() => toggleSort("sport")}
                      className="flex items-center gap-2"
                    >
                      Sport
                      {sortBy === "sport" &&
                        (sortDirection === "asc" ? (
                          <IoArrowUp />
                        ) : (
                          <IoArrowDown />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    <button
                      onClick={() => toggleSort("max_roster_year")}
                      className="flex items-center gap-2"
                    >
                      Graduation Year
                      {sortBy === "max_roster_year" &&
                        (sortDirection === "asc" ? (
                          <IoArrowUp />
                        ) : (
                          <IoArrowDown />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left font-semibold rounded-tr-lg">
                    <button
                      onClick={() => toggleSort("gender")}
                      className="flex items-center gap-2"
                    >
                      Gender
                      {sortBy === "gender" &&
                        (sortDirection === "asc" ? (
                          <IoArrowUp />
                        ) : (
                          <IoArrowDown />
                        ))}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmails.map((email, index) => (
                  <tr
                    key={email.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${index + 1}`}
                        className="appearance-none bg-white shrink-0 w-4 h-4 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                        checked={selectedIds.has(email.id)}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const copy = new Set(prev);
                            if (e.target.checked) copy.add(email.id);
                            else copy.delete(email.id);
                            return copy;
                          });
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {email.athlete_name}
                    </td>
                    <td className="px-4 py-2">{email.email_address}</td>
                    <td className="px-4 py-2">{email.sport}</td>
                    <td className="px-4 text-center py-2">
                      {email.max_roster_year}
                    </td>
                    <td className="px-4 py-2">
                      {email.gender_id === 1 ? "Mens" : "Womens"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
