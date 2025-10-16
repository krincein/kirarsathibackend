const express = require("express");
const app = require("../../../main");

const { toggleLikesController, shortListUserController } = require("../../controllers");

const { isAuthorized } = require("../../middleware");

const likeUserRoute = express.Router();

likeUserRoute.route("/toggle-like/:targetUserId").post(isAuthorized, toggleLikesController);
likeUserRoute.route("/short-list/:targetUserId").post(isAuthorized, shortListUserController);

const likeUser = app.use("/", likeUserRoute);

module.exports = { likeUser };
