const express = require("express");
const app = require("../../../main");

const {
  toggleLikesController,
  updateOnboardingController,
  getMyProfileController,
  getProfileByIdController,
  getGenderBasedProfilesController,
  sendShortlistRequestController,
  acceptShortlistRequestController,
  getPendingShortlistRequestsController,
  getShortlistStatusController,
  updateUserImages,
  addImageToCollection
} = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const userActionRoute = express.Router();

userActionRoute
  .route("/toggle-like/:targetUserId")
  .post(isAuthorized, toggleLikesController);
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
userActionRoute
  .route("/send-shortlist-request/:targetUserId")
  .post(isAuthorized, sendShortlistRequestController);
userActionRoute
  .route("/accept-shortlist-request/:requesterId")
  .post(isAuthorized, acceptShortlistRequestController);
userActionRoute
  .route("/get-pending-shortlist-requests")
  .get(isAuthorized, getPendingShortlistRequestsController);
userActionRoute
  .route("/get-shortlist-status/:targetUserId")
  .get(isAuthorized, getShortlistStatusController);


userActionRoute
  .route("/update-user-images")
  .post(isAuthorized, updateUserImages);
userActionRoute
  .route("/add-image-to-collection")
  .post(isAuthorized, addImageToCollection);


const userAction = app.use("/user", userActionRoute);

module.exports = { userAction };
