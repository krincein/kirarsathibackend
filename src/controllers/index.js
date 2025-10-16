const {
  signupController,
  loginController,
  logoutController,
} = require("./authUserControllers");
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
} = require("./userActionController");
const { updateStatusController } = require("./adminControllers");

module.exports = {
  signupController,
  loginController,
  logoutController,
  getProfileByIdController,
  toggleLikesController,
  updateOnboardingController,
  getMyProfileController,
  getGenderBasedProfilesController,
  sendShortlistRequestController,
  acceptShortlistRequestController,
  getPendingShortlistRequestsController,
  getShortlistStatusController,
  updateStatusController,
};
