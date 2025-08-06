const db = require("../src/config/db");

// SELECT
const selectQuery = async (req, res) => {
  try {
    const {limit=20,page=0,category}=req.query;
    const intLimit=parseInt(limit,10)||20;
    const intPage=parseInt(page,10)||0;
    const offset=intLimit*intPage;
    console.log(category);
    const [results] = await db.query("SELECT * FROM processed_data WHERE LOWER(TRIM(category)) = LOWER(TRIM(?)) LIMIT ? OFFSET ? ",[category,intLimit,offset]);
    //console.log(results);
    return res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Issue" });
  }
};
//filter
const filterQuery = async (req, res) => {
  const { filterType, filterValue } = req.query;
  try {
    if (filterType === 'null' || !filterType) {
      // No specific filter - do a general search
      if (!filterValue) {
        return res.status(400).json({ message: "Search value is required" });
      }
      
      const searchTerm = `%${filterValue.toLowerCase().replace(/\s+/g, '')}%`;
      const query = `SELECT * FROM processed_data 
                     WHERE REPLACE(LOWER(TRIM(name)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(email)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(company)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(skills)),' ','') LIKE ? 
                     OR REPLACE(LOWER(TRIM(address_location)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(phone_number)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(event)),' ','') LIKE ? 
                     OR REPLACE(LOWER(TRIM(role)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(category)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(gender)),' ','') LIKE ? OR REPLACE(LOWER(TRIM(age)),' ','') LIKE ?`;
      
      const [result] = await db.query(query, [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, 
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      ]);
      
      return res.status(200).json({ results: result });
    } else {
      // Specific filter is applied - validate filterType first
      const allowedFilters = ['role', 'event', 'skills', 'age', 'category', 'gender', 'name', 'company'];
      
      if (!allowedFilters.includes(filterType)) {
        return res.status(400).json({ message: "Invalid filter type" });
      }
      
      if (!filterValue) {
        return res.status(400).json({ message: "Filter value is required" });
      }
      
      const query = `SELECT * FROM processed_data WHERE REPLACE(LOWER(TRIM(${filterType})),' ','') LIKE ?`;
      const searchTerm = `%${filterValue.toLowerCase().replace(/\s+/g, '')}%`;
      
      const [result] = await db.query(query, [searchTerm]);
      
      return res.status(200).json({ results: result });
    }
    
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: "Error has occurred" });
  }
};

// UPDATE
const editRecords = async (req, res) => {
  const { id } = req.params;
  const {
    name, email, linkedin, dob, company,
    address_location, phone_number, event, role,
    category, gender, age,skills
  } = req.body;
  const query = `
    UPDATE processed_data
    SET name=?, email=?, linkedin=?, dob=?, company=?, address_location=?,
        phone_number=?, event=?, role=?, category=?, age=?, gender=?,skills= ?
    WHERE id=?
  `;
  const values = [
    name, email, linkedin, dob, company, address_location,
    phone_number, event, role, category, age, gender,skills, id,
  ];
  try {
    const [result] = await db.query(query, values);
    const [row] = await db.query('SELECT * FROM processed_data WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "record not found" });
    }
    return res.status(200).json({record:row, message: "update successfully" });
  } catch (err) {
    console.error("update error:", err);
    return res.status(500).json({ message: "database update failed" });
  }
};

// ADD LOGGER
const addLogger = async (req, res) => {
  const { id } = req.params;
  const { log } = req.body.logger;
  const query = "UPDATE processed_data SET logger = ? WHERE id = ?";
  try {
    const [result] = await db.query(query, [log, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "record not found" });
    }
    return res.status(200).json({ message: "Update successfully" });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ message: "database update failed" });
  }
};

// DELETE
const deleteRecord = async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM processed_data WHERE id = ?";
  try {
    const [result] = await db.query(query, [id]); // id should be an array
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "record not found" });
    }
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "database Delete failed" });
  }
};
const getNames = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    // Get the user's info and who added them
    const userQuery = `
      SELECT 
        p.id,
        p.name,
        p.email,                      -- User's own email
        p.role,
        p.user as added_by_email,     -- Email of person who added this user (boss)
        l_self.id as login_id,        -- User's login table ID
        l_self.role as login_role,    -- User's login role
        l_parent.id as added_by_login_id,   -- Boss's login table ID
        l_parent.role as added_by_login_role -- Boss's login role
      FROM processed_data p
      LEFT JOIN login l_self ON l_self.email = p.email      -- Link to user's own login
      LEFT JOIN login l_parent ON l_parent.email = p.user   -- Link to boss's login
      WHERE p.id = ?
    `;

    const [userResult] = await db.query(userQuery, [id]);

    if (userResult.length === 0) {
      return res.status(200).json({ 
        result: [{ user: null }],
        addedbyuser: null,
        useraddbyid: null
      });
    }

    const userData = userResult[0];

    // Get people added by this user (their direct reports/team)
    const teamQuery = `
      SELECT p.id, p.name, p.email, p.role
      FROM processed_data p
      WHERE p.user = ?
    `;

    const [teamResult] = await db.query(teamQuery, [userData.email]);

    return res.status(200).json({ 
      result: [{ 
        user: userData.added_by_email    // Who added this user (their boss)
      }],
      addedbyuser: teamResult.length > 0 ? teamResult : null,  // Their direct reports
      useraddbyid: userData.added_by_login_id ? [{ id: userData.added_by_login_id }] : null,  // Boss's login ID
      currentUser: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        login_id: userData.login_id,
        added_by: userData.added_by_email
      }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ message: "Database query failed" });
  }
};
 const getIdByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ id: null });

    const [rows] = await db.query(
      "SELECT id FROM processed_data WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    return res.json({ id: rows.length ? rows[0].id : null });
  } catch (e) {
    console.error("getIdByEmail:", e);
    return res.status(500).json({ id: null });
  }
};

module.exports = { selectQuery, editRecords, addLogger, deleteRecord, getNames,filterQuery,getIdByEmail };