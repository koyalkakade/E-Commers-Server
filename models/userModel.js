const mongoose = require('mongoose')

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    contactNumber: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["customer", "admin", "vendor"],
        default: "customer",
    },
    address: {
        houseNumber: String,
        area: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    imgPath: {
        type: String,
        default: "",
    },

    isActive: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", user)
module.exports = User