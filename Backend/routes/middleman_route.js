const express=require("express");
const router=express.Router()
const{addrecord,deleterecord}=require("../controllers/middleman_record")


router.post("/add",addrecord)
router.post("/delete",deleterecord)


module.exports = router;