const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Kindly provide your full name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email address."],
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address."],
    },
    phoneNo: {
      type: String,
      required: [true, "Kindly provide a phone number."],
      unique: [true, "The phone number is already registered."],
      sparse: true,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number."],
    },
    password: {
      type: String,
      required: [true, "Please set up a password to continue."],
      minlength: [8, "Your password should be at least 8 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "deleted", "pending"],
      default: "pending",
    },
    // To track how far user has completed onboarding
    onboardingStep: {
      type: Number,
      default: 1, // 1–5
    },
  },
  { timestamps: true }
);

module.exports.UserSchema = mongoose.model("User", userSchema);
