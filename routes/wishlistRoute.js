const express = require("express");
const { addToWishlist, removeFromWishlist, getWishlist } = require("../controllers/wishlistController");
const { auth } = require("../middleware/auth");
const router = express.Router();


router.post("/add", auth, addToWishlist);

router.delete("/remove/:product_id",auth,removeFromWishlist);

router.get("/getWishlist", auth, getWishlist);

module.exports = router;