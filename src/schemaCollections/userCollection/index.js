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
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
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
      enum: ["active", "blocked", "married", "muted", "pending"],
      default: "pending",
    },

    onboarding: {
      status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started",
      },
      step: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
      },
    },

    images: {
      profileUrl: String,
      imageCollectionUrls: [String],
    },

    basic_information: {
      gender: {
        type: String,
        enum: ["male", "female"],
      },
      skinTone: {
        type: String,
        enum: ["Fair", "Light", "Medium", "Dark", "Very Dark", "Other"],
      },
      bodyType: {
        type: String,
        enum: ["Slim", "Athletic", "Muscular", "Average", "Heavy", "Other"],
      },
      dateOfBirth: Date,
      placeOfBirth: String,
      timeOfBirth: String,
      height: String,
      weight: String,
      bloodGroup: String,
      manglik: { type: String, enum: ["Yes", "No"], default: "No" },
      rashi: String,
      cast: String,
      gotra: String,
      motherCast: String,
      motherGotra: String,
      physicalDisability: { type: String, enum: ["Yes", "No"], default: "No" },
      vegitarian: { type: String, enum: ["Yes", "No"], default: "No" },
      drink: { type: String, enum: ["Yes", "No"], default: "No" },
      smoke: { type: String, enum: ["Yes", "No"], default: "No" },
      criminalRecord: { type: String, enum: ["Yes", "No"], default: "No" },
      criminalDetails: String,
    },

    education_occupation: {
      educationLevel: {
        type: String,
        enum: [
          "Bachelors",
          "Masters",
          "Doctorate",
          "Diploma",
          "Undergraduate",
          "Associate degree",
          "High school",
          "Secondary school",
          "Primary school",
        ],
      },
      educationField: String,
      occupation: String,
      occupationDetails: String,
      income: String,
      jobLocation: String,
    },

    family_contact_address: {
      familyMembers: {
        fatherName: String,
        motherName: String,
        fatherOccupation: String,
        motherOccupation: String,
        noOfBrothers: Number,
        noOfSisters: Number,
        noOfMarriedBrothers: Number,
        noOfMarriedSisters: Number,
        farming: { type: String, enum: ["Yes", "No"], default: "No" },
        farmingDetails: String,
      },
      addressDetails: String,
      contactDetails: [
        {
          name: String,
          relationship: String,
          phoneNo: String,
        },
      ],
    },

    partner_preference: {
      partnerEducation: String,
      partnerOccupation: String,
      aboutPartner: String,
    },

    hobbies_interests_skills: {
      hobbies: String,
      interests: String,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    shortListed: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],

    pendingShortlistRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports.UserSchema = mongoose.model("User", userSchema);