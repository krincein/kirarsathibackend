const express = require("express");
const app = require("../../../main");

const { updateStatusController , updateUserRoleController, getAllUsersController} = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const adminRoute = express.Router();

adminRoute.route("/update-status/:id").put(isAuthorized, updateStatusController);
adminRoute.route("/update-role/:id").put(isAuthorized, updateUserRoleController);
adminRoute.route("/get-all-users").get(isAuthorized, getAllUsersController);

const admin = app.use("/admin", adminRoute);

module.exports = { admin };
