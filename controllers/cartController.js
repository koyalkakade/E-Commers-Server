const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const addToCart = async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        if (!user_id || !product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: "user_id, product_id and quantity are required."
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0."
            });
        }

        // Check Product
        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Product is not available."
            });
        }
        if (quantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} items available in stock.`
            });
        }
        // Find User Cart
        let cart = await Cart.findOne({ user_id });

        // Cart not found
        if (!cart) {

            cart = await Cart.create({
                user_id,
                products: [
                    {
                        product_id,
                        quantity
                    }
                ]
            });

            return res.status(201).json({
                success: true,
                message: "Product added to cart.",
                data: cart
            });
        }

        // Product already in cart
        const existingProduct = cart.products.find(
            item => item.product_id.toString() === product_id
        );

        if (existingProduct) {

            if (existingProduct.quantity + quantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items available in stock.`
                });
            }

            existingProduct.quantity += Number(quantity);

        } else {

            if (quantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items available in stock.`
                });
            }

            cart.products.push({
                product_id,
                quantity
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart updated successfully.",
            data: cart
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyCart = async (req, res) => {
    try {

        const { user_id } = req.user.id;

        const cart = await Cart.findOne({ user_id })
            .populate("products.product_id");

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    products: []
                }
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const updateCartQuantity = async (req, res) => {

    try {
        const { ID } = req.params;
        const { product_id, quantity } = req.body;

        const cart = await Cart.findOne({ ID });

        if (!cart)
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });

        const item = cart.products.find(
            p => p.product_id.toString() === product_id
        );

        if (!item)
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });

        item.quantity = quantity;

        await cart.save();

        res.json({
            success: true,
            message: "Quantity updated",
            data: cart
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const removeProductFromCart = async (req, res) => {

    try {

        const { user_id, product_id } = req.body;

        const cart = await Cart.findOne({ user_id });

        if (!cart)
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });

        cart.products = cart.products.filter(
            p => p.product_id.toString() !== product_id
        );

        await cart.save();

        res.json({
            success: true,
            message: "Product removed",
            data: cart
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const clearCart = async (req, res) => {

    try {

        const { user_id } = req.params;

        await Cart.findOneAndUpdate(
            { user_id },
            {
                products: []
            }
        );

        res.json({
            success: true,
            message: "Cart cleared"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getCartCount = async (req, res) => {

    try {

        const { user_id } = req.user.id;

        const cart = await Cart.findOne({ user_id });

        if (!cart)
            return res.json({
                success: true,
                count: 0
            });

        const count = cart.products.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        res.json({
            success: true,
            count
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const getCartTotal = async (req, res) => {
    try {

        const { user_id } = req.body;

        const cart = await Cart.findOne({ user_id })
            .populate("products.product_id");

        if (!cart || cart.products.length === 0) {
            return res.status(200).json({
                success: true,
                totalItems: 0,
                subtotal: 0,
                discountAmount: 0,
                deliveryCharge: 0,
                totalAmount: 0,
                products: []
            });
        }

        let totalItems = 0;
        let subtotal = 0;
        let discountAmount = 0;

        const products = cart.products.map(item => {

            const product = item.product_id;

            const price = product.price;

            const discount = product.discount || 0;

            const finalPrice = price - ((price * discount) / 100);

            const itemSubtotal = price * item.quantity;

            const itemDiscount =
                ((price * discount) / 100) * item.quantity;

            const itemTotal = finalPrice * item.quantity;

            totalItems += item.quantity;
            subtotal += itemSubtotal;
            discountAmount += itemDiscount;

            return {
                product_id: product._id,
                name: product.name,
                mainImage: product.mainImage,
                quantity: item.quantity,
                price,
                discount,
                finalPrice,
                itemTotal
            };
        });

        const deliveryCharge = subtotal >= 500 ? 0 : 50;

        const totalAmount =
            subtotal -
            discountAmount +
            deliveryCharge;

        return res.status(200).json({
            success: true,
            totalItems,
            subtotal,
            discountAmount,
            deliveryCharge,
            totalAmount,
            products
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    addToCart, getMyCart, updateCartQuantity,
    removeProductFromCart, clearCart, getCartCount,getCartTotal
};