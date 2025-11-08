"use client";
import React, { useState } from "react";
import { TimelinePoint } from "./AnalyticsChart";
import StyledTooltip from "@/components/common/StyledTooltip";
import DrilldownModal from "./DrilldownModal";
import EmailListModal from "./EmailListsModal";

import { TimeSeriesEvent } from "./EventsTable";

interface TimelineTableProps {
  timeline: TimelinePoint[];
  events?: any[];
  // function to retrieve emails for a given day and event type (SEND, OPEN, CLICK)
  getEmailsFor?: (
    day: number,
    eventType: "SEND" | "OPEN" | "CLICK"
  ) => string[];
  // function to retrieve full event objects for a given day and event type (for modal display)
  getEventsFor?: (
    day: number,
    eventType: "SEND" | "OPEN" | "CLICK"
  ) => TimeSeriesEvent[];
}

export default function TimelineTable({
  timeline,
  events,
  getEmailsFor,
  getEventsFor,
}: TimelineTableProps) {
  console.log("Rendering TimelineTable with events:", events);

  const [modalOpen, setModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalBody, setModalBody] = useState<React.ReactNode | undefined>(
    undefined
  );

  // Email list modal state
  const [emailListModalOpen, setEmailListModalOpen] = useState(false);
  const [emailListModalTitle, setEmailListModalTitle] = useState("");
  const [emailListModalEmails, setEmailListModalEmails] = useState<string[]>(
    []
  );
  const [emailListModalEvents, setEmailListModalEvents] = useState<TimeSeriesEvent[]>(
    []
  );

  // Function to extract emails from events based on day and event type
  const getEmailsFromEvents = (
    dayIndex: number,
    eventType: string
  ): string[] => {
    if (!events || !Array.isArray(events)) return [];

    return events
      .filter(
        (event) =>
          event.days_ago === dayIndex &&
          event.event_type === eventType &&
          event.recipient_email
      )
      .map((event) => event.recipient_email)
      .filter((email, index, array) => array.indexOf(email) === index); // Remove duplicates
  };

  const columnHeaders = [
    "Status",
    "Today (T)",
    "Yesterday",
    "T-2",
    "T-3",
    "T-4",
    "T-5",
    ">= T-6",
  ];

  const metrics = [
    { key: "sent" as keyof TimelinePoint, label: "Sent", eventType: "SEND" },
    {
      key: "delivered" as keyof TimelinePoint,
      label: "Delivered",
      eventType: "DELIVERY",
    },
    { key: "opens" as keyof TimelinePoint, label: "Opened", eventType: "OPEN" },
    {
      key: "clicks" as keyof TimelinePoint,
      label: "Clicked",
      eventType: "CLICK",
    },
    {
      key: "bounces" as keyof TimelinePoint,
      label: "Bounces",
      eventType: "BOUNCE",
    },
    {
      key: "complaints" as keyof TimelinePoint,
      label: "Complaint",
      eventType: "COMPLAINT",
    },
    {
      key: "deliveryDelayReject" as keyof TimelinePoint,
      label: "Delivery Delay/Reject",
      eventType: "REJECT",
    },
  ];

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="text-center text-gray-500">
          No timeline data available
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary text-white rounded-t-lg">
            {columnHeaders.map((header, index) => (
              <th
                key={header}
                className={`px-4 py-2 text-center font-semibold ${
                  index === 0
                    ? "text-left rounded-tl-lg"
                    : index === columnHeaders.length - 1
                    ? "rounded-tr-lg"
                    : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, metricIndex) => (
            <tr
              key={metric.key}
              className={metricIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <th scope="row" className="px-8 py-2 font-medium text-left">
                {metric.label}
              </th>
              {timeline.slice(0, 7).map((timePoint, dayIndex) => {
                // Get emails from events based on day and metric event type
                const emails = metric.eventType
                  ? getEmailsFromEvents(dayIndex, metric.eventType)
                  : getEmailsFor
                  ? getEmailsFor(
                      dayIndex,
                      metric.eventType as "SEND" | "OPEN" | "CLICK"
                    )
                  : [];

                const shortEmails = emails ? emails.slice(0, 4) : [];

                const openEmailListModal = () => {
                  setEmailListModalTitle(`${metric.label} - Day ${dayIndex}`);
                  
                  // Use full events if getEventsFor is available, otherwise fall back to emails
                  if (getEventsFor && metric.eventType) {
                    const events = getEventsFor(dayIndex, metric.eventType as "SEND" | "OPEN" | "CLICK");
                    setEmailListModalEvents(events);
                    setEmailListModalEmails([]); // Clear emails when using events
                  } else {
                    setEmailListModalEmails(emails);
                    setEmailListModalEvents([]); // Clear events when using emails
                  }
                  
                  setEmailListModalOpen(true);
                };

                const cellContent = (
                  <div className="px-4 py-2 text-center">
                    {timePoint[metric.key] || 0}
                  </div>
                );

                return (
                  <td key={dayIndex} className="px-4 py-2 text-center">
                    {(metric.eventType || getEmailsFor) && emails.length > 0 ? (
                      <StyledTooltip
                        title={
                          <div className="text-sm">
                            {shortEmails.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No addresses
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {shortEmails.map((e) => (
                                  <div key={e} className="break-words">
                                    {e}
                                  </div>
                                ))}
                              </div>
                            )}
                            {emails.length > 4 && (
                              <div className="mt-2">
                                <button
                                  className="text-xs text-primary underline cursor-pointer hover:text-primary/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEmailListModal();
                                  }}
                                >
                                  View All ({emails.length})
                                </button>
                              </div>
                            )}
                          </div>
                        }
                        arrow
                        interactive
                      >
                        <div>{cellContent}</div>
                      </StyledTooltip>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <DrilldownModal
        open={modalOpen}
        onCloseAction={() => setModalOpen(false)}
        title={modalTitle}
        body={modalBody}
      />
      <EmailListModal
        isOpen={emailListModalOpen}
        onClose={() => setEmailListModalOpen(false)}
        emails={emailListModalEmails}
        events={emailListModalEvents}
        title={emailListModalTitle}
      />
    </div>
  );
}
