const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const { UploadMidea } = require('../utils/UploadMidea');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
require('dotenv').config();

//create course
exports.createCourse = async (req, res) => {
    try {
        //fetch data and file
        const { courseName, courseDescription, whatYouWillLearn, price, CategoryId, tag, status } = req.body
        const thumbnail = req.files.thumbnail;
        //validate data
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !tag) {
            return res.status(400).json({
                success: false,
                message: "all course field require"
            })
        }
        //get instructor id or details
        const instructorID = req.user.id;
        const InstructorDetails = await User.findById(instructorID);
        if (!InstructorDetails) {
            return res.status(400).json({
                success: false,
                message: "instructor not found"
            })
        }
        //check given Category is valid or not
        const CategoryDetails = await Category.findById({ _id: CategoryId })
        if (!CategoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }
        //upload image on cloudinary
        const ImageUploadDetails = await UploadMidea(thumbnail, process.env.CLOUDINARY_FOLDER, 60);
        //create course in db
        const courseDB = await Course.create({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: tag,
            thumbnail: ImageUploadDetails.secure_url,
            Category: CategoryDetails._id,
            instructor: InstructorDetails._id,
            status: status
        })
        //add course id in User model in  Course array key
        await User.findByIdAndUpdate({ _id: InstructorDetails._id },
            {
                $push: {
                    courses: courseDB._id
                }
            },
            { new: true });
        //add course id in Category model in course array key
        await Category.findByIdAndUpdate({ _id: CategoryDetails._id }, {
            $push: {
                courses: courseDB._id
            }
        });
        //retrun response
        res.status(200).json({
            sucess: true,
            message: "course created sucessfully",
            courseDetails: courseDB
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: `someting went wrong when create course => ${error.message}`,
            messageError: error.message
        })
    }
}


//show all course
exports.getAllCourses = async (req, res) => {
    try {
        //TODO:change below statment increamentally
        const AllCourse = await Course.find({});

        //return success response
        res.status(200).json({
            success: true,
            message: "get all course successfully",
            AllCourse
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: 'someting went wrong when find all course',
            messageError: error.message
        })
    }
}

//edit Course

exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const updates = req.body;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(401).json({
                success: false,
                message: 'course not found'
            })
        }

        //if thubnail image found, update it
        if (req.files) {
            console.log("thubnail is update");
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await UploadMidea(thumbnail, process.env.CLOUDINARY_FOLDER)
            course.thumbnail = thumbnailImage.secure_url;
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key]);
                } else {
                    course[key] = updates[key];
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({ _id: courseId }).populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },
        })
            .populate("Category")
            //   .populate("RatingAndReview")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.status(200).json({
            success: true,
            message: "course updated",
            course: updatedCourse
        })
    } catch (error) {
        return res.status(501).json({
            success: false,
            message: `somting went wrong in update course ${error.message}`
        })
    }
}



//get courseDetails

exports.getCourseDetails = async (req, res) => {
    try {
        //fetch course id
        const { courseId } = req.body;
        //find course from db
        const CourseDetails = await Course.findById(courseId)
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails"
                    }
                })
            .populate(
                {
                    path: "courseContent",
                    populate: {
                        path: "SubSection"
                    }
                }
            )
            .populate("RatingAndReview")
            .populate("Category")
            .exec();

        //validate course details
        if (!CourseDetails) {
            return res.status(400).json({
                success: false,
                message: `course not found in this ${courseId} id`
            })
        }

        //return success response
        res.status(200).json({
            success: true,
            message: "course details fetch successfully",
            data: CourseDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error while fetching course details",
            errorMessage: error.message
        })
    }
}

exports.getCourseById = async (req, res) => {
    try {
        const { courseId } = req.body;
        console.log("this course id is:",courseId.courseId)
        const CourseDetails = await Course.findById(courseId.courseId)
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails"
                    }
                }) 
            .populate(
                {
                    path: "courseContent",
                    populate: {
                        path: "subSection"
                    }
                }
            ) 
            .populate("RatingAndReview")
            .populate("Category")    
            .exec();

        //validate course details
        if (!CourseDetails) {
            return res.status(400).json({
                success: false,
                message: `course not found in this ${courseId} id`
            })
        }

        //return success response
        res.status(200).json({
            success: true,
            message: "course details fetch successfully",
            data: CourseDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error while fetching course details",
            errorMessage: error.message
        })
    }
}

//get All instructor courses

exports.getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const instructorCourses = await Course.find({ instructor: instructorId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            courses: instructorCourses
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            message: `somthing went wrong while fetching instruector courses ${error.message}`
        })
    }
}

//delete course

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        //find course
        const course = await Course.findById(courseId);
        // console.log("courseinfo",course);
        if (!course) {
            return res.status(401).json({
                success: false,
                message: "course not found"
            })
        }

        //unEnroll student course
        const studentEnrolled = course.studentsEnrolled;

        for (const studentId of studentEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: {
                    courses: courseId
                }
            })
        }

        //delete section and subsection
        const sections = course.courseContent;
        for (const sectionId of sections) {
            //delete subsection
            const section = await Section.findById(sectionId);
            if (section) {
                const subsections = section.subSection;
                for (const subsectionId of subsections) {
                    await SubSection.findByIdAndDelete(subsectionId);
                }
            }
            //delete section
            await Section.findByIdAndDelete(sectionId);
        }

        //remove course id from instructor
        const instructor = await User.findById(course.instructor);
        await User.findByIdAndUpdate(instructor._id, {
            $pull: {
                courses: courseId
            }
        })
        //delete course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course delete successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `error while delete course ${error.message}`
        })
    }
}

//getFullCourseDetails

// exports.getFullCourseDetails= async(req,res)=>{
//     try{
//         const{courseId} = req.body;
//         // const userid = req.user.id;

//         const courseDetails = await Course.findOne({_id:courseId}).populate({
//             path:"instructor",
//             populate:{
//                 path:"additionalDetails"
//             }
//         })
//         .populate("Category")
//         // .populate("RatingAndReview")
//         .populate({
//             path:"courseContent",
//             populate:{
//                 path:"subSection"
//             }
//         }).exec();

//         if(!courseDetails){
//             return res.status(401).json({
//                 success:false,
//                 message:`course not found`
//             })
//         }

//         return res.status(200).json({
//             success:true,
//             course:courseDetails
//         })
//     }catch(error){
//         return res.status(501).json({
//             success:false,
//             message:`error while feching course ${error.message}`
//         })
//     }
// }

exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}