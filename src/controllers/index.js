const { signupController, loginController, logoutController } = require("./authUserControllers");
const { toggleLikesController, shortListUserController, updateOnboardingController, getMyProfileController ,getProfileByIdController} = require("./userActionController");
const { updateStatusController } = require("./adminControllers");

module.exports = {
  signupController,
  loginController,
  logoutController,
  getProfileByIdController,
  toggleLikesController,
  shortListUserController,
  updateOnboardingController,
  getMyProfileController,
  updateStatusController,
};
