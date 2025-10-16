//Importing schema
const { UserSchema } = require("../../schemaCollections");

const allowedStatuses = ["active", "blocked", "married", "muted", "pending"];

const updateStatusController = async (request, response) => {
    try {
        const currentUser = request.user; // Assuming user info is populated here by auth middleware
        if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
            return response.status(403).json({
                success: false,
                message: "Unauthorized: Only admin or superadmin can update status.",
            });
        }

        const userId = request.params.id;
        const { status } = request.body;

        if (!status || !allowedStatuses.includes(status)) {
            return response.status(400).json({
                success: false,
                message: `Invalid status value. Allowed statuses are: ${allowedStatuses.join(", ")}`,
            });
        }

        const user = await UserSchema.findById(userId);

        if (!user) {
            return response.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.status = status;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        return response.status(200).json({
            success: true,
            message: "User status updated successfully.",
            data: userObj,
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        return response.status(500).json({
            success: false,
            message: "Server error while updating status.",
            error: error.message,
        });
    }
};

module.exports = { updateStatusController };

