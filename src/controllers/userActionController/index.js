//Importing schema
const { UserSchema } = require("../../schemaCollections");

//Importing file upload controller
const { uploadSingleFile, uploadMultipleFiles, upload } = require("./fileUploadToS3");

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

    // ✅ 1. Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token missing or invalid.",
      });
    }

    // ✅ 2. Fetch current user
    const currentUser = await UserSchema.findById(userId).select(
      "basic_information.gender status"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ✅ 3. Handle user status conditions
    if (currentUser.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "You are blocked by admin. Please contact support.",
        alert: true,
      });
    }

    if (currentUser.status === "muted") {
      return res.status(403).json({
        success: false,
        message: "Your subscription plan or some other requirement is pending. Please upgrade or complete the necessary steps.",
        alert: true,
      });
    }

    if (currentUser.status === "married") {
      return res.status(403).json({
        success: false,
        message: "You are already married. Your profile is no longer available for matchmaking.",
        alert: true,
      });
    }


    if (currentUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active. Please contact support admin.",
        alert: true,
      });
    }

    // ✅ 4. Ensure gender info
    const userGender = currentUser.basic_information?.gender;
    if (!userGender) {
      return res.status(400).json({
        success: false,
        message: "Your gender information is missing. Please complete your basic profile first.",
        alert: true,
      });
    }

    // ✅ 5. Determine target gender
    const genderMap = { male: "female", female: "male" };
    const targetGender = genderMap[userGender];

    if (!targetGender) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender or no matching gender preference found.",
      });
    }

    // ✅ 6. Fetch opposite-gender profiles (excluding current user)
    const oppositeGenderProfiles = await UserSchema.find({
      "basic_information.gender": targetGender,
      status: "active",
      _id: { $ne: userId },
    })
      .select(
        "fullName profileUrl images basic_information likes education_occupation createdAt"
      )
      .limit(50)
      .sort({ createdAt: -1 });

    // ✅ 7. Return success response
    return res.status(200).json({
      success: true,
      message: `Fetched ${targetGender} profiles successfully.`,
      count: oppositeGenderProfiles.length,
      data: oppositeGenderProfiles,
    });
  } catch (error) {
    console.error("❌ Error in getGenderBasedProfilesController:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profiles.",
      error: error.message,
    });
  }
};

const updateUserImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileUrl } = req.body;

    if (!profileUrl) {
      return res.status(400).json({
        success: false,
        message: "Profile URL is required.",
      });
    }

    const user = await UserSchema.findByIdAndUpdate(
      userId,
      { "images.profileUrl": profileUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      profileUrl: user.images.profileUrl,
    });
  } catch (error) {
    console.error("Update Profile Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile image.",
      error: error.message,
    });
  }
};

const addImageToCollection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { imageCollectionUrls } = req.body;

    if (!imageCollectionUrls) {
      return res.status(400).json({
        success: false,
        message: "Collection of image URLs is required.",
      });
    }

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingImages = user.images?.imageCollectionUrls || [];
    const newImages = Array.isArray(imageCollectionUrls)
      ? imageCollectionUrls
      : [imageCollectionUrls];

    // ✅ Check limit
    if (existingImages.length + newImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only have up to 5 images in your collection.",
        currentCount: existingImages.length,
      });
    }

    // ✅ Add new image(s)
    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      { $push: { "images.imageCollectionUrls": { $each: newImages } } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image(s) added to collection successfully.",
      imageCollectionUrls: updatedUser.images.imageCollectionUrls,
    });
  } catch (error) {
    console.error("Add Image To Collection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding image to collection.",
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

    const [targetUser, currentUser] = await Promise.all([
      UserSchema.findById(targetUserId),
      UserSchema.findById(currentUserId),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent duplicate request or already connected
    const alreadyRequested =
      targetUser.pendingShortlistRequests.includes(currentUserId) ||
      currentUser.sendShortlistRequests.includes(targetUserId);

    const alreadyShortlisted =
      targetUser.shortListed?.some((s) => s.user.toString() === currentUserId.toString()) ||
      currentUser.shortListed?.some((s) => s.user.toString() === targetUserId.toString());

    if (alreadyRequested || alreadyShortlisted) {
      return res.status(400).json({
        success: false,
        message: "Request already sent or user already shortlisted.",
      });
    }

    // Push IDs into respective arrays
    targetUser.pendingShortlistRequests.push(currentUserId);
    currentUser.sendShortlistRequests.push(targetUserId);

    await Promise.all([targetUser.save(), currentUser.save()]);

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
    const requesterId = req.params.requesterId; // sender of request
    const currentUserId = req.user._id; // receiver

    const [currentUser, requesterUser] = await Promise.all([
      UserSchema.findById(currentUserId),
      UserSchema.findById(requesterId),
    ]);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check pending request
    if (!currentUser.pendingShortlistRequests.includes(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "No pending shortlist request from this user.",
      });
    }

    // Prevent duplicates
    const alreadyConnected =
      currentUser.shortListed.some((s) => s.user.toString() === requesterId.toString()) &&
      requesterUser.shortListed.some((s) => s.user.toString() === currentUserId.toString());

    if (alreadyConnected) {
      return res.status(400).json({ success: false, message: "Already connected." });
    }

    // ✅ Remove from pending + sender’s sent list
    currentUser.pendingShortlistRequests.pull(requesterId);
    requesterUser.sendShortlistRequests.pull(currentUserId);

    // ✅ Add both to each other's shortlist
    currentUser.shortListed.push({ user: requesterId, status: "accepted" });
    requesterUser.shortListed.push({ user: currentUserId, status: "accepted" });

    await Promise.all([currentUser.save(), requesterUser.save()]);

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

// Reject Shortlist Request
const rejectShortlistRequestController = async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    const currentUserId = req.user._id;

    const [currentUser, requesterUser] = await Promise.all([
      UserSchema.findById(currentUserId),
      UserSchema.findById(requesterId),
    ]);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!currentUser.pendingShortlistRequests.includes(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "No pending shortlist request from this user.",
      });
    }

    // Remove pending + remove from sender’s sent list
    currentUser.pendingShortlistRequests.pull(requesterId);
    requesterUser.sendShortlistRequests.pull(currentUserId);

    await Promise.all([currentUser.save(), requesterUser.save()]);

    res.status(200).json({
      success: true,
      message: "Shortlist request rejected successfully.",
    });
  } catch (error) {
    console.error("Reject Shortlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting shortlist request.",
      error: error.message,
    });
  }
};

