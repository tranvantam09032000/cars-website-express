const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.register = async (req, res) => {
    const {name, email, age, password} = req.body;

    const existingUser = await User.findOne({email});
    if (existingUser) return res.status(400).json({message: "Email đã được sử dụng"});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({name, email, age, password: hashedPassword});
    await newUser.save();

    res.status(201).json({message: "Đăng ký thành công"});
}

exports.login = async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (!user) return res.status(400).json({message: "Email hoặc mật khẩu không đúng"});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({message: "Email hoặc mật khẩu không đúng"});
    const token = jwt.sign({id: user._id.toHexString()}, process.env.JWT_SECRET, {expiresIn: "1h"});

    res.json({token, user: {id: user._id, name: user.name, email: user.email}});
}

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({message: "User not found"});
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.createUser = async (req, res) => {
    try {
        const {name, email, age} = req.body;
        const newUser = new User({name, email, age});
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.updateUser = async (req, res) => {
    try {
        const {name, email, age} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {name, email, age},
            {new: true}
        );
        if (!updatedUser) return res.status(404).json({message: "User not found"});
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({message: "User not found"});
        res.status(200).json({message: "User deleted"});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};
