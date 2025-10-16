const { signupController, loginController, logoutController, getProfileByIdController } = require("./authUserControllers");
const { toggleLikesController, shortListUserController } = require("./userActionController");

module.exports = {
  signupController,
  loginController,
  logoutController,
  getProfileByIdController,
  toggleLikesController,
  shortListUserController,
};
