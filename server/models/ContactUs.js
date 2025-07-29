const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    countrycode:{
        type:String,
        required:true,
    },
    contactNumber:{
        type:String,
        required:true,
        trim:true
    },
    message:{
        type:String,
        required:true,
        trim:true
    }
})

module.exports = mongoose.model('ContactUs',ContactUsSchema);