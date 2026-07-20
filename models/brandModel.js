const mongoose = require('mongoose')

const brand = new mongoose.Schema({
    brandName: {
        type: String,
        unique: true,
        required: true,
    },
    brandImage: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
},
    {
        timestamps: true,
    }
);

const Brand = mongoose.model("brand", brand)
module.exports = Brand