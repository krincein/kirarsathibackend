const express = require("express");
const multer = require("multer");
const path = require("path");

const app = require("../../../main");
const { isAuthorized } = require("../../middleware");
const { UserSchema } = require("../../schemaCollections");

const fileUploadRoute = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSingleFile = async (req, res) => {

    const userId = req.user._id;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await UserSchema.findByIdAndUpdate(
        userId,
        { "images.profileUrl": `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
    }

    return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });
}

const uploadMultipleFiles = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const userId = req.user._id;

    const user = await UserSchema.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
    }

    const existingImages = user.images?.imageCollectionUrls || [];
    const newImages = Array.isArray(req.files)
        ? req.files
        : [req.files];

    // ✅ Check limit
    if (existingImages.length + newImages.length > 6) {
        return res.status(400).json({
            success: false,
            message: "You can only have up to 6 images in your collection.",
            currentCount: existingImages.length,
        });
    }

    // ✅ Add new image(s)
    const updatedUser = await UserSchema.findByIdAndUpdate(
        userId,
        { $push: { "images.imageCollectionUrls": { $each: newImages.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`) } } },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "Image(s) added to collection successfully.",
        imageCollectionUrls: updatedUser.images.imageCollectionUrls,
    });
}

fileUploadRoute
    .route("/single-file")
    .post(isAuthorized, upload.single("image"), uploadSingleFile);

fileUploadRoute
    .route("/multiple-files")
    .post(isAuthorized, upload.array("images", 6), uploadMultipleFiles);

const fileUpload = app.use("/upload", fileUploadRoute);

module.exports = { fileUpload };