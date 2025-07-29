// Import the required modules
const express = require("express")
const router = express.Router()

const { caputrePayment, verifyPayment, 
    sendPaymentSuccessEmail 
} = require('../controller/Payments')
const { auth, isInstructor, isStudent, isAdmin } = require('../middleware/auth')
router.post("/capturePayment", auth, isStudent, caputrePayment)
router.post("/verifyPayment",auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);
module.exports = router;