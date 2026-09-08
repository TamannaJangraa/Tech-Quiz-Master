import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    playerName: {
      type: String,
      required: true,
      trim: true,
    },

    technology: String,
    level: String,
    totalQuestions: Number,
    correct: Number,
    wrong: Number,
    timeTaken: Number,
    startDate: Date,
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;