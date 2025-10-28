"use client";
import { useState } from "react";
// import ECommsCampaignBuilder from "./ECommsCampaignBuilder";
import CampaignsList from "./CampaignsList";
import type { CampaignData } from "@/types/Campaign";

export default function CampaignsPageMain() {
  const [view, setView] = useState<"list" | "builder">("list");
  // No longer auto-opening save draft on mount since we capture name/desc before entering builder
  const [openSaveDraftOnMount, setOpenSaveDraftOnMount] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(
    null
  );
  const [initialCampaignName, setInitialCampaignName] = useState<
    string | undefined
  >(undefined);
  const [initialCampaignDesc, setInitialCampaignDesc] = useState<
    string | undefined
  >(undefined);

  const handleCreateCampaign = (name: string, desc: string) => {
    setEditingCampaign(null); // Clear any editing state
    setInitialCampaignName(name);
    setInitialCampaignDesc(desc);
    setOpenSaveDraftOnMount(false); // we already have basics, don't prompt again
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
        // <ECommsCampaignBuilder
        //   onBackToList={handleBackToList}
        //   openSaveDraftOnMount={openSaveDraftOnMount}
        //   editingCampaign={editingCampaign}
        //   initialCampaignName={initialCampaignName}
        //   initialCampaignDesc={initialCampaignDesc}
        // />
        <></>
      )}
    </div>
  );
}
