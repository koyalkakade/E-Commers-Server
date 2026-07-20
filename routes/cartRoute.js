const express = require("express");
const router = express.Router();
const { auth } = require('../middleware/auth');
const { addToCart, getMyCart, updateCartQuantity,
    removeProductFromCart, clearCart, 
    getCartCount,
    getCartTotal} = require("../controllers/cartController");

router.post("/addToCart", auth, addToCart);
router.get("/getMyCart", auth, getMyCart)
router.get("/getCartCount", auth, getCartCount)
router.put('/updateCartQuantity/:ID', auth, updateCartQuantity)
router.delete("/removeProductFromCart", auth, removeProductFromCart)
router.delete("/clearCart/:user_id", auth, clearCart)
router.get("/getCartTotal", auth, getCartTotal)

module.exports = router;