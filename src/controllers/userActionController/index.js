//Importing schema
const { UserSchema } = require("../../schemaCollections");

const toggleLikesController = async (request, response) => {
    try {
        const targetUserId = request?.params?.targetUserId;
        const currentUserId = request?.user?._id;

        if (currentUserId === targetUserId) {
            return response.status(400).json({
                success: false,
                message: "You cannot like your own profile.",
            });
        }

        const currentUser = await UserSchema.findById(currentUserId);
        const targetUser = await UserSchema.findById(targetUserId);

        if (!targetUser) {
            return response.status(404).json({
                success: false,
                message: "Target user not found.",
            });
        }

        const isLiked = currentUser.likes.includes(targetUserId);

        if (isLiked) {
            // Unlike
            currentUser.likes.pull(targetUserId);
            await currentUser.save();

            return response.status(200).json({
                success: true,
                message: "User unliked successfully.",
                liked: false,
            });
        } else {
            // Like
            currentUser.likes.push(targetUserId);
            await currentUser.save();

            return response.status(200).json({
                success: true,
                message: "User liked successfully.",
                liked: true,
            });
        }
    } catch (error) {
        console.error("Toggle Like Error:", error);
        return response.status(500).json({
            success: false,
            message: "Server error while toggling like.",
            error: error.message,
        });
    }
};

const shortListUserController = async (request, response) => {
    try {
        const targetUserId = request?.params?.targetUserId;
        const currentUserId = request?.user?._id;

        if (currentUserId === targetUserId) {
            return response.status(400).json({
                success: false,
                message: "You cannot like your own profile.",
            });
        }

        const currentUser = await UserSchema.findById(currentUserId);
        const targetUser = await UserSchema.findById(targetUserId);

        if (!targetUser) {
            return response.status(404).json({
                success: false,
                message: "Target user not found.",
            });
        }

        const isShortListed = currentUser.shortListed.includes(targetUserId);

        if (isShortListed) {
            // Unlike
            currentUser.shortListed.pull(targetUserId);
            await currentUser.save();

            return response.status(200).json({
                success: true,
                message: "Unshortlisted successfully.",
                shortlisted: false,
            });
        } else {
            // Like
            currentUser.shortListed.push(targetUserId);
            await currentUser.save();

            return response.status(200).json({
                success: true,
                message: "User shortlisted successfully.",
                shortlisted: true,
            });
        }
    } catch (error) {
        console.error("ShortList Error:", error);
        return response.status(500).json({
            success: false,
            message: "Server error while shortListing.",
            error: error.message,
        });
    }
};

module.exports = { toggleLikesController, shortListUserController };
