import mongoose from "mongoose";

const answerReviewSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  selectedAnswer: {
    type: String,
    default: "",
  },
  correctAnswer: {
    type: String,
    default: "",
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  explanation: {
    type: String,
    default: "",
  },
}, { _id: false });

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    playerName: {
      type: String,
      required: true,
      trim: true,
    },
    technology: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    level: {
      type: String,
      enum: ["Basic", "Intermediate", "Advanced"],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    correct: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    wrong: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    timeTaken: {
      type: Number,
      min: 0,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    answerReview: {
      type: [answerReviewSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

resultSchema.index({ userId: 1, status: 1 });
resultSchema.index({ technology: 1, level: 1 });

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
