const express = require("express");
const router = express.Router();
const { auth,admin,vendor } = require('../middleware/auth');
const { placeOrder, getMyOrders, getOrderById, 
    cancelOrder, getAllOrders, updateOrderStatus, 
    getVendorOrders,
    getTotalOrders,
    getTotalRevenue,
    getPendingOrders,
    getProcessingOrders,
    getShippedOrders,
    getDeliveredOrders,
    getCancelledOrders,
    getTodayOrders,
    getMonthlySales,
    getTopSellingProducts,
    dashboard,
    vendorDashboard} = require("../controllers/orderController");


router.post("/placeOrder", auth, placeOrder);
router.get("/getMyOrders",auth, getMyOrders);
router.get("/getOrderById/:id",auth, getOrderById);
router.get("/getAllOrders",auth, getAllOrders);
router.put("/updateOrderStatus/:id",auth, updateOrderStatus);
router.get("/vendorOrders/:vendorId",auth,admin, getVendorOrders);
router.put("/cancelOrder/:id",auth, cancelOrder);

router.get("/getTotalOrders",auth,admin, getTotalOrders);
router.get("/getTotalRevenue",auth,admin, getTotalRevenue);
router.get("/getPendingOrders",auth,admin, getPendingOrders);
router.get("/getProcessingOrders",auth,admin, getProcessingOrders);
router.get("/getShippedOrders",auth,admin, getShippedOrders);
router.get("/getDeliveredOrders",auth,admin, getDeliveredOrders);
router.get("/getCancelledOrders",auth,admin, getCancelledOrders);
router.get("/getTodayOrders",auth,admin, getTodayOrders);
router.get("/getMonthlySales",auth,admin, getMonthlySales);
router.get("/getTopSellingProducts",auth,admin, getTopSellingProducts);
router.get("/dashboard",auth,admin, dashboard);
router.get("/vendorDashboard",auth,vendor, vendorDashboard);


module.exports = router;