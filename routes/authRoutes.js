const express = require("express");
const {register, login, getMe} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");

const router = express.Router();
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(getMe));

module.exports = router;
