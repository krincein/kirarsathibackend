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

const updateUserRoleController = async (request, response) => {
  try {
    const currentUser = request.user;
    if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
      return response.status(403).json({
        success: false,
        message: "Unauthorized: Only admin or superadmin can update user roles.",
      });
    }

    const userId = request.params.id;
    const { role } = request.body;

    const allowedRoles = ["user", "admin", "superadmin"];

    if (!role || !allowedRoles.includes(role)) {
      return response.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      });
    }

    // Prevent admin from promoting others to superadmin
    if (currentUser.role === "admin" && role === "superadmin") {
      return response.status(403).json({
        success: false,
        message: "Admins cannot assign the superadmin role.",
      });
    }

    // Prevent users from changing their own role
    if (currentUser._id.toString() === userId.toString()) {
      return response.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await UserSchema.findById(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return response.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully.`,
      data: userObj,
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    return response.status(500).json({
      success: false,
      message: "Server error while updating role.",
      error: error.message,
    });
  }
};

// Get all users (admin only)

const getAllUsersController = async (req, res) => {
  try {
    // Only admins or superadmins should be able to view users
    const currentUser = req.user;
    if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admin or superadmin can view all users.",
      });
    }

    // Get all users, exclude password field
    const users = await UserSchema.find().select("-password");

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
};

module.exports = { updateStatusController, updateUserRoleController, getAllUsersController };

