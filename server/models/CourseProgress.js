const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
    },
    complatedVideo:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"subSection",
        }
    ]
});

module.exports = mongoose.model("CourseProgress",CourseProgressSchema);