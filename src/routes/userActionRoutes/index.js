const express = require("express");
const app = require("../../../main");

const {
  toggleLikesController,
  shortListUserController,
  updateOnboardingController,
  getMyProfileController,
  getProfileByIdController,
  getGenderBasedProfilesController,
} = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const userActionRoute = express.Router();

userActionRoute
  .route("/toggle-like/:targetUserId")
  .post(isAuthorized, toggleLikesController);
userActionRoute
  .route("/short-list/:targetUserId")
  .post(isAuthorized, shortListUserController);
userActionRoute
  .route("/update-onboarding")
  .post(isAuthorized, updateOnboardingController);
userActionRoute.route("/my-profile").get(isAuthorized, getMyProfileController);
userActionRoute
  .route("/get-profile/:id")
  .get(isAuthorized, getProfileByIdController);
userActionRoute
  .route("/get-gender-based-profiles")
  .get(isAuthorized, getGenderBasedProfilesController);

const userAction = app.use("/", userActionRoute);

module.exports = { userAction };
