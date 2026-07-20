const express = require("express");
const router = express.Router();
const {auth, admin} = require('../middleware/auth')
const uploadImage = require('../middleware/categoryMulter');
const { createCategory,getAllCategory, updateCategory, 
    deleteCategory, 
    getCategoryById} = require("../controllers/categoryController");

router.post("/createCategory",auth,admin,uploadImage.single('categoryImage'), createCategory);
router.get("/getAllCategory",auth,admin,getAllCategory)
router.get("/getCategoryById/:id", getCategoryById);
router.put('/updateCategory/:ID',auth,admin,uploadImage.single('categoryImage'), updateCategory)
router.delete("/deleteCategory/:ID",auth,admin,deleteCategory)

module.exports = router;