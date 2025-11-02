"use client";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import StyledTooltip from "@/components/common/StyledTooltip";
import { Edit, Check, X } from "lucide-react";

interface CampaignHeaderProps {
  campaignName?: string;
  isLoading: boolean;
  onCampaignNameUpdateAction?: (newName: string) => void;
  onRefreshAction?: () => void;
}

export default function CampaignHeader({
  campaignName,
  isLoading,
  onCampaignNameUpdateAction,
  onRefreshAction,
}: CampaignHeaderProps) {
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");

  const startEditingCampaignName = () => {
    setTempCampaignName(campaignName || "");
    setIsEditingCampaignName(true);
  };

  const cancelEditingCampaignName = () => {
    setTempCampaignName("");
    setIsEditingCampaignName(false);
  };

  const saveCampaignName = () => {
    if (tempCampaignName.trim() && onCampaignNameUpdateAction) {
      onCampaignNameUpdateAction(tempCampaignName.trim());
      setIsEditingCampaignName(false);
      setTempCampaignName("");
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-lg text-primary font-semibold">
          Campaign Analytics
        </h2>
        <p className="text-sm text-gray-600">Results Analytics and KPIs</p>
      </div>
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Analytics actions"
      >
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
                {onCampaignNameUpdateAction && (
                  <button
                    onClick={startEditingCampaignName}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Edit campaign name"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {onRefreshAction && (
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="Analytics actions"
            >
              <StyledTooltip title="Re-fetch latest analytics" arrow>
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <AutorenewIcon fontSize="small" />
                      )
                    }
                    disabled={isLoading}
                    aria-label={
                      isLoading ? "Refreshing analytics" : "Refresh analytics"
                    }
                    onClick={onRefreshAction}
                  >
                    {isLoading ? "Refreshing" : "Refresh"}
                  </Button>
                </span>
              </StyledTooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
