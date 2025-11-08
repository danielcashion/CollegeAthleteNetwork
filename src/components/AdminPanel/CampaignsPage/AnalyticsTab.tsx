"use client";

import React, { useState, useEffect } from "react";
import type { CampaignData } from "@/types/Campaign";
import {
  getCampaignEventSummaryByCampaignId,
  getCampaignLineChartByCampaignId,
  getCampaignTimeSeriesByCampaignId,
} from "@/services/InternalMemberApis";
import DrilldownModal from "./DrilldownModal";
import CampaignHeader from "./CampaignHeader";
import CampaignMetricsCards, { CampaignMetrics } from "./CampaignMetricsCards";
import ChartControls, { ChartDisplayOptions } from "./Chartcontrols";
import AnalyticsChart, { TimelinePoint } from "./AnalyticsChart";
import TimelineTable from "./TimeTable";
import EventsTable, { TimeSeriesEvent } from "./EventsTable";

// Type definitions
type EventSummary = {
  event_type: string;
  qty: number;
};

type LineChartData = {
  event_type: string;
  "0_day": number;
  "1_day": number;
  "2_day": number;
  "3_day": number;
  "4_day": number;
  "5_day": number;
  "6_day_and_older": number;
};

type Analytics = {
  campaignId: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  timeline: TimelinePoint[];
  timeSeriesEvents: TimeSeriesEvent[];
};

interface DrillItem {
  title: string;
  body: React.ReactNode;
}

interface AnalyticsTabProps {
  campaign?: CampaignData | null;
  campaignName?: string;
  onCampaignNameUpdate?: (newName: string) => void;
  onBackAction: () => void;
}

