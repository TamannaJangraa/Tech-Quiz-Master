import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkID: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    fullName: { 
      type: String 
    },
    role: { 
      type: String, 
      default: "student" 
    },
    isLoggedIn: { 
      type: Boolean, 
      default: false 
    },
    lastActiveDate: { 
      type: Date, 
      default: Date.now 
    },
    eligibilityStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    mobileNumber: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);