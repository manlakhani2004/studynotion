const SubSection = require('../models/subSection');
const Section = require('../models/section');
const { UploadMidea } = require('../utils/UploadMidea');
const Course = require('../models/Course');
require('dotenv').config();


//create subsection
exports.createSubSection = async (req, res) => {
    try {
        //fetch data
        const { title, description, sectionId } = req.body;
        const LectureVideo = req.files.LectureVideo;
        //validate data
        if (!title || !description || !sectionId || !LectureVideo) {
            return res.status(400).json({
                success: false,
                message: "some data missing to create subsection"
            })
        }

        //updaload video on cloudinary
        // console.log(LectureVideo);
        const videoUplaod = await UploadMidea(LectureVideo, process.env.CLOUDINARY_FOLDER);
        //store subSection on db

        const subsectionDB = await SubSection.create({
            title,
            timeDuration: `${videoUplaod.duration}`,
            description,
            videoUrl: videoUplaod.secure_url
        })
        //add subsection id in section subsection array
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $push: {
                subSection: subsectionDB._id
            }
        }, { new: true }).populate("subSection");

        //return success response
        res.status(200).json({
            success: true,
            message: "subsection created sucessfully",
            subsectionDB,
            updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `subsection not create some went wrong ${error.message}`
        })
    }
}

//update subsection
exports.updateSubSection = async (req, res) => {
    try {
        //fetch data
        const { sectionId, subSectionId, title, description } = req.body;
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.LectureVideo !== undefined) {
            const video = req.files.LectureVideo
            const uploadDetails = await UploadMidea(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        ) 

        //return response
        res.status(200).json({
            success: true, 
            message: "subsection update successfully",
            updatedSection: updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `subsection not update ${error.message}`,
        })
    }
}


//delete subSection
exports.deleteSubSection = async (req, res) => {
    try {
        //fetch data
        const { subsectionId, sectionId, courseId } = req.body;
        //validate data
        if (!subsectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "subsection id and section are require for delete subsection"
            })
        }
        //delete subsection from section array
        await Section.findByIdAndUpdate({ _id: sectionId }, {
            $pull: {
                subSection: subsectionId
            }
        })
        //delete subsection form db
        const subSection = await SubSection.findByIdAndDelete({ _id: subsectionId }, { new: true })



        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }
        const Updatedsection = await Section.findById(sectionId).populate("subSection")

        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec();

        if (!course) {
            return res.json({
                success: false,
                message: "course not found"
            })
        }

        //return db
        res.status(200).json({
            success: true,
            message: "section updated and subsection is deleted",
            Updatedsection,
            course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "subsection not delete and section not update some went wrong",
            messageError: error.message
        })
    }
}