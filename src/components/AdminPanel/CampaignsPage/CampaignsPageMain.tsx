"use client";
import { useState } from "react";
import CampaignBuilder from "./CampaignBuilder";
import CampaignsList from "./CampaignsList";
import type { CampaignData } from "@/types/Campaign";

export default function CampaignsPageMain() {
  const [view, setView] = useState<"list" | "builder">("list");
  // No longer auto-opening save draft on mount since we capture name/desc before entering builder
  const [openSaveDraftOnMount, setOpenSaveDraftOnMount] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(
    null
  );

  const handleCreateCampaign = (campaign: CampaignData) => {
    setEditingCampaign(campaign); // Set the created campaign as editing campaign
    setOpenSaveDraftOnMount(false); // we already have the campaign created
    setView("builder");
  };

  const handleEditCampaign = (campaign: CampaignData) => {
    setEditingCampaign(campaign);
    setOpenSaveDraftOnMount(false); // Don't open save draft modal when editing
    setView("builder");
  };

  const handleBackToList = () => {
    setView("list");
    setEditingCampaign(null); // Clear editing state when going back
  };

  return (
    <div className="min-h-[90vh]">
      {view === "list" ? (
        <CampaignsList
          createCampaignAction={handleCreateCampaign}
          editCampaignAction={handleEditCampaign}
        />
      ) : (
        <CampaignBuilder
          onBackToList={handleBackToList}
          openSaveDraftOnMount={openSaveDraftOnMount}
          editingCampaign={editingCampaign}
        />
      )}
    </div>
  );
}
