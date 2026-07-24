const mongoose = require("mongoose");
const Product = require('../models/productModel')
const fs = require("fs");
const path = require("path");
const Order = require("../models/orderModel");


const createProduct = async (req, res) => {
    try {
        console.log(req.body, '/////////////////')
        const {
            name,
            description,
            categoryId,
            brandId,
            price,
            discount,
            quantity,
            isAvailable,
            isFeatured,
            createdBy,
            updatedBy,
            reviews
        } = req.body;

        console.log(req.body)

        // Check duplicate product
        const exists = await Product.findOne({ name });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Product already exists"
            });
        }

        // Main Image
        let mainImage = "";

        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {
            mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
        }

        // Multiple Images
        let productImages = [];

        if (
            req.files &&
            req.files.productImage
        ) {
            productImages = req.files.productImage.map(
                (img) => `/uploads/products/${img.filename}`
            );
        }
        // console.log(productImages,'productImages')
        // Review Object
        let reviewData = [];

        if (reviews) {
            try {

                if (typeof reviews === "string") {
                    reviewData = [JSON.parse(reviews)];
                } else {
                    reviewData = [reviews];
                }

            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid review data"
                });
            }
        }
        if (discount == '') { discount = 0 }

        const product = await Product.create({
            name,
            description,
            categoryId,
            brandId,
            price,
            discount,
            quantity,
            mainImage,
            productImage: productImages,
            isAvailable,
            isFeatured,
            createdBy,
            updatedBy,
            reviews: reviewData
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Product.find()
            .populate("brandId", "brandName")
            .populate("categoryId", "categoryName")
            .sort({ createdAt: -1 });

        res.status(200).send({ allProducts: allProducts, success: true })
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const getProductById = async (req, res) => {
    try {
        // console.log(req.params)
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("categoryId", "categoryName")
            .populate("brandId", "brandName")
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .populate("reviews.user_id", "name email'");

            // console.log(product)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const products = await Product.find({
            categoryId,
            isAvailable: true
        })
            .populate("categoryId", "categoryName")
            .populate("brandId", "brandName")
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email")
            .populate("reviews.user_id", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: products.length,
            message: "Products fetched successfully",
            data: products
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            description,
            categoryId,
            brandId,
            price,
            discount,
            quantity,
            isAvailable,
            isFeatured,
            updatedBy,
            reviews
        } = req.body;

        // Check duplicate name
        if (name && name !== product.name) {

            const exists = await Product.findOne({
                name,
                _id: { $ne: id }
            });

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Product name already exists"
                });
            }
        }

        // Main Image
        let mainImage = product.mainImage;

        if (
            req.files &&
            req.files.mainImage &&
            req.files.mainImage.length > 0
        ) {
            mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
        }

        // Product Images
        let productImages = product.productImage;

        if (
            req.files &&
            req.files.productImage &&
            req.files.productImage.length > 0
        ) {
            // Replace all old images
            productImages = req.files.productImage.map(file =>
                `/uploads/products/${file.filename}`);

            // OR append new images instead:
            // productImages = [
            //     ...product.productImage,
            //     ...req.files.productImage.map(file => file.filename)
            // ];
        }

        // Reviews
        let reviewData = product.reviews;

        if (reviews) {
            reviewData =
                typeof reviews === "string"
                    ? JSON.parse(reviews)
                    : reviews;
        }

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.categoryId = categoryId ?? product.categoryId;
        product.brandId = brandId ?? product.brandId;
        product.price = price ?? product.price;
        product.discount = discount ?? product.discount;
        product.quantity = quantity ?? product.quantity;
        product.isAvailable = isAvailable ?? product.isAvailable;
        product.isFeatured = isFeatured ?? product.isFeatured;
        product.updatedBy = updatedBy ?? product.updatedBy;

        product.mainImage = mainImage;
        product.productImage = productImages;
        product.reviews = reviewData;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete Main Image
        if (product.mainImage) {
            const mainImagePath = path.join(
                __dirname,
                "../uploads/products",
                product.mainImage
            );

            if (fs.existsSync(mainImagePath)) {
                fs.unlinkSync(mainImagePath);
            }
        }

        // Delete Product Images
        if (
            product.productImage &&
            product.productImage.length > 0
        ) {
            product.productImage.forEach((image) => {

                const imagePath = path.join(
                    __dirname,
                    "../uploads/products",
                    image
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

            });
        }

        // Delete Product
        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getAverageRating = async (req, res) => {
    try {

        const { id } = req.params;

        // Get current product
        const currentProduct = await Product.findById(id);

        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find all vendor listings with same product name
        const products = await Product.find({
            name: currentProduct.name
        });

        let totalRating = 0;
        let totalReviews = 0;

        products.forEach(product => {

            product.reviews.forEach(review => {
                totalRating += review.rating;
                totalReviews++;
            });

        });

        const averageRating =
            totalReviews === 0
                ? 0
                : Number((totalRating / totalReviews).toFixed(1));

        return res.status(200).json({
            success: true,
            productName: currentProduct.name,
            averageRating,
            totalReviews
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const addReview = async (req, res) => {
    try {

        const { productId } = req.params;
        const user_id = req.user.id;
        const { rating, comment } = req.body.reviewData;

        // console.log(productId,user_id,rating, comment)

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product Id"
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // User must have purchased and received this product
        const ordered = await Order.findOne({
            user_id,
            orderStatus: "delivered",
            "products.product_id": productId
        });

        if (!ordered) {
            return res.status(400).json({
                success: false,
                message: "You can review only delivered products."
            });
        }
// console.log('//////////',ordered)

        // Check duplicate review
        const alreadyReviewed = product.reviews.find(
            review => review.user_id.toString() === user_id
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product."
            });
        }

        // Add review
        product.reviews.push({
            user_id,
            rating,
            comment
        });

        await product.save();

        // Calculate average
        const totalReviews = product.reviews.length;

        const totalRating = product.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating = Number(
            (totalRating / totalReviews).toFixed(1)
        );

        res.status(201).json({
            success: true,
            message: "Review added successfully.",
            averageRating,
            totalReviews,
            data: product
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    createProduct, getAllProducts, updateProduct,
    deleteProduct, getProductById, getProductsByCategory,
    getAverageRating, addReview
}