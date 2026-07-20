const Wishlist = require("../models/wishlistModel");

const addToWishlist = async (req, res) => {
  try {
    //  console.log("Wishlist API Called");
    const user_id = req.user.id; // From auth middleware
    // console.log(req.user.id,'user id wishlist')
    const { product_id } = req.body;

    let wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id,
        products: [product_id],
      });
    } else {
      if (wishlist.products.includes(product_id)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      wishlist.products.push(product_id);
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.params;

    const wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== product_id
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;

    const wishlist = await Wishlist.findOne({ user_id }).populate({
      path: "products",
      populate: [
        { path: "brandId" },
        { path: "categoryId" },
      ],
    });

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports={
    addToWishlist,removeFromWishlist,getWishlist
}