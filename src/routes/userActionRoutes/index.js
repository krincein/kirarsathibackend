const express = require("express");
const app = require("../../../main");

const { toggleLikesController, shortListUserController, updateOnboardingController } = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const userActionRoute = express.Router();

userActionRoute.route("/toggle-like/:targetUserId").post(isAuthorized, toggleLikesController);
userActionRoute.route("/short-list/:targetUserId").post(isAuthorized, shortListUserController);
userActionRoute.route("/update-onboarding").post(isAuthorized, updateOnboardingController);

const userAction = app.use("/", userActionRoute);

module.exports = { userAction };
