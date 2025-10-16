const { authUser } = require("./authUserRoutes");
const { userAction } = require("./userActionRoutes");
const { admin } = require("./adminRoutes");

module.exports = {
  authUser,
  userAction,
  admin,
};
