const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true,
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true,
    },
    whatYouWillLearn: {
        type: String,
        required: true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true,
        }
    ],
    RatingAndReview: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
            required: true,
        }
    ],
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    Category:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required: true
    },
    tag:{
        type:[String],
        trim:true
    },
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            // required:true
        }
    ],
    status:{
        type:String,
        enum:["Draft","Published"]
    },
    createdAt: {
		type:Date,
		default:Date.now
	},
    instructions: {
		type: [String],
	},

});
 
module.exports = mongoose.model("Course", CourseSchema);