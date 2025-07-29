const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

//create ratingAndReview
exports.createRating = async (req, res) => {
    try {
        //fetch user id
        const userId = req.user.id;
        //fetch data
        const { rating, review, courseId } = req.body;
        //check user enrolled in course

        // $elemMatch: This is a MongoDB query operator that allows you to specify multiple criteria on the elements of an array field.
        // $eq: This is another MongoDB query operator that checks for equality.
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: {
                $elemMatch: { $eq: userId }
            }
        });

        if (!courseDetails) {
            return res.status(403).json({
                success: false,
                message: "user not enrolled in course"
            });
        }

        //check user already review the course
        const RatingAndReviewDetails = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });
        if (RatingAndReviewDetails) {
            return res.status(400).json({
                success: false,
                message: "user already reviewed this course"
            })
        }
        //crate entery on db
        const RatingAndReviewDB = await RatingAndReview.create({
            user: userId,
            review: review,
            rating: rating,
            course: courseId
        })
        //add ratingAndReview id in course model
        const UpdatedCourse = await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                RatingAndReview: RatingAndReviewDB._id
            }
        })
        //return success response
        res.status(200).json({
            success: true,
            message: "rating and review create successfully",
            RatingAndReviewDB,
            UpdatedCourse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error while creating Rating and review",
            errorMessage: error.message
        })
    }
}

//getAverage Rating
exports.getAverageRating = async (req, res) => {
    try {
        //get course id
        const { courseId } = req.body;
        //calculate average rating
        const Result = await Course.aggregate([
            {
                $match: {
                    course: mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])
        //if no rating/review exist
        if (Result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: Result[0].averageRating
            })
        }
        //if no rating/review exist
        return res.status(200).json({
            success: true,
            message: 'this course not have any rating',
            averageRating: 0
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"some issue while calculating average rating",
            errorMessage:error.message
        })
    }
}


//get All RatingAndReview
exports.getAllRating = async(req,res)=>{
    try{
        //get all rating and review
        const getAllRatingAndReview = await RatingAndReview.find({})
                                            .sort({rating:"desc"})
                                            .populate({
                                                path:"user",
                                                select:'firstName,lastName,email,image'
                                            })
                                            .populate({
                                                path:"course",
                                                select:"courseName"
                                            })
                                            .exec();
        //return respose
        res.status(200).json({
            success:true,
            message:"fetch all rating and review successfully",
            data:getAllRatingAndReview
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"some issue while get all ratingAndReview",
            errorMessage:error.message
        })
    }
}