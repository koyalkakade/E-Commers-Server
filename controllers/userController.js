const User = require('../models/userModel')
const bcrypt = require("bcryptjs")
const validateUser = require('../validators/userValidation')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function register(req, res) {
    try {

        if (!req.file) {
            return res.status(400).send({ success: false, msg: "Please upload image", });
        }
        const validation = await validateUser(req.body)
        if (!validation.success) {
            return res.status(400).send(validation);
        }
        let { name, email, password, contactNumber } = req.body

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return res.status(400).send({ success: false, msg: "User already exists..." })
        }

        password = await bcrypt.hash(password, 8)
        let imgPath = `/uploads/profiles/${req.file.filename}`;


        const newUser = await User.create({ name, email, password, contactNumber, imgPath })
        // console.log(newUser)
        await newUser.save()

        res.status(200).send({ success: true, msg: "Successfully Registered..." })

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error" })
    }
}

// let existingUser
const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const existingUser = await User.findOne({ email: email })
        // console.log(existingUser)
        if (!existingUser) {
            return res.status(401).send({ msg: "User does not exist", success: false })
        }

        const isPassCorrect = await bcrypt.compare(password, existingUser.password)
        // console.log(isPassCorrect)
        if (!isPassCorrect) {
            return res.status(401).send({ msg: "Invalid credentials", success: false })
        }

        if (existingUser.status === "inactive") {
            return res.status(400).send({ success: false, msg: "You are IN-ACTIVE" })
        }


        // const id = existingUser._id 
        // const role = existingUser.role
        const token = jwt.sign({
            id: existingUser._id,
            role: existingUser.role
        }, process.env.SECRET_KEY, { expiresIn: "2h" })
        // console.log(token)
        res.status(200).send({ msg: "Logged in succesfully", success: true, token: token })

    } catch (error) {
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const getUserInfo = async (req, res) => {
    try {
        //console.log("************", req.user)
        const loggedUser = await User.findById(req.user.id, { password: 0, createdAt: 0, updatedAt: 0 })
        // Convert Sequelize instance to plain object
        const userData = loggedUser.toObject();

        // Update image path
        if (userData.imgPath) {
            userData.imgPath = userData.imgPath;
        }

        // console.log(userData);
        res.status(200).send({ loggedUser: userData, success: true })

    } catch (error) {
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const getUserProfileById = async (req, res) => {
    try {
        // console.log("************", req.params)
        const { ID } = req.params;
        const loggedUser = await User.findById(ID, { password: 0, createdAt: 0, updatedAt: 0 })
        // Convert Sequelize instance to plain object
        const userData = loggedUser.toObject();

        // Update image path
        if (userData.imgPath) {
            userData.imgPath = process.env.SERVER_URL + userData.imgPath;
        }

        // console.log(userData);
        res.status(200).send({ userData: userData, success: true })

    } catch (error) {
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({}, { password: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        res.status(200).send({ allUsers: allUsers, success: true })


    } catch (error) {
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const updateProfileStatus = async (req, res) => {
    try {
        const ID = req.params.ID;
        const { status, role } = req.body.data
        // console.log(req.body, 'update user data......')
        // console.log(req.params)

        const userForUpdate = await User.findById(ID);
        if (!userForUpdate) {
            return res.status(404).json({ message: 'user not found', success: false });
        }

        const result = await User.updateOne(
            { _id: ID },
            {
                $set: {
                    status,
                    role,
                },
            }
        );
        res.status(200).send({ msg: "user update successfully", success: true })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const updateProfile = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.file, req.body.name, 'update profile')

        const user = await User.findById(id);
        if (req.file) {
            user.imgPath = `/uploads/profiles/${req.file.filename}`;
        }
        
        user.name = req.body.name;
        user.email = req.body.email;
        user.contactNumber = req.body.contactNumber;
        await user.save();

        res.status(200).json({

            success: true,
            msg: "Profile Updated"

        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error", success: false })
    }

}

async function changePassword(req, res) {
    try {
        console.log("------------------")
        const id = req.params.ID
        console.log(id)
        let { pass } = req.body
        console.log(id, pass)
        // Get token from headers
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, msg: 'No token provided' });

        // Verify JWT
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const salt = await bcrypt.genSaltSync(8)
        pass = await bcrypt.hashSync(pass, salt)

        const result = await User.updateOne(
             { _id: id },
            {
                $set: {
                    password:pass
                },
            }
        )

        res.status(200).send({ msg: "Password update successfully", success: true })
    }
    catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).send({ msg: "server error", success: false })
    }
}

module.exports = {
    register, login, getUserInfo, getAllUsers, updateProfileStatus, getUserProfileById,
     updateProfile,changePassword
}