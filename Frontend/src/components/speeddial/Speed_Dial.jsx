import React, { useState, useCallback, useEffect, useRef } from "react";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PostAddSharpIcon from "@mui/icons-material/PostAddSharp";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import WorkIcon from "@mui/icons-material/Work";
import CameraIcon from "@mui/icons-material/Camera";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  Snackbar,
  Box,
  Backdrop,
  SpeedDial,
  Modal,
  Typography,
  Button,
  Paper,
  TextField,
  Alert,
} from "@mui/material";

import Webcam from "react-webcam";
import axios from "axios";
import api from "../../api/axios"

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500, md: 700 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 3,
  outline: "none",
};

const requiredFields = ["name", "phone", "event", "role"];

// Helper: validate required form fields
const hasEmptyRequiredFields = (data) =>
  requiredFields.some((field) => !data[field] || data[field].trim() === "");

const FormModalContent = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    event: "",
    role: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <Box sx={modalStyle}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Add New Contact
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[ // Input fields configuration
          {
            name: "name",
            label: "Full Name",
            icon: AccountCircle,
            required: true,
            inputProps: {},
          },
          {
            name: "phone",
            label: "Phone Number",
            icon: PhoneIcon,
            required: true,
            inputProps: {
              inputMode: "numeric",
              maxLength: 10,
              onInput: (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              },
            },
          },
          { name: "event", label: "Purpose of Visit", icon: AssignmentIndIcon, required: true },
          { name: "role", label: "Role", icon: WorkIcon, required: true },
        ].map(({ name, label, icon: Icon, required = false, inputProps }) => (
          <Box key={name} sx={{ display: "flex", alignItems: "flex-end" }}>
            <Icon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
            <TextField
              name={name}
              label={label}
              variant="standard"
              required={required}
              fullWidth
              value={formData[name]}
              onChange={handleChange}
              {...inputProps}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" endIcon={<DoneAllIcon />} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const track = stream.getVideoTracks()[0];
        console.log("Camera settings:", track.getSettings());
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        screenshotQuality={1}
        mirrored={true}
        videoConstraints={{
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          facingMode,
          frameRate: { ideal: 30 },
          aspectRatio: { ideal: 16 / 9 },
        }}
        style={{ width: "100%", maxWidth: "100%", height: "auto", objectFit: "contain" }}
      />
      <Box sx={{ pt: 7, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" startIcon={<CameraIcon />} onClick={capture}>
          Take Photo
        </Button>
        <Button variant="contained" startIcon={<CameraswitchIcon />} onClick={toggleCamera}>
          Switch Camera
        </Button>
      </Box>
    </Box>
  );
};

const PhotoModalContent = ({ onClose, onSubmit,userEmail }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = useCallback((image) => {
    setCapturedImage(image);
    setShowCamera(false);
  }, []);

  const dataUriToBlob = useCallback((dataUri) => {
    const byteString = atob(dataUri.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i += 1) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: "image/jpeg" });
  }, []);

  const handleUpload = useCallback(() => {
    if (!capturedImage) return;
    const formData = new FormData();
    formData.append("photo", dataUriToBlob(capturedImage));
    formData.append("user", userEmail);
    onSubmit(formData);
  }, [capturedImage, dataUriToBlob, onSubmit]);

  return (
    <Box sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Upload Photo
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {!showCamera && !capturedImage && (
        <Typography sx={{ mt: 4 }}>
          Here you can take a photo from your device.
        </Typography>
      )}

      <Box width="100%">
        {showCamera ? (
          <CameraCapture onCapture={handleCapture} />
        ) : (
          capturedImage && <img src={capturedImage} alt="Captured" style={{ marginTop: 16, width: "100%" }} />
        )}
      </Box>

      {!showCamera ? (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" startIcon={<CameraIcon />} onClick={() => setShowCamera(true)}>
            {capturedImage ? "Retake Photo" : "Take Photo"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!capturedImage}
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </Box>
      ) : (
        <Box />
      )}
    </Box>
  );
};

