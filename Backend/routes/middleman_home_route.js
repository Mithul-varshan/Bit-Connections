const express=require("express");
const router=express.Router()
const {selectQuery, editRecords,addLogger,deleteRecord,getNames,filterQuery, getIdByEmail}=require('../controllers/middleman_home')
const verifyToken = require('../middleware/authMiddleware');
router.get('/processed_data',verifyToken,selectQuery);
router.put('/edit_data/:id',verifyToken,editRecords);
router.put('/update_logger/:id',verifyToken,addLogger);
router.delete('/delete_record/:id',verifyToken,deleteRecord);
router.get('/getNames/:id',verifyToken,getNames);
router.get('/filtered_data',verifyToken,filterQuery);
router.get('/id-by-email', verifyToken, getIdByEmail);
module.exports = router;