import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    technology: {
      type: String,
    },

    level: {
      type: String,
    },

    totalQuestions: {
      type: Number,
    },

    correct: {
      type: Number,
    },

    wrong: {
      type: Number,
    },

    timeTaken: {
      type: Number,
    },

    startDate: {
      type: Date,
    },

    // Quiz attempt status
    // pending = quiz started but not submitted
    // submitted = quiz successfully submitted
    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Result ||
  mongoose.model("Result", resultSchema);