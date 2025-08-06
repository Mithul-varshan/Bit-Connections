import React, { useState, useCallback } from "react";
import {
  Paper, TextField, Typography, Snackbar, Alert, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Stack, Modal, Box, Button, IconButton
} from "@mui/material";
import {
  Delete as DeleteIcon, Edit as EditIcon, EventNote as EventNoteIcon,
  Add as AddIcon, Close as CloseIcon, DoneAll as DoneAllIcon, 
  AccountCircle, Phone as PhoneIcon, AssignmentInd as AssignmentIndIcon, Work as WorkIcon,
  GroupAdd as GroupAddIcon, LinkedIn as LinkedInIcon, Link as LinkIcon, Cake as CakeIcon,
  Business as BusinessIcon, Category as CategoryIcon, MailOutlineTwoTone as MailOutlineTwoToneIcon,
  HailTwoTone as HailTwoToneIcon, WcTwoTone as WcTwoToneIcon, HomeTwoTone as HomeTwoToneIcon,
  ElderlyTwoTone as ElderlyTwoToneIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import profile from "../../assets/Profile.png";
import axios from "axios";
import api from "../../api/axios";
// --- STYLES ---
const modalContainerStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 800, md: 900 },
  display: "flex",
  outline: "none",
};
const modalStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500, md: 600 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
  outline: "none",
};

const REQUIRED_FIELDS = ["name", "phone", "event", "role", "address", "category", "gender"];

const allFields = [
  { name: "name", label: "Full Name*", icon: AccountCircle, options: {} },
  {
    name: "phone", label: "Phone Number*", icon: PhoneIcon, options: {
      inputProps: { inputMode: "numeric", maxLength: 10 },
      onInput: (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); },
    }
  },
  { name: "event", label: "Purpose of Visit*", icon: AssignmentIndIcon, options: {} },
  { name: "role", label: "Role*", icon: WorkIcon, options: {} },
  { name: "linkedin", label: "LinkedIn", icon: LinkedInIcon, options: {} },
  { name: "gender", label: "Gender*", icon: WcTwoToneIcon, options: {} },
  { name: "dob", label: "Date of Birth", icon: CakeIcon, options: {} },
  { name: "age", label: "Age", icon: ElderlyTwoToneIcon, options: {} },
  { name: "address", label: "Address*", icon: HomeTwoToneIcon, options: {} },
  { name: "company", label: "Company", icon: BusinessIcon, options: {} },
  { name: "category", label: "Category*", icon: CategoryIcon, options: {} },
  { name: "email", label: "Email", icon: MailOutlineTwoToneIcon, options: {} },
  { name: "skill", label: "Skills", icon: HailTwoToneIcon, options: {} },
];

const fieldsPerPage = 5;
const totalPages = Math.ceil(allFields.length / fieldsPerPage);

const getPaginatedFields = (page) => {
  const start = (page - 1) * fieldsPerPage;
  return allFields.slice(start, start + fieldsPerPage);
};

