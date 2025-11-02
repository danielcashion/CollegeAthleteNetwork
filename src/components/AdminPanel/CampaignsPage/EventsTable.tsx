"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { FaAngleDown } from "react-icons/fa";
import { X } from "lucide-react";

export interface TimeSeriesEvent {
  recipient_email: string;
  message_id: string;
  event_type: string;
  occurred_at: string;
  days_ago: number;
}

interface EventsTableProps {
  events: TimeSeriesEvent[];
  campaignName?: string;
}

type SortKey = "date" | "email" | "event" | "days";
type SortDir = "asc" | "desc";

export default function EventsTable({
  events,
  campaignName,
}: EventsTableProps) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [eventTypesDropdownOpen, setEventTypesDropdownOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const eventTypesDropdownRef = useRef<HTMLDivElement>(null);

  // Get unique event types
  const availableEventTypes = useMemo(() => {
    if (!events) return [];
    const uniqueTypes = Array.from(
      new Set(events.map((event) => event.event_type.toLowerCase()))
    ).sort();
    return uniqueTypes;
  }, [events]);

  // Initialize selected event types when data changes
  useEffect(() => {
    if (availableEventTypes.length > 0 && selectedEventTypes.length === 0) {
      setSelectedEventTypes(availableEventTypes);
    }
  }, [availableEventTypes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventTypesDropdownRef.current &&
        !eventTypesDropdownRef.current.contains(event.target as Node)
      ) {
        setEventTypesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEventTypeSelect = (eventType: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(eventType)
        ? prev.filter((x) => x !== eventType)
        : [...prev, eventType]
    );
  };

  const handleSelectAllEventTypes = () => {
    if (selectedEventTypes.length === availableEventTypes.length) {
      setSelectedEventTypes([]);
    } else {
      setSelectedEventTypes(availableEventTypes);
    }
  };

  // Memoized sorted events
  const sortedEvents = useMemo(() => {
    if (!events) return [] as TimeSeriesEvent[];
    const list = [...events];

    const compareString = (a: string | undefined, b: string | undefined) => {
      const aa = (a || "").toLowerCase();
      const bb = (b || "").toLowerCase();
      if (aa < bb) return -1;
      if (aa > bb) return 1;
      return 0;
    };

    list.sort((a, b) => {
      let primary = 0;
      if (sortKey === "date") {
        const ta = Date.parse(a.occurred_at);
        const tb = Date.parse(b.occurred_at);
        primary = ta === tb ? 0 : ta < tb ? -1 : 1;
        if (primary === 0) {
          primary = compareString(a.recipient_email, b.recipient_email);
        }
      } else if (sortKey === "email") {
        primary = compareString(a.recipient_email, b.recipient_email);
        if (primary === 0) {
          primary =
            Date.parse(a.occurred_at) === Date.parse(b.occurred_at)
              ? 0
              : Date.parse(a.occurred_at) < Date.parse(b.occurred_at)
              ? -1
              : 1;
        }
      } else if (sortKey === "event") {
        primary = compareString(a.event_type, b.event_type);
        if (primary === 0) {
          primary =
            Date.parse(a.occurred_at) === Date.parse(b.occurred_at)
              ? 0
              : Date.parse(a.occurred_at) < Date.parse(b.occurred_at)
              ? -1
              : 1;
        }
      } else if (sortKey === "days") {
        primary = Number(a.days_ago) - Number(b.days_ago);
        if (primary === 0) {
          primary = compareString(a.recipient_email, b.recipient_email);
        }
      }

      const dir = sortDir === "asc" ? 1 : -1;
      return primary * dir;
    });

    return list;
  }, [events, sortKey, sortDir]);

  // Filter events
  const filteredAndSortedEvents = useMemo(() => {
    if (!events) return [];

    const term = emailSearch.trim().toLowerCase();

    return sortedEvents
      .filter((event) =>
        selectedEventTypes.includes(event.event_type.toLowerCase())
      )
      .filter((event) => {
        if (!term) return true;
        return (event.recipient_email || "").toLowerCase().includes(term);
      });
  }, [sortedEvents, selectedEventTypes, emailSearch]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  };

  const exportToCsv = () => {
    try {
      const rows = showAllEvents
        ? filteredAndSortedEvents
        : filteredAndSortedEvents.slice(0, 5);

      const headers = ["Email", "Event Type", "Date/Time", "Days Ago"];
      const csvLines = [headers.join(",")];

      for (const r of rows) {
        const esc = (v: string | number | undefined) => {
          const s = v == null ? "" : String(v);
          if (/[",\n]/.test(s)) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        };

        csvLines.push(
          [
            esc(r.recipient_email),
            esc(r.event_type),
            esc(new Date(r.occurred_at).toLocaleString()),
            esc(r.days_ago),
          ].join(",")
        );
      }

      const blob = new Blob([csvLines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const pad2 = (n: number) => String(n).padStart(2, "0");
      const now = new Date();
      const y = now.getFullYear();
      const m = pad2(now.getMonth() + 1);
      const d = pad2(now.getDate());
      const hh = pad2(now.getHours());
      const mm = pad2(now.getMinutes());
      const ss = pad2(now.getSeconds());

      const baseName = (campaignName || "campaign").replace(
        /[^a-z0-9_\- ]/gi,
        ""
      );
      const filename = `${baseName}-CampaignMetrics-${y}-${m}-${d} ${hh}:${mm}:${ss}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed", err);
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? (
      <ArrowUpwardIcon fontSize="small" className="inline-block ml-1" />
    ) : (
      <ArrowDownwardIcon fontSize="small" className="inline-block ml-1" />
    );
  };

  const getSortOrder = (key: SortKey) => {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  };

  return (
    <section aria-labelledby="time-series-heading" className="mb-4 mt-10">
      <div className="flex items-center justify-between mb-3">
        <h3
          id="time-series-heading"
          className="text-lg text-primary font-semibold"
        >
          Table of Email Events
        </h3>
        <div className="flex items-center gap-4">
          {/* Email search */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              placeholder="Filter by email"
              aria-label="Filter by email"
              className="h-8 px-3 rounded border border-gray-300 bg-white text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
            {emailSearch && (
              <button
                onClick={() => setEmailSearch("")}
                aria-label="Clear email filter"
                className="absolute right-1 h-6 w-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Event Type Filter */}
          <div className="relative" ref={eventTypesDropdownRef}>
            <Tooltip title="Filter by event type" arrow>
              <button
                className="h-8 px-3 rounded border border-gray-300 bg-white text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between gap-2"
                onClick={() =>
                  setEventTypesDropdownOpen(!eventTypesDropdownOpen)
                }
              >
                <span>
                  {selectedEventTypes.length > 0
                    ? `${selectedEventTypes.length} event type(s)`
                    : "Select Event Types"}
                </span>
                <FaAngleDown
                  className={`h-3 w-3 transition-transform ${
                    eventTypesDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Tooltip>
            {eventTypesDropdownOpen && (
              <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto right-0">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedEventTypes.length === availableEventTypes.length
                      }
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectAllEventTypes();
                      }}
                      className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                    <span className="text-sm font-medium">
                      {selectedEventTypes.length === availableEventTypes.length
                        ? "Unselect All"
                        : "Select All"}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  {availableEventTypes.map((eventType) => (
                    <div
                      key={eventType}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventTypes.includes(eventType)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEventTypeSelect(eventType);
                        }}
                        className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      />
                      <span
                        className="text-sm capitalize"
                        onClick={() => handleEventTypeSelect(eventType)}
                      >
                        {eventType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {filteredAndSortedEvents.length > 5 && (
            <Button
              size="small"
              variant="text"
              onClick={() => setShowAllEvents(!showAllEvents)}
            >
              {showAllEvents ? "Show First 5 Only" : "Show All Records"}
            </Button>
          )}

          <Button size="small" variant="outlined" onClick={exportToCsv}>
            Download CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-white rounded-t-lg">
              <th
                className="px-4 py-2 text-left font-semibold rounded-tl-lg cursor-pointer"
                onClick={() => handleSort("email")}
                aria-sort={getSortOrder("email")}
              >
                Email {getSortIcon("email")}
              </th>
              <th
                className="px-4 py-2 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("event")}
                aria-sort={getSortOrder("event")}
              >
                Event Type {getSortIcon("event")}
              </th>
              <th
                className="px-4 py-2 text-left font-semibold cursor-pointer"
                onClick={() => handleSort("date")}
                aria-sort={getSortOrder("date")}
              >
                Date/Time {getSortIcon("date")}
              </th>
              <th
                className="px-4 py-2 text-left text-center font-semibold rounded-tr-lg cursor-pointer"
                onClick={() => handleSort("days")}
                aria-sort={getSortOrder("days")}
              >
                Days Ago {getSortIcon("days")}
              </th>
            </tr>
          </thead>
          <tbody>
            {(showAllEvents
              ? filteredAndSortedEvents
              : filteredAndSortedEvents.slice(0, 5)
            ).map((event, index) => (
              <tr
                key={`${event.message_id}-${event.event_type}-${index}`}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="px-4 py-2">{event.recipient_email}</td>
                <td className="px-4 py-2 capitalize">
                  {event.event_type.toLowerCase()}
                </td>
                <td className="px-4 py-2">
                  {new Date(event.occurred_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-center">{event.days_ago}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {selectedEventTypes.length === 0
              ? "No event types selected. Please select event types to view data."
              : "No event timeline data available for the selected event types."}
          </div>
        )}

        {!showAllEvents && filteredAndSortedEvents.length > 5 && (
          <div className="text-center py-4 text-sm text-gray-600">
            Showing 5 of {filteredAndSortedEvents.length} events
          </div>
        )}
      </div>
    </section>
  );
}
