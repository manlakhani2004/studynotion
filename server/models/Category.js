const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Course"
    }]
})

module.exports = mongoose.model("Category",CategorySchema);