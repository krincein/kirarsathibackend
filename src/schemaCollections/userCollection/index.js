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
      manglik: { type: Boolean, default: false },
      rashi: String,
      cast: String,
      subcast: String,
      gotra: String,
      motherCast: String,
      motherSubcast: String,
      motherGotra: String,
      physicalStatus: { type: Boolean, default: false },
      drink: { type: Boolean, default: false },
      smoke: { type: Boolean, default: false },
      aboutMySelf: [String],
      criminalRecord: { type: Boolean, default: false },
      criminalDetails: String,
      lookingFor: {
        type: String,
        enum: [
          "My self",
          "Son",
          "Daughter",
          "Brother",
          "Sister",
          "Relative",
          "Friend",
        ],
      },
      vegitarian: { type: Boolean, default: false },
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
      jobLocation: {
        country: String,
        state: String,
        city: String,
      },
    },

    family_contact_address: {
      addressDetails: {
        country: String,
        state: String,
        city: String,
        address: String,
        pincode: String,
      },
      familyMembers: {
        fatherName: String,
        motherName: String,
        fatherOccupation: String,
        motherOccupation: String,
        noOfBrothers: Number,
        noOfSisters: Number,
        noOfMarriedBrothers: Number,
        noOfMarriedSisters: Number,
        farming: { type: Boolean, default: false },
        farmingDetails: String,
      },
      contactDetails: [
        {
          name: String,
          phoneNo: String,
          relationship: String,
        },
      ],
    },

    partner_preference: {
      education: [String],
      occupation: [String],
      aboutPartner: [String],
    },

    hobbies_interests_skills: {
      hobbies: [String],
      interests: [String],
      skills: [String],
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
