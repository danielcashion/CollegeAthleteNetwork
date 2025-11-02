"use client";
import React from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";

const defaultSx = {
  bgcolor: "#fff",
  color: "#111827",
  border: "1.5px solid var(--primary)",
  boxShadow: "0 6px 32px 0 rgba(16,30,54,0.18)",
  borderRadius: "12px",
  padding: "12px 16px",
  fontFamily: "var(--font-poppins), sans-serif",
  fontSize: 13,
  maxWidth: 520,
  "& .MuiTooltip-arrow": { color: "var(--primary)" },
};

export default function StyledTooltip(
  props: TooltipProps & { maxWidth?: number; interactive?: boolean }
) {
  const { children, slotProps, maxWidth, interactive, ...rest } = props;
  const mergedSlotProps = {
    ...slotProps,
    tooltip: {
      sx: {
        ...(slotProps as any)?.tooltip?.sx,
        ...defaultSx,
        maxWidth: maxWidth ?? (defaultSx as any).maxWidth,
      },
      ...(slotProps as any)?.tooltip,
    },
  } as any;

  // If interactive behavior is requested, set pointerEvents on the tooltip slot
  // instead of forwarding the `interactive` prop which could be passed to a DOM node
  // by some Tooltip implementations and trigger React warnings.
  if (interactive) {
    mergedSlotProps.tooltip.sx = {
      ...(mergedSlotProps.tooltip.sx || {}),
      pointerEvents: "auto",
    };
  }

  // Do NOT forward `interactive` directly in the spread to avoid it ending up on a DOM element.
  const passed = { ...(rest as any) } as any;

  return (
    <Tooltip {...passed} slotProps={mergedSlotProps}>
      {children}
    </Tooltip>
  );
}
