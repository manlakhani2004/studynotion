const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require('../middleware/auth')
const {
  DeleteUser,
  updateProfile,
  GetUserDetails,
  updateDisplayPicture,
  getEnrolledCourses
//   instructorDashboard,
} = require('../controller/Profile');

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, DeleteUser)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, GetUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router;