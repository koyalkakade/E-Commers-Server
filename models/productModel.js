const mongoose = require('mongoose');

// 1. Define the Review Schema first so we can enable automatic timestamps for it
const reviewSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            //   required: true // Added required, since a review needs an author
        },
        rating: {
            type: Number,
            //   required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            default: ""
        }
    },
    {
        // This automatically manages createdAt and updatedAt for each review!
        timestamps: true
    }
);

// 2. Define the main Product Schema
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        description:{
              type: String,
               required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },
        brandId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "brand",
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: [0.01, "Price must be greater than 0"] // Enforces price > 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be negative"] // Enforces quantity >= 0
        },
        mainImage: {
            type: String,
            default: "",
        },
        productImage: {
           type: [String],
            default: "",
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
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
        // Embed the reviewSchema here
        reviews: [reviewSchema]
    },
    {
        // This manages createdAt and updatedAt for the main Product document
        timestamps: true,
    }
);

const Product = mongoose.model("product", productSchema);
module.exports = Product;