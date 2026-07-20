const mongoose = require("mongoose");
require("dotenv").config()


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        //await mongoose.connect(process.env.MONGO_URL_ATLAS);


        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.log("❌ Database Connection Failed");
        console.log(error.message);
        process.exit(1);
    }
};
connectDB()
module.exports = connectDB;