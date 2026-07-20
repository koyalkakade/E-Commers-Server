const { ConnectionPoolClearedEvent } = require('mongodb');
const mongoose = require('mongoose')

const order = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },

            vendor_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user", // Vendor is a user
                required: true,
            },

            productName: {
                type: String,
                required: true,
            },

            productImage: {
                type: String,
                default: "",
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            price: {
                type: Number,
                required: true,
            },

            discount: {
                type: Number,
                default: 0,
            },

            finalPrice: {
                type: Number,
                required: true,
            },
        }
    ],

    shippingAddress: {
        name: String,
        contactNumber: String,
        houseNumber: String,
        area: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
    },

    subtotal: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0,
    },

    deliveryCharge: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "UPI", "Card", "NetBanking", "Wallet"],
        default: "COD",
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
    },

    orderStatus:{
        type:String,
        enum:["placed","confirmed","processing","shipped","out_for_delivery","delivered","cancelled"],
        default:"placed"
    },

    transactionId: {
        type: String,
        default: "",
    },

    orderDate: Date,
    deliveredAt: Date,
    cancelledAt: Date
},
    {
        timestamps: true,
    }
);

const Order = mongoose.model("order", order)
module.exports = Order