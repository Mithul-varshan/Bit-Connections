import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TaskIcon from "@mui/icons-material/Task";
import StatusBar from "../../components/percentageBar/StatusBar";
import MiddleManRecordsCard from "../../components/middlemancard/MiddleManRecordsCard";
import axios from "axios";
import api from "../../api/axios"
import useAuthStore from "../../store/authStore";
export default function MiddleManHome() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // --- Filter menu state ---
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  const [alertState, setAlertState] = useState({ open: false, message: "", severity: "success" });
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;
  const category=useAuthStore((state) => state.user?.category); 
  const loadData = useCallback(async (force=false) => {
    if (!force && (!hasMore || loading)) return;
    setLoading(true);
    try {
      const response = await api.get("/api/processed_data", {
        params: {
          limit, page,category
        }
      });
      const newRecords = response.data?.results || [];
      if (page === 0) {
        setRecords(newRecords);
      } else {
        setRecords(prevRecords => [...prevRecords, ...newRecords]);
      }
      if (newRecords.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlertState({ open: true, message: "Failed to load data", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [hasMore, page]);

  const fetchFilteredData = async (inputValue) => {
    try {
      setLoading(true);
      console.log("Sending to fetchFilteredData:", inputValue);
      
      const response = await api.get("/api/filtered_data", {
        params: {
          filterType: selectedFilterType,
          filterValue: inputValue,
        }
      });
      console.log(response.data.results);
      const filteredResults = response.data?.results || [];
      console.log("Filtered results:", filteredResults);
      
      setRecords(filteredResults);
      setHasMore(false);
      
      return filteredResults;
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      setAlertState({ open: true, message: "Failed to load filtered data", severity: "error" });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      }, { root: null, threshold: 0, rootMargin: '300px' });
    observer.observe(scrollRef.current);
    return () => {
      if (scrollRef.current) observer.unobserve(scrollRef.current);
    };
  }, [hasMore, loading]);

  const handleRecordDeleted = useCallback((id, msg = "Record Deleted Successfully") => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
    setAlertState({ open: true, message: msg, severity: "success" });
  }, []);

  const handleRecordEdit = useCallback((id, newDataArray) => {
    const newData = newDataArray[0] || {};
    setRecords((prevRecords) =>
      prevRecords.map((record) => (record.id === id ? { ...record, ...newData } : record))
    );
  }, []);

  useEffect(() => {
    loadData();
  }, [page]);

  const showAlert = (msg, severity = "success") => {
    setAlertState({ open: true, message: msg, severity });
  };

  const handleAlertClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setAlertState((s) => ({ ...s, open: false }));
  }, []);

  const handleOpenFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (filterType) => {
    setSelectedFilterType(filterType);
    setQuery("");
    handleCloseFilterMenu();
  };

  const handleClearFilter = () => {
    setSelectedFilterType(null);
    setQuery("");
    // Reset to original data
    setRecords([]);
    setPage(0);
    setHasMore(true);
    loadData(true);
    showAlert("Filter cleared", "info");
  };

  const handleCancelInput = () => {
    setQuery("");
    setSelectedFilterType(null);
    // Reset to original data like loadData does
    setRecords([]);
    setPage(0);
    setHasMore(true);
    loadData(true);
    // This will trigger loadData through the useEffect
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value && value.trim() !== "") {
      console.log("in");
      fetchFilteredData(value.trim().toLowerCase());
    } else {
      loadData(true); // Load original data if query is empty
    }
  };

  const filteredRecords = records;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: { xs: 2, md: 0 } }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
        mb={4}
      >
        {/* Search and Filter */}
        <Stack direction="row" spacing={1} flex={1} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            placeholder={selectedFilterType ? `Enter ${selectedFilterType} value...` : "Search records by name..."}
            value={query}
            onChange={handleQueryChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "grey.500" }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleCancelInput}
                    edge="end"
                    size="small"
                    sx={{ color: "grey.500" }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": { borderRadius: 1 },
            }}
          />
          <Button
            variant="contained"
            sx={{ minWidth: 48, height: 56, borderRadius: 1 }}
            onClick={handleOpenFilterMenu}
          >
            <FilterAltIcon />
          </Button>
        </Stack>

        {/* Show Selected Filter Type */}
        {selectedFilterType && (
          <Chip
            label={`Filter: ${selectedFilterType}`}
            onDelete={handleClearFilter}
            color="primary"
            sx={{ mt: { xs: 2, md: 0 }, ml: { md: 2 } }}
          />
        )}

        {/* Counters */}
        <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, md: 0 } }}>
          <Paper
            elevation={1}
            sx={{ minWidth: 120, px: 2, py: 1, borderRadius: 2, textAlign: "center" }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <TaskIcon color="action" />
              <Typography fontSize={15}>Tasks</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              --
            </Typography>
          </Paper>
        </Stack>
      </Stack>

      {/* Status Bar Section */}
      <Paper
        elevation={1}
        sx={{ width: "100%", mb: 5, py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 4 }, borderRadius: 3 }}
      >
        <StatusBar percentage={0} barMaxWidth={1200} />
      </Paper>

      {/* Cards Grid Section */}
      {records.length === 0 && loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} columns={{ xs: 12, sm: 12, md: 12 }}>
          {filteredRecords.length === 0 ? (
            <Grid size={12}>
              <Typography textAlign="center" sx={{ mt: 8, color: "grey.600" }}>
                No records found matching your criteria.
              </Typography>
            </Grid>
          ) : (
            filteredRecords.map((card) => (
              <Grid key={card.id} size="auto">
                <Box sx={{ flexShrink: 0 }}>
                  <MiddleManRecordsCard
                    cardData={card}
                    onRecordDeleted={handleRecordDeleted}
                    onAlert={showAlert}
                    onRecordEdit={handleRecordEdit}
                  />
                </Box>
              </Grid>
            ))
          )}
          <Box ref={scrollRef} sx={{ height: 20, width: '100%' }} />
        </Grid>
      )}

      {/* Show loading spinner at bottom when loading more pages */}
      {loading && records.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleCloseFilterMenu}
      >
        <MenuItem onClick={() => handleFilterSelect('role')}>By Role</MenuItem>
        <MenuItem onClick={() => handleFilterSelect('event')}>By Event</MenuItem>
        <MenuItem onClick={() => handleFilterSelect('skills')}>By Skill</MenuItem>
        <MenuItem onClick={() => handleFilterSelect('age')}>By Age</MenuItem>
        <MenuItem onClick={() => handleFilterSelect('category')}>By Category</MenuItem>
        <MenuItem onClick={() => handleFilterSelect('gender')}>By Gender</MenuItem>
        {selectedFilterType && (
          <>
            <Divider />
            <MenuItem onClick={handleClearFilter}>Clear Filter</MenuItem>
          </>
        )}
      </Menu>

      {/* Snackbar Alert */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={alertState.severity}
          onClose={handleAlertClose}
          variant="filled"
          elevation={6}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
