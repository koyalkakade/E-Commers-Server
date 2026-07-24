const express = require("express");
const router = express.Router();
const {auth, admin} = require('../middleware/auth')
const uploadImage = require('../middleware/brandMulter');
const { createBrand, updateBrand, deleteBrand,getAllBrand } = require("../controllers/brandController");

router.post("/createBrand",auth,admin,uploadImage.single('brandImage'), createBrand);
router.get("/getAllBrand",auth,getAllBrand)
router.put('/updateBrand/:ID',auth,admin,uploadImage.single('brandImage'), updateBrand)
router.delete("/deleteBrand/:ID",auth,admin,deleteBrand)

module.exports = router;