function FormModalContent({ onClose, onSubmit, ...initVals }) {
  const [formData, setFormData] = useState({
    name: initVals.name || "",
    phone: initVals.phone || "",
    event: initVals.event || "",
    role: initVals.role || "",
    linkedin: "",
    gender: "",
    dob: "",
    age: "",
    address: "",
    company: "",
    category: "",
    email: "",
    skill: "",
    user: initVals.user,
    verifyId: initVals.verify,
    image: initVals.image,
  });
  const [page, setPage] = useState(1);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNext = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), []);
  const handlePrev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);

  return (
    <Box sx={{
      position: "absolute",
      display: initVals.image ? "flex" : "block",
      top: "50%", left: "50%",
      bgcolor: "background.paper",
      boxShadow: 24,
      borderRadius: 2,
      p: 3,
      width: initVals.image
        ? { xs: "95%", sm: 1050, md: 1250 }
        : { xs: "90%", sm: 500, md: 600 },
      minHeight:"74vh",
      maxHeight: "90vh",
      overflowY: "auto",
      transform: "translate(-50%, -50%)",
    }}>
      {initVals.image &&
        <Box sx={{
          width: { xs: "40%", sm: 800 },
          mr: 2, display: "flex"
        }}>
          <img
            key={initVals.verify}
            src={`http://localhost:8000/${initVals.path.replace(/\\/g, "/")}`}
            alt={`User ${initVals.verify}`}
            style={{ height: "auto", width: "100%", borderRadius: 4, objectFit: "fill" }}
          />
        </Box>
      }
      <Box sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">Add New Contact</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {getPaginatedFields(page).map((field) => (
            <Box key={field.name} sx={{ display: "flex", alignItems: "flex-end" }}>
              <field.icon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
              <TextField
                name={field.name}
                label={field.label}
                variant="standard"
                fullWidth
                value={formData[field.name]}
                onChange={handleChange}
                {...field.options}
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Typography variant="body2">
            Page {page} of {totalPages}
          </Typography>
        </Box>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={handlePrev} disabled={page === 1} startIcon={<ArrowBackIcon />}>Previous</Button>
          {page === totalPages ? (
            <Button
              variant="contained"
              color="primary"
              endIcon={<DoneAllIcon />}
              onClick={() => onSubmit(formData)}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const MiddlemanCard = ({
  id, name, event, phone, role, user, image, path,
  setData, onAlert
}) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpen = useCallback((e) => {
    if (e) e.stopPropagation();
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleFormModalClose = handleClose;

  const handleDeleteClick = useCallback((e) => {
    if (e) e.stopPropagation();
    setDeleteDialogOpen(true);
  }, []);
  const handleDeleteDialogClose = useCallback(() => setDeleteDialogOpen(false), []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await api.post("/middleman/delete", { id, user, image }, {
        headers: { "Content-Type": "application/json" },
      });
      if (setData) {
        setData((prevData) =>
          image
            ? { ...prevData, images: prevData.images.filter((item) => item.id !== id) }
            : { ...prevData, forms: prevData.forms.filter((item) => item.id !== id) }
        );
      }
      if (onAlert) onAlert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      if (onAlert) onAlert("Failed to delete record", "error");
    } finally {
      setDeleteDialogOpen(false);
    }
  }, [id, user, image, setData, onAlert]);

  const handleFormSubmit = useCallback(async (formData) => {
    try {
      const requiredFieldsMissing = REQUIRED_FIELDS.some((field) => !formData[field]);
      if (requiredFieldsMissing) {
        onAlert && onAlert("Fill out the * Details", "warning");
        return;
      }
      const res = await api.post("/middleman/add", formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.success !== false && setData) {
        setData((prevData) =>
          image
            ? { ...prevData, images: prevData.images.filter((item) => item.id !== id) }
            : { ...prevData, forms: prevData.forms.filter((item) => item.id !== id) }
        );
      }
      onAlert && onAlert(res.data.message);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      onAlert && onAlert("An error occurred", "error");
    }
  }, [id, setData, image, onAlert]);

  // --- RENDER ---
  return (
    <>
      <div
        style={{ padding: image ? 0 : "1.5rem" }}
        className="relative w-full max-w-xl bg-white rounded-lg shadow mx-auto flex gap-6"
      >
        {/* Action Buttons */}
        <div className="absolute top-0 left-0.5 right-0.5 flex justify-between ">
          <Button
            aria-label="delete"
            color="error"
            sx={{
              minWidth: "auto", width: 32, height: 32,
              borderTopLeftRadius: 8, padding: 0, minHeight: "auto",
            }}
            onClick={handleDeleteClick}
          >
            <DeleteIcon color={image ? "#990000" : "#FFCCCC"} fontSize="medium" />
          </Button>
          <Button
            aria-label="add"
            size="medium"
            color="primary"
            sx={{
              minWidth: "auto", width: 32, height: 32,
              borderTopRightRadius: 8, padding: 0, minHeight: "auto",
            }}
            onClick={handleOpen}
          >
            <GroupAddIcon color={image ? "#0066FF" : "inherit"} fontSize="medium" />
          </Button>
        </div>

        {/* Card Content */}
        {image ?
          <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
            <img
              key={id}
              src={`http://localhost:8000/${path.replace(/\\/g, "/")}`}
              alt={`User ${id}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 7 }}
            />
          </Box> : (
            <>
              <Box sx={{ width: 120, height: 120, overflow: "hidden", borderRadius: "8px", mt: 2 }}>
                <img src={profile} alt="Profile"
                  className="w-full h-full object-cover"
                  style={{ objectFit: "cover", transform: "scale(1.75)", paddingBottom: 7 }}
                />
              </Box>
              <div className="flex flex-col justify-center space-y-2">
                <p><span className="font-semibold">Name:</span> {name}</p>
                <p><span className="font-semibold">Event Name:</span> {event}</p>
                <p><span className="font-semibold">Phone:</span> +91 {phone}</p>
                <p><span className="font-semibold">Role:</span> {role}</p>
              </div>
            </>
          )}
      </div>

      {/* Form Modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="photo-modal-title">
        <FormModalContent
          onClose={handleFormModalClose}
          onSubmit={handleFormSubmit}
          name={name}
          event={event}
          phone={phone}
          role={role}
          user={user}
          verify={id}
          image={image}
          path={path}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MiddlemanCard;
