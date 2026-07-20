const otpStore = require("../utils/otpStore");
const transporter = require("../services/mail");
const User = require("../models/userModel");

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
       // console.log(req.body, 'email body')
        // const user = await User.findOne({ email: email })  //use for password change

        // if (!user) {
        //     return res.status(404).json({
        //         success: false,
        //         msg: "Email not found"
        //     });
        // }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // console.log(otp, 'otp')
        otpStore.set(email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000
        });
      //  console.log(otpStore, 'otpStore')

        const transporter1 = await transporter.sendMail({
            to: email,
            subject: "For Verify Email OTP",
            html: `<h2>Your OTP: ${otp}</h2>`
        });
        // console.log(transporter1, 'transporter1')

        res.status(200).json({
            otp: otp,
            success: true,
            msg: "OTP Sent"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {

        //const { data } = req.body;
        const {email}= req.body
        const {otp}= req.body
       // console.log(email,otp, 'verify email body',req.body)
        const otpData = otpStore.get(email);
       // console.log(otpData, 'otpData',otpStore)
        if (!otpData) {
            return res.status(400).json({
                success: false,
                msg: "OTP not found"
            });
        }

        if (otpData.expires < Date.now()) {
            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                msg: "OTP expired"
            });
        }

        if (otpData.otp !== otp) {
            return res.status(400).json({
                success: false,
                msg: "Invalid OTP"
            });
        }

        res.status(200).json({
            success: true,
            msg: "OTP Verify Successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message
        });
    }
};

module.exports = { sendOTP, verifyOTP }