// ✅ Get Pending Shortlist Requests (Received Requests)
const getPendingShortlistRequestsController = async (req, res) => {
  try {
    const currentUser = await UserSchema.findById(req.user._id)
      .populate(
        "pendingShortlistRequests",
        "fullName email images.profileUrl basic_information.gender basic_information.dateOfBirth"
      )
      .lean();

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Pending shortlist requests fetched successfully.",
      total: currentUser.pendingShortlistRequests.length,
      data: currentUser.pendingShortlistRequests,
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

// ✅ Get Sent Shortlist Requests (Requests You Sent)
const getSentShortlistRequestsController = async (req, res) => {
  try {
    const currentUser = await UserSchema.findById(req.user._id)
      .populate(
        "sendShortlistRequests",
        "fullName email images.profileUrl basic_information.gender basic_information.dateOfBirth"
      )
      .lean();

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Sent shortlist requests fetched successfully.",
      total: currentUser.sendShortlistRequests.length,
      data: currentUser.sendShortlistRequests,
    });
  } catch (error) {
    console.error("Get Sent Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sent requests.",
      error: error.message,
    });
  }
};

// ✅ Get Shortlisted Users (with status and mutual info)
const getShortlistedUsersController = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await UserSchema.findById(currentUserId)
      .populate({
        path: "shortListed.user",
        select: "fullName email phoneNo images.profileUrl basic_information.gender status basic_information.dateOfBirth education_occupation.occupation",
      })
      .lean();

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Compute mutual connections efficiently
    const shortlistedUsers = await Promise.all(
      currentUser.shortListed.map(async (item) => {
        const isMutual = await UserSchema.exists({
          _id: item.user._id,
          "shortListed.user": currentUserId,
          "shortListed.status": "accepted",
        });

        return {
          ...item.user,
          shortlistStatus: item.status,
          isMutual: !!isMutual,
        };
      })
    );

    // ✅ Compute counts
    const pendingCount = currentUser.pendingShortlistRequests?.length || 0;
    const sentCount = currentUser.sendShortlistRequests?.length || 0;
    const shortlistedCount = shortlistedUsers.length;

    res.status(200).json({
      success: true,
      message: "Shortlisted users fetched successfully.",
      totalShortlisted: shortlistedCount,
      totalPendingRequests: pendingCount,
      totalSentRequests: sentCount,
      data: shortlistedUsers,
    });
  } catch (error) {
    console.error("Get Shortlisted Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching shortlisted users.",
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
  rejectShortlistRequestController,
  getPendingShortlistRequestsController,
  getSentShortlistRequestsController,
  getShortlistedUsersController,
  uploadSingleFile,
  uploadMultipleFiles,
  upload,
  updateUserImages,
  addImageToCollection
};
