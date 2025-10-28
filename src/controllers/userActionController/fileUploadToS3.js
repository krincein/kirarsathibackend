const path = require("path");
const multer = require("multer");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const myBucket = process.env.AWS_BUCKET_NAME;

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|heif/;
    const isFileTypeValid = allowedFileTypes.test(file.mimetype);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isExtensionValid = allowedFileTypes.test(fileExtension);

    if (isFileTypeValid && isExtensionValid) {
        return cb(null, true);
    }

    req.fileError = `Supports only the following filetypes - ${allowedFileTypes}`;
    cb(null, false);
};

const optimizeImage = async (buffer) => {
    const maxSizeMB = 1;
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // 1MB in bytes

    let optimizedBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Resize to 1200px wide
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();

    // Check if the optimized image size is within limits
    if (optimizedBuffer.length > maxSizeBytes) {
        // Reduce quality until the image is within the size limit
        let quality = 80;
        while (optimizedBuffer.length > maxSizeBytes && quality > 10) {
            quality -= 10;
            optimizedBuffer = await sharp(buffer)
                .resize({ width: 1200, withoutEnlargement: true })
                .jpeg({ quality })
                .toBuffer();
        }
    }

    return optimizedBuffer;
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadToS3 = async (file) => {
    const optimizedBuffer = await optimizeImage(file.buffer); // Optimize image before uploading

    const key = fileName(file); // Get the file key (path)

    try {
        await s3.send(
            new PutObjectCommand({
                Bucket: myBucket,
                Key: key,
                Body: optimizedBuffer,
                ContentType: file.mimetype,
                // Removed ACL parameter
            })
        );

        // Construct the file URL
        const fileUrl = `https://${myBucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { success: true, message: "Upload successful", fileUrl: fileUrl };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        return { success: false, message: error.message };
    }
};

const fileName = (file) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    return `${file.fieldname}_${uniqueSuffix}${extension}`;
};


const uploadSingleFile = (req, res) => {
    try {
        if (req.fileError) {
            return res.status(400).send({ message: req.fileError, success: false });
        }

        if (!req.file) {
            return res
                .status(400)
                .send({ message: "Please upload a file.", success: false });
        }

        // Proceed with upload handling
        // ...
    } catch (error) {
        if (error.message.includes("Payload Too Large")) {
            return res
                .status(413)
                .send({ message: "File size exceeds the limit.", success: false });
        }
        res.status(500).send({ message: error.message, success: false });
    }
}


const uploadMultipleFiles = async (req, res) => {
    try {
        if (req.fileError) {
            return res.status(400).send({ message: req.fileError, success: false });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).send({
                message: "Please upload at least one file.",
                success: false,
            });
        }

        const uploadPromises = req.files.map((file) => uploadToS3(file));
        const results = await Promise.all(uploadPromises);

        // Check if all uploads were successful
        if (results.some((result) => !result.success)) {
            return res
                .status(500)
                .send({ message: "Some files failed to upload", success: false });
        }

        const fileUrls = results.map((result) => result.fileUrl);

        res.status(201).send({
            success: true,
            message: "Your files are uploaded successfully",
            result: fileUrls,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}



module.exports = {
    uploadSingleFile,
    uploadMultipleFiles,
    upload
};
