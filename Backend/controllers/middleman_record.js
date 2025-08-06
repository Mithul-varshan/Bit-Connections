const db = require("../src/config/db");
const addrecord = async (req, res) => {
  try {
    const query = `
  INSERT INTO processed_data (
    name, phone_number, event, role, dob,
    email, address_location, linkedin, company, category,
    user,gender, skills, age
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)
`;

    const value = [
      req.body.name,
      req.body.phone,
      req.body.event,
      req.body.role,
      req.body.dob || null,
      req.body.email || null,
      req.body.address,
      req.body.linkedin || null,
      req.body.company || null,
      req.body.category,
      req.body.user,
      req.body.gender,
      req.body.skill || null,
      req.body.age || null,
    ];
    const constraint=req.body.image;
    console.log(constraint,req.body.image);
    const result = await db.query(query, value);
    let verified;
    if(constraint){
    verified = await db.query(
      "UPDATE raw_photos SET verified='yes' WHERE id=?",
      [req.body.verifyId]
    );}
    else{
      verified = await db.query(
      "UPDATE raw_data SET verified='yes' WHERE id=?",
      [req.body.verifyId]
    );
    }
    console.log(verified);
    if (verified[0].affectedRows > 0) {
      // Fetch the updated row
      let fetchedRow;
      let fetchQuery;
      if(constraint){
        fetchQuery = "SELECT * FROM raw_photos WHERE id = ?";
        fetchedRow = await db.query(fetchQuery, [req.body.verifyId]);
      }
      else{
        fetchQuery = "SELECT * FROM raw_data WHERE id = ?";
        fetchedRow = await db.query(fetchQuery, [req.body.verifyId]);
      }

      // Send response with the affected row
      res.status(200).send({
        message: "Data added successfully",
        affectedRows: verified.affectedRows,
        updatedRow: fetchedRow[0],
      });
    } else {
      res.status(200).send({
        message: "Data added but no records were updated",
        affectedRows: 0,
        updatedRow: null,
      });
    }
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).send({ message: "Failed to add" });
  }
};
const deleterecord = async (req, res) => {
  try {
    const constraint = req.body.image;
    console.log(req.body.id, req.body.user)
    let verified;
    if (constraint) {
      verified = await db.query(
        "UPDATE raw_photos SET verified='yes' WHERE id=? AND user=?",
        [req.body.id, req.body.user]
      );
    } else {
      verified = await db.query(
        "UPDATE raw_data SET verified='yes' WHERE id=? AND user=?",
        [req.body.id, req.body.user]
      );
    }

    if (verified[0].affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Record deleted successfully",
        affectedRows: verified[0].affectedRows,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Record not found or already processed",
        affectedRows: 0,
      });
    }
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to delete record" 
    });
  }
};

module.exports = { addrecord, deleterecord };
