const express = require("express");
const multer = require("multer");
const path = require("path");

const app = require("../../../main");
const { isAuthorized } = require("../../middleware");

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
    limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadSingleFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file: req.file,
    });
}

const uploadMultipleFiles = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        files: req.files,
    });
}

fileUploadRoute
    .route("/single-file")
    .post(isAuthorized, upload.single("image"), uploadSingleFile);

fileUploadRoute
    .route("/multiple-files")
    .post(isAuthorized, upload.array("images", 5), uploadMultipleFiles);

const fileUpload = app.use("/upload", fileUploadRoute);

module.exports = { fileUpload };