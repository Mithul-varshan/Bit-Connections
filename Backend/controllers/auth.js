const db = require("../src/config/db");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // We are back to checking the password.
    const sql = "SELECT id, email, role, password FROM login WHERE TRIM(email) = TRIM(?)";
    const [result] = await db.execute(sql, [email]);

    // Check if user email exists
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = result[0];

    // Check if the password matches
    if (user.password.trim() !== password.trim()) {
        return res.status(401).json({ message: "Invalid credentials" });
        
    }

    // If both are correct, create the payload for the token
    const payload = { id: user.id, email: user.email, role: user.role };

    // Sign the token and send it back with the user info
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });

    // We only send back non-sensitive user info
    const userResponse = { id: user.id, email: user.email, role: user.role };
    
    return res.status(200).json({ token, user: userResponse });

  } catch (err) {
    console.error("Server error in login controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
  
};

module.exports = { login };