"use client";
import React from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { Paper, Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

type ScheduleCalendarProps = {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs | null) => void;
  schedules: any[];
};

// Custom day component that highlights scheduled dates
function CustomDay(props: PickersDayProps<Dayjs> & { scheduledDates?: Set<string> }) {
  const { scheduledDates, day, ...other } = props;
  const dateStr = day.format("YYYY-MM-DD");
  const hasSchedule = scheduledDates?.has(dateStr);

  return (
    <Box
      sx={{
        position: "relative",
        "&::after": hasSchedule
          ? {
              content: '""',
              position: "absolute",
              bottom: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: props.selected ? "#fff" : "#ED3237",
              zIndex: 1,
            }
          : {},
      }}
    >
      <PickersDay {...other} day={day} />
    </Box>
  );
}

export default function ScheduleCalendar({
  selectedDate,
  onDateChange,
  schedules,
}: ScheduleCalendarProps) {
  // Track the view month (the month being displayed in the first calendar)
  // Initialize to current month (today)
  const [viewMonth, setViewMonth] = React.useState(dayjs().startOf("month"));

  // Get dates that have scheduled campaigns
  const scheduledDates = new Set(
    schedules.map((schedule) => dayjs(schedule.scheduled_at).format("YYYY-MM-DD"))
  );

  // Calculate the two months to display - use useMemo to ensure they update when viewMonth changes
  const firstMonth = React.useMemo(() => {
    return dayjs(viewMonth).startOf("month");
  }, [viewMonth]);
  
  const secondMonth = React.useMemo(() => {
    // Create a new dayjs instance to avoid mutation - add 1 month to viewMonth
    return dayjs(viewMonth).add(1, "month").startOf("month");
  }, [viewMonth]);
  

  // Handle month navigation - when user clicks arrows, update view month
  const handleMonthChange = (newMonth: Dayjs) => {
    setViewMonth(newMonth.startOf("month"));
  };

  // Custom navigation handlers
  const handlePreviousMonth = () => {
    const newMonth = dayjs(viewMonth).subtract(1, "month").startOf("month");
    setViewMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = dayjs(viewMonth).add(1, "month").startOf("month");
    setViewMonth(newMonth);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1C315F",
              fontSize: "1.125rem",
            }}
          >
            Calendar View
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={handlePreviousMonth}
              size="small"
              sx={{
                color: "#1C315F",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
                transition: "all 0.2s ease",
              }}
              aria-label="Previous month"
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleNextMonth}
              size="small"
              sx={{
                color: "#1C315F",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
                transition: "all 0.2s ease",
              }}
              aria-label="Next month"
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: { xs: "wrap", md: "nowrap" },
            "& .MuiDateCalendar-root": {
              width: "100%",
              minWidth: { xs: "100%", md: "300px" },
            },
            "& .MuiPickersCalendarHeader-root": {
              padding: "8px 4px 4px 4px",
              minHeight: "48px",
              "& .MuiPickersCalendarHeader-label": {
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#1C315F",
              },
            },
            "& .MuiDayCalendar-weekContainer": {
              margin: "2px 0",
            },
            "& .MuiPickersDay-root": {
              fontSize: "0.8125rem",
              fontWeight: 500,
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#e3f2fd",
                transform: "scale(1.05)",
              },
            },
            "& .MuiPickersDay-today": {
              border: "2px solid #1C315F !important",
              fontWeight: 600,
            },
            "& .Mui-selected": {
              backgroundColor: "#1C315F !important",
              color: "white !important",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#243a66 !important",
                transform: "scale(1.05)",
              },
            },
            "& .MuiPickersCalendarHeader-weekDayLabel": {
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "4px 0",
            },
            // Hide the default navigation arrows
            "& .MuiPickersCalendarHeader-root": {
              "& .MuiIconButton-root": {
                display: "none",
              },
            },
          }}
        >
          <Box 
            sx={{ 
              flex: 1, 
              minWidth: 0,
              "& .MuiDateCalendar-root": {
                borderRight: { md: "1px solid #e5e7eb" },
                paddingRight: { md: 2 },
                marginRight: { md: 2 },
              },
            }}
          >
            <DateCalendar
              key={`calendar-1-${firstMonth.format("YYYY-MM")}`}
              value={null}
              onChange={onDateChange}
              referenceDate={firstMonth}
              views={['day']}
              openTo="day"
              reduceAnimations
              slots={{
                day: CustomDay,
              }}
              slotProps={{
                day: {
                  scheduledDates,
                } as any,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DateCalendar
              key={`calendar-2-${secondMonth.format("YYYY-MM")}`}
              value={null}
              onChange={onDateChange}
              referenceDate={secondMonth}
              views={['day']}
              openTo="day"
              reduceAnimations
              slots={{
                day: CustomDay,
              }}
              slotProps={{
                day: {
                  scheduledDates,
                } as any,
              }}
            />
          </Box>
        </Box>

        {/* Legend */}
        <Box 
          sx={{ 
            mt: 2, 
            pt: 2,
            borderTop: "1px solid #e5e7eb",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: 2 
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ED3237",
                boxShadow: "0 2px 4px rgba(237, 50, 55, 0.3)",
              }}
            />
            <Typography 
              variant="body2" 
              sx={{
                color: "#6B7280",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              Scheduled campaign
            </Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
}