export default function FixedSpeedDialWithModals({ data, setData,userEmail }) {
  const [dialOpen, setDialOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, message: "", severity: "success" });
  const speedDialRef = useRef(null);

  // Alert helpers
  const showAlert = useCallback((message, severity = "success") => {
    setAlertState({ open: true, message, severity });
  }, []);

  const handleAlertClose = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  // SpeedDial toggle
  const handleDialToggle = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!isSubmitting && !formModalOpen && !photoModalOpen) setDialOpen((prev) => !prev);
    },
    [isSubmitting, formModalOpen, photoModalOpen]
  );

  // Open modals handlers
  const openFormModal = useCallback(
    (e) => {
      e?.stopPropagation();
      setDialOpen(false);
      setFormModalOpen(true);
    },
    []
  );

  const openPhotoModal = useCallback(
    (e) => {
      e?.stopPropagation();
      setDialOpen(false);
      setPhotoModalOpen(true);
    },
    []
  );

  // Close modals handlers
  const closeFormModal = useCallback(() => {
    setIsSubmitting(false);
    setFormModalOpen(false);
  }, []);

  const closePhotoModal = useCallback(() => {
    setIsSubmitting(false);
    setPhotoModalOpen(false);
  }, []);

  // Upload handler
  const upload = useCallback(
    async (form_data) => {
      try {
        const res = await api.post("/user/upload", form_data);
        if (
          res.data.message === "Duplicate photo detected for this Contact." ||
          res.data.message === "Data already exists for this phone number and event"
        ) {
          showAlert(res.data.message, "warning");
        } else {
          showAlert(res.data.message);
          setData((prev) => {
            if (res.data.path) {
              return {
                ...prev,
                images: [...prev.images, { image: res.data.path, user: userEmail }],
              };
            }
            const { name, phone_no, event_name, role, user } = res.data;
            return {
              ...prev,
              forms: [...prev.forms, { name, phone_no, event_name, role, user }],
            };
          });
        }
      } catch (err) {
        console.error("Upload failed", err);
        showAlert("Failed to upload data", "error");
      }
    },
    [setData, showAlert,userEmail]
  );

  // Form submit handler
  const handleFormSubmit = useCallback(
    (formData) => {
      setIsSubmitting(true);
      // Validation
      if (hasEmptyRequiredFields(formData)) {
        showAlert("Fill out all the Fields", "warning");
        setIsSubmitting(false);
        return;
      }
      if (formData.phone.length < 10 || formData.phone.length > 10) {
        showAlert("Invalid Mobile Number", "warning");
        setIsSubmitting(false);
        return;
      }
      setFormModalOpen(false);
      const contactData = new FormData();
      contactData.append("name", formData.name);
      contactData.append("role", formData.role);
      contactData.append("event", formData.event);
      contactData.append("phone", formData.phone);
      contactData.append("user",userEmail);
      upload(contactData);

      setTimeout(() => setIsSubmitting(false), 500);
    },
    [showAlert, upload,userEmail]
  );

  // Photo submit handler
  const handlePhotoSubmit = useCallback(
    (form_data) => {
      setIsSubmitting(true);
      setPhotoModalOpen(false);
      upload(form_data);
      setTimeout(() => setIsSubmitting(false), 500);
    },
    [upload]
  );

  // Close SpeedDial on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialOpen && speedDialRef.current && !speedDialRef.current.contains(event.target)) {
        setDialOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dialOpen]);

  const actions = React.useMemo(
    () => [
      { icon: <PostAddSharpIcon />, name: "Form", onClick: openFormModal },
      { icon: <AddAPhotoIcon />, name: "Photo", onClick: openPhotoModal },
    ],
    [openFormModal, openPhotoModal]
  );

  return (
    <Box sx={{ height: "100vh", position: "relative" }}>
      <Backdrop open={dialOpen} sx={{ zIndex: (t) => t.zIndex.drawer + 1, color: "#fff" }} />

      <SpeedDial
        ref={speedDialRef}
        ariaLabel="Action Menu"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: (t) => t.zIndex.drawer + 2,
          "& .MuiFab-primary": {
            backgroundColor: "#2f3542",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#1e2328",
              boxShadow: "0 8px 16px rgba(47, 53, 66, 0.4)",
            },
          },
        }}
        icon={<SpeedDialIcon />}
        onClose={(e) => e.stopPropagation()}
        open={dialOpen}
        direction="up"
        FabProps={{
          onClick: handleDialToggle,
          disabled: isSubmitting || formModalOpen || photoModalOpen,
        }}
      >
        {actions.map(({ icon, name, onClick }) => (
          <SpeedDialAction
            key={name}
            icon={icon}
            tooltipTitle={name}
            tooltipOpen
            onClick={onClick}
          />
        ))}
      </SpeedDial>

      {/* Form Modal */}
      <Modal open={formModalOpen} onClose={closeFormModal} aria-labelledby="form-modal-title">
        <Paper sx={modalStyle} elevation={24}>
          <FormModalContent onClose={closeFormModal} onSubmit={handleFormSubmit} />
        </Paper>
      </Modal>

      {/* Photo Modal */}
      <Modal open={photoModalOpen} onClose={closePhotoModal} aria-labelledby="photo-modal-title">
        <Paper sx={modalStyle} elevation={24}>
          <PhotoModalContent onClose={closePhotoModal} onSubmit={handlePhotoSubmit} userEmail={userEmail} />
        </Paper>
      </Modal>

      {/* Snackbar Alert */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
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
