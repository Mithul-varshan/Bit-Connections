import React, { useState, useCallback } from "react";
import {
  Paper, Box, Typography, Avatar, Stack, Tooltip, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Divider, Chip, Grid, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText,DialogContentText
} from "@mui/material";
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  ArrowOutward as ArrowOutwardIcon,
  ArrowBackIos as ArrowBackIosIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import { events, roles, category, gender } from "../dropDownFields/DropDownConstants";
import api from "../../api/axios";

/* Delete-confirm modal styling */
const deleteStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 340,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3
};

/* ───────────────── helpers ──────────────────────────────────────── */
const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

const isValidId = (id) =>
  id !== null &&
  id !== undefined &&
  id !== "" &&
  (typeof id === "number" ? !Number.isNaN(id) : id.trim() !== "");

const toTitle = (s = "") =>
  s
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const MiddleManRecordsCard = ({ cardData, onRecordDeleted, onRecordEdit, onAlert }) => {
  /* state */
  const [openHierarchy, setOpenHierarchy] = useState(false);
  const [openShow, setOpenShow] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openLog, setOpenLog] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  const [editData, setEditData] = useState(cardData);
  const [logger, setLogger] = useState({ log: cardData.logger || "" });

  const [hierarchy, setHierarchy] = useState(null);
  const [trail, setTrail] = useState([]);      // breadcrumbs (processed_data id)
  const [loading, setLoading] = useState(false);

  /* ─────────────── hierarchy helpers ───────────────────────────── */
  const fetchHierarchy = useCallback(async (id) => {
    if (!isValidId(id)) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/getNames/${id}`);
      setHierarchy(data);
    } catch {
      onAlert && onAlert("Could not load hierarchy data", "error");
      setHierarchy(null);
    } finally {
      setLoading(false);
    }
  }, [onAlert]);

  const fetchIdByEmail = useCallback(async (email) => {
    if (!email) return null;
    try {
      const { data } = await api.get("/api/id-by-email", { params: { email } });
      return data?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  /* navigation */
  const openHierarchyDlg = () => {
    if (!isValidId(cardData.id)) return;
    setTrail([cardData.id]);
    setOpenHierarchy(true);
    fetchHierarchy(cardData.id);
  };
  const dive = (id) => { setTrail((t) => [...t, id]); fetchHierarchy(id); };
  const goUp = () =>
    setTrail((t) => {
      if (t.length <= 1) return t;
      const next = t.slice(0, -1);
      fetchHierarchy(next[next.length - 1]);
      return next;
    });
  const handleBossClick = async () => {
    const bossEmail = hierarchy?.result?.[0]?.user;
    if (!bossEmail) return;
    const bossId = await fetchIdByEmail(bossEmail);
    if (!bossId) {
      onAlert && onAlert("No record found for that person", "warning");
      return;
    }
    dive(bossId);
  };

  /* ─────────────── CRUD handlers ──────────────────────────────── */
  const saveLog = async () => {
    try {
      const { status } = await api.put(`/api/update_logger/${cardData.id}`, { logger });
      if (status === 200) {
        onRecordEdit && onRecordEdit(cardData.id, logger);
        onAlert && onAlert("Logger updated", "success");
        setOpenLog(false);
      } else onAlert && onAlert("Update failed", "error");
    } catch (e) {
      onAlert && onAlert(e.message, "error");
    }
  };

  const saveEdit = async () => {
    try {
      const { status, data } = await api.put(`/api/edit_data/${cardData.id}`, editData);
      if (status === 200) {
        onRecordEdit && onRecordEdit(cardData.id, data.record);
        onAlert && onAlert("Record updated", "success");
        setOpenEdit(false);
      } else onAlert && onAlert("Update failed", "error");
    } catch (e) {
      onAlert && onAlert(e.message, "error");
    }
  };

  const doDelete = async () => {
    try {
      const { status } = await api.delete(`/api/delete_record/${cardData.id}`);
      if (status === 200) onRecordDeleted && onRecordDeleted(cardData.id, "Record deleted");
      else onRecordDeleted && onRecordDeleted(null, "Delete failed");
    } catch (e) {
      onRecordDeleted && onRecordDeleted(null, e.message);
    } finally {
      setAskDelete(false);
    }
  };

 
  return (
    <>
      <Paper
        elevation={2}
        sx={{
          width: 330, height: 330, p: 2.5, borderRadius: 4,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          transition: "box-shadow .3s, transform .2s",
          "&:hover": { transform: "translateY(-4px)", boxShadow: 8 }
        }}
      >
        {/* header */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={`https://randomuser.me/api/portraits/men/${cardData.id % 100}.jpg`}
              sx={{ width: 56, height: 56 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Tooltip title={cardData.name || "No Name"}>
                <Typography variant="h6" fontWeight="bold" sx={ellipsis}>
                  {cardData.name || "No Name"}
                </Typography>
              </Tooltip>
              <Tooltip title={cardData.role || "No Role"}>
                <Typography variant="body2" color="text.secondary" sx={ellipsis}>
                  {cardData.role || "No Role"}
                </Typography>
              </Tooltip>
            </Box>
            <Stack spacing={0.5}>
              <Tooltip title="Log"><IconButton size="small" onClick={() => setOpenLog(true)}>
                <EventNoteIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Hierarchy"><IconButton size="small" onClick={openHierarchyDlg}>
                <PersonAddAlt1Icon fontSize="small" /></IconButton></Tooltip>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* quick facts */}
          <Stack spacing={1}>
            {[{ ic: PhoneIcon, v: cardData.phone_number },
            { ic: EventIcon, v: cardData.event },
            { ic: BusinessIcon, v: cardData.company }].map(({ ic: I, v }) => (
              <Stack key={I.name} direction="row" spacing={1} alignItems="center">
                <I sx={{ fontSize: 18, color: "action.active" }} />
                <Typography variant="body2" color="text.secondary" sx={ellipsis}>
                  {v || "N/A"}
                </Typography>
              </Stack>
            ))}
            <Typography variant="subtitle2" mt={1}>Skills</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: .5 }}>
              {(cardData.skills ? cardData.skills.split(",") : ["N/A"]).map((s) =>
                <Chip key={s} label={s.trim()} size="small" />)}
            </Box>
          </Stack>
        </Box>

        {/* actions */}
        <Stack direction="row" spacing={1} mt={2}>
          <Button fullWidth size="small" variant="outlined" onClick={() => setOpenShow(true)}>
            Details
          </Button>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => setOpenEdit(true)}>
            <EditIcon fontSize="inherit" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setAskDelete(true)}>
            <DeleteIcon fontSize="inherit" /></IconButton></Tooltip>
        </Stack>
      </Paper>

      {/* ─── full-details dialog ──────────────────────────────── */}
      <Dialog open={openShow} onClose={() => setOpenShow(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Full Details
          <IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={() => setOpenShow(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          {Object.entries(cardData)
            .filter(([k]) => !["verified", "logger", "id"].includes(k))
            .map(([k, v]) => {
              const value =
                ["created_at", "updated_at"].includes(k) && v
                  ? new Date(v).toLocaleDateString()
                  : v || "—";
              return (
                <Box key={k} sx={{ display: "flex", mb: 2 }}>
                  <Typography sx={{ fontWeight: "bold", minWidth: 120 }}>{k.replace(/_/g, " ")}:</Typography>
                  <Typography sx={{ ml: 1 }}>{value}</Typography>
                </Box>
              );
            })}
        </DialogContent>
      </Dialog>

      {/* ─── edit dialog ─────────────────────────────────────── */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Update Record
          <IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={() => setOpenEdit(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh" }}>
          <Grid container spacing={3}>
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "LinkedIn", name: "linkedin", type: "text" },
              {
                label: "Date of Birth", name: "dob", type: "date",
                value: editData.dob ? editData.dob.split("T")[0] : "",
                InputLabelProps: { shrink: true }
              },
              { label: "Company", name: "company", type: "text" },
              { label: "Address", name: "address_location", type: "text" },
              { label: "Phone", name: "phone_number", type: "text" },
              { label: "Age", name: "age", type: "number" },
              { label: "Skills", name: "skills", type: "text" }
            ].map(({ label, name, type, ...rest }) => (
              <Grid xs={12} sm={6} md={4} key={name}>
                <TextField
                  {...rest}
                  fullWidth
                  label={label}
                  name={name}
                  type={type}
                  value={editData[name] || ""}
                  onChange={(e) => setEditData({ ...editData, [name]: e.target.value })}
                />
              </Grid>
            ))}

            {[{ label: "Gender", name: "gender", data: gender },
            { label: "Event", name: "event", data: events },
            { label: "Role", name: "role", data: roles },
            { label: "Category", name: "category", data: category }
            ].map(({ label, name, data }) => (
              <Grid xs={12} sm={6} md={4} key={name}>
                <FormControl fullWidth>
                  <InputLabel>{label}</InputLabel>
                  <Select
                    label={label}
                    name={name}
                    value={editData[name] || ""}
                    onChange={(e) => setEditData({ ...editData, [name]: e.target.value })}
                  >
                    {data.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* ─── activity-log dialog ─────────────────────────────── */}
      <Dialog open={openLog} onClose={() => setOpenLog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Activity Log
          <IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={() => setOpenLog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth multiline rows={8}
            value={logger.log}
            onChange={(e) => setLogger({ log: e.target.value })}
            placeholder="Enter your log here…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLog(false)}>Cancel</Button>
          <Button onClick={saveLog} variant="contained">Save Log</Button>
        </DialogActions>
      </Dialog>

      {/* ─── hierarchy dialog ────────────────────────────────── */}
      <Dialog open={openHierarchy} onClose={() => setOpenHierarchy(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { display: "flex", flexDirection: "column", maxHeight: "80vh" } }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              {trail.length > 1 && (
                <IconButton size="small" onClick={goUp}>
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
              )}
              <Typography variant="h6">User Hierarchy</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOpenHierarchy(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ flex: 1 }}>
          {loading ? (
            <Typography align="center" sx={{ py: 4 }}>Loading…</Typography>
          ) : hierarchy ? (
            <>
              {/* current user */}
              {hierarchy.currentUser && (
                <Box mb={3} p={2} bgcolor="grey.50" borderRadius={2}>
                  <Typography fontWeight={700}>{toTitle(hierarchy.currentUser.name)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hierarchy.currentUser.email} • {hierarchy.currentUser.role}
                  </Typography>
                </Box>
              )}

              {/* boss */}
              <Box mb={3}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <SupervisorAccountIcon color="primary" />
                  <Typography variant="h6" color="primary">Reports To</Typography>
                </Stack>
                {hierarchy.result?.[0]?.user ? (
                  <Box
                    p={2} bgcolor="primary.50" borderRadius={2}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.100" } }}
                    onClick={handleBossClick}
                  >
                    <Typography>{toTitle(hierarchy.result[0].user)}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Top-level user
                  </Typography>
                )}
              </Box>

              {/* direct reports */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <GroupIcon color="secondary" />
                  <Typography variant="h6" color="secondary">Direct Reports</Typography>
                </Stack>
                {hierarchy.addedbyuser?.length ? (
                  <List>
                    {hierarchy.addedbyuser.map((u) => (
                      <ListItem
                        key={u.id}
                        sx={{
                          mb: 1, bgcolor: "secondary.50", borderRadius: 1,
                          cursor: "pointer", "&:hover": { bgcolor: "secondary.100" }
                        }}
                        onClick={() => dive(u.id)}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={500}>{toTitle(u.name)}</Typography>
                              <ArrowOutwardIcon fontSize="small" color="secondary" />
                            </Stack>
                          }
                          secondary={`${u.email} • ${u.role}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No direct reports
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography align="center" sx={{ py: 4 }}>No hierarchy data</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── delete-confirm dialog ─────────────────────────────── */}
      <Dialog open={askDelete} onClose={() => setAskDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskDelete(false)}>Cancel</Button>
          <Button onClick={doDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MiddleManRecordsCard;