const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');
const { UploadMidea } = require('../utils/UploadMidea');
require('dotenv').config();
//update profile
exports.updateProfile = async (req, res) => {
    try {
        //fetch data"
        const { dob = "", about = "", gender, contactNumber = "" } = req.body;
        //fetch userid
        const userId = req.user.id;
        console.log("user id", userId);
        //find profile
        const userDetails = await User.findById(userId); //find user for profile id
        const profile = await Profile.findById(userDetails.additionalDetails);
        console.log(dob, about, contactNumber, gender, userId, profile);
        profile.gender = gender;
        profile.dateOfBirth = dob,
            profile.contactNumber = contactNumber;
        profile.about = about;

        await profile.save();
        console.log("updated");
        const UpdatedUser = await User.findById(userId).populate('additionalDetails').exec();
        // const updatedProfile = await Profile.findById({_id:UpdatedUser.additionalDetails});
        // console.log(updatedProfile);
        //return response
        res.status(200).json({
            success: true,
            message: "profile details updated successfully",
            UpdatedUser,
            // profile:updatedProfile
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "profile details not update",
            messageError: error.message
        })
    }
}


//delete user controller
exports.DeleteUser = async (req, res) => {
    try {
        //fetch user id
        const id = req.user.id;

        //check user id is valid
        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(403).json({
                success: false,
                message: "user invalid user id"
            })
        }

        //delete user profile
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete({ _id: profileId });

        //romove user enroll course
        const courseId = userDetails.courses;
        const CourseDetail = await Course.findById(courseId);
        const updatecourse = await Course.findByIdAndUpdate({ _id: CourseDetail._id }, {
            $pull: {
                studentsEnrolled: userDetails._id
            }
        }, { new: true })

        //TODO:remove user review and rating

        //delete user id
        await User.findByIdAndDelete({ _id: userDetails._id });

        //return response
        return res.status(200).json({
            success: true,
            message: "user deleted successfully",
            DeletedUser: userDetails
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some issue while delete user",
            messageError: error.message,
        })
    }
}


//GetUser Details
exports.GetUserDetails = async (req, res) => {
    try {
        //fetch user id
        const id = req.user.id;

        //check user id is valid , get details
        const userDetails = await User.findById(id)
            .populate('additionalDetails')
            .exec();

        if (!userDetails) {
            return res.status(403).json({
                success: false,
                message: "user invalid user id"
            })
        }

        //return resonse
        res.status(200).json({
            sucess: true,
            message: "get user details successfully",
            userDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "some issue while get details user",
            messageError: error.message,
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await UploadMidea(
            displayPicture,
            process.env.CLOUDINARY_FOLDER,
            1000,
            5000
        )
        console.log(image)
        const updatedUser = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            user: updatedUser,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.getEnrolledCourses = async(req,res)=>
{
    try {
        const userId = req.user.id;

        const userDetails = await User.findById(userId).populate('courses')

        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "user not Found"
            })
        }

        res.status(200).json({
            success:true,
            message:"Enroll course get successfully",
            courses:userDetails.courses
        }) 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}