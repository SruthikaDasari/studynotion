const cloudinary = require('cloudinary').v2


exports.uploadImageToCloudinary  = async (file, folder, height, quality) => {
    const options = {folder};

    if(height) options.height = height;
    if(quality) options.quality = quality;                                 // height and quality is used to image compression
    options.resource_type = "auto";                                       // it auto fetch image type;

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}   

// Upload a course thumbnail: accepts any image format, crops it to 16:9
// (1280x720, smart-focus on the subject) and stores it as an optimized JPG.
exports.uploadThumbnailToCloudinary = async (file, folder) => {
    return await cloudinary.uploader.upload(file.tempFilePath, {
        folder,
        resource_type: "image",
        format: "jpg",
        transformation: [
            { width: 1280, height: 720, crop: "fill", gravity: "auto" },
            { quality: "auto" },
        ],
    });
}
