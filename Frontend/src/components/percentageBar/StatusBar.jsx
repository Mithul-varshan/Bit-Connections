import { useState, useEffect, memo } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography, Tooltip, Grid } from "@mui/material";

const BAR_HEIGHT = 20;

const getColor = (percentage, customColors) => {
  if (customColors) return customColors;
  if (percentage <= 25) return "#ef4444";
  if (percentage <= 50) return "#f59e42";
  if (percentage <= 75) return "#fde047";
  return "#22c55e";
};

const getDotColor = (percentage) => {
  if (percentage <= 25) return "#f87171";
  if (percentage <= 50) return "#fdba74";
  if (percentage <= 75) return "#fef08a";
  return "#4ade80";
};

const LEGEND = [
  { label: "Critical", color: "#ef4444", textColor: "#ef4444" },
  { label: "Warning", color: "#f59e42", textColor: "#f59e42" },
  { label: "Progress", color: "#fde047", textColor: "#fde047" },
  { label: "Complete", color: "#22c55e", textColor: "#22c55e" },
];
const AXIS_LABELS = [0, 25, 50, 75, 100];

const StatusBar = memo(
  ({
    percentage = 80,
    customColors,
    showTooltip = true,
    barMaxWidth = 820,
  }) => {
    const [currentPercentage, setCurrentPercentage] = useState(0);

    useEffect(() => {
      const validPercentage = Math.min(Math.max(percentage, 0), 100);
      setCurrentPercentage(validPercentage);
    }, [percentage]);

    return (
      <Box
        sx={{
          mx: "auto",
          width: "100%",
          background: "transparent",
          userSelect: "none",
          maxWidth: barMaxWidth,
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Typography fontWeight={600} fontSize={18}>
            Status
          </Typography>
          {showTooltip && (
            <Tooltip
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoOutlinedIcon fontSize="small" color="inherit" />
                  <span>{`${Math.round(currentPercentage)}% Complete`}</span>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "text.secondary",
                }}
                tabIndex={0}
              >
                <InfoOutlinedIcon fontSize="medium" />
              </Box>
            </Tooltip>
          )}
        </Grid>
        <Box
          role="progressbar"
          aria-valuenow={currentPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: barMaxWidth,
            backgroundColor: "#e5e7eb",
            border: "1px solid #e5e7eb",
            borderRadius: BAR_HEIGHT,
            height: BAR_HEIGHT,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
            overflow: "hidden",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              transition: "width 0.7s",
              width: `${currentPercentage}%`,
              height: BAR_HEIGHT,
              background: getColor(currentPercentage, customColors),
              borderRadius: BAR_HEIGHT,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: `calc(${currentPercentage}% - 10px)`,
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              background: getDotColor(currentPercentage),
              borderRadius: "50%",
              boxShadow: 2,
              border: "2px solid #fff",
              transition: "left 0.5s cubic-bezier(.6,1.7,.6,1)",
              zIndex: 2,
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            mt: 1,
            maxWidth: barMaxWidth,
            mx: "auto",
            px: 0.5,
            color: "#9ca3af",
          }}
        >
          {AXIS_LABELS.map((p, idx) => (
            <Box key={p} sx={{ ml: idx === 0 ? 0 : -1.1 }}>
              {p}%
            </Box>
          ))}
        </Box>
        {/* Legend */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: barMaxWidth,
            mx: "auto",
            mt: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {LEGEND.map((entry) => (
            <Box
              key={entry.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                color: entry.textColor,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: entry.color,
                  display: "inline-block",
                }}
              />
              <span>{entry.label}</span>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
);

StatusBar.displayName = "StatusBar";
export default StatusBar;
