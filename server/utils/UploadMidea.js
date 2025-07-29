const cloudinary = require('cloudinary').v2;

exports.UploadMidea = async (file, folder, quality,height)=>{
        let options = { folder }
        options.resource_type = "auto";
        if (quality) {
            options.quality = quality
        }
        
        if(height) {
            options.height = height;
        }

        return await cloudinary.uploader.upload(file.tempFilePath,options)
}