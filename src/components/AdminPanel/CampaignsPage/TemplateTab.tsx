"use client";
import React, { useEffect, useState } from "react";
import ImportTemplateModal from "./ImportTemplateModal";
import StyledTooltip from "@/components/common/StyledTooltip";
import toast from "react-hot-toast";
import { FiEdit2, FiX, FiCheck } from "react-icons/fi";
import { getInternalEmailTemplatesById } from "@/services/InternalMemberApis";
import HtmlViewer from "../General/HtmlViewer";
import { InternalEmailTemplate } from "@/types/InternalMember";

type Props = {
  onNextAction?: () => void;
  onBackAction?: () => void;
  commType: "general" | "event";
  setCommTypeAction: (value: "general" | "event") => void;
  senderName: string;
  setSenderNameAction: (value: string) => void;
  senderEmail: string;
  setSenderEmailAction: (value: string) => void;
  replyTo: string;
  setReplyToAction: (value: string) => void;
  subject: string;
  setSubjectAction: (value: string) => void;
  body: string;
  setBodyAction: (value: string) => void;
  colorScheme: "university" | "default";
  setColorSchemeAction: (value: "university" | "default") => void;
  includeUniversityLogo: boolean;
  setIncludeUniversityLogoAction: (value: boolean) => void;
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
  templateId: string | null;
  setTemplateIdAction: (value: string | null) => void;
  selectedUniversities?: string[];
};

