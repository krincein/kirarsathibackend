//Importing schema
const { UserSchema } = require("../../schemaCollections");

const toggleLikesController = async (request, response) => {
  try {
    const targetUserId = request?.params?.targetUserId;
    const currentUserId = request?.user?._id;

    if (currentUserId.equals(targetUserId)) {
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

const updateOnboardingController = async (req, res) => {
  try {
    const userId = req?.user?._id; // taken from JWT middleware
    const { step, data } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    if (!step || step < 1 || step > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid step number. Step must be between 1 and 5.",
      });
    }

    // build dynamic update object
    let updateData = {};
    let nextStep = step;
    let onboardingStatus = "in_progress";

    switch (step) {
      case 1:
        updateData.basic_information = data;
        nextStep = 2;
        break;

      case 2:
        updateData.education_occupation = data;
        nextStep = 3;
        break;

      case 3:
        updateData.family_contact_address = data;
        nextStep = 4;
        break;

      case 4:
        updateData.partner_preference = data;
        nextStep = 5;
        break;

      case 5:
        // Step 5 is optional — update if provided
        if (data && Object.keys(data).length > 0) {
          updateData.hobbies_interests_skills = data;
        }
        onboardingStatus = "completed";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid onboarding step.",
        });
    }

    // If not last step and data provided, mark as in_progress
    if (step < 5) onboardingStatus = "in_progress";

    // Prepare onboarding state
    updateData["onboarding.status"] = onboardingStatus;
    updateData["onboarding.step"] = nextStep;

    // Update the user
    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message:
        onboardingStatus === "completed"
          ? "Onboarding completed successfully."
          : `Step ${step} saved successfully. Proceed to step ${nextStep}.`,
      onboarding: updatedUser.onboarding,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Onboarding Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating onboarding.",
      error: error.message,
    });
  }
};

const getMyProfileController = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token missing or invalid.",
      });
    }

    const user = await UserSchema.findById(userId)
      .select("-password -__v") // exclude sensitive fields
      .populate("likes", "fullName email profileUrl") // optional: show liked user details
      .populate("shortListed", "fullName email profileUrl");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
      error: error.message,
    });
  }
};

const getProfileByIdController = async (request, response) => {
  try {
    const userId = request.params.id;

    // Find user by ID, exclude password field
    const user = await UserSchema.findById(userId).select("-password");

    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return response.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return response.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
      error: error.message,
    });
  }
};

const getGenderBasedProfilesController = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token missing or invalid.",
      });
    }

    // Fetch logged-in user
    const currentUser = await UserSchema.findById(userId).select(
      "basic_information.gender status"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ✅ Check if user is active
    if (currentUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active. Please complete onboarding or contact support.",
        alert: true, // 👈 frontend can use this to show a toast/alert
      });
    }

    // ✅ Ensure gender exists
    if (!currentUser.basic_information?.gender) {
      return res.status(400).json({
        success: false,
        message:
          "Your gender information is missing. Please complete your basic profile first.",
      });
    }

    const userGender = currentUser.basic_information.gender;

    // ✅ Determine the opposite gender
    let targetGender;
    if (userGender === "male") targetGender = "female";
    else if (userGender === "female") targetGender = "male";
    else targetGender = null;

    if (!targetGender) {
      return res.status(400).json({
        success: false,
        message: "No matching gender preference found.",
      });
    }

    // ✅ Fetch opposite-gender users
    const oppositeGenderProfiles = await UserSchema.find({
      "basic_information.gender": targetGender,
      status: "active", // only show active users
      _id: { $ne: userId }, // exclude current user
    })
      .select("fullName images basic_information likes")
      .limit(50)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `Fetched ${targetGender} profiles successfully.`,
      count: oppositeGenderProfiles.length,
      data: oppositeGenderProfiles,
    });
  } catch (error) {
    console.error("Get Gender-Based Profiles Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profiles.",
      error: error.message,
    });
  }
};
// ✅ Send Shortlist Request
const sendShortlistRequestController = async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    const currentUserId = req.user._id;

    if (currentUserId.equals(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot shortlist your own profile.",
      });
    }

    const targetUser = await UserSchema.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found.",
      });
    }

    // Check if already shortlisted or requested
    if (
      targetUser.pendingShortlistRequests.includes(currentUserId) ||
      targetUser.shortListed.includes(currentUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "You have already sent a request or are already shortlisted.",
      });
    }

    targetUser.pendingShortlistRequests.push(currentUserId);
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Shortlist request sent successfully.",
    });
  } catch (error) {
    console.error("Shortlist Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending shortlist request.",
      error: error.message,
    });
  }
};

// ✅ Accept Shortlist Request
const acceptShortlistRequestController = async (req, res) => {
  try {
    const requesterId = req.params.requesterId; // the user who sent the request
    const currentUserId = req.user._id; // the one accepting

    const currentUser = await UserSchema.findById(currentUserId);
    const requesterUser = await UserSchema.findById(requesterId);

    if (!requesterUser) {
      return res.status(404).json({
        success: false,
        message: "Requester not found.",
      });
    }

    // Ensure a pending request exists
    if (!currentUser.pendingShortlistRequests.includes(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "No pending shortlist request from this user.",
      });
    }

    // Remove pending request
    currentUser.pendingShortlistRequests.pull(requesterId);

    // Add to mutual shortlists
    currentUser.shortListed.push(requesterId);
    requesterUser.shortListed.push(currentUserId);

    await currentUser.save();
    await requesterUser.save();

    res.status(200).json({
      success: true,
      message: "Shortlist request accepted successfully.",
    });
  } catch (error) {
    console.error("Accept Shortlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while accepting shortlist request.",
      error: error.message,
    });
  }
};

const getPendingShortlistRequestsController = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // populate basic info about senders
    const currentUser = await UserSchema.findById(currentUserId)
      .populate("pendingShortlistRequests", "fullName email images.profileUrl basic_information.gender");

    res.status(200).json({
      success: true,
      message: "Pending shortlist requests fetched successfully.",
      totalRequests: currentUser.pendingShortlistRequests.length,
      requests: currentUser.pendingShortlistRequests,
    });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending requests.",
      error: error.message,
    });
  }
};


const getShortlistStatusController = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;

    const currentUser = await UserSchema.findById(currentUserId);
    const targetUser = await UserSchema.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let status = "none"; // default

    if (targetUser.pendingShortlistRequests.includes(currentUserId)) {
      status = "requested"; // You sent a request, waiting for acceptance
    }

    if (currentUser.pendingShortlistRequests.includes(targetUserId)) {
      status = "incoming"; // They sent a request to you
    }

    if (
      currentUser.shortListed.includes(targetUserId) &&
      targetUser.shortListed.includes(currentUserId)
    ) {
      status = "accepted"; // Both are connected
    }

    res.status(200).json({
      success: true,
      message: "Shortlist status fetched successfully.",
      status,
    });
  } catch (error) {
    console.error("Get Shortlist Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching shortlist status.",
      error: error.message,
    });
  }
};

module.exports = {
  toggleLikesController,
  updateOnboardingController,
  getMyProfileController,
  getProfileByIdController,
  getGenderBasedProfilesController,
  sendShortlistRequestController,
  acceptShortlistRequestController,
  getPendingShortlistRequestsController,
  getShortlistStatusController,
};
