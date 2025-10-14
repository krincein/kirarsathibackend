//Importing library
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Importing schema
const { UserSchema } = require("../../schemaCollections");
const { tokenBlacklist } = require("../../middleware");


const securePassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const signupController = async (request, response) => {
  try {
    const { email, password, fullName, role, phoneNo } = request.body;

    // 1️⃣ Basic validation
    if (!email || !password || !fullName || !phoneNo) {
      return response.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // 2️⃣ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // 3️⃣ Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4️⃣ Check if user with same email OR phone number already exists
    const existingUser = await UserSchema.findOne({
      $or: [{ email: normalizedEmail }, { phoneNo }],
    });

    if (existingUser) {
      const conflictField = existingUser.email === normalizedEmail ? "email" : "phone number";
      return response.status(400).json({
        success: false,
        message: `The provided ${conflictField} has already been registered. Please use a different one.`,
      });
    }

    // 5️⃣ Hash password
    const hashedPassword = await securePassword(password);

    // 6️⃣ Create and save new user
    const newUser = new UserSchema({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phoneNo: phoneNo.trim(),
    });

    const savedUser = await newUser.save();

    // 7️⃣ Exclude password before sending response
    const { password: _, ...userData } = savedUser.toObject();

    return response.status(201).json({
      success: true,
      message: "Your account has been successfully created.",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Error during user registration:", error);

    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return response.status(400).json({
        success: false,
        message: `The provided ${duplicateField} is already registered.`,
      });
    }

    return response.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const loginController = async (request, response) => {
  try {
    const { email, password } = request.body;

    // Basic validation
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "Email/Phone and password are required.",
      });
    }

    // Determine if input is an email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Find user by email or phone number
    const authUser = await UserSchema.findOne(
      isEmail ? { email: email.toLowerCase() } : { phoneNo: email }
    ).select("+password");

    if (!authUser) {
      return response.status(400).json({
        success: false,
        message: isEmail
          ? "Sorry, we couldn't find a user with that email."
          : "Sorry, we couldn't find a user with that phone number.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, authUser.password);
    if (!isPasswordMatch) {
      return response.status(400).json({
        success: false,
        message: "Invalid password provided.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { _id: authUser._id, role: authUser.role },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    // Remove password before sending user info
    authUser.password = undefined;

    // Success response
    return response.status(200).json({
      success: true,
      message: "Login successful.",
      user: authUser,
      token,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// Logout controller
const logoutController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!tokenBlacklist.has(token)) {
      tokenBlacklist.add(token);
    }

    return res.status(200).json({
      success: true,
      message: "You have been logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  signupController,
  loginController,
  logoutController,
};