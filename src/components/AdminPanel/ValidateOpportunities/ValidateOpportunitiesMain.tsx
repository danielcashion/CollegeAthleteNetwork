"use client";
import { useState, useEffect, useRef } from "react";
import { getJobOpportunities } from "@/services/universityApi";
import { JobOpportunity } from "@/types/JobOpportunity";
import { ShieldCheck, Loader2, RefreshCw, ExternalLink, X, Eye } from "lucide-react";
import { SkeletonTable } from "@/components/common/Skeleton";
import StyledTooltip from "@/components/common/StyledTooltip";

export default function ValidateOpportunitiesMain() {
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<JobOpportunity | null>(null);
  const [showIframeModal, setShowIframeModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobOpportunities();
      setOpportunities(data || []);
    } catch (err) {
      console.error("Error fetching job opportunities:", err);
      setError("Failed to load job opportunities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleViewJob = (opportunity: JobOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowIframeModal(true);
    setIframeError(false);
    setIframeLoading(true);
  };

  // Detect iframe blocking after modal opens
  useEffect(() => {
    if (showIframeModal && selectedOpportunity && iframeLoading) {
      // Many job sites (Workday, Greenhouse, etc.) block iframe embedding
      // Set a timeout to check if iframe loaded successfully
      const checkTimeout = setTimeout(() => {
        if (iframeRef.current && iframeLoading) {
          // If still loading after 3 seconds, likely blocked or slow
          // Show error message to help user
          setIframeError(true);
          setIframeLoading(false);
        }
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(checkTimeout);
    }
  }, [showIframeModal, selectedOpportunity, iframeLoading]);

  const handleCloseModal = () => {
    setShowIframeModal(false);
    setSelectedOpportunity(null);
    setIframeError(false);
    setIframeLoading(false);
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
    // After iframe loads, check if it's actually displaying content
    // Many sites block iframes and show a blank page or error
    setTimeout(() => {
      if (iframeRef.current) {
        try {
          // For cross-origin content, we can't access the document
          // But we can check if the iframe element itself loaded
          // If contentWindow exists but we can't access it, that's normal for cross-origin
          // The real test is if the user can see content - if not, they'll see the error message
          // No need to access iframe properties here as cross-origin restrictions prevent it
        } catch {
          // Cross-origin restrictions are expected and normal
          // Don't treat as error - the iframe may still be displaying content
        }
      }
    }, 1000);
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showIframeModal) {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showIframeModal]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showIframeModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        // Check if click is on the backdrop (not on the modal content)
        const target = event.target as HTMLElement;
        if (target.classList.contains("modal-backdrop")) {
          handleCloseModal();
        }
      }
    };

    if (showIframeModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showIframeModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  The College Athlete Network
                </h1>
                <h1 className="text-2xl font-bold tracking-tight">
                  Validate Opportunities
                </h1>
                <p className="text-blue-100 mt-1">
                  Review and validate job opportunities from our database
                </p>
              </div>
            </div>
            <button
              onClick={fetchOpportunities}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-[#1C315F] rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mb-4 shadow-xl mx-auto">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600 text-lg font-medium">
                Loading opportunities...
              </p>
            </div>
            <SkeletonTable rows={5} columns={5} />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Opportunities
            </h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchOpportunities}
              className="px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header with count */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{opportunities.length}</span>{" "}
                  opportunit{opportunities.length !== 1 ? "ies" : "y"} found
                </div>
              </div>
            </div>

            {opportunities.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Opportunities Found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  There are currently no job opportunities in the database. Check
                  back later or refresh to see new opportunities.
                </p>
                <button
                  onClick={fetchOpportunities}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        University Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Job Description
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Days Ago
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {opportunities.map((opportunity) => (
                      <tr
                        key={opportunity.job_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1C315F] transition-colors">
                            {opportunity.university_name}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-900">
                            {opportunity.company_name}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-900">
                            {opportunity.job_title}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {opportunity.job_description ? (
                            <StyledTooltip
                              title={
                                <div className="max-w-lg">
                                  {/* Header */}
                                  <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] -m-4 mb-0 p-4 rounded-t-lg">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Eye className="w-4 h-4 text-white" />
                                      <h3 className="text-sm font-bold text-white uppercase tracking-wide pt-1.5">
                                        Job Description
                                      </h3>
                                    </div>
                                    <p
                                      className="text-xs text-blue-100 font-medium truncate"
                                      style={{ paddingLeft: "5pt" }}
                                    >
                                      {opportunity.job_title}
                                    </p>
                                  </div>
                                  {/* Content */}
                                  <div 
                                    className="max-h-96 overflow-y-auto px-4 py-4"
                                    style={{
                                      scrollbarWidth: 'thin',
                                      scrollbarColor: '#1C315F #f1f1f1',
                                    }}
                                  >
                                    <div
                                      className="prose prose-sm prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700 prose-a:text-[#1C315F] prose-a:no-underline hover:prose-a:underline"
                                      dangerouslySetInnerHTML={{
                                        __html: opportunity.job_description,
                                      }}
                                    />
                                  </div>
                                </div>
                              }
                              arrow
                              placement="right"
                              enterDelay={300}
                              leaveDelay={200}
                              maxWidth={650}
                              interactive
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    padding: 0,
                                    bgcolor: "#fff",
                                    border: "2px solid #1C315F",
                                    boxShadow: "0 10px 40px rgba(28, 49, 95, 0.25)",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    maxHeight: "500px",
                                  },
                                },
                                arrow: {
                                  sx: {
                                    color: "#1C315F",
                                  },
                                },
                              }}
                            >
                              <button className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-[#1C315F] bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md">
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                            </StyledTooltip>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No description</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600">
                            {formatDate(opportunity.created_datetime)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600">
                            {opportunity.created_days_ago !== undefined
                              ? `${opportunity.created_days_ago} day${
                                  opportunity.created_days_ago !== 1 ? "s" : ""
                                } ago`
                              : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewJob(opportunity)}
                              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#1C315F] bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 group/btn"
                            >
                              <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              <span>View Job</span>
                            </button>
                            <a
                              href={opportunity.external_link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Iframe Modal */}
      {showIframeModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedOpportunity.job_title}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {selectedOpportunity.company_name} - {selectedOpportunity.university_name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 overflow-hidden p-4 relative">
              {iframeError ? (
                <div className="w-full h-full border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <ExternalLink className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unable to Display in Frame
                  </h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    This website cannot be displayed in an iframe due to security
                    restrictions (X-Frame-Options or Content-Security-Policy). Please
                    click the button below to open it in a new tab.
                  </p>
                  <a
                    href={selectedOpportunity.external_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              ) : (
                <>
                  {iframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1C315F] mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Loading job posting...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    src={selectedOpportunity.external_link_url}
                    className="w-full h-full border border-gray-200 rounded-lg"
                    title={`Job posting: ${selectedOpportunity.job_title}`}
                    allow="fullscreen"
                    onLoad={handleIframeLoad}
                    onError={() => {
                      setIframeError(true);
                      setIframeLoading(false);
                    }}
                    // Note: Many job sites (Workday, Greenhouse, etc.) block iframe embedding
                    // via X-Frame-Options or Content-Security-Policy headers
                    // If the iframe appears blank or doesn't load, use "Open in New Tab" button
                  />
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Job URL:</span>{" "}
                  <a
                    href={selectedOpportunity.external_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1C315F] hover:underline break-all"
                  >
                    {selectedOpportunity.external_link_url}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href={selectedOpportunity.external_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
              {!iframeError && (
                <p className="text-xs text-gray-500 italic">
                  Note: Some job sites block iframe embedding. If the page appears
                  blank, use &ldquo;Open in New Tab&rdquo; above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

