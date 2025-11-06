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
  getShortlistedUsersController,
  updateUserImages,
  addImageToCollection
} = require("./userActionController");
const { updateStatusController, updateUserRoleController, getAllUsersController, getUserCountController,
  updateUserStatusController
} = require("./adminControllers");

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
  updateStatusController,
  updateUserRoleController,
  getAllUsersController,
  getUserCountController,
  updateUserImages,
  addImageToCollection,
  getShortlistedUsersController,
  updateUserStatusController
};
