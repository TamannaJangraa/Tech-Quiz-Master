import User from "../model/user.js";
import Quiz from "../model/Quiz.js";
import { getAuth } from "@clerk/express";

export const getStats = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        msg: "Unauthorized",
      });
    }

    // Total registered users
    const totalUsers = await User.countDocuments();

    // Users currently marked as logged in by Clerk webhook
    const loggedInUsers = await User.countDocuments({
      isLoggedIn: true,
    });

    // Count total questions from all quizzes
    const questionStats = await Quiz.aggregate([
      {
        $project: {
          questionCount: {
            $size: {
              $ifNull: ["$questions", []],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalQuestions: {
            $sum: "$questionCount",
          },
        },
      },
    ]);

    const totalQuestions =
      questionStats.length > 0
        ? questionStats[0].totalQuestions
        : 0;

    // Calculate user activity percentage
    const loggedInPercentage =
      totalUsers > 0
        ? ((loggedInUsers / totalUsers) * 100).toFixed(2)
        : "0.00";

    res.json({
      totalUsers,
      loggedInUsers,
      totalQuestions,
      loggedInPercentage,
    });
  } catch (err) {
    console.error("Admin stats error:", err);

    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};