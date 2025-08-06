import React, { useEffect, useState } from "react";
import { Box, Modal, Typography, ButtonGroup, Button } from "@mui/material";
import SpeedDialTooltipOpen from "../../components/speeddial/Speed_Dial";
import axios from "axios";
import Nodatafound from "../../assets/animations/Nodatafound.json";
import Lottie from "lottie-react";
import Cards from "../../components/usercard/User_card";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
function Home_user() {
  const user=useAuthStore((state)=>state.user);
  const [data, setData] = useState([]);
  const [toggle, setToggle] = useState(true);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    if(!user || !user.email) return;
    try {
      const response = await api.post("/user/getdata", {
        user: user.email,
      });
      setData(response.data);
      console.log(response.data);
    } catch {
      console.log("error");
    }
  };
  return (
    <Box sx={{ minHeight: "80vh", width: "100%" }}>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: (theme) => theme.zIndex.tooltip,
        }}
      >
        <SpeedDialTooltipOpen data={data} setData={setData} userEmail={user?.email} />
      </Box>
      <Box>
        <Typography sx={{
          fontSize: 32,
          fontWeight:600,
          overflow: 'hidden',
          borderRight: '3px solid',
          whiteSpace: 'nowrap',
          '@keyframes typing': {
            from: { width: 0 },
            to: { width: '28.5%' }
          },
          '@keyframes blink': {
            '50%': { borderColor: 'transparent' }
          },
          animation: 'typing 2s steps(40) 1s forwards, blink 2s infinite'
        }}>
          Contacts you have added
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
          data.forms &&
            data.forms.length > 0 &&
            data.forms.some((img) => img.user === user.email) ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {data.forms
                .filter((form) => form.user ===user.email)
                .map((value, index) => (
                  <Cards
                    key={index}
                    name={value.name}
                    phone={value.phone_no}
                    event={value.event_name}
                    role={value.role}
                  />
                ))}
            </Box>
          ) : (
            <Box textAlign="center" mt={4}>
              <Lottie animationData={Nodatafound} loop={false} style={{ height: 400 }} />
              <Typography variant="h5">No records added!</Typography>
            </Box>
          )
        ) : data.images &&
          data.images.length > 0 &&
          data.images.some((img) => img.user === user.email) ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
            }}
          >
            {data.images
              .filter((image) => image.user ===user.email)
              .map((value, index) => (
                <img
                  key={value.id}
                  src={`http://localhost:8000/${value.image.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt={`User ${value.id}`}
                  style={{ width: "450px", borderRadius: 7 }}
                />
              ))}
          </Box>
        ) : (
          <Box textAlign="center" mt={4}>
            <Lottie animationData={Nodatafound} loop={false} style={{ height: 400 }} />
            <Typography variant="h5">No records added!</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Home_user;