export default function TemplateTab({
  onNextAction,
  onBackAction,
  commType,
  setCommTypeAction,
  setSenderNameAction,
  setSenderEmailAction,
  setReplyToAction,
  setSubjectAction,
  setBodyAction,
  colorScheme,
  setColorSchemeAction,
  includeUniversityLogo,
  setIncludeUniversityLogoAction,
  campaignName,
  onCampaignNameUpdate,
  templateId,
  setTemplateIdAction,
}: Props) {
  const [importTemplateModalOpen, setImportTemplateModalOpen] = useState(false);
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<InternalEmailTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Fetch template data if templateId exists
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setSelectedTemplate(null);
        return;
      }

      setLoadingTemplate(true);
      try {
        const templateData = await getInternalEmailTemplatesById(templateId);
        if (templateData && templateData.length > 0) {
          setSelectedTemplate(templateData[0]);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast.error("Failed to load template");
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Campaign name editing functions
  const startEditingCampaignName = () => {
    setTempCampaignName(campaignName || "");
    setIsEditingCampaignName(true);
  };

  const cancelEditingCampaignName = () => {
    setTempCampaignName("");
    setIsEditingCampaignName(false);
  };

  const saveCampaignName = async () => {
    if (tempCampaignName.trim() && onCampaignNameUpdate) {
      try {
        await onCampaignNameUpdate(tempCampaignName.trim());
        setIsEditingCampaignName(false);
        setTempCampaignName("");
      } catch (error) {
        toast.error("Failed to update campaign name");
        console.log(error);
      }
    } else {
      cancelEditingCampaignName();
    }
  };

  const handleCampaignNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveCampaignName();
    } else if (e.key === "Escape") {
      cancelEditingCampaignName();
    }
  };

  const handleTemplateSelect = (template: {
    senderName: string;
    senderEmail: string;
    subject: string;
    body: string;
    replyToAddress?: string;
    templateId?: string;
  }) => {
    setSenderNameAction(template.senderName);
    setSenderEmailAction(template.senderEmail);
    setSubjectAction(template.subject);
    setBodyAction(template.body);
    if (template.replyToAddress) {
      setReplyToAction(template.replyToAddress);
    }
    if (template.templateId) {
      setTemplateIdAction(template.templateId);
    }
    toast.success("Template imported successfully");
  };

  const handleClearTemplate = () => {
    setTemplateIdAction(null);
    setSelectedTemplate(null);
    setBodyAction("");
    setSenderNameAction("");
    setSenderEmailAction("");
    setSubjectAction("");
    setReplyToAction("");
    toast.success("Template cleared");
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Select Template</h2>
            <div className="text-md text-gray-500">
              Import a template from the library and confirm your selection.
            </div>
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

        <div className="flex flex-row items-start gap-4 mb-4">
          <div className="w-full flex gap-2 items-center">
            <StyledTooltip
              title="Import a saved template from the library"
              placement="top"
              arrow
            >
              <button
                className="bg-primary text-white border px-4 py-2 text-sm rounded shadow-lg hover:font-bold transition-all duration-200"
                onClick={() => setImportTemplateModalOpen(true)}
                aria-label="Import template from library"
              >
                Import Template
              </button>
            </StyledTooltip>
            {selectedTemplate && (
              <StyledTooltip
                title="Clear the current template selection"
                placement="top"
                arrow
              >
                <button
                  className="bg-red-500 text-white px-4 py-2 text-sm rounded shadow-lg hover:font-bold transition-all duration-200"
                  onClick={handleClearTemplate}
                  aria-label="Clear template selection"
                >
                  Clear Template
                </button>
              </StyledTooltip>
            )}
          </div>
        </div>

        <div className="flex flex-row items-start gap-4 mb-4">
          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Color Scheme:
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="color-scheme-label"
              >
                <StyledTooltip
                  title="Use the primary color of your university"
                  arrow
                  placement="top"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorScheme"
                      value="university"
                      checked={colorScheme === "university"}
                      onChange={() => setColorSchemeAction("university")}
                      className="accent-sky-600"
                      aria-describedby="color-university-desc"
                    />
                    University Colors
                  </label>
                </StyledTooltip>
                <span id="color-university-desc" className="sr-only">
                  Use your university&apos;s brand colors for the email template
                </span>
                <StyledTooltip
                  title="Use the default color theme our App (dark blue)"
                  arrow
                  placement="top"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="colorScheme"
                      value="default"
                      checked={colorScheme === "default"}
                      onChange={() => setColorSchemeAction("default")}
                      className="accent-sky-600"
                      aria-describedby="color-default-desc"
                    />
                    App Default
                  </label>
                </StyledTooltip>
                <span id="color-default-desc" className="sr-only">
                  Use the College Athlete Network default color scheme
                </span>
              </div>
            </fieldset>
          </div>

          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Include University Logo in HTML:
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="university-logo-label"
              >
                <StyledTooltip placement="left" title="Recommended">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="universityLogo"
                      value="yes"
                      checked={includeUniversityLogo}
                      onChange={() => setIncludeUniversityLogoAction(true)}
                      className="accent-sky-600"
                      aria-describedby="logo-yes-desc"
                    />
                    Yes
                  </label>
                </StyledTooltip>
                <span id="logo-yes-desc" className="sr-only">
                  Include university logo in the email header
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="universityLogo"
                    value="no"
                    checked={!includeUniversityLogo}
                    onChange={() => setIncludeUniversityLogoAction(false)}
                    className="accent-sky-600"
                    aria-describedby="logo-no-desc"
                  />
                  No
                </label>
                <span id="logo-no-desc" className="sr-only">
                  Do not include university logo in the email
                </span>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="flex flex-row items-start gap-4 mb-4">
          <div className="w-full">
            <fieldset>
              <legend className="block text-sm mb-2 font-medium text-gray-700">
                Communication Type
              </legend>
              <div
                className="flex gap-6"
                role="radiogroup"
                aria-labelledby="comm-type-label"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="commType"
                    value="general"
                    checked={commType === "general"}
                    onChange={() => setCommTypeAction("general")}
                    className="accent-sky-600"
                    aria-describedby="comm-general-desc"
                  />
                  General Communication
                </label>
                <span id="comm-general-desc" className="sr-only">
                  Send general communications to recipients
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="commType"
                    value="event"
                    checked={commType === "event"}
                    onChange={() => setCommTypeAction("event")}
                    className="accent-sky-600"
                    aria-describedby="comm-event-desc"
                  />
                  Event Specific
                </label>
                <span id="comm-event-desc" className="sr-only">
                  Send event-specific communications with event details
                </span>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Template Preview Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Template Preview
          </h3>

          {loadingTemplate ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : selectedTemplate ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Template Title:
                    </p>
                    <p className="text-base text-gray-800">
                      {selectedTemplate.template_title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Template ID:
                    </p>
                    <p className="text-base text-gray-800">
                      {selectedTemplate.campaign_template_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Subject:
                    </p>
                    <p className="text-base text-gray-800">
                      {selectedTemplate.email_subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      From Name:
                    </p>
                    <p className="text-base text-gray-800">
                      {selectedTemplate.email_from_name}
                    </p>
                  </div>
                </div>
                {selectedTemplate.template_description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Description:
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedTemplate.template_description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <p className="text-sm font-semibold text-gray-700">
                    HTML Preview
                  </p>
                </div>
                <div className="max-h-[500px] overflow-auto">
                  <HtmlViewer htmlContent={selectedTemplate.email_body || ""} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg mb-2">No template selected</p>
              <p className="text-gray-400 text-sm">
                Click &quot;Import Template&quot; above to select a template
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="bg-gray-100 px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
            onClick={onBackAction}
            aria-label="Go back to previous step"
          >
            Back
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded shadow hover:font-bold transition-all duration-200"
            onClick={onNextAction}
            aria-label="Continue to review and verify email campaign"
            disabled={!selectedTemplate}
          >
            Next: Review & Send Test
          </button>
        </div>
      </div>

      {/* Import Template Modal */}
      <ImportTemplateModal
        isOpen={importTemplateModalOpen}
        onCloseAction={() => setImportTemplateModalOpen(false)}
        onTemplateSelectAction={handleTemplateSelect}
      />
    </>
  );
}
