const mongoose = require('mongoose')

const cart = new mongoose.Schema({

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
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]

},
    {
        timestamps: true,
    }
);

const Cart = mongoose.model("cart", cart)
module.exports = Cart