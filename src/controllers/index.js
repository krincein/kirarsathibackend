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
  updateUserImages,
  addImageToCollection
} = require("./userActionController");
const { updateStatusController, updateUserRoleController, getAllUsersController } = require("./adminControllers");

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
  updateUserRoleController,
  getAllUsersController,
  updateUserImages,
  addImageToCollection
};
