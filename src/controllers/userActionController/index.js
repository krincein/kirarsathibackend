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

const shortListUserController = async (request, response) => {
  try {
    const targetUserId = request?.params?.targetUserId;
    const currentUserId = request?.user?._id;

    if (currentUserId.equals(targetUserId)) {
      return response.status(400).json({
        success: false,
        message: "You cannot shortlist your own profile.",
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

module.exports = {
  toggleLikesController,
  shortListUserController,
  updateOnboardingController,
};
