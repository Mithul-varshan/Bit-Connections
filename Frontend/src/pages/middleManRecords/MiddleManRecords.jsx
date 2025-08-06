import { Box, ButtonGroup, Button, Typography, TextField,Snackbar,Alert, } from '@mui/material'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import Nodatafound from "../../assets/animations/Nodatafound.json";
import Lottie from "lottie-react";
import MiddlemanCard from '../../components/middlemancard/MiddlemanCard';
import ContactPageIcon from "@mui/icons-material/ContactPage";
import ImageIcon from "@mui/icons-material/Image";
import api from '../../api/axios';
function MiddleManRecords() {
  const [data, setData] = useState([]);
  const [toggle, setToggle] = useState(true);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const showAlert = (message, severity = "success") => {
    console.log('Parent showAlert called:', message, severity);
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  const getData = async () => {
    try {
      const response = await api.post("/user/getdata", {
      });
      setData(response.data);
      console.log(response.data);
    } catch {
      console.log("error");
    }
  };
   useEffect(() => {
    getData();
  }, []);
  return (
    <Box sx={{ width: "100%"}}>
      <Box>
        <Typography sx={{ fontWeight: 600 }} variant="h4">
          Contacts to be verified
        </Typography>
      </Box>
      <ButtonGroup
        sx={{ mt: 3 }}
        variant="outlined"
        aria-label="Loading button group"
      >
        <Button
          variant={toggle ? "contained" : "outlined"}
          onClick={() => setToggle(!toggle)}
          startIcon={<ContactPageIcon fontSize="large" />}
        >
          Documents
        </Button>
        <Button
          variant={!toggle ? "contained" : "outlined"}
          onClick={() => setToggle(!toggle)}
          startIcon={<ImageIcon />}
        >
          Visiting Cards
        </Button>
      </ButtonGroup>
      <Box sx={{ mt: 3, pb: 3 }}>
        {toggle ? (
          data.forms && data.forms.filter(value => value.verified !== 'yes').length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {data.forms
                .filter(value => value.verified !== 'yes')
                .map((value, index) => (
                  <MiddlemanCard
                    key={index}
                    name={value.name}
                    phone={value.phone_no}
                    event={value.event_name}
                    role={value.role}
                    id={value.id}
                    user={value.user}
                    setData={setData}
                    image={false}
                    onAlert={showAlert}
                  />
                ))}
            </Box>
          ) : (
            <Box textAlign="center" mt={4}>
              <Lottie animationData={Nodatafound} loop={false} style={{ height: 400 }} />
              <Typography variant="h5">No unverified records found!</Typography>
            </Box>
          )
        ) : data.images && data.images.filter(value => value.verified !== 'yes').length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
            }}
          >
            {data.images
              .filter(value => value.verified !== 'yes')
              .map((value, index) => (
                <MiddlemanCard
                  user={value.user}
                  key={index}
                  image={true}
                  path={value.image}
                  setData={setData}
                  id={value.id}
                  onAlert={showAlert}
                />
              ))}
          </Box>
        ) : (
          <Box textAlign="center" mt={4}>
            <Lottie animationData={Nodatafound} loop={false} style={{ height: 400 }} />
            <Typography variant="h5">No unverified records found!</Typography>
          </Box>
        )}
      </Box>
      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={alertSeverity}
          onClose={handleAlertClose}
          variant="filled"
          elevation={6}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MiddleManRecords;