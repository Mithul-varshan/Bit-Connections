const express = require('express');
const app = express();
const cors = require('cors'); // Step 1: Keep this import
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

// You don't need to import the middleware here unless you apply it globally.
// const verifyToken = require('./middleware/authMiddleware'); 


const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173']; // Your frontend's URL

const corsOptions = {
  origin: (origin, callback) => {
    // This logic allows requests from your frontend and tools like Postman/Thunder Client (where origin is undefined)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
    
  },
  credentials: true,
  optionsSuccessStatus: 200, 
};



// --- Global Middleware Setup ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cors(corsOptions)); 

app.use('/added_photos', express.static('added_photos'));

app.use("/auth", require('./routes/authRoutes'));
app.use('/user', require('./routes/user_route'));
app.use('/middleman', require('./routes/middleman_route'));
app.use("/api", require('./routes/middleman_home_route'));


app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
