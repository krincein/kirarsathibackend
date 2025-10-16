const { signupController, loginController, logoutController, getProfileByIdController } = require("./authUserControllers");
const { toggleLikesController, shortListUserController, updateOnboardingController } = require("./userActionController");
const { updateStatusController } = require("./adminControllers");

module.exports = {
  signupController,
  loginController,
  logoutController,
  getProfileByIdController,
  toggleLikesController,
  shortListUserController,
  updateOnboardingController,
  updateStatusController,
};
