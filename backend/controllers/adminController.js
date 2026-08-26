import { getAuth } from "@clerk/express";
import Quiz from "../model/Quiz.js";

export const uploadQuiz = async (req, res) => {
  try {
    const { technology, level, timeLimit, questions } = req.body;

    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const techLower = technology.toLowerCase();

    const quiz = await Quiz.findOneAndUpdate(
      {
        technology: techLower,
        level,
      },
      {
        technology: techLower,
        level,
        timeLimit,
        questions,
        totalQuestions: questions.length,
        createdBy: userId,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      quiz,
    });

  } catch (err) {
    console.error("Error uploading quiz:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        res.json({ success: true, quizzes });
    } catch (err) {
        console.error("Error getting quizzes:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        res.json({ success: true, message: "Quiz deleted successfully" });
    } catch (err) {
        console.error("Error deleting quiz:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


