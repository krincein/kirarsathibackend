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
  rejectShortlistRequestController,
  getPendingShortlistRequestsController,
  getSentShortlistRequestsController,
  getShortlistStatusController,
  getShortlistedUsersController,
  updateUserImages,
  addImageToCollection
} = require("./userActionController");
const { updateStatusController, updateUserRoleController, getAllUsersController, getUserCountController } = require("./adminControllers");

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
  rejectShortlistRequestController,
  getPendingShortlistRequestsController,
  getSentShortlistRequestsController,
  getShortlistStatusController,
  updateStatusController,
  updateUserRoleController,
  getAllUsersController,
  getUserCountController,
  updateUserImages,
  addImageToCollection,
  getShortlistedUsersController
};
