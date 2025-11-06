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

// controllers/admin/getUserCountController.js

const getUserCountController = async (req, res) => {
  try {
    const totalUsers = await UserSchema.countDocuments(); // count all users
    const activeUsers = await UserSchema.countDocuments({ status: "active" });
    const blockedUsers = await UserSchema.countDocuments({ status: "blocked" });
    const pendingUsers = await UserSchema.countDocuments({ status: "pending" });
    const marriedUsers = await UserSchema.countDocuments({ status: "married" });
    const mutedUsers = await UserSchema.countDocuments({ status: "muted" });

    return res.status(200).json({
      success: true,
      message: "User statistics fetched successfully",
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        pendingUsers,
        marriedUsers,
        mutedUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    });
  }
};

// ✅ Get Married With
const updateUserStatusController = async (req, res) => {
  try {
    const adminUser = req.user; // from auth middleware
    const { userId, status, marriedWith } = req.body;

    // ✅ Check permission
    if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // ✅ Validate required data
    if (!userId || !status) {
      return res.status(400).json({ message: "userId and status are required." });
    }

    // ✅ Check if user exists
    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Handle 'married' status logic
    if (status === "married") {
      if (!marriedWith) {
        return res.status(400).json({
          message: "Please provide 'marriedWith' user ID to set status as married.",
        });
      }

      // Fetch partner
      const partner = await UserSchema.findById(marriedWith);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found." });
      }

      // Prevent marrying self
      if (userId === marriedWith) {
        return res
          .status(400)
          .json({ message: "A user cannot be married to themselves." });
      }

      // Check if already married
      if (user.status === "married" && user.marriedWith) {
        return res
          .status(400)
          .json({ message: "This user is already married." });
      }
      if (partner.status === "married" && partner.marriedWith) {
        return res
          .status(400)
          .json({ message: "The selected partner is already married." });
      }

      // ✅ Update both users
      user.status = "married";
      user.marriedWith = partner._id;

      partner.status = "married";
      partner.marriedWith = user._id;

      await user.save();
      await partner.save();

      return res.status(200).json({
        message: "Marriage updated successfully.",
        user,
        partner,
      });
    }

    // ✅ Handle non-married statuses
    user.status = status;
    user.marriedWith = null; // clear marriage link
    await user.save();

    res.status(200).json({
      message: "User status updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


module.exports = {
  updateStatusController, updateUserRoleController,
  getAllUsersController, getUserCountController,
  updateUserStatusController
};

