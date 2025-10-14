const express = require("express");
const app = require("../../../main");

const { signupController, loginController, logoutController } = require("../../controllers");


//
const { isAuthorized } = require("../../middleware");


const authUserRoute = express.Router();

authUserRoute.route("/signup").post(signupController);
authUserRoute.route("/login").post(loginController);
authUserRoute.route("/logout").post(isAuthorized, logoutController);

const authUser = app.use("/", authUserRoute);

module.exports = { authUser };
