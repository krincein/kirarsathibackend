const express = require("express");
const app = require("../../../main");

const { updateStatusController } = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const adminRoute = express.Router();

adminRoute.route("/update-status/:id").post(isAuthorized, updateStatusController);

const admin = app.use("/admin", adminRoute);

module.exports = { admin };
