const { authUser } = require("./authUserRoutes");
const { likeUser } = require("./userActionRoutes");
const { admin } = require("./adminRoutes");

module.exports = {
  authUser,
  likeUser,
  admin,
};
