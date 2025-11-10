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
} from "@/services/InternalMemberApis";
import { updateInternalCampaign } from "@/services/InternalMemberApis";
import {
  getUniversityMetaByUniversityName,
  getTeamsByUniversityName,
} from "@/services/universityApi";
import SaveDraftCampaignModal from "./SaveDraftCampaignModal";
import ConfirmSaveDraftModal from "./ConfirmSaveDraftModal";
import { CampaignData } from "@/types/Campaign";
import { cleanEmailField } from "@/services/InternalMemberApis";
import { getAllUniversities } from "@/services/universityApi";
// import {  
//   replaceTemplateVariablesWithLogo
// } from "@/utils/CampaignUtils";

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
  // When editing an existing campaign, pass the campaign data
  editingCampaign?: CampaignData | null;
}

export default function CampaignBuilder({
  onBackToList,
  openSaveDraftOnMount,
  editingCampaign,
}: ECommsCampaignBuilderProps) {
  const [sportTeamList, setSportTeamList] = useState<any[]>([]);
  const [universityMetaData, setUniversityMetaData] = useState<any>(null);
  const [allUniversities, setAllUniversities] = useState<any[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [totalCounts, setTotalCounts] = useState<any>([]);
  const [filteredCounts, setFilteredCounts] = useState<any>([]);
  const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any | null>(null);
  const [emailBody, setEmailBody] = useState<string>(editingCampaign?.email_body || "");

  // Filter states moved from AudienceTab
  const [gender, setGender] = useState<string | null>(null);
  const [sports, setSports] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>(years);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    []
  );

  // Template states
  const [commType, setCommType] = useState<"general" | "event">("general");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState(
    "admin@collegeathletenetwork.org"
  );
  const [replyTo, setReplyTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateTask, setTemplateTask] = useState<string | null>(null);

  // New states for color scheme and university logo
  const [colorScheme, setColorScheme] = useState<"university" | "default">(
    "default"
  );
  const [includeUniversityLogo, setIncludeUniversityLogo] = useState(true);

  useEffect(() => {
    console.log("template task added: ", templateTask);
  }, [templateTask]);

  // Fetch all universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const universities = await getAllUniversities();

        // Ensure we have an array
        if (Array.isArray(universities)) {
          setAllUniversities(universities);
        } else {
          console.error("Universities data is not an array:", universities);
          setAllUniversities([]);
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        toast.error("Failed to load universities");
        setAllUniversities([]);
      }
    };

    fetchUniversities();
  }, []);

  // Fetch university metadata when selected universities change
  useEffect(() => {
    const fetchUniversityData = async () => {
      if (selectedUniversities.length === 0) {
        setUniversityMetaData(null);
        return;
      }

      try {
        // Fetch metadata for the first selected university (for logo/colors)
        const metaData = await getUniversityMetaByUniversityName(
          selectedUniversities[0]
        );
        setUniversityMetaData(metaData);
      } catch (error) {
        console.error("Error fetching university metadata:", error);
      }
    };

    fetchUniversityData();
  }, [selectedUniversities]);

  // Fetch sport teams for selected universities
  useEffect(() => {
    const fetchSportTeams = async () => {
      if (selectedUniversities.length === 0) {
        setSportTeamList([]);
        return;
      }

      try {
        // Fetch teams for all selected universities
        const teamsPromises = selectedUniversities.map((university) =>
          getTeamsByUniversityName(university)
        );
        const teamsResults = await Promise.all(teamsPromises);

        // Combine all teams from all universities
        const allTeams = teamsResults.flat();
        setSportTeamList(allTeams);
      } catch (error) {
        console.error("Error fetching sport teams:", error);
      }
    };

    fetchSportTeams();
  }, [selectedUniversities]);

  // Fetch total counts for selected universities
  useEffect(() => {
    const fetchTotalCounts = async () => {
      if (selectedUniversities.length === 0) {
        setTotalCounts([]);
        return;
      }

      try {
        // Fetch counts for all selected universities
        const countsPromises = selectedUniversities.map((university) =>
          getTotalCountsByUniversity({ university_name: university })
        );
        const countsResults = await Promise.all(countsPromises);

        // Each API call returns [data, metadata], so we need to extract the data parts
        // and then combine all the data arrays from all universities
        const allCounts = countsResults
          .map(result => Array.isArray(result) && result.length > 0 ? result[0] : [])
          .flat();
        
        // Wrap in array to match expected structure
        setTotalCounts([allCounts]);
      } catch (error) {
        console.error("Error fetching total counts:", error);
      }
    };

    fetchTotalCounts();
  }, [selectedUniversities]);

  // Initialize form fields when editing a campaign
  useEffect(() => {
    if (editingCampaign) {
      // Parse campaign filters if they exist
      if (editingCampaign.campaign_filters) {
        try {
          const filters = JSON.parse(editingCampaign.campaign_filters);
          setGender(filters.gender || null);
          setSports(filters.sports || []);
          setSelectedYears(filters.selectedYears || years);
          setSelectedUniversities(filters.universities || []);
        } catch (error) {
          console.error("Error parsing campaign filters:", error);
        }
      }

      // Parse university_names if it exists
      if (editingCampaign.university_names) {
        try {
          const universities = JSON.parse(editingCampaign.university_names);
          if (Array.isArray(universities)) {
            setSelectedUniversities(universities);
          }
        } catch (error) {
          console.log("Error parsing university_names:", error);
          setSelectedUniversities([editingCampaign.university_names]);
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

              // Store the template_task for API calls
              setTemplateTask(template.template_task);

              // Update state variables if not set in campaign
              if (!editingCampaign.email_from_name)
                setSenderName(template.email_from_name || "");
              if (!editingCampaign.email_from_address)
                setSenderEmail(template.email_from_address || "");
              if (!editingCampaign.email_subject)
                setSubject(template.email_subject || "");
              if (!editingCampaign.reply_to_address)
                setReplyTo(template.reply_to_address || "");

              // Update the campaign object with template data for use in ScheduleTab
              const updatedCampaign = {
                ...editingCampaign,
                email_from_name:
                  editingCampaign.email_from_name ||
                  template.email_from_name ||
                  "",
                email_from_address:
                  editingCampaign.email_from_address ||
                  template.email_from_address ||
                  "",
                email_subject:
                  editingCampaign.email_subject || template.email_subject || "",
                reply_to_address:
                  editingCampaign.reply_to_address ||
                  template.reply_to_address ||
                  "",
                email_body: template.email_body || "",
              };
              setCreatedCampaign(updatedCampaign);
            } else {
              // No template data found, just set the campaign as is
              setCreatedCampaign(editingCampaign);
            }
          } catch (error) {
            console.error("Error fetching template data:", error);
            // On error, still set the campaign
            setCreatedCampaign(editingCampaign);
          }
        };
        fetchTemplateData();
      } else {
        // Fallback to email_body if no template_id (for backward compatibility)
        setBody(editingCampaign.email_body || "");
        // Set the created campaign for modal display
        setCreatedCampaign(editingCampaign);
      }
    }
  }, [editingCampaign]);

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

  // Calculate university options
  const universityOptions = useMemo(() => {
    if (!Array.isArray(allUniversities)) {
      console.log("allUniversities is not an array");
      return [];
    }
    const options = allUniversities
      .map((university: any) => ({
        value: university.university_name,
        label: university.university_name,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));

    return options;
  }, [allUniversities]);

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
  }, [totalCounts, gender, sports, selectedYears]);

  // Calculate totals and filtered totals
  const totals = useMemo(() => {
    if (!totalCounts?.[0] || !Array.isArray(totalCounts[0])) {
      return { totalAthletes: 0, emails: 0 };
    }

    const totalAthletes = totalCounts[0].reduce(
      (sum: number, item: any) => sum + (item.athletes_num || 0),
      0
    );
    const totalEmails = totalCounts[0].reduce(
      (sum: number, item: any) => sum + (item.emails_num || 0),
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
      // Update campaign with template options if we have a campaign
      if (createdCampaign || editingCampaign) {
        try {
          const campaignData = {
            ...(editingCampaign || createdCampaign),
            include_logo_YN: includeUniversityLogo ? 1 : 0,
            university_colors_YN: colorScheme === "university" ? 1 : 0,
            updated_datetime: new Date().toISOString(),
            email_body: emailBody,
          };

          await updateInternalCampaign(campaignData.campaign_id, campaignData);

          // Update the created campaign state
          setCreatedCampaign(campaignData);
        } catch (updateError) {
          console.error("Error updating campaign:", updateError);
          // Don't block the flow, just log the error
        }
      }

      // Move to review tab
      setActiveIndex(2);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to proceed to review");
    }
  };

  // Function to handle background saving when switching tabs
  const handleBackgroundSave = async () => {
    try {
      // Update campaign if we have one
      const campaignToUpdate = editingCampaign || createdCampaign;
      if (campaignToUpdate) {
        const updatedCampaignData = {
          ...campaignToUpdate,
          campaign_filters: JSON.stringify({
            gender_id: gender === "M" ? [1] : gender === "F" ? [2] : [],
            max_roster_year: selectedYears,
            sports: sports,
            universities: selectedUniversities,
          }),
          email_body: emailBody,
          university_names: JSON.stringify(selectedUniversities),
          email_from_name: senderName,
          email_from_address: senderEmail,
          reply_to_address: replyTo || null,
          email_subject: cleanEmailField(subject),
          editor_type: "html",
          campaign_template_id: templateId,
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
        university_names: JSON.stringify(selectedUniversities),
        aws_configuration_set: process.env.AWS_SES_CONFIGURATION_SET || "",
        updated_datetime: new Date().toISOString(),
        email_body: emailBody,
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
                      if (editingCampaign || createdCampaign?.campaign_name) {
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
                  editingCampaign?.campaign_name
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
                selectedUniversities={selectedUniversities}
                setSelectedUniversitiesAction={setSelectedUniversities}
                universityOptions={universityOptions}
                templateTask={templateTask}
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
                colorScheme={colorScheme}
                setColorSchemeAction={setColorScheme}
                includeUniversityLogo={includeUniversityLogo}
                setIncludeUniversityLogoAction={setIncludeUniversityLogo}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name
                }
                emailBody={emailBody}
                setEmailBody={setEmailBody}
                onCampaignNameUpdate={handleCampaignNameUpdate}
                templateId={templateId}
                setTemplateIdAction={setTemplateId}
                templateTask={templateTask}
                setTemplateTaskAction={setTemplateTask}
                selectedUniversities={selectedUniversities}
              />
              <ReviewTab
                onNext={() => handleTabSwitch(3)}
                onBack={() => handleTabSwitch(1)}
                audience_size={filteredTotal.athletes}
                audience_emails={filteredTotal.emails}
                campaign={editingCampaign || createdCampaign || undefined}
                campaign_name={
                  editingCampaign?.campaign_name ||
                  createdCampaign?.campaign_name ||
                  undefined
                }
                campaign_status={
                  editingCampaign?.campaign_status ||
                  createdCampaign?.campaign_status ||
                  "draft"
                }
                templateId={templateId}
                templateTask={templateTask}
                universityMetaData={universityMetaData}
                includeUniversityLogo={includeUniversityLogo}
                colorScheme={colorScheme}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
                campaignFilters={{
                  gender,
                  sports,
                  selectedYears,
                  universities: selectedUniversities,
                }}
                emailBody={emailBody}
                senderName={senderName}
                subject = {subject}
                replyTo={replyTo}
              />
              <ScheduleTab
                onBack={() => handleTabSwitch(2)}
                emailBody={emailBody}
                templateId={templateId}
                templateTask={templateTask}
                campaign={createdCampaign || editingCampaign}
                campaignFilters={{
                  gender,
                  sports,
                  selectedYears,
                }}
                selectedUniversities={selectedUniversities}
                universityMetaData={universityMetaData}
                includeUniversityLogo={includeUniversityLogo}
                colorScheme={colorScheme}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name
                }
                onCampaignNameUpdate={handleCampaignNameUpdate}
              />
              <AnalyticsTab
                campaign={editingCampaign || createdCampaign}
                onBackAction={() => handleTabSwitch(3)}
                campaignName={
                  createdCampaign?.campaign_name ??
                  editingCampaign?.campaign_name
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
          universities: selectedUniversities,
        }}
        selectedUniversities={selectedUniversities}
        audienceData={{
          athletes: filteredTotal.athletes,
          emails: filteredTotal.emails,
        }}
        initialCampaignName={editingCampaign?.campaign_name}
        initialCampaignDesc={editingCampaign?.campaign_desc}
        emailData={{
          senderName,
          senderEmail,
          replyTo,
          subject,
          body,
          editorType: "html",
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
          "Unnamed campaign"
        }
        onConfirm={async () => {
          setConfirmSaveOpen(false);
          setSaving(true);
          try {
            // Build campaign payload from available builder state
            const campaignData: any = {
              campaign_id:
                editingCampaign?.campaign_id ?? createdCampaign?.campaign_id,

              campaign_name:
                editingCampaign?.campaign_name ??
                createdCampaign?.campaign_name ??
                "",
              campaign_desc:
                editingCampaign?.campaign_desc ??
                createdCampaign?.campaign_desc ??
                undefined,
              campaign_type: commType === "event" ? "event" : "email",
              aws_configuration_set:
                process.env.AWS_SES_CONFIGURATION_SET || "",
              campaign_filters: JSON.stringify({
                gender,
                sports,
                selectedYears,
                universities: selectedUniversities,
              }),
              university_names: JSON.stringify(selectedUniversities),
              audience_size: String(filteredTotal.athletes),
              audience_emails: String(filteredTotal.emails),
              campaign_status: "draft",
              is_active_YN: 1,
              include_logo_YN: includeUniversityLogo ? 1 : 0,
              university_colors_YN: colorScheme === "university" ? 1 : 0,
              updated_datetime: new Date().toISOString(),
              campaign_template_id: templateId || undefined,
              // Keep basic email info for backward compatibility
              email_from_name: senderName || undefined,
              email_from_address: senderEmail || undefined,
              reply_to_address: replyTo || undefined,
              email_subject: subject || undefined,
              editor_type: "html",
              email_body: emailBody,
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
