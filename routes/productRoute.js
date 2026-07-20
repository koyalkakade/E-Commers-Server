const express = require("express");
const router = express.Router();
const {auth, vendor,admin} = require('../middleware/auth')
const {  createProduct,getAllProducts, updateProduct, deleteProduct, getProductById, getProductsByCategory, getAverageRating, addReview } = require("../controllers/productController");
const upload = require("../middleware/productMulter");

// router.post("/createProduct",auth,vendor,uploadImage.single('img'), createProduct);
router.post("/createProduct",auth,admin, upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "productImage", maxCount: 10 }
    ]),
    createProduct
);

router.get("/getAllProducts",auth,getAllProducts)
router.get("/getProductById/:id",auth, getProductById);
router.get("/getProductsByCategory/:categoryId",auth, getProductsByCategory);


router.put('/updateProduct/:id',auth,admin,upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "productImage", maxCount: 10 }
    ]), updateProduct)

router.delete("/deleteProduct/:id",auth,vendor,admin,deleteProduct)

router.get("/getAverageRating/:id",auth, getAverageRating);
router.post("/addReview/:productId",auth, addReview);

module.exports = router;