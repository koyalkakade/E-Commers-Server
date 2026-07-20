const mongoose = require('mongoose')

const category = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        required: true,
    },
    categoryImage: {
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

const Category = mongoose.model("category", category)
module.exports = Category