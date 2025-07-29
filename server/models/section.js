const mongoose = require('mongoose');
const subSection = require('./subSection');

const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String,
        required:true,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
            required:true,
        }
    ]
})

module.exports = mongoose.model("Section",sectionSchema);