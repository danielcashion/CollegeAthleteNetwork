"use client";
import React from "react";

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  bounces: number;
  opens: number;
  clicks: number;
}

interface CampaignMetricsCardsProps {
  metrics: CampaignMetrics;
}

export default function CampaignMetricsCards({
  metrics,
}: CampaignMetricsCardsProps) {
  const metricItems = [
    {
      label: "Sent",
      value: metrics.sent,
      ariaLabel: `Emails sent ${metrics.sent}`,
    },
    {
      label: "Delivered",
      value: metrics.delivered,
      ariaLabel: `Emails delivered ${metrics.delivered}`,
    },
    {
      label: "Bounced",
      value: metrics.bounces,
      ariaLabel: `Emails bounced ${metrics.bounces}`,
    },
    {
      label: "Opens",
      value: metrics.opens,
      ariaLabel: `Opens ${metrics.opens}`,
    },
    {
      label: "Clicks",
      value: metrics.clicks,
      ariaLabel: `Clicks ${metrics.clicks}`,
    },
  ];

  return (
    <section aria-labelledby="campaign-metrics-heading" className="mb-4">
      <h3 id="campaign-metrics-heading" className="sr-only">
        Campaign performance metrics
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {metricItems.map((item) => (
          <div key={item.label} className="bg-white p-4 rounded shadow">
            <dt className="text-sm text-center text-primary">{item.label}</dt>
            <dd
              className="text-2xl text-center font-semibold"
              aria-label={item.ariaLabel}
            >
              {item.value?.toLocaleString() || "0"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
