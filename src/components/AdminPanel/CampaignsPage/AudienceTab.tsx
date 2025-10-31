"use client";
import React, { useRef, useState, useEffect } from "react";
import FunnelChart from "./FunnelChart";
import PresetModal from "./PresetModal";
import CampaignEmailsList from "./CampaignEmailsList";
import toast from "react-hot-toast";
import Tooltip from "@mui/material/Tooltip";
import { FaAngleDown } from "react-icons/fa";
import { FiEdit2, FiX, FiCheck } from "react-icons/fi";
import Drawer from "@mui/material/Drawer";
import { getInternalCampaigns } from "@/services/InternalMemberApis";

type Props = {
  onNext?: () => void;
  gender: string | null;
  setGenderAction: (gender: string | null) => void;
  sports: string[];
  setSportsAction: (sports: string[]) => void;
  selectedYears: number[];
  setSelectedYearsAction: (years: number[]) => void;
  years: number[];
  sportOptions: { value: string; label: string }[];
  totals: { totalAthletes: number; emails: number };
  filteredTotal: { athletes: number; emails: number };
  filteredCounts: any[];
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
  selectedUniversities: string[];
  setSelectedUniversitiesAction: (universities: string[]) => void;
  universityOptions: { value: string; label: string }[];
};

export default function AudienceTab({
  onNext,
  gender,
  setGenderAction,
  sports,
  setSportsAction,
  selectedYears,
  setSelectedYearsAction,
  years,
  sportOptions,
  totals,
  filteredTotal,
  filteredCounts,
  campaignName,
  onCampaignNameUpdate,
  selectedUniversities,
  setSelectedUniversitiesAction,
  universityOptions,
}: Props) {
  const [openPreset, setOpenPreset] = useState(false);
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const [yearsDropdownOpen, setYearsDropdownOpen] = useState(false);
  const [universitiesDropdownOpen, setUniversitiesDropdownOpen] =
    useState(false);
  const [showEmailsList, setShowEmailsList] = useState(false);
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [tempCampaignName, setTempCampaignName] = useState("");
  const [distributionType, setDistributionType] = useState<
    "custom" | "historical"
  >("custom");
  const [historicalCampaigns, setHistoricalCampaigns] = useState<any[]>([]);
  const [selectedHistoricalCampaign, setSelectedHistoricalCampaign] =
    useState<string>("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const sportsDropdownRef = useRef<HTMLDivElement>(null);
  const yearsDropdownRef = useRef<HTMLDivElement>(null);
  const universitiesDropdownRef = useRef<HTMLDivElement>(null);

  const allYearsSelected = selectedYears.length === years.length;
  const noneSelected = selectedYears.length === 0;
  const someSelected = !noneSelected && !allYearsSelected;

  // Debug logging
  useEffect(() => {
    console.log("AudienceTab - universityOptions:", universityOptions);
    console.log("AudienceTab - selectedUniversities:", selectedUniversities);
  }, [universityOptions, selectedUniversities]);

  // Fetch historical campaigns on component mount
  useEffect(() => {
    const fetchHistoricalCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const campaigns = await getInternalCampaigns();
        // Sort by created_datetime in ascending order
        const sortedCampaigns = campaigns.sort(
          (a: any, b: any) =>
            new Date(a.created_datetime).getTime() -
            new Date(b.created_datetime).getTime()
        );
        setHistoricalCampaigns(sortedCampaigns);
      } catch (error) {
        console.error("Error fetching historical campaigns:", error);
        toast.error("Failed to load historical campaigns");
      } finally {
        setLoadingCampaigns(false);
      }
    };

    fetchHistoricalCampaigns();
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sportsDropdownRef.current &&
        !sportsDropdownRef.current.contains(event.target as Node)
      ) {
        setSportsDropdownOpen(false);
      }
      if (
        yearsDropdownRef.current &&
        !yearsDropdownRef.current.contains(event.target as Node)
      ) {
        setYearsDropdownOpen(false);
      }
      if (
        universitiesDropdownRef.current &&
        !universitiesDropdownRef.current.contains(event.target as Node)
      ) {
        setUniversitiesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSportSelect = (sportValue: string) => {
    setSportsAction(
      sports.includes(sportValue)
        ? sports.filter((x) => x !== sportValue)
        : [...sports, sportValue]
    );
  };

  const handleUniversitySelect = (universityValue: string) => {
    setSelectedUniversitiesAction(
      selectedUniversities.includes(universityValue)
        ? selectedUniversities.filter((x) => x !== universityValue)
        : [...selectedUniversities, universityValue]
    );
  };

  const handleYearSelect = (year: number) => {
    setSelectedYearsAction(
      selectedYears.includes(year)
        ? selectedYears.filter((x) => x !== year)
        : [...selectedYears, year]
    );
  };

  const handleSelectAllYears = () => {
    if (allYearsSelected) {
      setSelectedYearsAction([]);
    } else {
      setSelectedYearsAction(years);
    }
  };

  const handleSelectAllSports = () => {
    if (sports.length === sportOptions.length) {
      setSportsAction([]);
    } else {
      setSportsAction(sportOptions.map((option) => option.value));
    }
  };

  const handleSelectAllUniversities = () => {
    if (selectedUniversities.length === universityOptions.length) {
      setSelectedUniversitiesAction([]);
    } else {
      setSelectedUniversitiesAction(
        universityOptions.map((option) => option.value)
      );
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

  const saveCampaignName = async () => {
    if (tempCampaignName.trim() && onCampaignNameUpdate) {
      try {
        await onCampaignNameUpdate(tempCampaignName.trim());
        setIsEditingCampaignName(false);
        setTempCampaignName("");
      } catch (error) {
        console.log("Error updating campaign name:", error);
        toast.error("Failed to update campaign name");
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

  // Handle historical campaign selection
  const handleHistoricalCampaignSelect = (campaignId: string) => {
    const selectedCampaign = historicalCampaigns.find(
      (c) => c.campaign_id === campaignId
    );
    if (selectedCampaign && selectedCampaign.campaign_filters) {
      try {
        const filters = JSON.parse(selectedCampaign.campaign_filters);

        // Apply the filters from the selected campaign
        if (filters.gender !== undefined) {
          setGenderAction(filters.gender);
        }
        if (filters.sports && Array.isArray(filters.sports)) {
          setSportsAction(filters.sports);
        }
        if (filters.selectedYears && Array.isArray(filters.selectedYears)) {
          setSelectedYearsAction(filters.selectedYears);
        }
        if (filters.universities && Array.isArray(filters.universities)) {
          setSelectedUniversitiesAction(filters.universities);
        }

        setSelectedHistoricalCampaign(campaignId);
        toast.success("Applied filters from historical campaign");
      } catch (error) {
        console.error("Error parsing campaign filters:", error);
        toast.error("Failed to apply filters from historical campaign");
      }
    }
  };

  // Create a campaign object for the emails list modal
  const campaign = {
    campaign_name: campaignName || "Filtered Audience",
    audience_size: filteredTotal.athletes,
    audience_emails: filteredTotal.emails,
    campaign_filters: JSON.stringify({
      gender,
      sports,
      selectedYears,
      universities: selectedUniversities,
    }),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            Audience - Build Recipient List
          </h2>
          <div className="text-sm">
            Define your audience and see live counts before sending.
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

      {/* Distribution Type Selection */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-3">
          Choose Distribution Type
        </h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="distributionType"
              value="historical"
              checked={distributionType === "historical"}
              onChange={() => {
                setDistributionType("historical");
              }}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-medium">
              Reuse a Historical Campaign List
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="distributionType"
              value="custom"
              checked={distributionType === "custom"}
              onChange={() => {
                setDistributionType("custom");
                setSelectedHistoricalCampaign("");
              }}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-medium">
              Use a Custom Distribution List
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="col-span-2 bg-gray-50 p-6 rounded-lg">
          <div className="flex flex-row gap-4 items-start ">
            <div className="w-full">
              <label className="block text-sm text-gray-600">
                Historical Campaign
              </label>
              <select
                value={selectedHistoricalCampaign}
                onChange={(e) => handleHistoricalCampaignSelect(e.target.value)}
                disabled={
                  distributionType === "custom" ||
                  loadingCampaigns ||
                  historicalCampaigns.length === 0
                }
                className="mt-1 p-2 border border-gray-300 rounded w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCampaigns
                    ? "Loading..."
                    : historicalCampaigns.length === 0
                    ? "No campaigns"
                    : distributionType === "custom"
                    ? "Select option above"
                    : "Select a campaign"}
                </option>
                {historicalCampaigns.map((campaign) => (
                  <option
                    key={campaign.campaign_id}
                    value={campaign.campaign_id}
                  >
                    {campaign.campaign_name} -{" "}
                    {new Date(campaign.created_datetime).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {selectedHistoricalCampaign &&
                distributionType === "historical" && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Filters applied
                  </div>
                )}
            </div>
            <div className="w-full">
              {/* University Selection */}
              <div className="w-full mb-6">
                <Tooltip
                  title="Select one or more universities for this campaign"
                  placement="left"
                  arrow
                >
                  <label className="block text-sm text-gray-600">
                    Universities *
                  </label>
                </Tooltip>

                <div className="relative mt-1" ref={universitiesDropdownRef}>
                  <button
                    className="h-10 w-full rounded border border-gray-300 bg-white pl-4 pr-8 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onClick={() =>
                      distributionType === "custom" &&
                      setUniversitiesDropdownOpen(!universitiesDropdownOpen)
                    }
                    disabled={distributionType === "historical"}
                  >
                    {selectedUniversities.length > 0
                      ? `${selectedUniversities.length} universit${
                          selectedUniversities.length > 1 ? "ies" : "y"
                        } selected`
                      : "Select Universities"}
                    <FaAngleDown
                      className={`h-4 w-4 transition-transform ${
                        universitiesDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {universitiesDropdownOpen &&
                    distributionType === "custom" && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                selectedUniversities.length ===
                                universityOptions.length
                              }
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectAllUniversities();
                              }}
                              className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                            <span className="text-sm font-medium">
                              {selectedUniversities.length ===
                              universityOptions.length
                                ? "Unselect All"
                                : "Select All"}
                            </span>
                          </div>
                        </div>
                        <div className="p-2">
                          {universityOptions.map((option, i) => (
                            <div
                              key={i}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUniversities.includes(
                                  option.value
                                )}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleUniversitySelect(option.value);
                                }}
                                className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                              />
                              <span
                                className="text-sm"
                                onClick={() =>
                                  handleUniversitySelect(option.value)
                                }
                              >
                                {option.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-1">
                  <Tooltip
                    title="By default, all genders are included."
                    placement="left"
                    arrow
                  >
                    <label className="block text-sm text-gray-600">
                      Gender
                    </label>
                  </Tooltip>
                  <select
                    value={gender ?? ""}
                    onChange={(e) => setGenderAction(e.target.value || null)}
                    disabled={distributionType === "historical"}
                    className="mt-1 p-2 border border-gray-300 rounded w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">All</option>
                    <option value="M">Men</option>
                    <option value="W">Women</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Tooltip
                    title="By default, all sports are included."
                    placement="left"
                    arrow
                  >
                    <label className="block text-sm text-gray-600">
                      Sports
                    </label>
                  </Tooltip>

                  <div className="relative mt-1" ref={sportsDropdownRef}>
                    <button
                      className="h-10 w-full rounded border border-gray-300 bg-white pl-4 pr-8 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                      onClick={() =>
                        distributionType === "custom" &&
                        setSportsDropdownOpen(!sportsDropdownOpen)
                      }
                      disabled={distributionType === "historical"}
                    >
                      {sports.length > 0
                        ? `${sports.length} sport(s) selected`
                        : "Select Sports"}
                      <FaAngleDown
                        className={`h-4 w-4 transition-transform ${
                          sportsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {sportsDropdownOpen && distributionType === "custom" && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={sports.length === sportOptions.length}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectAllSports();
                              }}
                              className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                            <span className="text-sm font-medium">
                              {sports.length === sportOptions.length
                                ? "Unselect All"
                                : "Select All"}
                            </span>
                          </div>
                        </div>
                        <div className="p-2">
                          {sportOptions.map((option, i) => (
                            <div
                              key={i}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={sports.includes(option.value)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSportSelect(option.value);
                                }}
                                className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                              />
                              <span
                                className="text-sm"
                                onClick={() => handleSportSelect(option.value)}
                              >
                                {option.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Tooltip
                  title="Technically, this is the max year the player was rostered."
                  placement="left"
                  arrow
                >
                  <label className="block text-sm text-gray-600 mb-2">
                    Graduation Years
                  </label>
                </Tooltip>
                <div className="relative" ref={yearsDropdownRef}>
                  <button
                    className="h-10 w-full rounded border border-gray-300 bg-white pl-4 pr-8 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onClick={() =>
                      distributionType === "custom" &&
                      setYearsDropdownOpen(!yearsDropdownOpen)
                    }
                    disabled={distributionType === "historical"}
                  >
                    {selectedYears.length > 0
                      ? `${selectedYears.length} year(s) selected`
                      : "Select Years"}
                    <FaAngleDown
                      className={`h-4 w-4 transition-transform ${
                        yearsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {yearsDropdownOpen && distributionType === "custom" && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <input
                            ref={selectAllRef}
                            type="checkbox"
                            checked={allYearsSelected}
                            aria-checked={
                              someSelected ? "mixed" : allYearsSelected
                            }
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectAllYears();
                            }}
                            className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                          />
                          <span className="text-sm font-medium">
                            {allYearsSelected ? "Unselect All" : "Select All"}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="grid grid-cols-4 gap-1">
                          {years.map((year) => (
                            <div
                              key={year}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedYears.includes(year)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleYearSelect(year);
                                }}
                                className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                              />
                              <span
                                className="text-sm"
                                onClick={() => handleYearSelect(year)}
                              >
                                {year}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500"># Athletes</div>
              <div className="text-3xl font-bold text-gray-700">
                {filteredTotal.athletes.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500"># Emails</div>
              <div className="text-3xl font-bold text-gray-700">
                {filteredTotal.emails.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Details</div>
              <button
                onClick={() => setShowEmailsList(true)}
                className="w-full mt-2 bg-primary text-white shadow-lg px-4 py-2 rounded hover:bg-primary/90 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                View Filtered Emails
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-primary mb-2">Detail By Sport</h3>
            <div className="bg-white rounded shadow overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-3">Sport</th>
                    <Tooltip placement="top" arrow title="# Athletes">
                      <th className="p-3 text-center"># Athletes</th>
                    </Tooltip>
                    <Tooltip
                      placement="top"
                      arrow
                      title="Note: There might be a multiple emails (work & personal) for some athletes"
                    >
                      <th className="p-3 text-center"># Emails</th>
                    </Tooltip>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    filteredCounts.reduce((acc: any, item: any) => {
                      if (!acc[item.sport]) {
                        acc[item.sport] = { athletes: 0, emails: 0 };
                      }
                      acc[item.sport].athletes += item.athletes_num;
                      acc[item.sport].emails += item.emails_num;
                      return acc;
                    }, {})
                  ).map(([sport, data]: [string, any]) => (
                    <tr key={sport} className="border-t">
                      <td className="p-3">{sport}</td>
                      <td className="p-3 text-center">
                        {data.athletes.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        {data.emails.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="col-span-1 bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            <h4 className="font-medium mb-3">Active Filters</h4>
            <div className="space-y-3">
              {/* Gender Filter */}
              {gender && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Gender:
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {gender === "M" ? "Men" : "Women"}
                  </span>
                </div>
              )}

              {/* Sports Filter */}
              {sports.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Sports ({sports.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sports.map((sport) => (
                      <span
                        key={sport}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Years Filter */}
              {selectedYears.length > 0 &&
                selectedYears.length < years.length && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Years ({selectedYears.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedYears.slice(0, 5).map((year) => (
                        <span
                          key={year}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                        >
                          {year}
                        </span>
                      ))}
                      {selectedYears.length > 5 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{selectedYears.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              {/* No filters message */}
              {!gender &&
                sports.length === 0 &&
                selectedYears.length === years.length && (
                  <div className="text-sm text-gray-500 italic">
                    No filters applied - showing all athletes
                  </div>
                )}
            </div>
          </div>

          <h4 className="font-medium test-primary mb-3">Funnel Preview</h4>
          <div className="h-48">
            <FunnelChart
              values={[
                totals.totalAthletes,
                filteredTotal.athletes,
                totals.emails,
                filteredTotal.emails,
              ]}
              labels={[
                "All Athletes",
                "Filtered Athletes",
                "Total Emails",
                "Filtered Emails",
              ]}
            />
          </div>
          <div className="mt-6">
            <button
              className="w-full bg-primary text-white px-4 py-2 rounded shadow-lg hover:font-bold transition-all duration-200"
              onClick={() => onNext?.()}
            >
              Next: Design Message
            </button>
          </div>
        </div>
      </div>

      <PresetModal
        open={openPreset}
        onClose={() => setOpenPreset(false)}
        onSave={() => {
          toast.success("Preset saved");
          setOpenPreset(false);
        }}
      />

      <Drawer
        anchor="right"
        open={showEmailsList}
        onClose={() => setShowEmailsList(false)}
        PaperProps={{
          "aria-label": "Filtered emails list",
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
