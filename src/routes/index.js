const { authUser } = require("./authUserRoutes");
const { userAction } = require("./userActionRoutes");
const { admin } = require("./adminRoutes");
const { fileUpload } = require("./fileUpload");

module.exports = {
  authUser,
  userAction,
  admin,
  fileUpload,
};