export default function AnalyticsTab({
  campaign,
  campaignName,
  onCampaignNameUpdate,
  onBackAction,
}: AnalyticsTabProps) {
  // const { data: session } = useSession();

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<DrillItem | null>(null);

  // Chart display options state
  const [chartOptions, setChartOptions] = useState<ChartDisplayOptions>({
    showDailyOpens: true,
    showDailyClicks: true,
    showCumulativeOpens: true,
    showCumulativeClicks: true,
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!campaignName || !campaign?.campaign_id) return;

    setLoading(true);
    setError(null);

    try {
      const [eventSummaryResult, lineChartResult, timeSeriesResult] =
        await Promise.all([
          getCampaignEventSummaryByCampaignId(campaign.campaign_id),
          getCampaignLineChartByCampaignId(campaign.campaign_id),
          getCampaignTimeSeriesByCampaignId(campaign.campaign_id),
        ]);

      const eventSummary = eventSummaryResult[0] as EventSummary[];
      const lineChartData = lineChartResult[0] as LineChartData[];

      // Process event summary for totals
      const sent =
        eventSummary.find((item) => item.event_type === "SEND")?.qty || 0;
      const delivered =
        eventSummary.find((item) => item.event_type === "DELIVERY")?.qty || 0;
      const opens =
        eventSummary.find((item) => item.event_type === "OPEN")?.qty || 0;
      const clicks =
        eventSummary.find((item) => item.event_type === "CLICK")?.qty || 0;
      const bounces =
        eventSummary.find((item) => item.event_type === "BOUNCE")?.qty || 0;
      const unsubscribes =
        eventSummary.find((item) => item.event_type === "UNSUBSCRIBE")?.qty ||
        0;

      const timeline: TimelinePoint[] = [];

      // Create timeline for 7 days (0-6)
      for (let day = 0; day < 7; day++) {
        const dayKey =
          day === 6 ? "6_day_and_older" : (`${day}_day` as keyof LineChartData);

        const dayData = {
          day,
          sent: (lineChartData.find((item) => item.event_type === "SEND")?.[
            dayKey
          ] || 0) as number,
          delivered: (lineChartData.find(
            (item) => item.event_type === "DELIVERY"
          )?.[dayKey] || 0) as number,
          opens: (lineChartData.find((item) => item.event_type === "OPEN")?.[
            dayKey
          ] || 0) as number,
          clicks: (lineChartData.find((item) => item.event_type === "CLICK")?.[
            dayKey
          ] || 0) as number,
          bounces: (lineChartData.find(
            (item) => item.event_type === "BOUNCE"
          )?.[dayKey] || 0) as number,
          complaints: (lineChartData.find(
            (item) => item.event_type === "COMPLAINT"
          )?.[dayKey] || 0) as number,
          deliveryDelayReject: (lineChartData.find(
            (item) => item.event_type === "REJECT"
          )?.[dayKey] || 0) as number,
        };

        timeline.push(dayData);
      }

      // Process time series data
      const timeSeriesEvents = timeSeriesResult[0] as TimeSeriesEvent[];

      const analyticsData: Analytics = {
        campaignId: campaign.campaign_id,
        sent,
        delivered,
        opens,
        clicks,
        bounces,
        unsubscribes,
        timeline,
        timeSeriesEvents,
      };

      setData(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Analytics fetch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics on mount and when campaign changes
  useEffect(() => {
    if (campaignName && campaign?.campaign_id) {
      fetchAnalytics();
    }
  }, [campaignName, campaign?.campaign_id]);

  // Chart point click handler for drilling down (matches AnalyticsChart signature)
  const handlePointClick = (pointIndex: number, point: TimelinePoint) => {
    if (!data) return;

    // Create drill-down modal content
    const title = `Day ${pointIndex} Details`;
    const body = (
      <div>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Metrics for this day:</h4>
          <ul className="space-y-1">
            <li>Sent: {point.sent}</li>
            <li>Delivered: {point.delivered}</li>
            <li>Opens: {point.opens}</li>
            <li>Clicks: {point.clicks}</li>
            <li>Bounces: {point.bounces}</li>
          </ul>
        </div>
      </div>
    );

    setDrill({ title, body });
  };

  // Helper to get distinct recipient emails for a given day and event type
  const getEmailsFor = (day: number, eventType: "SEND" | "OPEN" | "CLICK") => {
    if (!data) return [] as string[];
    // Accept multiple candidate mappings for days_ago to tolerate off-by-one or 1-based vs 0-based
    const candidates = new Set<number>([day, Math.max(0, day - 1), day + 1]);

    // preserve multiplicity (one entry per event) so counts align with chart numbers
    let list = data.timeSeriesEvents
      .filter(
        (e) =>
          candidates.has(Number(e.days_ago)) &&
          e.event_type.toUpperCase() === eventType
      )
      .map((e) => e.recipient_email || "")
      .filter(Boolean);

    // Fallback: if no matches found, try a direct equality on day (legacy behavior) or nearest-day heuristic
    if (list.length === 0) {
      list = data.timeSeriesEvents
        .filter(
          (e) =>
            Number(e.days_ago) === day &&
            e.event_type.toUpperCase() === eventType
        )
        .map((e) => e.recipient_email || "")
        .filter(Boolean);
    }

    // Another fallback: if still empty, try matching by closest days_ago value
    if (list.length === 0 && data.timeSeriesEvents.length > 0) {
      const numericDays = Array.from(
        new Set(data.timeSeriesEvents.map((e) => Number(e.days_ago)))
      ).sort((a, b) => a - b);
      if (numericDays.length > 0) {
        // find closest
        let closest = numericDays[0];
        let minDiff = Math.abs(day - closest);
        for (const d of numericDays) {
          const diff = Math.abs(day - d);
          if (diff < minDiff) {
            minDiff = diff;
            closest = d;
          }
        }
        list = data.timeSeriesEvents
          .filter(
            (e) =>
              Number(e.days_ago) === closest &&
              e.event_type.toUpperCase() === eventType
          )
          .map((e) => e.recipient_email || "")
          .filter(Boolean);
      }
    }
    return list;
  };

  // Helper to get full event objects for a given day and event type (for modal display)
  const getEventsFor = (day: number, eventType: "SEND" | "OPEN" | "CLICK"): TimeSeriesEvent[] => {
    if (!data) return [] as TimeSeriesEvent[];
    // Accept multiple candidate mappings for days_ago to tolerate off-by-one or 1-based vs 0-based
    const candidates = new Set<number>([day, Math.max(0, day - 1), day + 1]);

    // preserve multiplicity (one entry per event) so counts align with chart numbers
    let events = data.timeSeriesEvents
      .filter(
        (e) =>
          candidates.has(Number(e.days_ago)) &&
          e.event_type.toUpperCase() === eventType
      );

    // Fallback: if no matches found, try a direct equality on day (legacy behavior) or nearest-day heuristic
    if (events.length === 0) {
      events = data.timeSeriesEvents
        .filter(
          (e) =>
            Number(e.days_ago) === day &&
            e.event_type.toUpperCase() === eventType
        );
    }

    // Another fallback: if still empty, try matching by closest days_ago value
    if (events.length === 0 && data.timeSeriesEvents.length > 0) {
      const numericDays = Array.from(
        new Set(data.timeSeriesEvents.map((e) => Number(e.days_ago)))
      ).sort((a, b) => a - b);
      if (numericDays.length > 0) {
        // find closest
        let closest = numericDays[0];
        let minDiff = Math.abs(day - closest);
        for (const d of numericDays) {
          const diff = Math.abs(day - d);
          if (diff < minDiff) {
            minDiff = diff;
            closest = d;
          }
        }
        events = data.timeSeriesEvents
          .filter(
            (e) =>
              Number(e.days_ago) === closest &&
              e.event_type.toUpperCase() === eventType
          );
      }
    }
    
    // Sort by datetime (occurred_at) in descending order (newest first)
    return events.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  };

  // Prepare metrics for the cards component
  const campaignMetrics: CampaignMetrics | null = data
    ? {
        sent: data.sent,
        delivered: data.delivered,
        bounces: data.bounces,
        opens: data.opens,
        clicks: data.clicks,
      }
    : null;

  // Check if campaign is not sent
  if (campaign?.campaign_status !== "Sent") {
    return (
      <div>
        <CampaignHeader
          campaignName={campaignName}
          isLoading={loading}
          onCampaignNameUpdateAction={onCampaignNameUpdate}
        />
        <div
          className="p-4 text-orange-600 bg-orange-50 rounded border border-orange-200"
          role="alert"
        >
          Analytics are only available for sent campaigns. This campaign status
          is: {campaign?.campaign_status || "unknown"}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={onBackAction}
            aria-label="Back to campaign builder"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div aria-busy={loading ? "true" : "false"}>
      {/* Live region for state announcements */}
      <div className="sr-only" aria-live="polite">
        {loading
          ? "Loading analytics"
          : error
          ? "Error loading analytics"
          : data
          ? "Analytics loaded"
          : ""}
      </div>

      <CampaignHeader
        campaignName={campaignName}
        isLoading={loading}
        onCampaignNameUpdateAction={onCampaignNameUpdate}
        onRefreshAction={() => {
          // call fetchAnalytics and ensure any unexpected rejection is handled
          fetchAnalytics().catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            console.error("fetchAnalytics error (wrapper):", err);
            setError(message);
          });
        }}
      />

      {loading && (
        <div className="p-4" role="status">
          Loading analytics…
        </div>
      )}
      {error && (
        <div className="p-4 text-red-600" role="alert">
          Error: {error}
        </div>
      )}

      {data && campaignMetrics && (
        <div>
          <CampaignMetricsCards metrics={campaignMetrics} />

          <div id="analytics-overview" className="sr-only">
            {`Total sent ${data.sent}, delivered ${data.delivered}, opens ${data.opens}, clicks ${data.clicks}.`}
            {data.delivered > 0 &&
              ` Open rate ${((data.opens / data.delivered) * 100).toFixed(
                1
              )} percent.`}
          </div>

          <ChartControls
            options={chartOptions}
            onOptionsChangeAction={setChartOptions}
          />

          {data.timeline && data.timeline.length > 0 && (
            <AnalyticsChart
              timeline={data.timeline}
              displayOptions={chartOptions}
              onPointClickAction={handlePointClick}
            />
          )}

          <div id="chart-summary" className="sr-only">
            {`Analytics timeline over ${data.timeline.length} days. `}
            {`Peak daily opens ${Math.max(
              ...data.timeline.map((p) => p.opens)
            )}. `}
            {`Peak daily clicks ${Math.max(
              ...data.timeline.map((p) => p.clicks)
            )}. `}
            {`Total cumulative opens ${data.timeline.reduce(
              (sum, p) => sum + p.opens,
              0
            )}. `}
            {`Total cumulative clicks ${data.timeline.reduce(
              (sum, p) => sum + p.clicks,
              0
            )}.`}
          </div>

          <TimelineTable
            timeline={data.timeline}
            events={data.timeSeriesEvents}
            getEmailsFor={getEmailsFor}
            getEventsFor={getEventsFor}
          />

          <EventsTable
            events={data.timeSeriesEvents}
            campaignName={campaignName}
          />

          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={onBackAction}
              aria-label="Back to campaign builder"
            >
              Back
            </button>
          </div>
        </div>
      )}

      <DrilldownModal
        open={!!drill}
        title={drill?.title}
        body={drill?.body}
        onCloseAction={() => setDrill(null)}
      />
    </div>
  );
}
