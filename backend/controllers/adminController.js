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
    });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      quizzes,
    });
  } catch (err) {
    console.error("Error getting quizzes:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting quiz:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE QUIZ
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      technology,
      level,
      timeLimit,
      questions,
    } = req.body;

    if (
      !technology ||
      !level ||
      !timeLimit ||
      !Array.isArray(questions)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz data",
      });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      {
        technology: technology
          .toLowerCase()
          .trim(),

        level,

        timeLimit: Number(timeLimit),

        questions,

        totalQuestions: questions.length,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (err) {
    console.error(
      "Error updating quiz:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message || "Server error",
    });
  }
};