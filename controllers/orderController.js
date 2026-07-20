const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const placeOrder = async (req, res) => {
    try {

        const {
            user_id,
            shippingAddress,
            paymentMethod
        } = req.body;

        const cart = await Cart.findOne({ user_id })
            .populate("products.product_id");

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let subtotal = 0;
        let discountAmount = 0;

        const orderProducts = [];

        for (const item of cart.products) {

            const product = item.product_id;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (item.quantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.quantity} items available`
                });
            }

            const price = product.price;

            const discount = product.discount || 0;

            const finalPrice =
                price - (price * discount) / 100;

            subtotal += price * item.quantity;

            discountAmount +=
                ((price * discount) / 100) * item.quantity;

            orderProducts.push({
                product_id: product._id,

                vendor_id: product.createdBy,

                productName: product.name,

                productImage: product.mainImage,

                quantity: item.quantity,

                price,

                discount,

                finalPrice
            });
        }

        const deliveryCharge = subtotal >= 500 ? 0 : 50;

        const totalAmount =
            subtotal -
            discountAmount +
            deliveryCharge;

        const order = await Order.create({

            user_id,

            products: orderProducts,

            shippingAddress,

            subtotal,

            discountAmount,

            deliveryCharge,

            totalAmount,

            paymentMethod,

            paymentStatus:
                paymentMethod === "COD"
                    ? "Pending"
                    : "Paid",

            orderStatus: "placed",

            orderDate: new Date()

        });

        // Reduce Stock

        for (const item of cart.products) {

            await Product.findByIdAndUpdate(
                item.product_id._id,
                {
                    $inc: {
                        quantity: -item.quantity
                    }
                }
            );

        }

        // Clear Cart

        cart.products = [];

        await cart.save();

        res.status(201).json({

            success: true,

            message: "Order placed successfully",

            data: order

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const getMyOrders = async (req, res) => {
    try {
        const { user_id } = req.params;

        const orders = await Order.find({ user_id })
            .populate("user_id", "name email mobile")
            .populate("products.vendor_id", "name email mobile")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            message: "Orders fetched successfully.",
            data: orders,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getOrderById = async (req, res) => {
    try {

        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("user_id", "name email mobile profileImage")
            .populate("products.vendor_id", "name email mobile profileImage")
            .populate("products.product_id");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully.",
            data: order
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getAllOrders = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            orderStatus,
            paymentStatus,
            paymentMethod
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const filter = {};

        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }

        let orders = await Order.find(filter)
            .populate("user_id", "name email mobile")
            .populate("products.vendor_id", "name email")
            .populate("products.product_id", "name mainImage")
            .sort({ createdAt: -1 });

        // Search by customer name
        if (search) {
            const keyword = search.toLowerCase();

            orders = orders.filter(order =>
                order.user_id &&
                order.user_id.name.toLowerCase().includes(keyword)
            );
        }

        const totalOrders = orders.length;

        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedOrders = orders.slice(start, end);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully.",
            totalOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            data: paginatedOrders
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const updateOrderStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { orderStatus } = req.body;

        const allowedStatus = [
            "placed",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatus.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.orderStatus === "delivered" ||
            order.orderStatus === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: `Order is already ${order.orderStatus}.`
            });
        }

        // Valid status flow
        const statusFlow = {
            placed: "confirmed",
            confirmed: "processing",
            processing: "shipped",
            shipped: "out_for_delivery",
            out_for_delivery: "delivered"
        };

        // Allow cancellation before shipping
        if (orderStatus === "cancelled") {

            if (
                ["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Order cannot be cancelled."
                });
            }

            // Restore Stock
            for (const item of order.products) {

                await Product.findByIdAndUpdate(
                    item.product_id,
                    {
                        $inc: {
                            quantity: item.quantity
                        }
                    }
                );

            }

            order.orderStatus = "cancelled";
            order.cancelledAt = new Date();

            if (order.paymentStatus === "Paid") {
                order.paymentStatus = "Refunded";
            }

        } else {

            const nextStatus = statusFlow[order.orderStatus];

            if (nextStatus !== orderStatus) {

                return res.status(400).json({
                    success: false,
                    message: `Order can only move from "${order.orderStatus}" to "${nextStatus}".`
                });

            }

            order.orderStatus = orderStatus;

            if (orderStatus === "delivered") {

                order.deliveredAt = new Date();

                // COD payment becomes paid after delivery
                if (order.paymentMethod === "COD") {
                    order.paymentStatus = "Paid";
                }

            }

        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: order
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getVendorOrders = async (req, res) => {
    try {

        const { vendorId } = req.params;

        const orders = await Order.find({
            "products.vendor_id": vendorId
        })
            .populate("user_id", "name email mobile")
            .populate("products.product_id", "name mainImage")
            .populate("products.vendor_id", "name email mobile")
            .sort({ createdAt: -1 });

        // Keep only vendor's own products in each order
        const vendorOrders = orders.map(order => {

            const vendorProducts = order.products.filter(
                product => product.vendor_id._id.toString() === vendorId
            );

            return {
                _id: order._id,
                user_id: order.user_id,
                products: vendorProducts,
                shippingAddress: order.shippingAddress,
                subtotal: vendorProducts.reduce(
                    (sum, item) => sum + (item.finalPrice * item.quantity),
                    0
                ),
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                transactionId: order.transactionId,
                orderDate: order.orderDate,
                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });

        return res.status(200).json({
            success: true,
            totalOrders: vendorOrders.length,
            message: "Vendor orders fetched successfully.",
            data: vendorOrders
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const cancelOrder = async (req, res) => {
    try {

        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Already cancelled
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled."
            });
        }

        // Cannot cancel after shipping
        if (
            ["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled because it is ${order.orderStatus}.`
            });
        }

        // Restore stock
        for (const item of order.products) {

            await Product.findByIdAndUpdate(
                item.product_id,
                {
                    $inc: {
                        quantity: item.quantity
                    }
                }
            );
        }

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();

        // Refund online payments
        if (order.paymentStatus === "Paid") {
            order.paymentStatus = "Refunded";
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            data: order
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//dashboard
const getTotalOrders = async (req, res) => {
    try {

        const totalOrders = await Order.countDocuments();

        res.status(200).json({
            success: true,
            totalOrders
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getTotalRevenue = async (req, res) => {
    try {

        const revenue = await Order.aggregate([
            {
                $match: {
                    orderStatus: "delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        res.json({
            success: true,
            totalRevenue: revenue[0]?.totalRevenue || 0
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const getPendingOrders = async (req, res) => {

    try {

        const total = await Order.countDocuments({
            orderStatus: "placed"
        });

        res.json({
            success: true,
            pendingOrders: total
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getProcessingOrders = async (req, res) => {
    try {
        const total = await Order.countDocuments({
            orderStatus: "processing"
        });

        res.json({
            success: true,
            processingOrders: total
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getShippedOrders = async (req, res) => {

    try {

        const total = await Order.countDocuments({
            orderStatus: "shipped"
        });

        res.json({
            success: true,
            shippedOrders: total
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const getDeliveredOrders = async (req, res) => {

    try {

        const total = await Order.countDocuments({
            orderStatus: "delivered"
        });

        res.json({
            success: true,
            deliveredOrders: total
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getCancelledOrders = async (req, res) => {

    try {

        const total = await Order.countDocuments({
            orderStatus: "cancelled"
        });

        res.json({
            success: true,
            cancelledOrders: total
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getTodayOrders = async (req, res) => {

    try {

        const start = new Date();
        start.setHours(0,0,0,0);

        const end = new Date();
        end.setHours(23,59,59,999);

        const total = await Order.countDocuments({
            createdAt:{
                $gte:start,
                $lte:end
            }
        });

        res.json({
            success:true,
            todayOrders:total
        });

    } catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};

const getMonthlySales = async (req, res) => {

    try {

        const data = await Order.aggregate([

            {
                $match:{
                    orderStatus:"delivered"
                }
            },

            {
                $group:{
                    _id:{
                        year:{
                            $year:"$createdAt"
                        },
                        month:{
                            $month:"$createdAt"
                        }
                    },

                    sales:{
                        $sum:"$totalAmount"
                    },

                    totalOrders:{
                        $sum:1
                    }

                }
            },

            {
                $sort:{
                    "_id.year":1,
                    "_id.month":1
                }
            }

        ]);

        res.json({
            success:true,
            data
        });

    } catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};

const getTopSellingProducts = async (req, res) => {

    try {

        const products = await Order.aggregate([

            {
                $match:{
                    orderStatus:"delivered"
                }
            },

            {
                $unwind:"$products"
            },

            {
                $group:{

                    _id:"$products.product_id",

                    productName:{
                        $first:"$products.productName"
                    },

                    image:{
                        $first:"$products.productImage"
                    },

                    sold:{
                        $sum:"$products.quantity"
                    }

                }

            },

            {
                $sort:{
                    sold:-1
                }
            },

            {
                $limit:10
            }

        ]);

        res.json({
            success:true,
            data:products
        });

    } catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};

module.exports = {
    placeOrder,getMyOrders,getOrderById,getAllOrders,
    updateOrderStatus,getVendorOrders,cancelOrder,
    getTotalOrders,getTotalRevenue,getPendingOrders,
    getProcessingOrders,getShippedOrders,getDeliveredOrders,
    getCancelledOrders,getTodayOrders,getMonthlySales,
    getTopSellingProducts
};