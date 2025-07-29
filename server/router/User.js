const express = require('express');
const router = express.Router();

//fetch controller
const {sendOTP,signup,login,changePassword} = require('../controller/auth')
const {resetPasswordToken,ResetPassword} = require('../controller/resetPassword');
const {auth} = require('../middleware/auth');
//map the controller

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP) 

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", ResetPassword)

// Export the router for use in the main application
module.exports = router;