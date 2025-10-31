"use client";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import StyledTooltip from "@/components/common/StyledTooltip";
import AudienceTab from "./AudienceTab";
import TemplateTab from "./TemplateTab";
import ReviewTab from "./ReviewTab";
import ScheduleTab from "./ScheduleTab";
import AnalyticsTab from "./AnalyticsTab";
import { CircularProgress } from "@mui/material";
import {
  getTotalCountsByUniversity,
  getInternalEmailTemplatesById,
  updateInternalEmailTemplate,
  createInternalEmailTemplate,
} from "@/services/InternalMemberApis";
import { updateInternalCampaign } from "@/services/InternalMemberApis";
import {
  getUniversityMetaByUniversityName,
  getTeamsByUniversityName,
} from "@/services/universityApi";
import SaveDraftCampaignModal from "./SaveDraftCampaignModal";
import ConfirmSaveDraftModal from "./ConfirmSaveDraftModal";
import { CampaignData } from "@/types/Campaign";
import { getVarcharEight } from "@/helpers/getVarCharId";
import { cleanEmailField } from "@/services/InternalMemberApis";

const TABS = [
  "Define Audience",
  "Design Messaging",
  "Review & Send Test",
  "Schedule & Send",
  "Analyze Results",
] as const;

// Render graduation years in descending order (e.g., most recent first)
const years = Array.from({ length: 42 }, (_, i) => 1985 + i).reverse(); // from 1985 to 2026  -- I do not like how this is hardcoded -Dan

interface ECommsCampaignBuilderProps {
  onBackToList?: () => void;
  // If true, open the Save Draft modal as soon as the builder mounts
  openSaveDraftOnMount?: boolean;
  // Optional initial campaign name/description when opening builder via 'Create Campaign'
  initialCampaignName?: string;
  initialCampaignDesc?: string;
  // When editing an existing campaign, pass the campaign data
  editingCampaign?: CampaignData | null;
}

