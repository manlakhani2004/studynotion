const Section = require('../models/section');
const Course = require('../models/Course');
const subSection = require('../models/subSection');


//create section
exports.createSection = async (req, res) => {
    try {
        //fetch data
        const { name, courseID } = req.body;
        console.log(name,courseID);
        //validate data
        if (!name || !courseID) {
            return res.status(400).json({
                success: false,
                message: "some data missing in createSection"
            })
        }
        //store in db
        const SectionDB = await Section.create({
            sectionName: name
        })
        //add section id in CourseContent key
        const updatedCourse = await Course.findByIdAndUpdate(courseID, {
            $push: {
                courseContent: SectionDB._id
            }
        }, { new: true }).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec();

        if(!updatedCourse){
            return res.status(401).json({
                success:false,
                message:"course not found"
            })
        }

        //return response
        res.status(200).json({
            success: true,
            message: "section created successfully",
            section: SectionDB,
            updatedCourse
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: "section not created",
            messageError: error.message
        })
    }
}

//update section
exports.updateSection = async (req, res) => {
    try {
        //fetch data
        const { name, sectionID, courseId } = req.body;
        //validate data
        if (!name || !sectionID || !courseId) {
            return res.status(400).json({
                success: false,
                message: "some data missing in update section"
            })
        }


        //update section on db
        const updatedSection = await Section.findByIdAndUpdate(sectionID, {
            sectionName: name
        }, { new: true });


        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec();

        if(!course){
            return res.status(401).json({
                success:false,
                message:"course not found"
            })
        }

        // return success response
        res.status(200).json({
            success: true,
            message: "section updated",
            section: updatedSection,
            course:course
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: "section not update",
            messageError: error.message
        })
    }
}

//delete Section
exports.deleteSection = async (req, res) => {
    try {
        //fetch data
        const { sectionID, courseID } = req.body;
        console.log(sectionID,courseID);
        //validate data
        if (!sectionID || !courseID) {
            return res.status(400).json({
                success: false,
                message: "some data missing in delete section"
            })
        }
        console.log("course");

        //remove sectionId from course
        await Course.findByIdAndUpdate({_id:courseID }, {
            $pull: {
                courseContent: sectionID
            }
        });

        const section = await Section.findById(sectionID);

        if (!section) {
            return res.status(400).json({
                success: false,
                message: "Section not found"
            })
        }

        //delete all subSection of Section 
        await subSection.deleteMany({ _id: { $in: section.subSection } });

        //delete from db section by id
        const DeletedSection = await Section.findByIdAndDelete(sectionID);

        //delete section id from coure model of courseContent array
        const updatedCourse = await Course.findByIdAndUpdate(courseID, {
            $pull: {
                courseContent: sectionID
            }
        }, { new: true }).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec();

        console.log("course info",updatedCourse);
        if(!updatedCourse){
            return res.status(401).json({
                success:false,
                message:"course not found"
            })
        }
        //return success response
        res.status(200).json({
            success: true,
            message: "section delete successfully",
            DeletedSection,
            course: updatedCourse
        })

    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: `section not delete ${error.message}`
        })
    }
}