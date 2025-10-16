const { signupController, loginController, logoutController } = require("./authUserControllers");
const { toggleLikesController, shortListUserController } = require("./userActionController");

module.exports = {
  signupController,
  loginController,
  logoutController,
  toggleLikesController,
  shortListUserController,
};