export default function CampaignBuilder({
  onBackToList,
  openSaveDraftOnMount,
  initialCampaignName,
  initialCampaignDesc,
  editingCampaign,
}: ECommsCampaignBuilderProps) {
  // console.log("ECommsCampaignBuilder session:", session);

  const [sportTeamList, setSportTeamList] = useState<any[]>([]);
  const [universityMetaData, setUniversityMetaData] = useState<any>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [totalCounts, setTotalCounts] = useState<any>([]);
  const [filteredCounts, setFilteredCounts] = useState<any>([]);
  const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any | null>(null);

  // Filter states moved from AudienceTab
  const [gender, setGender] = useState<string | null>(null);
  const [sports, setSports] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>(years);

  // Template states
  const [commType, setCommType] = useState<"general" | "event">("general");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState(
    "admin@collegeathletenetwork.org"
  );
  const [replyTo, setReplyTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [editorType, setEditorType] = useState<"text-editor" | "html">("html");
  const [templateId, setTemplateId] = useState<string | null>(null);

  // New states for color scheme and university logo
  const [colorScheme, setColorScheme] = useState<"university" | "default">(
    "default"
  );
  const [includeUniversityLogo, setIncludeUniversityLogo] = useState(true);

  // Fetch university metadata
  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        const metaData = await getUniversityMetaByUniversityName("Yale");
        setUniversityMetaData(metaData);
      } catch (error) {
        console.error("Error fetching university metadata:", error);
      }
    };

    fetchUniversityData();
  }, []);

  // Fetch sport teams
  useEffect(() => {
    const fetchSportTeams = async () => {
      try {
        const teams = await getTeamsByUniversityName("Yale");
        setSportTeamList(teams);
      } catch (error) {
        console.error("Error fetching sport teams:", error);
      }
    };

    fetchSportTeams();
  }, []);

  useEffect(() => {
    const fetchTotalCounts = async () => {
      try {
        const data = await getTotalCountsByUniversity({
          university_names: "Yale",
        });

        // console.log("Fetched total counts:", data);
        setTotalCounts(data);
      } catch (error) {
        console.error("Error fetching total counts:", error);
      }
    };

    fetchTotalCounts();
  }, []);

  // Initialize form fields when editing a campaign
  useEffect(() => {
    if (editingCampaign) {
      // console.log("Initializing form for editing campaign:", editingCampaign);

      // Parse campaign filters if they exist
      if (editingCampaign.campaign_filters) {
        try {
          const filters = JSON.parse(editingCampaign.campaign_filters);
          setGender(filters.gender || null);
          setSports(filters.sports || []);
          setSelectedYears(filters.selectedYears || years);
        } catch (error) {
          console.error("Error parsing campaign filters:", error);
        }
      }

      // Set template fields
      setCommType(
        editingCampaign.campaign_type === "event" ? "event" : "general"
      );
      setSenderName(editingCampaign.email_from_name || "");
      setSenderEmail(
        editingCampaign.email_from_address || "admin@collegeathletenetwork.org"
      );
      setReplyTo(editingCampaign.reply_to_address || "");
      setSubject(editingCampaign.email_subject || "");
      setEditorType(
        editingCampaign.editor_type === "html" ? "html" : "text-editor"
      );
      setTemplateId(editingCampaign.campaign_template_id || null);

      // Initialize new template options with default values
      // TODO: In the future, these could be stored in campaign data
      setColorScheme(
        editingCampaign.university_colors_YN === 1 ? "university" : "default"
      );
      setIncludeUniversityLogo(editingCampaign.include_logo_YN === 1);

      // If there's a template_id, fetch the template data to populate the body
      if (editingCampaign.campaign_template_id) {
        const fetchTemplateData = async () => {
          try {
            const response = await getInternalEmailTemplatesById(
              editingCampaign.campaign_template_id!
            );
            if (response && response.length > 0) {
              const template = response[0];
              setBody(template.email_body || "");
              // Also update other template fields if they're not set in campaign
              if (!editingCampaign.email_from_name)
                setSenderName(template.email_from_name || "");
              if (!editingCampaign.email_subject)
                setSubject(template.email_subject || "");
              if (!editingCampaign.reply_to_address)
                setReplyTo(template.reply_to_address || "");
            }
          } catch (error) {
            console.error("Error fetching template data:", error);
          }
        };
        fetchTemplateData();
      } else {
        // Fallback to email_body if no template_id (for backward compatibility)
        setBody(editingCampaign.email_body || "");
      }

      // Set the created campaign for modal display
      setCreatedCampaign(editingCampaign);
    }
  }, [editingCampaign, years]);

  // If requested, open the Save Draft modal when the builder mounts
  useEffect(() => {
    if (openSaveDraftOnMount) {
      setSaveDraftModalOpen(true);
    }
  }, [openSaveDraftOnMount]);

  // Calculate sport options
  const sportOptions = useMemo(() => {
    return [
      ...(sportTeamList
        ?.map((team: any) => ({
          value: team.team_name,
          label: team.team_name,
        }))
        .filter(
          (sport: any, index: number, array: any[]) =>
            array.findIndex((s: any) => s.value === sport.value) === index
        )
        .sort((a: any, b: any) => a.label.localeCompare(b.label)) || []),
    ];
  }, [sportTeamList]);

  // Filter the data based on selected filters
  useEffect(() => {
    if (!totalCounts?.[0] || !Array.isArray(totalCounts[0])) {
      setFilteredCounts([]);
      return;
    }

    const data = totalCounts[0];
    let filtered = [...data];

    // Filter by gender
    if (gender) {
      const genderId = gender === "M" ? 1 : 2; // Assuming 1 = Male, 2 = Female
      filtered = filtered.filter((item: any) => item.gender_id === genderId);
    }

    // Filter by sports
    if (sports.length > 0) {
      filtered = filtered.filter((item: any) => sports.includes(item.sport));
    }

    // Filter by graduation years (max_roster_year)
    if (selectedYears.length > 0 && selectedYears.length < years.length) {
      filtered = filtered.filter((item: any) =>
        selectedYears.includes(item.max_roster_year)
      );
    }

    setFilteredCounts(filtered);
  }, [totalCounts, gender, sports, selectedYears, years.length]);

  // Calculate totals and filtered totals
  const totals = useMemo(() => {
    if (!totalCounts?.[0] || !Array.isArray(totalCounts[0])) {
      return { totalAthletes: 0, emails: 0 };
    }

    const totalAthletes = totalCounts[0].reduce(
      (sum: number, item: any) => sum + item.athletes_num,
      0
    );
    const totalEmails = totalCounts[0].reduce(
      (sum: number, item: any) => sum + item.emails_num,
      0
    );

    return { totalAthletes, emails: totalEmails };
  }, [totalCounts]);

  const filteredTotal = useMemo(() => {
    if (!filteredCounts || !Array.isArray(filteredCounts)) {
      return { athletes: 0, emails: 0 };
    }

    const athletes = filteredCounts.reduce(
      (sum: number, item: any) => sum + item.athletes_num,
      0
    );
    const emails = filteredCounts.reduce(
      (sum: number, item: any) => sum + item.emails_num,
      0
    );

    return { athletes, emails };
  }, [filteredCounts]);

  const progress = useMemo(
    () => Math.round(((activeIndex + 1) / TABS.length) * 100),
    [activeIndex]
  );

  // Function to handle moving from Template tab to Review tab
  const handleTemplateNext = async () => {
    try {
      let currentTemplateId = templateId;

      // If we don't have a template ID, generate one
      if (!currentTemplateId) {
        currentTemplateId = getVarcharEight();
      }

      // Create template data
      const templateData = {
        campaign_template_id: currentTemplateId,
        campaign_type: "email",
        university_names: "Yale",
        template_title: `Template for ${
          createdCampaign?.campaign_name || initialCampaignName || "Campaign"
        }`,
        email_body: cleanEmailField(body),
        email_from_name: senderName,
        email_from_address: senderEmail,
        reply_to_address: replyTo || null,
        email_subject: cleanEmailField(subject),
        is_systemwide_YN: 0,
        is_active_YN: 1,
        created_by: "1",
        editor_type: editorType,
      };

      // Update existing template or create new one
      let response;
      if (templateId) {
        // Template exists, update it
        response = await updateInternalEmailTemplate(
          currentTemplateId,
          templateData
        );
      } else {
        // Create new template
        response = await createInternalEmailTemplate(templateData);
      }

      if (response) {
        setTemplateId(currentTemplateId);
        console.log(
          "Template",
          templateId ? "updated" : "created",
          "with ID:",
          currentTemplateId
        );

        // Update campaign with template_id if we have a campaign
        if (createdCampaign || editingCampaign) {
          try {
            const campaignData = {
              ...(editingCampaign || createdCampaign),
              campaign_template_id: currentTemplateId,
              include_logo_YN: includeUniversityLogo ? 1 : 0,
              university_colors_YN: colorScheme === "university" ? 1 : 0,
              updated_datetime: new Date().toISOString(),
            };

            await updateInternalCampaign(
              campaignData.campaign_id,
              campaignData
            );
            console.log(
              "Campaign updated with template_id:",
              currentTemplateId
            );

            // Update the created campaign state
            setCreatedCampaign(campaignData);
          } catch (updateError) {
            console.error(
              "Error updating campaign with campaign_template_id:",
              updateError
            );
            // Don't block the flow, just log the error
          }
        }

        // Move to review tab
        setActiveIndex(2);
      } else {
        toast.error(
          "Failed to " + (templateId ? "update" : "create") + " template"
        );
      }
    } catch (error) {
      console.error(
        "Error " + (templateId ? "updating" : "creating") + " template:",
        error
      );
      toast.error(
        "Failed to " + (templateId ? "update" : "create") + " template"
      );
    }
  };

  // Function to handle background saving when switching tabs
  const handleBackgroundSave = async () => {
    try {
      let currentTemplateId = templateId;

      // If we don't have a template ID, generate one
      if (!currentTemplateId) {
        currentTemplateId = getVarcharEight();
      }

      // Create template data
      const templateData = {
        campaign_template_id: currentTemplateId,
        campaign_type: "email",
        university_names: "Yale",
        template_title: `Template for ${
          createdCampaign?.campaign_name || initialCampaignName || "Campaign"
        }`,
        email_body: cleanEmailField(body),
        email_from_name: senderName,
        email_from_address: senderEmail,
        reply_to_address: replyTo || null,
        email_subject: cleanEmailField(subject),
        is_systemwide_YN: 0,
        is_active_YN: 1,
        editor_type: editorType,
      };

      // Update existing template or create new one (in background)
      if (templateId) {
        updateInternalEmailTemplate(templateId, templateData).catch(
          (error: any) => {
            console.error("Background template update failed:", error);
          }
        );
      } else {
        if (templateData.email_body) {
          createInternalEmailTemplate(templateData)
            .then(() => {
              setTemplateId(currentTemplateId);
            })
            .catch((error: any) => {
              console.error("Background template creation failed:", error);
            });
        }
      }

      // Update campaign if we have one
      const campaignToUpdate = editingCampaign || createdCampaign;
      if (campaignToUpdate) {
        const updatedCampaignData = {
          ...campaignToUpdate,
          campaign_filters: JSON.stringify({
            gender_id: gender === "M" ? [1] : gender === "F" ? [2] : [],
            max_roster_year: selectedYears,
            sports: sports,
          }),
          campaign_template_id: currentTemplateId,
          email_from_name: senderName,
          email_from_address: senderEmail,
          reply_to_address: replyTo || null,
          email_subject: cleanEmailField(subject),
          editor_type: editorType,
          university_colors_YN: colorScheme === "university" ? 1 : 0,
          include_logo_YN: includeUniversityLogo ? 1 : 0,
          aws_configuration_set: process.env.AWS_SES_CONFIGURATION_SET || "",
          updated_datetime: new Date().toISOString(),
        };
        updateInternalCampaign(
          campaignToUpdate.campaign_id,
          updatedCampaignData
        )
          .then((response) => {
            if (response) {
              setCreatedCampaign(updatedCampaignData);
            }
          })
          .catch((error) => {
            console.error("Background campaign update failed:", error);
          });
      }
    } catch (error) {
      console.error("Background save failed:", error);
    }
  };

  // Function to handle tab switching with background save
  const handleTabSwitch = (newIndex: number) => {
    // Perform background save for current tab's data
    handleBackgroundSave();

    // Switch to new tab immediately for better UX
    setActiveIndex(newIndex);
  };

  // Function to handle campaign name updates from AudienceTab
  const handleCampaignNameUpdate = async (newCampaignName: string) => {
    try {
      // Determine which campaign we're updating
      const campaignToUpdate = editingCampaign || createdCampaign;
      if (!campaignToUpdate) {
        toast.error("No campaign to update");
        return;
      }

      // Update the campaign with the new name
      const updatedCampaignData = {
        ...campaignToUpdate,
        campaign_name: newCampaignName,
        aws_configuration_set: process.env.AWS_SES_CONFIGURATION_SET || "",
        updated_datetime: new Date().toISOString(),
      };

      await updateInternalCampaign(
        campaignToUpdate.campaign_id,
        updatedCampaignData
      );

      // Update local state - for editing campaigns, we update createdCampaign
      // since editingCampaign is a prop that can't be modified directly
      setCreatedCampaign(updatedCampaignData);

      toast.success("Campaign name updated successfully");
    } catch (error) {
      console.error("Error updating campaign name:", error);
      toast.error("Failed to update campaign name");
    }
  };

  return (
    <div className="">
      <header className="rounded-xl overflow-hidden mb-6 shadow-lg">
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToList && (
                <button
                  onClick={onBackToList}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
              )}
              <div>
                <h1 className="text-3xl font-extrabold">
                  E-Comms — Campaign {editingCampaign ? "Editor" : "Builder"}
                </h1>
                <p className="mt-1 text-sm opacity-90">
                  {editingCampaign
                    ? `Editing campaign: ${editingCampaign.campaign_name}`
                    : "Design, target, schedule and measure email & SMS campaigns with confidence."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saving ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={20} color="inherit" />
                  <span className="text-sm">Saving...</span>
                </div>
              ) : (
                <StyledTooltip
                  title={editingCampaign ? "Save Progress" : "Save progress"}
                >
                  <button
                    className="bg-white text-sky-700 font-semibold px-4 py-2 rounded shadow hover:shadow-md"
                    onClick={() => {
                      // If we already have a created campaign name, show confirm modal
                      if (
                        editingCampaign ||
                        createdCampaign?.campaign_name ||
                        initialCampaignName
                      ) {
                        setConfirmSaveOpen(true);
                      } else {
                        setSaveDraftModalOpen(true);
                      }
                    }}
                  >
                    {editingCampaign ? "Save Progress" : "Save draft"}
                  </button>
                </StyledTooltip>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm p-4">
          <div className="mb-4">
            <div className="text-xs text-gray-400">Progress</div>
            <div className="w-full bg-gray-100 h-2 rounded mt-2 overflow-hidden">
              <div
                className="h-2 bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => handleTabSwitch(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                  i === activeIndex
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    i === activeIndex
                      ? "bg-white text-primary"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-xs text-gray-300">
                    {i === 0
                      ? "Select audience"
                      : i === 1
                      ? "Design message"
                      : i === 2
                      ? "Sanity check"
                      : i === 3
                      ? "When to send"
                      : i === 4
                      ? "Measure Impact of Campaign"
                      : i === 5}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* AnimatedPanel: smooth cross-fade + slight slide between steps */}
            <AnimatedPanel index={activeIndex}>
              <AudienceTab
                onNext={() => handleTabSwitch(1)}
                gender={gender}
                setGenderAction={setGender}
                sports={sports}
                setSportsAction={setSports}
                selectedYears={selectedYears}
                setSelectedYearsAction={setSelectedYears}
                years={years}
                sportOptions={sportOptions}
                totals={totals}
                filteredTotal={filteredTotal}
                filteredCounts={filteredCounts}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name ??
                  initialCampaignName
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
              <TemplateTab
                onNextAction={handleTemplateNext}
                onBackAction={() => handleTabSwitch(0)}
                commType={commType}
                setCommTypeAction={setCommType}
                senderName={senderName}
                setSenderNameAction={setSenderName}
                senderEmail={senderEmail}
                setSenderEmailAction={setSenderEmail}
                replyTo={replyTo}
                setReplyToAction={setReplyTo}
                subject={subject}
                setSubjectAction={setSubject}
                body={body}
                setBodyAction={setBody}
                editorType={editorType}
                setEditorTypeAction={setEditorType}
                colorScheme={colorScheme}
                setColorSchemeAction={setColorScheme}
                includeUniversityLogo={includeUniversityLogo}
                setIncludeUniversityLogoAction={setIncludeUniversityLogo}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name ??
                  initialCampaignName
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
              <ReviewTab
                onNext={() => handleTabSwitch(3)}
                onBack={() => handleTabSwitch(1)}
                audience_size={filteredTotal.athletes}
                audience_emails={filteredTotal.emails}
                campaign={
                  editingCampaign ||
                  createdCampaign ||
                  initialCampaignName ||
                  undefined
                }
                campaign_name={
                  editingCampaign?.campaign_name ||
                  createdCampaign?.campaign_name ||
                  initialCampaignName ||
                  undefined
                }
                campaign_status={
                  editingCampaign?.campaign_status ||
                  createdCampaign?.campaign_status ||
                  "draft"
                }
                templateId={templateId}
                universityMetaData={universityMetaData}
                includeUniversityLogo={includeUniversityLogo}
                colorScheme={colorScheme}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name ??
                  initialCampaignName
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
              <ScheduleTab
                onBack={() => handleTabSwitch(2)}
                emailBody={body}
                templateId={templateId}
                campaign={editingCampaign || createdCampaign}
                campaignFilters={{
                  gender,
                  sports,
                  selectedYears,
                }}
                universityMetaData={universityMetaData}
                includeUniversityLogo={includeUniversityLogo}
                colorScheme={colorScheme}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name ??
                  initialCampaignName
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
              <AnalyticsTab
                campaign={editingCampaign || createdCampaign}
                onBackAction={() => handleTabSwitch(3)}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name ??
                  initialCampaignName
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
            </AnimatedPanel>
          </div>
        </main>
      </div>

      <SaveDraftCampaignModal
        isOpen={saveDraftModalOpen}
        onClose={() => setSaveDraftModalOpen(false)}
        campaignFilters={{
          gender,
          sports,
          selectedYears,
        }}
        audienceData={{
          athletes: filteredTotal.athletes,
          emails: filteredTotal.emails,
        }}
        initialCampaignName={
          editingCampaign?.campaign_name || initialCampaignName
        }
        initialCampaignDesc={
          editingCampaign?.campaign_desc || initialCampaignDesc
        }
        emailData={{
          senderName,
          senderEmail,
          replyTo,
          subject,
          body,
          editorType,
        }}
        colorScheme={colorScheme}
        includeUniversityLogo={includeUniversityLogo}
        onSaved={(created) => {
          // remember the created campaign and close modal
          setCreatedCampaign(created);
          setSaveDraftModalOpen(false);
          // After naming the campaign, direct user to the Audience tab (index 0)
          setActiveIndex(0);
        }}
      />

      <ConfirmSaveDraftModal
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        campaignName={
          editingCampaign?.campaign_name ??
          createdCampaign?.campaign_name ??
          initialCampaignName ??
          "Unnamed campaign"
        }
        onConfirm={async () => {
          setConfirmSaveOpen(false);
          setSaving(true);
          try {
            let finalTemplateId = templateId;

            // Create or update template if needed
            if (body || senderName || subject) {
              // Generate new template ID if we don't have one
              if (!finalTemplateId) {
                finalTemplateId = getVarcharEight();
              }

              const templateData = {
                campaign_template_id: finalTemplateId,
                campaign_type: "email",
                university_names: "Yale",
                template_title: `Template for ${
                  editingCampaign?.campaign_name ??
                  createdCampaign?.campaign_name ??
                  initialCampaignName ??
                  "Campaign"
                }`,
                email_body: body,
                email_from_name: senderName,
                email_from_address: senderEmail,
                reply_to_address: replyTo || null,
                email_subject: subject,
                is_systemwide_YN: 0,
                is_active_YN: 1,
                editor_type: editorType,
              };

              // Update existing template or create new one
              let templateResponse;
              if (templateId) {
                // Template exists, update it
                templateResponse = await updateInternalEmailTemplate(
                  finalTemplateId,
                  templateData
                );
              } else {
                // Create new template
                templateResponse = await createInternalEmailTemplate(
                  templateData
                );
              }

              if (templateResponse) {
                setTemplateId(finalTemplateId);
              }
            }

            // Build campaign payload from available builder state
            const campaignData: any = {
              campaign_id:
                editingCampaign?.campaign_id ??
                createdCampaign?.campaign_id ??
                getVarcharEight(),
              campaign_name:
                editingCampaign?.campaign_name ??
                createdCampaign?.campaign_name ??
                initialCampaignName ??
                "",
              campaign_desc:
                editingCampaign?.campaign_desc ??
                createdCampaign?.campaign_desc ??
                initialCampaignDesc ??
                undefined,
              campaign_type: commType === "event" ? "event" : "email",
              aws_configuration_set:
                process.env.AWS_SES_CONFIGURATION_SET || "",
              campaign_filters: JSON.stringify({
                gender,
                sports,
                selectedYears,
              }),
              audience_size: String(filteredTotal.athletes),
              audience_emails: String(filteredTotal.emails),
              campaign_status: "draft",
              is_active_YN: 1,
              include_logo_YN: includeUniversityLogo ? 1 : 0,
              university_colors_YN: colorScheme === "university" ? 1 : 0,
              updated_datetime: new Date().toISOString(),
              // Use template_id instead of individual email fields
              campaign_template_id: finalTemplateId || undefined,
              // Keep basic email info for backward compatibility
              email_from_name: senderName || undefined,
              email_from_address: senderEmail || undefined,
              reply_to_address: replyTo || undefined,
              email_subject: subject || undefined,
              editor_type: editorType,
            };

            // If we're editing, preserve original creation info
            if (editingCampaign) {
              campaignData.created_datetime = editingCampaign.created_datetime;
              campaignData.created_by = editingCampaign.created_by;
            } else {
              campaignData.created_datetime = new Date().toISOString();
            }

            await updateInternalCampaign(
              campaignData.campaign_id,
              campaignData
            );
            setCreatedCampaign(campaignData);
            const isEditing = !!editingCampaign;
            toast.success(
              `Campaign draft ${isEditing ? "updated" : "saved"} successfully`
            );
          } catch (err) {
            console.error("Failed to update campaign:", err);
            toast.error("Failed to save draft");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}

function AnimatedPanel({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const [displayIndex, setDisplayIndex] = useState(index);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayIndex(index);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {React.Children.toArray(children)[displayIndex as number]}
    </div>
  );
}
